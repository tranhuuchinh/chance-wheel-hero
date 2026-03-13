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

function playNoise(duration: number, volume: number, startTime: number) {
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 8000;
    bandpass.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);
    noise.start(ctx.currentTime + startTime);
    noise.stop(ctx.currentTime + startTime + duration);
  } catch (e) {
    // Silently fail
  }
}

// ===== Sound Effects =====

export function playWinSound() {
  // Grand triumphant fanfare with chords, bass, and sparkle
  const fanfare: { freq: number; time: number; dur: number; type: OscillatorType; vol: number }[] = [
    // Opening drum hits (low percussive tones)
    { freq: 100, time: 0, dur: 0.15, type: "square", vol: 0.2 },
    { freq: 80, time: 0.08, dur: 0.12, type: "square", vol: 0.15 },

    // Ascending brass-like fanfare (C major -> G -> C5)
    { freq: 523, time: 0.05, dur: 0.35, type: "sawtooth", vol: 0.12 },
    { freq: 659, time: 0.05, dur: 0.35, type: "sawtooth", vol: 0.1 },
    { freq: 784, time: 0.05, dur: 0.35, type: "sawtooth", vol: 0.08 },

    // Quick ascending arpeggio
    { freq: 523, time: 0.15, dur: 0.2, type: "sine", vol: 0.2 },
    { freq: 659, time: 0.2, dur: 0.2, type: "sine", vol: 0.2 },
    { freq: 784, time: 0.25, dur: 0.2, type: "sine", vol: 0.22 },
    { freq: 1047, time: 0.3, dur: 0.3, type: "sine", vol: 0.25 },

    // Bass note support
    { freq: 131, time: 0.15, dur: 0.5, type: "triangle", vol: 0.15 },

    // Second phrase - triumphant repeat higher
    { freq: 100, time: 0.45, dur: 0.12, type: "square", vol: 0.18 },
    { freq: 784, time: 0.5, dur: 0.2, type: "sine", vol: 0.22 },
    { freq: 1047, time: 0.55, dur: 0.2, type: "sine", vol: 0.24 },
    { freq: 1319, time: 0.6, dur: 0.25, type: "sine", vol: 0.25 },
    { freq: 1568, time: 0.7, dur: 0.4, type: "sine", vol: 0.28 },

    // Chord under the high note (C major)
    { freq: 523, time: 0.7, dur: 0.5, type: "triangle", vol: 0.12 },
    { freq: 659, time: 0.7, dur: 0.5, type: "triangle", vol: 0.1 },
    { freq: 784, time: 0.7, dur: 0.5, type: "triangle", vol: 0.08 },
    { freq: 196, time: 0.7, dur: 0.5, type: "triangle", vol: 0.12 },

    // Final triumphant sustain with octave
    { freq: 2093, time: 0.85, dur: 0.6, type: "sine", vol: 0.18 },
    { freq: 1047, time: 0.85, dur: 0.6, type: "sine", vol: 0.15 },
    { freq: 1568, time: 0.9, dur: 0.5, type: "sine", vol: 0.12 },

    // Sparkle/shimmer trail
    { freq: 2637, time: 0.95, dur: 0.3, type: "sine", vol: 0.08 },
    { freq: 3136, time: 1.0, dur: 0.25, type: "sine", vol: 0.06 },
    { freq: 3520, time: 1.05, dur: 0.2, type: "sine", vol: 0.05 },
    { freq: 4186, time: 1.1, dur: 0.15, type: "sine", vol: 0.04 },
  ];

  fanfare.forEach(({ freq, time, dur, type, vol }) => {
    playTone(freq, dur, type, vol, time);
  });

  // Cymbal-like noise hits
  playNoise(0.25, 0.08, 0);
  playNoise(0.15, 0.06, 0.45);
  playNoise(0.3, 0.07, 0.85);
}

