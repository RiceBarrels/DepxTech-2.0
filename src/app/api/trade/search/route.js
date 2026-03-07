import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
        return NextResponse.json({ products: [] })
    }

    try {
        // Search across title, brand, series, and category
        // Exact substring match
        const searchTerm = `%${query}%`
        // Fuzzy pattern: "samsng" -> "%s%a%m%s%n%g%" catches typos with missing/swapped chars
        const fuzzyTerm = `%${query.split('').join('%')}%`

        const { data: products, error } = await supabase
            .from('tradable_products')
            .select('id, title, brand, series, category, base_price, imgs')
            .is('variant_of', null)
            .or(`title.ilike.${searchTerm},brand.ilike.${searchTerm},series.ilike.${searchTerm},category.ilike.${searchTerm},title.ilike.${fuzzyTerm},brand.ilike.${fuzzyTerm},series.ilike.${fuzzyTerm}`)
            .order('base_price', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Search error:', error)
            return NextResponse.json(
                { error: 'Search failed' },
                { status: 500 }
            )
        }

        return NextResponse.json({ products: products || [] })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
