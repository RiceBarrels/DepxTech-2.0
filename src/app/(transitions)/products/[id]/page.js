"use server"

import ProductDetails from '@/components/ui/productDetails'
import Recommends from '@/components/ui/recommends'
import TopNav from '@/components/ui/topNav'

export default async function ProductPage({ params }) {
    const { id } = await params
    
    // Increment views on the server side using the API with service role
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/views`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId: id }),
        })
        
        if (!response.ok) {
            console.error('Failed to increment views:', await response.text())
        }
    } catch (error) {
        console.error('Error incrementing views:', error)
    }
    
    // fetch product from api/products
    const product = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?id=${id}`)
    const productData = await product.json()
    
    // The API returns { products: [...], pagination: {...} }, so we need the first product
    const productDetails = productData.products?.[0]
    
    if (!productDetails) {
        throw new Error('Product not found')
    }
    
    return (
        <div className='p-4 flex flex-col items-center justify-center'>
            <TopNav backURL="/products" />
            <ProductDetails product={productDetails} />
            <Recommends title="Recommended for You" limit={8} className="mt-8" excludeId={id} categories={productDetails.category}/>
        </div>
    )
}