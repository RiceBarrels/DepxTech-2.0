"use server"

import { getTranslations } from 'next-intl/server'
import ProductDetailClient from '@/components/product/ProductDetailClient'
import { ProductStructuredData, BreadcrumbStructuredData } from '@/components/seo/StructuredData'

export async function generateMetadata({ params }) {
  const { id, locale } = await params
  const t = await getTranslations('productDetail')
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'
  
  try {
    const product = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?id=${id}`)
    const productData = await product.json()
    const productDetails = productData.products?.[0]
    
    if (!productDetails) {
      return {
        title: t('productNotFoundMeta'),
        description: t('productNotFoundDesc'),
      }
    }
    
    const title = `${productDetails.title} | DepxTech`
    const description = productDetails.des 
      ? `${productDetails.des.substring(0, 155)}...` 
      : t('buyAt', { title: productDetails.title })
    const image = productDetails.imgs && productDetails.imgs.length > 0 
      ? productDetails.imgs[0] 
      : `${baseUrl}/placeholder-image.svg`
    
    return {
      title,
      description,
      keywords: [
        productDetails.title,
        ...(productDetails.category || []),
        'electronics',
        'depxtech',
        'buy online',
      ],
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${baseUrl}/${locale}/products/${id}`,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: productDetails.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      alternates: {
        canonical: `${baseUrl}/${locale}/products/${id}`,
      },
      other: {
        'product:price:amount': productDetails.price?.toString() || '',
        'product:price:currency': 'USD',
        'product:availability': productDetails.stocks > 0 ? 'in stock' : 'out of stock',
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Product | DepxTech',
      description: 'View product details at DepxTech.',
    }
  }
}

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
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'

    return (
        <>
            <ProductStructuredData product={productDetails} />
            <BreadcrumbStructuredData items={[
                { name: 'Home', url: baseUrl },
                { name: 'Products', url: `${baseUrl}/products` },
                { name: productDetails.title, url: `${baseUrl}/products/${id}` },
            ]} />
            <ProductDetailClient product={productDetails} productId={id} />
        </>
    )
}