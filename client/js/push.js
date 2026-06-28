const PUBLIC_VAPID_KEY = '<cryptography.hazmat.bindings._rust.openssl.ec.ECPublicKey object at 0x7f73cf2b35b0>'; // we'll fill this in a moment

export async function subscribeUserToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push not supported in this browser');
        return;
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
        console.log('Permission denied');
        return;
    }

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: PUBLIC_VAPID_KEY
    });

    // Send subscription to your backend
    const token = localStorage.getItem('brightminds-user-token');
    await fetch('https://brightminds-tutors.onrender.com/api/notifications/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscription)
    });
}