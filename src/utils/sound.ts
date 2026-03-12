// Sound utility using Web Audio API - no external files needed
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.3,
  startTime = 0,
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
    gainNode.gain.linearRampToValueAtTime(
      volume,
      ctx.currentTime + startTime + 0.01,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + startTime + duration,
    );

    oscillator.start(ctx.currentTime + startTime);
    oscillator.stop(ctx.currentTime + startTime + duration);
  } catch (e) {
    // Silently fail if audio not supported
  }
}

// ===== Background Music =====
let bgMusicPlaying = false;
let bgMusicMuted = false;

let bgAudio: HTMLAudioElement | null = null;

function getBackgroundAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!bgAudio) {
    // Đặt file nhạc quay số may mắn tại: /public/audio/nhac-quay-so-may-man.mp3
    bgAudio = new Audio("/audio/nhac-quay-so-may-man.mp3");
    bgAudio.loop = true;
    bgAudio.volume = 0.45;
  }
  return bgAudio;
}

export function startBackgroundMusic(muted = false) {
  bgMusicMuted = muted;
  if (bgMusicPlaying) return;
  bgMusicPlaying = true;
  if (!muted) {
    const audio = getBackgroundAudio();
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // ignore play errors (autoplay policy, etc.)
      });
    }
  }
}

export function stopBackgroundMusic() {
  bgMusicPlaying = false;
  bgMusicMuted = true;
  const audio = getBackgroundAudio();
  if (audio) {
    audio.pause();
  }
}

export function setBackgroundMusicMuted(muted: boolean) {
  bgMusicMuted = muted;
  if (!muted && bgMusicPlaying) {
    const audio = getBackgroundAudio();
    if (audio) {
      audio.play().catch(() => {
        // ignore play errors
      });
    }
  } else if (muted) {
    const audio = getBackgroundAudio();
    if (audio) {
      audio.pause();
    }
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
    playTone(freq, 0.25, "sine", 0.25, time);
    playTone(freq * 0.5, 0.3, "triangle", 0.1, time);
  });
}

export function playPopupSound() {
  [523, 659, 784, 1047].forEach((freq, i) => {
    playTone(freq, 0.2, "sine", 0.2, i * 0.08);
  });
}

export function playButtonClick() {
  playTone(440, 0.08, "sine", 0.15);
}

export function playConfettiSound() {
  for (let i = 0; i < 8; i++) {
    const freq = 600 + Math.random() * 800;
    playTone(freq, 0.15, "sine", 0.15, i * 0.06);
  }
}
