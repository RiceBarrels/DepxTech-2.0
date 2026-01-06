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

    // Map CSV rows to offer objects
    const offers = dataRows.map(row => {
      const offer = {}
      headers.forEach((header, index) => {
        let value = row[index] || ''
        
        // Remove surrounding quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1).replace(/""/g, '"')
        }

        // Parse JSON fields
        if (header === 'applicable_categories') {
          try {
            value = value ? JSON.parse(value) : []
          } catch {
            value = []
          }
        }

        // Parse numeric fields
        if (['discount_percentage', 'discount_amount', 'min_purchase_amount', 'max_discount_amount'].includes(header)) {
          value = value ? parseFloat(value) : null
        }

        // Parse boolean fields
        if (header === 'is_active') {
          value = value === 'true' || value === true || value === '1' || value === 1
        }

        // Parse date fields
        if (['start_date', 'end_date', 'created_at', 'updated_at'].includes(header)) {
          value = value || null
        }

        offer[header] = value
      })
      return offer
    })

    // Insert/update offers
    const results = {
      success: 0,
      failed: 0,
      errors: []
    }

    for (const offer of offers) {
      try {
        const offerData = {
          title: offer.title,
          description: offer.description || '',
          discount_percentage: offer.discount_percentage || null,
          discount_amount: offer.discount_amount || null,
          start_date: offer.start_date || null,
          end_date: offer.end_date || null,
          is_active: offer.is_active !== undefined ? offer.is_active : true,
          image_url: offer.image_url || null,
          code: offer.code || null,
          min_purchase_amount: offer.min_purchase_amount || null,
          max_discount_amount: offer.max_discount_amount || null,
          applicable_categories: offer.applicable_categories || []
        }

        if (offer.id) {
          // Update existing offer
          const { error } = await supabaseAdmin
            .from('offers')
            .update(offerData)
            .eq('id', offer.id)

          if (error) throw error
        } else {
          // Insert new offer
          const { error } = await supabaseAdmin
            .from('offers')
            .insert(offerData)

          if (error) throw error
        }
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push({
          offer: offer.title || offer.id,
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

