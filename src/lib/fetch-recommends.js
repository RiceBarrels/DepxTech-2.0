import { supabase } from './supabase'

// Server-side function to fetch recommendations for SSR
export async function fetchRecommendationsServer({ 
    categories = [], 
    limit = 8, 
    excludeId = null 
} = {}) {
    try {
        let recommendations = []
        const categoryList = categories ? categories.filter(Boolean) : []
        
        // Only category-based recommendations (if categories provided)
        if (categoryList.length > 0) {
            let query = supabase
                .from('products')
                .select('*')
            
            // Only add excludeId filter if it's provided and not empty
            if (excludeId && excludeId.toString().trim() !== '') {
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
            if (excludeId && excludeId.toString().trim() !== '') {
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
                if (excludeId && excludeId.toString().trim() !== '') {
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

        return {
            products: enrichedRecommendations,
            meta: {
                total: enrichedRecommendations.length,
                strategies_used: getStrategiesUsed(enrichedRecommendations, categoryList),
                requested_limit: limit
            }
        }
        
    } catch (error) {
        console.error('Error fetching server recommendations:', error)
        return {
            products: [],
            meta: {
                total: 0,
                strategies_used: [],
                requested_limit: limit,
                error: error.message
            }
        }
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