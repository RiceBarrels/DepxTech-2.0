import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'all'

  try {
    // Fetch questions for the category and 'all' category
    const { data: questions, error: questionsError } = await supabase
      .from('trade_questions')
      .select(`
        id,
        question_key,
        question_text,
        description,
        display_order,
        is_required,
        category,
        trade_question_options (
          id,
          option_text,
          description,
          deduction_percent,
          display_order,
          is_deal_breaker
        )
      `)
      .or(`category.eq.all,category.eq.${category}`)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    // Sort options within each question
    const sortedQuestions = questions.map(q => ({
      ...q,
      trade_question_options: q.trade_question_options?.sort((a, b) => a.display_order - b.display_order) || []
    }))

    // Fetch accessories for the category
    const { data: accessories, error: accessoriesError } = await supabase
      .from('trade_accessories')
      .select('*')
      .or(`category.eq.all,category.eq.${category}`)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (accessoriesError) {
      console.error('Error fetching accessories:', accessoriesError)
      return NextResponse.json({ error: 'Failed to fetch accessories' }, { status: 500 })
    }

    return NextResponse.json({
      questions: sortedQuestions,
      accessories: accessories || []
    }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
