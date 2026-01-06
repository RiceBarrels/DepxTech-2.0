import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { supabaseAdmin } from '@/lib/supabase-admin'

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

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Read file content
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must have at least a header row and one data row' },
        { status: 400 }
      )
    }

    // Parse CSV (simple parser - handles quoted fields)
    const parseCSVLine = (line) => {
      const result = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"'
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseCSVLine(lines[0])
    const dataRows = lines.slice(1).map(parseCSVLine)

    // Map CSV rows to product objects
    const products = dataRows.map(row => {
      const product = {}
      headers.forEach((header, index) => {
        let value = row[index] || ''
        
        // Remove surrounding quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1).replace(/""/g, '"')
        }

        // Parse JSON fields
        if (header === 'category' || header === 'imgs' || header === 'variant_data') {
          try {
            value = value ? JSON.parse(value) : (header === 'category' ? [] : header === 'imgs' ? [] : [])
          } catch {
            value = header === 'category' ? [] : header === 'imgs' ? [] : []
          }
        }

        // Parse numeric fields
        if (header === 'price' || header === 'stocks' || header === 'views') {
          value = value ? parseFloat(value) : 0
        }

        // Parse boolean/null fields
        if (header === 'variant_of_id' && !value) {
          value = null
        }

        product[header] = value
      })
      return product
    })

    // Insert/update products
    const results = {
      success: 0,
      failed: 0,
      errors: []
    }

    for (const product of products) {
      try {
        if (product.id) {
          // Update existing product
          const { error } = await supabaseAdmin
            .from('products')
            .update({
              title: product.title,
              des: product.des,
              price: product.price,
              stocks: product.stocks,
              views: product.views || 0,
              category: product.category,
              imgs: product.imgs,
              variant_of_id: product.variant_of_id || null,
              variant_data: product.variant_data
            })
            .eq('id', product.id)

          if (error) throw error
        } else {
          // Insert new product
          const { error } = await supabaseAdmin
            .from('products')
            .insert({
              title: product.title,
              des: product.des,
              price: product.price,
              stocks: product.stocks,
              views: product.views || 0,
              category: product.category,
              imgs: product.imgs,
              variant_of_id: product.variant_of_id || null,
              variant_data: product.variant_data
            })

          if (error) throw error
        }
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push({
          product: product.title || product.id,
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.success,
      failed: results.failed,
      errors: results.errors
    })
  } catch (error) {
    console.error('Error in import route:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

