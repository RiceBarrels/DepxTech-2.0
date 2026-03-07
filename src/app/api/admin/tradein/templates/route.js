import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'


// GET - Fetch all question templates
export async function GET(request) {
    try {
        const adminVerification = await verifyAdminAccess(request)
        if (!adminVerification.authorized) {
            return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
        }

        const supabase = supabaseAdmin

        const { data: templates, error } = await supabase
            .from('trade_question_templates')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching templates:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Optionally attach linked product counts
        const { searchParams } = new URL(request.url)
        if (searchParams.get('withCounts') === 'true' && templates?.length) {
            const { data: links } = await supabase
                .from('tradable_products')
                .select('question_template_id')
                .not('question_template_id', 'is', null)

            const countMap = {}
            links?.forEach(row => {
                countMap[row.question_template_id] = (countMap[row.question_template_id] || 0) + 1
            })
            templates.forEach(t => {
                t.linked_product_count = countMap[t.id] || 0
            })
        }

        return NextResponse.json({ templates })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }
}

// POST - Create a new question template
export async function POST(request) {
    try {
        const adminVerification = await verifyAdminAccess(request)
        if (!adminVerification.authorized) {
            return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
        }

        const body = await request.json()
        const { name, questions = [], questions_i18n = {}, parent_template_id = null } = body

        if (!name) {
            return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
        }

        const { data: template, error } = await supabaseAdmin
            .from('trade_question_templates')
            .insert({
                name,
                questions,
                questions_i18n,
                parent_template_id
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating template:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ template })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }
}

// Helper: normalize question title for matching
function normalizeTitle(title) {
    return (title || '').toLowerCase().replace(/[:：\s]+$/, '').trim()
}

// Helper: apply differential question changes from parent to a target's questions array
// Returns the merged questions array for the target
function mergeQuestionChanges(oldParentQuestions, newParentQuestions, targetQuestions) {
    const oldByTitle = new Map(oldParentQuestions.map(q => [normalizeTitle(q.title), q]))
    const newByTitle = new Map(newParentQuestions.map(q => [normalizeTitle(q.title), q]))

    // Find what changed in parent
    const addedTitles = []     // titles in new but not in old
    const removedTitles = new Set() // titles in old but not in new
    const modifiedQuestions = new Map() // title -> new question data (for questions whose content changed)

    for (const [title, newQ] of newByTitle) {
        if (!oldByTitle.has(title)) {
            addedTitles.push(title)
        } else {
            const oldQ = oldByTitle.get(title)
            // Check if the question actually changed (compare answers, img, etc.)
            if (JSON.stringify(oldQ) !== JSON.stringify(newQ)) {
                modifiedQuestions.set(title, newQ)
            }
        }
    }
    for (const title of oldByTitle.keys()) {
        if (!newByTitle.has(title)) {
            removedTitles.add(title)
        }
    }

    // If nothing changed, return null to skip update
    if (addedTitles.length === 0 && removedTitles.size === 0 && modifiedQuestions.size === 0) {
        return null
    }

    // Apply changes to the target's questions
    let merged = targetQuestions.map(q => {
        const title = normalizeTitle(q.title)

        // Remove questions that were removed from parent
        if (removedTitles.has(title)) return null

        // Update questions that were modified in parent
        if (modifiedQuestions.has(title)) {
            // Replace the question but keep the target's answers if the parent question
            // answers are the same structure as before (i.e. only non-answer fields changed)
            const parentNewQ = modifiedQuestions.get(title)
            const parentOldQ = oldByTitle.get(title)

            // If answers changed in parent, propagate the new answers
            // If only other fields changed (title text, img), keep target's answers
            const parentAnswersChanged = JSON.stringify(parentOldQ?.ans) !== JSON.stringify(parentNewQ?.ans)

            if (parentAnswersChanged) {
                // Full replacement — parent changed the answers
                return { ...parentNewQ }
            } else {
                // Only non-answer fields changed — keep target's own answers
                return { ...q, title: parentNewQ.title, img: parentNewQ.img }
            }
        }

        return q
    }).filter(Boolean)

    // Add newly added questions (insert them at the same position as in parent)
    for (const addedTitle of addedTitles) {
        const newQ = newByTitle.get(addedTitle)
        // Find the position in the parent's new list
        const parentIndex = newParentQuestions.findIndex(q => normalizeTitle(q.title) === addedTitle)
        // Insert at same index, clamped to merged length
        const insertAt = Math.min(parentIndex, merged.length)
        merged.splice(insertAt, 0, { ...newQ })
    }

    return merged
}

