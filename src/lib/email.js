import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

let _resend = null
function getResend() {
    if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
    return _resend
}

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

            const { error } = await getResend().emails.send({
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
export function buildTradeInEmail({ productTitle, customerName, customerEmail, customerPhone, estimatedValue, notes, shippingMethod, paymentMethod, paymentHandle }) {
    const shippingLabel = shippingMethod === 'depxtech_box'
        ? 'DepxTech Shipping Kit (box + prepaid label)'
        : shippingMethod === 'own_box'
            ? 'Customer\'s Own Box'
            : 'Not selected'

    const paymentLabels = { paypal: 'PayPal', zelle: 'Zelle', cashapp: 'Cash App', venmo: 'Venmo', bitcoin: 'Bitcoin' }
    const paymentLabel = paymentLabels[paymentMethod] || paymentMethod || 'Not selected'

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
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Shipping Method</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #2563eb;">${shippingLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Payment Method</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #7c3aed;">${paymentLabel}${paymentHandle ? ` — ${paymentHandle}` : ''}</td>
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
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/trade-quotes" style="color: #6d28d9; text-decoration: none; font-weight: 600;">View in Admin Dashboard &rarr;</a>
      </p>
    </div>`
}

/**
 * Send email to a customer (fire-and-forget)
 */
export function notifyCustomer({ to, subject, html }) {
    getResend().emails.send({
        from: `DepxTech <${FROM_EMAIL}>`,
        to,
        subject,
        html,
    })
        .then(({ error }) => {
            if (error) console.error('Customer email error:', error)
        })
        .catch((err) => {
            console.error('Customer email failed:', err)
        })
}

/**
 * Build HTML for trade-in quote status update (sent to customer)
 */
export function buildQuoteStatusEmail({ productTitle, customerName, estimatedValue, status }) {
    const statusConfig = {
        approved: { label: 'Approved', color: '#16a34a', message: 'Great news! Your trade-in quote has been approved. Please ship your device as soon as possible.' },
        rejected: { label: 'Rejected', color: '#dc2626', message: 'Unfortunately, your trade-in quote has been rejected. Please contact us if you have any questions.' },
        completed: { label: 'Completed', color: '#2563eb', message: 'Your trade-in has been completed! Payment will be processed shortly.' },
        pending: { label: 'Pending', color: '#ca8a04', message: 'Your trade-in quote is being reviewed. We\'ll update you soon.' },
    }

    const cfg = statusConfig[status] || statusConfig.pending

    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0f172a; margin-bottom: 8px;">Trade-in Quote Update</h2>
      <p style="color: #64748b; margin-bottom: 24px;">Hi ${customerName},</p>

      <div style="padding: 20px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 24px; text-align: center;">
        <p style="font-size: 18px; font-weight: 700; color: ${cfg.color}; margin: 0 0 4px 0;">${cfg.label}</p>
        <p style="font-size: 14px; color: #64748b; margin: 0;">${cfg.message}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 140px;">Product</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${productTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Estimated Value</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #16a34a;">$${Number(estimatedValue).toFixed(2)}</td>
        </tr>
      </table>

      <p style="margin-top: 24px; font-size: 14px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/trade-ins" style="color: #6d28d9; text-decoration: none; font-weight: 600;">View My Trade-ins &rarr;</a>
      </p>
      <p style="margin-top: 16px; color: #64748b; font-size: 14px;">
        If you have any questions, reply to this email or contact us at <a href="mailto:${FROM_EMAIL}" style="color: #6d28d9; text-decoration: none;">${FROM_EMAIL}</a>.
      </p>
      <p style="margin-top: 16px; color: #94a3b8; font-size: 12px;">— The DepxTech Team</p>
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
