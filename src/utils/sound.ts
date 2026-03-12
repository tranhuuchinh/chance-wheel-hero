// Sound utility using Web Audio API - no external files needed
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  startTime = 0
) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

    oscillator.start(ctx.currentTime + startTime);
    oscillator.stop(ctx.currentTime + startTime + duration);
  } catch (e) {
    // Silently fail if audio not supported
  }
}

export function playTickSound() {
  playTone(800, 0.05, 'square', 0.1);
}

export function playSpinSound(duration: number = 4) {
  // Rapid ticking that slows down
  const ctx = getAudioContext();
  const steps = 80;
  for (let i = 0; i < steps; i++) {
    const progress = i / steps;
    // Exponential slowdown
    const time = duration * (1 - Math.pow(1 - progress, 2));
    const freq = 400 + Math.random() * 200;
    playTone(freq, 0.04, 'square', 0.08, time);
  }
}

export function playWinSound() {
  // Celebratory fanfare
  const melody = [
    { freq: 523, time: 0 },      // C5
    { freq: 659, time: 0.1 },    // E5
    { freq: 784, time: 0.2 },    // G5
    { freq: 1047, time: 0.3 },   // C6
    { freq: 784, time: 0.45 },   // G5
    { freq: 1047, time: 0.55 },  // C6
    { freq: 1319, time: 0.65 },  // E6
    { freq: 1568, time: 0.8 },   // G6
  ];

  melody.forEach(({ freq, time }) => {
    playTone(freq, 0.25, 'sine', 0.25, time);
    playTone(freq * 0.5, 0.3, 'triangle', 0.1, time);
  });
}

export function playPopupSound() {
  // Ascending chime
  [523, 659, 784, 1047].forEach((freq, i) => {
    playTone(freq, 0.2, 'sine', 0.2, i * 0.08);
  });
}

export function playButtonClick() {
  playTone(440, 0.08, 'sine', 0.15);
}

export function playConfettiSound() {
  // Multiple random pings
  for (let i = 0; i < 8; i++) {
    const freq = 600 + Math.random() * 800;
    playTone(freq, 0.15, 'sine', 0.15, i * 0.06);
  }
}
