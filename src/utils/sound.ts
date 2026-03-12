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

// ===== Background Music =====
let bgMusicNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let bgMusicPlaying = false;
let bgMusicMuted = false;

const BG_MELODY = [
  523.25, 587.33, 659.25, 698.46, 783.99, 659.25, 698.46, 523.25,
  587.33, 523.25, 440.00, 493.88, 523.25, 587.33, 659.25, 523.25,
];
const BG_NOTE_DURATION = 0.45;
let bgLoopTimeout: ReturnType<typeof setTimeout> | null = null;

function playBgLoop(muted: boolean) {
  if (muted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    BG_MELODY.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * BG_NOTE_DURATION);
      gain.gain.setValueAtTime(0, now + i * BG_NOTE_DURATION);
      gain.gain.linearRampToValueAtTime(0.06, now + i * BG_NOTE_DURATION + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * BG_NOTE_DURATION + BG_NOTE_DURATION * 0.9);
      osc.start(now + i * BG_NOTE_DURATION);
      osc.stop(now + i * BG_NOTE_DURATION + BG_NOTE_DURATION);

      // Bass accompaniment
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(freq * 0.5, now + i * BG_NOTE_DURATION);
      bassGain.gain.setValueAtTime(0, now + i * BG_NOTE_DURATION);
      bassGain.gain.linearRampToValueAtTime(0.03, now + i * BG_NOTE_DURATION + 0.02);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + i * BG_NOTE_DURATION + BG_NOTE_DURATION * 0.7);
      bassOsc.start(now + i * BG_NOTE_DURATION);
      bassOsc.stop(now + i * BG_NOTE_DURATION + BG_NOTE_DURATION);
    });

    const totalDuration = BG_MELODY.length * BG_NOTE_DURATION * 1000;
    bgLoopTimeout = setTimeout(() => {
      if (bgMusicPlaying && !bgMusicMuted) {
        playBgLoop(bgMusicMuted);
      }
    }, totalDuration);
  } catch (e) {
    // Silently fail
  }
}

export function startBackgroundMusic(muted = false) {
  bgMusicMuted = muted;
  if (bgMusicPlaying) return;
  bgMusicPlaying = true;
  if (!muted) {
    try {
      getAudioContext().resume();
    } catch (e) {}
    playBgLoop(false);
  }
}

export function stopBackgroundMusic() {
  bgMusicPlaying = false;
  bgMusicMuted = true;
  if (bgLoopTimeout) {
    clearTimeout(bgLoopTimeout);
    bgLoopTimeout = null;
  }
}

export function setBackgroundMusicMuted(muted: boolean) {
  bgMusicMuted = muted;
  if (!muted && bgMusicPlaying) {
    try {
      getAudioContext().resume();
    } catch (e) {}
    playBgLoop(false);
  } else if (muted && bgLoopTimeout) {
    clearTimeout(bgLoopTimeout);
    bgLoopTimeout = null;
  }
}

// ===== Sound Effects =====

export function playWinSound() {
  // Celebratory fanfare
  const melody = [
    { freq: 523, time: 0 },
    { freq: 659, time: 0.1 },
    { freq: 784, time: 0.2 },
    { freq: 1047, time: 0.3 },
    { freq: 784, time: 0.45 },
    { freq: 1047, time: 0.55 },
    { freq: 1319, time: 0.65 },
    { freq: 1568, time: 0.8 },
  ];

  melody.forEach(({ freq, time }) => {
    playTone(freq, 0.25, 'sine', 0.25, time);
    playTone(freq * 0.5, 0.3, 'triangle', 0.1, time);
  });
}

export function playPopupSound() {
  [523, 659, 784, 1047].forEach((freq, i) => {
    playTone(freq, 0.2, 'sine', 0.2, i * 0.08);
  });
}

export function playButtonClick() {
  playTone(440, 0.08, 'sine', 0.15);
}

export function playConfettiSound() {
  for (let i = 0; i < 8; i++) {
    const freq = 600 + Math.random() * 800;
    playTone(freq, 0.15, 'sine', 0.15, i * 0.06);
  }
}
