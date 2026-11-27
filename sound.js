const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol = 0.08) {
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

const SFX = {
  click: () => playTone(600, 'square', 0.06),
  type: () => playTone(850 + Math.random() * 200, 'square', 0.025, 0.03),
  build: () => {
    playTone(440, 'square', 0.08);
    setTimeout(() => playTone(660, 'square', 0.1), 80);
  },
  scrap: () => {
    playTone(300, 'sawtooth', 0.08);
    setTimeout(() => playTone(220, 'sawtooth', 0.1), 70);
  },
  nextDay: () => {
    playTone(330, 'triangle', 0.1);
    setTimeout(() => playTone(520, 'triangle', 0.15), 100);
  },
  alert: () => {
    playTone(200, 'sawtooth', 0.2);
    setTimeout(() => playTone(160, 'sawtooth', 0.25), 180);
  },
  win: () => {
    playTone(523, 'square', 0.12);
    setTimeout(() => playTone(659, 'square', 0.12), 110);
    setTimeout(() => playTone(784, 'square', 0.12), 220);
    setTimeout(() => playTone(1046, 'square', 0.25), 330);
  }
};
