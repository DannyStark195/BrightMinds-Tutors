/**
 * Shared helpers — ported from the original client's js/utils/helpers.js.
 *
 * The original's DOM class togglers (activateElement/deactivateElement/
 * removeInactive/addInactive) are gone: React state drives those class names
 * now. Everything else is behaviour-identical to the original, including the
 * quirks noted below, so pages render the same strings they always did.
 */

export function formatCurrency(currency) {
  return currency.toLocaleString('en-US', {})
}

/**
 * Note: kept verbatim from the original, including its boundary handling —
 * hour 0 and hour 12 both fall through to "evening".
 */
export function getHourOfDay() {
  const hour = new Date().getHours()

  if (hour > 0 && hour < 12) {
    return 'morning'
  } else if (hour > 12 && hour < 18) {
    return 'afternoon'
  } else {
    return 'evening'
  }
}

export function calculateFileHash(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = function (e) {
      // Sample the first 5KB for speed
      const arr = new Uint8Array(e.target.result).subarray(0, 5000)
      let hash = ''
      for (let i = 0; i < arr.length; i++) {
        hash += arr[i].toString(16)
      }
      resolve(hash)
    }
    reader.readAsArrayBuffer(file)
  })
}

export function formatDate(date) {
  const [year, month, day] = date.split('-')
  const dateObj = new Date(year, month - 1, day)

  return dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateTime(date) {
  const [year, month, day, hour, minute, second] = date.split(/[- :]/)
  const dateObj = new Date(year, month - 1, day, hour, minute, second)

  return dateObj.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function getQueryParamValue(key) {
  const params = new URLSearchParams(window.location.search)
  const value = params.get(key)
  if (value) return value
}

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
