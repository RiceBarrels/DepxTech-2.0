import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.STORE_EMAIL || 'support@depxtech.com'

function createServiceRoleClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

/**
 * Get all admin user emails from Supabase
 */
async function getAdminEmails() {
    const supabase = createServiceRoleClient()

    // Get admin user IDs
    const { data: admins, error: adminError } = await supabase
        .from('profile_customer_readonly')
        .select('id')
        .eq('role', 'admin')

    if (adminError || !admins?.length) {
        console.error('Failed to fetch admin users:', adminError)
        return []
    }

    const adminIds = new Set(admins.map(a => a.id))

    // Get emails from auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1000 })

    if (authError) {
        console.error('Failed to fetch auth users:', authError)
        return []
    }

    return (authData?.users || [])
        .filter(u => adminIds.has(u.id) && u.email)
        .map(u => u.email)
}

/**
 * Send email notification to all admins (fire-and-forget)
 */
export function notifyAdmins({ subject, html }) {
    // Don't await — fire and forget so we don't block the API response
    getAdminEmails()
        .then(async (emails) => {
            if (!emails.length) {
                console.warn('No admin emails found, skipping notification')
                return
            }

            const { error } = await resend.emails.send({
                from: `DepxTech <${FROM_EMAIL}>`,
                to: emails,
                subject,
                html,
            })

            if (error) {
                console.error('Resend email error:', error)
            }
        })
        .catch((err) => {
            console.error('Email notification failed:', err)
        })
}

/**
 * Build HTML for trade-in quote notification
 */
export function buildTradeInEmail({ productTitle, customerName, customerEmail, customerPhone, estimatedValue, notes }) {
    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0f172a; margin-bottom: 24px;">New Trade-in Quote Request</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 140px;">Product</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${productTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Estimated Value</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #16a34a;">$${Number(estimatedValue).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Customer</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${customerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Email</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${customerEmail}">${customerEmail}</a></td>
        </tr>
        ${customerPhone ? `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Phone</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${customerPhone}</td>
        </tr>` : ''}
        ${notes ? `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Notes</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${notes}</td>
        </tr>` : ''}
      </table>
      <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/tradein" style="color: #6d28d9; text-decoration: none; font-weight: 600;">View in Admin Dashboard &rarr;</a>
      </p>
    </div>`
}

/**
 * Build HTML for new order notification
 */
export function buildOrderEmail({ amount, customerEmail, cartItems }) {
    const items = Array.isArray(cartItems) ? cartItems : []
    const itemsHtml = items.map(item =>
        `<li style="padding: 4px 0;">${item.title || item.name || 'Item'} × ${item.quantity || 1}</li>`
    ).join('')

    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0f172a; margin-bottom: 24px;">New Order Received</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 140px;">Amount</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #16a34a;">$${(Number(amount) / 100).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Customer</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${customerEmail}">${customerEmail}</a></td>
        </tr>
        ${items.length > 0 ? `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; vertical-align: top;">Items</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
            <ul style="margin: 0; padding-left: 16px;">${itemsHtml}</ul>
          </td>
        </tr>` : ''}
      </table>
      <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders" style="color: #6d28d9; text-decoration: none; font-weight: 600;">View in Admin Dashboard &rarr;</a>
      </p>
    </div>`
}
