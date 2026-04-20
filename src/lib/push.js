import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

webpush.setVapidDetails(
    'mailto:support@depxtech.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
)

function createServiceRoleClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

/**
 * Send push notification to all subscriptions for a user (fire-and-forget).
 * Automatically removes stale/expired subscriptions.
 */
export function sendPushToUser({ userId, title, body, url, tag }) {
    const supabase = createServiceRoleClient()

    supabase
        .from('push_subscriptions')
        .select('id, endpoint, p256dh, auth')
        .eq('user_id', userId)
        .then(({ data: subs, error }) => {
            if (error || !subs?.length) return

            const payload = JSON.stringify({ title, body, url, tag })

            subs.forEach((sub) => {
                const pushSub = {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth }
                }

                webpush.sendNotification(pushSub, payload).catch((err) => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        supabase
                            .from('push_subscriptions')
                            .delete()
                            .eq('id', sub.id)
                            .then(() => console.log('[Push] Removed stale subscription:', sub.id))
                    } else {
                        console.error('[Push] Send failed:', err.statusCode, err.message)
                    }
                })
            })
        })
        .catch((err) => console.error('[Push] Failed to fetch subscriptions:', err))
}
