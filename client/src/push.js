import { urlBase64ToUint8Array } from './utils/helpers.js'
import { BASE_URL } from './api/api.js'
import { getUserToken } from './auth/auth.js'

/**
 * Web-push subscription — ported from the original client's js/push.js.
 * The service worker itself is unchanged and lives at public/sw.js.
 */

const PUBLIC_VAPID_KEY =
  'BARhvkQPQpADSiSjYpth7wpcYJETGfMXLMVj_rpp-6FAI1RcIU7-Y2nVdO4jHqVEB4WPfFZfrbCfBG4d-gd5jTE'

export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return
  }

  const registration = await navigator.serviceWorker.register('/sw.js')
  const permission = await Notification.requestPermission()

  if (permission !== 'granted') {
    return
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
  })

  await fetch(`${BASE_URL}notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getUserToken()}`,
    },
    body: JSON.stringify(subscription),
  })
}