export function playPopupSound() {
  // Lively "ta-da!" with chord stab and rapid sparkle arpeggio
  const tada: { freq: number; time: number; dur: number; type: OscillatorType; vol: number }[] = [
    // Snare-like hit
    { freq: 150, time: 0, dur: 0.08, type: "square", vol: 0.2 },

    // Major chord stab (C major)
    { freq: 523, time: 0.02, dur: 0.3, type: "sine", vol: 0.22 },
    { freq: 659, time: 0.02, dur: 0.3, type: "sine", vol: 0.18 },
    { freq: 784, time: 0.02, dur: 0.3, type: "sine", vol: 0.15 },
    { freq: 262, time: 0.02, dur: 0.35, type: "triangle", vol: 0.12 },

    // Fast sparkle run up
    { freq: 1047, time: 0.15, dur: 0.12, type: "sine", vol: 0.15 },
    { freq: 1319, time: 0.19, dur: 0.12, type: "sine", vol: 0.15 },
    { freq: 1568, time: 0.23, dur: 0.12, type: "sine", vol: 0.16 },
    { freq: 2093, time: 0.27, dur: 0.15, type: "sine", vol: 0.17 },
    { freq: 2637, time: 0.31, dur: 0.18, type: "sine", vol: 0.14 },
    { freq: 3136, time: 0.35, dur: 0.15, type: "sine", vol: 0.1 },
    { freq: 3520, time: 0.38, dur: 0.1, type: "sine", vol: 0.06 },
  ];

  tada.forEach(({ freq, time, dur, type, vol }) => {
    playTone(freq, dur, type, vol, time);
  });

  playNoise(0.12, 0.06, 0);
}

export function playButtonClick() {
  playTone(440, 0.08, "sine", 0.15);
}

export function playConfettiSound() {
  // Festive "popping" confetti with rhythmic sparkles and mini drum pattern
  for (let i = 0; i < 5; i++) {
    // "Pop" sounds - short percussive bursts
    playTone(200 + i * 50, 0.06, "square", 0.12, i * 0.12);
    playNoise(0.05, 0.08, i * 0.12);
  }

  // Rapid sparkle cascade (descending then ascending)
  const sparkleNotes = [2093, 1760, 1568, 1319, 1175, 1319, 1568, 1760, 2093, 2349, 2637, 3136];
  sparkleNotes.forEach((freq, i) => {
    playTone(freq, 0.12, "sine", 0.1 + Math.random() * 0.05, 0.1 + i * 0.05);
  });

  // Background chord shimmer
  [523, 659, 784, 1047].forEach((freq) => {
    playTone(freq, 0.8, "triangle", 0.06, 0.1);
  });

  // Final celebratory stinger
  playTone(1047, 0.3, "sine", 0.15, 0.75);
  playTone(1319, 0.3, "sine", 0.12, 0.8);
  playTone(1568, 0.35, "sine", 0.14, 0.85);
  playTone(2093, 0.4, "sine", 0.16, 0.9);
  playNoise(0.2, 0.05, 0.85);
}

// ===== Spinning / ticking sound =====

let spinTimer: number | null = null;
let spinStartedAt: number | null = null;

export function startSpinSound() {
  try {
    if (spinTimer !== null) return;
    if (typeof window === "undefined") return;

    // Ensure audio context is created/unlocked after user interaction
    getAudioContext();

    const baseInterval = 80;
    const maxInterval = 220;
    const rampDuration = 6000;
    const start =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    spinStartedAt = start;

    const tick = () => {
      if (spinStartedAt == null) {
        spinTimer = null;
        return;
      }

      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const elapsed = now - spinStartedAt;
      const t = Math.min(elapsed / rampDuration, 1);

      // Cheerful click + sparkle with slight randomness
      const sparkleFreq = 1400 + Math.random() * 240;
      const clickFreq = 260 + Math.random() * 60;
      playTone(sparkleFreq, 0.06, "triangle", 0.12);
      playTone(clickFreq, 0.04, "square", 0.08);

      // Gradually slow down tick speed over time
      const interval =
        baseInterval + (maxInterval - baseInterval) * (0.2 + 0.8 * t);
      spinTimer = window.setTimeout(tick, interval);
    };

    spinTimer = window.setTimeout(tick, baseInterval);
  } catch {
    // ignore audio errors
  }
}

export function stopSpinSound() {
  if (typeof window === "undefined") return;
  if (spinTimer !== null) {
    window.clearTimeout(spinTimer);
    spinTimer = null;
  }
  spinStartedAt = null;
}
