import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '8')
  const excludeId = searchParams.get('excludeId') || ''
  const categories = searchParams.get('categories') || ''
  
  try {
    let recommendations = []
    const categoryList = categories ? categories.split(',').filter(Boolean) : []
    

    
    // Only category-based recommendations (if categories provided)
    if (categoryList.length > 0) {
      let query = supabase
        .from('products')
        .select('*')
      
      // Only add excludeId filter if it's provided and not empty
      if (excludeId && excludeId.trim() !== '') {
        query = query.neq('id', excludeId)
      }
      
      const { data: categoryProducts, error: categoryError } = await query
        .gt('stocks', 0) // Only in-stock products
        .order('views', { ascending: false })
      
      if (!categoryError && categoryProducts) {
        // Filter products that have matching categories
        const filtered = categoryProducts.filter(product => 
          product.category && 
          Array.isArray(product.category) && 
          product.category.some(cat => categoryList.includes(cat))
        )
        recommendations = filtered
      }
    } else {
      // If no categories provided, return all available products
      let query = supabase
        .from('products')
        .select('*')
      
      // Only add excludeId filter if it's provided and not empty
      if (excludeId && excludeId.trim() !== '') {
        query = query.neq('id', excludeId)
      }
      
      const { data: allProducts, error: allProductsError } = await query
        .gt('stocks', 0) // Only in-stock products
        .order('views', { ascending: false })
      
      if (!allProductsError && allProducts) {
        recommendations = allProducts
      } else {
        // If there's an error or no in-stock products, try to get all products regardless of stock
        let fallbackQuery = supabase
          .from('products')
          .select('*')
        
        // Only add excludeId filter if it's provided and not empty
        if (excludeId && excludeId.trim() !== '') {
          fallbackQuery = fallbackQuery.neq('id', excludeId)
        }
        
        const { data: fallbackProducts, error: fallbackError } = await fallbackQuery
          .order('views', { ascending: false })
        
        if (!fallbackError && fallbackProducts) {
          recommendations = fallbackProducts
        }
      }
    }
    
    // Limit results to requested amount
    const uniqueRecommendations = recommendations.slice(0, limit)
    
    // Add recommendation scores/reasons for better UX
    const enrichedRecommendations = uniqueRecommendations.map(product => ({
      ...product,
      recommendation_reason: getRecommendationReason(product, categoryList)
    }))

    return NextResponse.json({ 
      products: enrichedRecommendations,
      meta: {
        total: enrichedRecommendations.length,
        strategies_used: getStrategiesUsed(enrichedRecommendations, categoryList),
        requested_limit: limit
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

function getRecommendationReason(product, categories) {
  if (categories.length > 0 && product.category) {
    const matchingCategories = product.category.filter(cat => categories.includes(cat))
    if (matchingCategories.length > 0) {
      return `Same category: ${matchingCategories.join(', ')}`
    }
  }
  
  // When no categories are provided, show general recommendation reason
  if (categories.length === 0) {
    return 'Popular product'
  }
  
  return 'Same category'
}

function getStrategiesUsed(products, categories) {
  const strategies = []
  
  if (categories.length > 0 && products.length > 0) {
    strategies.push('category_based')
  } else if (categories.length === 0 && products.length > 0) {
    strategies.push('popular_products')
  }
  
  return strategies
}

// Alternative endpoint for getting recommendations by product ID
export async function POST(request) {
  try {
    const { productId, limit = 8 } = await request.json()
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    // Get the product details first
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()
    
    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Use the product's categories for recommendations
    const categories = product.category || []
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      excludeId: productId.toString(),
      categories: categories.join(',')
    })
    
    // Reuse the GET logic
    const url = new URL(`${request.url}?${params}`)
    const getRequest = new Request(url, { method: 'GET' })
    
    return GET(getRequest)
    
  } catch (error) {
    console.error('Error in POST recommendations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}