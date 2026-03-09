/**
 * Plays a notification sound if supported by the browser
 */
export function playNotificationSound() {
  try {
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure beep sound
    oscillator.frequency.value = 800; // Hz
    oscillator.type = "sine";
    
    // Fade in and out
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    // Play beep
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    console.log("[notificationSound] Notification sound played");
  } catch (err) {
    console.warn("[notificationSound] Could not play sound:", err.message);
    // Silently fail - not all browsers/contexts support Web Audio API
  }
}

/**
 * Request notification permission from browser if available
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log("[notificationSound] Browser does not support notifications");
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.warn("[notificationSound] Failed to request notification permission:", err);
      return false;
    }
  }

  return false;
}

/**
 * Send a browser push notification if available
 */
export function sendBrowserNotification(title, options = {}) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      ...options,
    });

    console.log("[notificationSound] Browser notification sent:", title);
  } catch (err) {
    console.warn("[notificationSound] Could not send browser notification:", err);
  }
}