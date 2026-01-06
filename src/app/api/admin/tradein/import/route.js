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

    // Parse CSV
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

    // Map CSV rows to tradable product objects
    const products = dataRows.map(row => {
      const product = {}
      headers.forEach((header, index) => {
        let value = row[index] || ''
        
        // Remove surrounding quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1).replace(/""/g, '"')
        }

        // Parse JSON fields
        if (header === 'imgs') {
          try {
            value = value ? JSON.parse(value) : []
          } catch {
            value = []
          }
        }

        // Parse numeric fields
        if (['new_price', 'good_price', 'okay_price', 'bad_price', 'broken_price', 'trades', 'views', 'likes'].includes(header)) {
          value = value ? parseFloat(value) : 0
        }

        product[header] = value
      })
      return product
    })

    // Insert/update tradable products
    const results = {
      success: 0,
      failed: 0,
      errors: []
    }

    for (const product of products) {
      try {
        const productData = {
          title: product.title,
          des: product.des || null,
          category: product.category,
          brand: product.brand,
          series: product.series,
          new_price: product.new_price,
          good_price: product.good_price,
          okay_price: product.okay_price,
          bad_price: product.bad_price,
          broken_price: product.broken_price,
          new_def: product.new_def,
          good_def: product.good_def,
          okay_def: product.okay_def,
          bad_def: product.bad_def,
          broken_def: product.broken_def,
          imgs: product.imgs || [],
          brand_img: product.brand_img || null,
          trades: product.trades || 0,
          views: product.views || 0,
          likes: product.likes || 0
        }

        if (product.id) {
          // Update existing product
          const { error } = await supabaseAdmin
            .from('tradable_products')
            .update(productData)
            .eq('id', product.id)

          if (error) throw error
        } else {
          // Insert new product
          const { error } = await supabaseAdmin
            .from('tradable_products')
            .insert(productData)

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

