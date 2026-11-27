const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

const SFX = {
  click: () => playTone(600, 'square', 0.06),
  build: () => {
    playTone(440, 'square', 0.08);
    setTimeout(() => playTone(660, 'square', 0.1), 80);
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
