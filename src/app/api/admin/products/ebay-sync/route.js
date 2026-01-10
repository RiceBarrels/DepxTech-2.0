import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { ebayClient } from '@/lib/ebay'

export async function POST(request) {
  try {
    // Verify admin access
    const adminVerification = await verifyAdminAccess(request)

    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    // Check if eBay credentials are configured
    if (!process.env.EBAY_APP_ID || !process.env.EBAY_CERT_ID) {
      return NextResponse.json(
        {
          error: 'eBay credentials not configured. Please add EBAY_APP_ID and EBAY_CERT_ID to your environment variables.',
        },
        { status: 400 }
      )
    }

    // Fetch all items from the eBay store
    const sellerUsername = process.env.EBAY_SELLER_USERNAME || 'depxtech'
    const ebayItems = await ebayClient.getAllSellerItems(sellerUsername)

    if (!ebayItems || ebayItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No items found in eBay store: ${sellerUsername}`,
        imported: 0,
        failed: 0,
        results: [],
      })
    }

    // Process each eBay item and import to database
    const results = []
    let importedCount = 0
    let failedCount = 0
    let updatedCount = 0

    for (const ebayItem of ebayItems) {
      try {
        // Get detailed item info for full description and all images
        let productData
        try {
          const detailedItem = await ebayClient.getItemDetails(ebayItem.itemId)
          productData = ebayClient.convertDetailedToLocalProduct(detailedItem)
        } catch (e) {
          // Fall back to summary data if detail fetch fails
          productData = ebayClient.convertToLocalProduct(ebayItem)
        }

        // Check if product with this title already exists
        const { data: existingProduct } = await supabaseAdmin
          .from('products')
          .select('id')
          .eq('title', productData.title)
          .single()

        if (existingProduct) {
          // Update existing product
          const { error: updateError } = await supabaseAdmin
            .from('products')
            .update({
              des: productData.des,
              price: productData.price,
              stocks: productData.stocks,
              imgs: productData.imgs,
              category: productData.category,
            })
            .eq('id', existingProduct.id)

          if (updateError) {
            throw updateError
          }

          results.push({
            itemId: ebayItem.itemId,
            title: productData.title,
            status: 'updated',
            productId: existingProduct.id,
          })
          updatedCount++
        } else {
          // Insert new product
          const { data: newProduct, error: insertError } = await supabaseAdmin
            .from('products')
            .insert({
              title: productData.title,
              des: productData.des,
              price: productData.price,
              stocks: productData.stocks,
              imgs: productData.imgs,
              category: productData.category,
              variant_data: productData.variant_data,
              views: 0,
            })
            .select('id')
            .single()

          if (insertError) {
            throw insertError
          }

          results.push({
            itemId: ebayItem.itemId,
            title: productData.title,
            status: 'imported',
            productId: newProduct?.id,
          })
          importedCount++
        }

      } catch (itemError) {
        console.error(`Failed to import eBay item ${ebayItem.itemId}:`, itemError)
        results.push({
          itemId: ebayItem.itemId,
          title: ebayItem.title || 'Unknown',
          status: 'failed',
          error: itemError.message,
        })
        failedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed: ${importedCount} imported, ${updatedCount} updated, ${failedCount} failed`,
      imported: importedCount,
      updated: updatedCount,
      failed: failedCount,
      total: ebayItems.length,
      results,
    })

  } catch (error) {
    console.error('Error in eBay sync route:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

// GET endpoint to check sync status/configuration
export async function GET(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)

    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const configured = !!(process.env.EBAY_APP_ID && process.env.EBAY_CERT_ID)
    const sandbox = process.env.EBAY_SANDBOX === 'true'
    const sellerUsername = process.env.EBAY_SELLER_USERNAME || 'depxtech'

    return NextResponse.json({
      configured,
      sandbox,
      sellerUsername,
      message: configured
        ? `eBay sync configured for store: ${sellerUsername} (${sandbox ? 'Sandbox' : 'Production'} mode)`
        : 'eBay credentials not configured'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}
