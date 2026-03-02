import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { supabaseAdmin } from '@/lib/supabase-admin'


/**
 * GET /api/admin/tradein/settings
 * Fetch all trade-in settings
 */
export async function GET(request) {
  try {
    // Verify admin access
    const adminVerification = await verifyAdminAccess(request)

    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const supabase = supabaseAdmin

    const { data: settings, error } = await supabase
      .from('trade_settings')
      .select('*')
      .order('setting_key', { ascending: true })

    if (error) {
      console.error('Error fetching trade settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trade settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      settings: settings || [],
      userRole: 'admin',
      userId: adminVerification.userId
    })

  } catch (error) {
    console.error('Error in trade settings GET route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/tradein/settings
 * Update one or more trade-in settings
 */
export async function PUT(request) {
  try {
    // Verify admin access
    const adminVerification = await verifyAdminAccess(request)

    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Settings array is required' },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin
    const results = []

    for (const setting of settings) {
      const { setting_key, setting_value } = setting

      if (!setting_key) {
        results.push({ setting_key, error: 'Setting key is required' })
        continue
      }

      if (setting_value === undefined || setting_value === null) {
        results.push({ setting_key, error: 'Setting value is required' })
        continue
      }

      // Update the setting
      const { data, error } = await supabase
        .from('trade_settings')
        .update({
          setting_value: parseFloat(setting_value),
          updated_at: new Date().toISOString(),
          updated_by: adminVerification.userId
        })
        .eq('setting_key', setting_key)
        .select()
        .single()

      if (error) {
        console.error(`Error updating setting ${setting_key}:`, error)
        results.push({ setting_key, error: error.message })
      } else {
        results.push({ setting_key, success: true, data })
      }
    }

    const hasErrors = results.some(r => r.error)

    return NextResponse.json({
      success: !hasErrors,
      results,
      userRole: 'admin',
      userId: adminVerification.userId
    }, { status: hasErrors ? 207 : 200 })

  } catch (error) {
    console.error('Error in trade settings PUT route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
