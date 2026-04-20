import { createClient } from '@supabase/supabase-js'
import { notifyCustomer } from '@/lib/email'
import { sendPushToUser } from '@/lib/push'

function createServiceRoleClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

/**
 * Send push notification + inbox entry to all admin users (fire-and-forget).
 */
export function notifyAdminsPush({ type, title, body, url, data }) {
    const supabase = createServiceRoleClient()

    supabase
        .from('profile_customer_readonly')
        .select('id')
        .eq('role', 'admin')
        .then(({ data: admins, error }) => {
            if (error || !admins?.length) return

            for (const admin of admins) {
                // In-app notification
                supabase
                    .from('notifications')
                    .insert({
                        user_id: admin.id,
                        type: type || 'admin_alert',
                        title,
                        body,
                        url: url || null,
                        data: data || {},
                    })
                    .then(({ error: e }) => {
                        if (e) console.error('[NotifyAdmin] Insert error:', e)
                    })

                // Web push
                sendPushToUser({
                    userId: admin.id,
                    title,
                    body,
                    url: url || '/admin',
                    tag: type || 'admin-alert',
                })
            }
        })
        .catch((err) => console.error('[NotifyAdmin] Failed:', err))
}

/**
 * Send a notification across all channels: inbox, push, email.
 * All fire-and-forget to avoid blocking the caller.
 */
export function notifyUser({ userId, email, type, title, body, data, emailHtml, emailSubject, pushUrl }) {
    const supabase = createServiceRoleClient()

    // 1) In-app notification
    if (userId) {
        supabase
            .from('notifications')
            .insert({ user_id: userId, type, title, body, data: data || {} })
            .then(({ error }) => {
                if (error) console.error('[Notify] Insert error:', error)
            })
    }

    // 2) Web push
    if (userId) {
        sendPushToUser({
            userId,
            title,
            body,
            url: pushUrl || '/account/inbox',
            tag: data?.quote_id ? `trade-quote-${data.quote_id}` : type,
        })
    }

    // 3) Email
    if (email && emailHtml) {
        notifyCustomer({
            to: email,
            subject: emailSubject || title,
            html: emailHtml,
        })
    }
}
