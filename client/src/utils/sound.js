export function playEndSound(volume = 0.7) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(volume * 0.4, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.5);
    });
    setTimeout(() => ctx.close(), 2000);
  } catch {
    // AudioContext not available — silently skip
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function showEndNotification(label) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const title = 'Focus session complete!';
  const body = label ? `"${label}" is done. Time for a break.` : 'Time for a break.';
  const n = new Notification(title, { body, icon: '/favicon.ico' });
  setTimeout(() => n.close(), 6000);
}