// PUT - Update a question template + propagate changes to linked products
export async function PUT(request) {
    try {
        const adminVerification = await verifyAdminAccess(request)
        if (!adminVerification.authorized) {
            return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
        }

        const body = await request.json()
        const { id, name, questions, questions_i18n, parent_template_id } = body

        if (!id) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
        }

        const supabase = supabaseAdmin

        // Fetch old template BEFORE updating (needed for differential sync)
        let oldQuestions = null
        if (questions !== undefined) {
            const { data: oldTemplate } = await supabase
                .from('trade_question_templates')
                .select('questions')
                .eq('id', id)
                .single()
            oldQuestions = oldTemplate?.questions || []
        }

        const updateData = {}
        if (name !== undefined) updateData.name = name
        if (questions !== undefined) updateData.questions = questions
        if (questions_i18n !== undefined) updateData.questions_i18n = questions_i18n
        if (parent_template_id !== undefined) updateData.parent_template_id = parent_template_id

        const { data: template, error } = await supabase
            .from('trade_question_templates')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating template:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Differential propagation: only sync the questions that actually changed
        let updatedProductCount = 0
        let updatedChildCount = 0
        if (questions !== undefined && oldQuestions !== null) {
            // 1. Fetch child templates with their current questions
            const { data: childTemplates, error: childFetchError } = await supabase
                .from('trade_question_templates')
                .select('id, questions')
                .eq('parent_template_id', id)

            if (childFetchError) {
                console.error('Error fetching child templates:', childFetchError)
            } else if (childTemplates?.length) {
                // Differentially merge changes into each child
                for (const child of childTemplates) {
                    const merged = mergeQuestionChanges(oldQuestions, questions, child.questions || [])
                    if (merged === null) continue // no changes relevant to this child

                    const childUpdateData = { questions: merged }
                    if (questions_i18n !== undefined) childUpdateData.questions_i18n = questions_i18n

                    const { error: childUpdateError } = await supabase
                        .from('trade_question_templates')
                        .update(childUpdateData)
                        .eq('id', child.id)

                    if (childUpdateError) {
                        console.error(`Error updating child template ${child.id}:`, childUpdateError)
                    } else {
                        updatedChildCount++
                    }

                    // Also propagate to products linked to this child template
                    const { data: childProducts, error: childProdError } = await supabase
                        .from('tradable_products')
                        .select('id, questions')
                        .eq('question_template_id', child.id)

                    if (!childProdError && childProducts?.length) {
                        for (const product of childProducts) {
                            const prodMerged = mergeQuestionChanges(oldQuestions, questions, product.questions || [])
                            if (prodMerged === null) continue

                            const prodUpdateData = { questions: prodMerged }
                            if (questions_i18n !== undefined) prodUpdateData.questions_i18n = questions_i18n

                            await supabase
                                .from('tradable_products')
                                .update(prodUpdateData)
                                .eq('id', product.id)

                            updatedProductCount++
                        }
                    }
                }
            }

            // 2. Propagate to products directly linked to THIS parent template
            const { data: directProducts, error: directProdError } = await supabase
                .from('tradable_products')
                .select('id, questions')
                .eq('question_template_id', id)

            if (!directProdError && directProducts?.length) {
                for (const product of directProducts) {
                    const prodMerged = mergeQuestionChanges(oldQuestions, questions, product.questions || [])
                    if (prodMerged === null) continue

                    const prodUpdateData = { questions: prodMerged }
                    if (questions_i18n !== undefined) prodUpdateData.questions_i18n = questions_i18n

                    await supabase
                        .from('tradable_products')
                        .update(prodUpdateData)
                        .eq('id', product.id)

                    updatedProductCount++
                }
            }
        }

        return NextResponse.json({ template, updatedProductCount, updatedChildCount })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
    }
}

// DELETE - Delete a question template
export async function DELETE(request) {
    try {
        const adminVerification = await verifyAdminAccess(request)
        if (!adminVerification.authorized) {
            return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('trade_question_templates')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting template:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
    }
}
