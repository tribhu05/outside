// Pure Web Audio API ambient chime - no external sound files needed
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSingingBowlChime(fundamentalFreq = 432) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Fundamental tone + gentle harmonising overtones
    const freqs = [fundamentalFreq, fundamentalFreq * 1.5, fundamentalFreq * 2.02, fundamentalFreq * 2.76];
    const gains = [0.4, 0.2, 0.1, 0.05];

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      // Gentle attack
      gain.gain.linearRampToValueAtTime(gains[i], now + 0.04);
      // Long, peaceful decay
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 3.3);
    });
  } catch (e) {
    console.warn('Audio chime skipped:', e);
  }
}
