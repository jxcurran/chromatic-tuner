import { useState, useEffect, useRef, useCallback } from 'react';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function detectPitchYIN(buffer: Float32Array, sampleRate: number): number {
  const halfLen = Math.floor(buffer.length / 2);
  const yin = new Float32Array(halfLen);

  // Step 1: Difference function
  for (let tau = 0; tau < halfLen; tau++) {
    for (let j = 0; j < halfLen; j++) {
      const delta = buffer[j] - buffer[j + tau];
      yin[tau] += delta * delta;
    }
  }

  // Step 2: Cumulative mean normalized difference
  yin[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < halfLen; tau++) {
    runningSum += yin[tau];
    yin[tau] *= tau / runningSum;
  }

  // Step 3: Absolute threshold search
  const threshold = 0.1;
  let tau = 2;
  for (; tau < halfLen; tau++) {
    if (yin[tau] < threshold) {
      while (tau + 1 < halfLen && yin[tau + 1] < yin[tau]) tau++;
      break;
    }
  }

  if (tau === halfLen || yin[tau] >= threshold) return -1;

  // Step 4: Parabolic interpolation for better accuracy
  let betterTau: number;
  if (tau > 0 && tau < halfLen - 1) {
    const s0 = yin[tau - 1];
    const s1 = yin[tau];
    const s2 = yin[tau + 1];
    betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
  } else {
    betterTau = tau;
  }

  return sampleRate / betterTau;
}

function closestNote(freq: number): { note: string; freq: number } {
  // MIDI note number (A4=440Hz is MIDI 69)
  const midi = Math.round(12 * Math.log2(freq / 440) + 69);
  const targetFreq = 440 * Math.pow(2, (midi - 69) / 12);
  const octave = Math.floor(midi / 12) - 1;
  const name = NOTE_NAMES[midi % 12];
  return { note: `${name}${octave}`, freq: targetFreq };
}

const AudioContextCtor: typeof AudioContext =
  window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

export function useGuitarTuner() {
  const [isListening, setIsListening] = useState(false);
  const [targetNote, setTargetNote] = useState('--');
  const [cents, setCents] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    setIsListening(false);
    setTargetNote('--');
    setCents(0);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Microphone not supported. Use HTTPS or a modern browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const audioContext = new AudioContextCtor();
      // iOS Safari creates AudioContext in suspended state — must resume after user gesture
      if (audioContext.state === 'suspended') await audioContext.resume();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);

      const loop = () => {
        analyser.getFloatTimeDomainData(buffer);
        const freq = detectPitchYIN(buffer, audioContext.sampleRate);

        if (freq > 60 && freq < 1100) {
          const match = closestNote(freq);
          setTargetNote(match.note);
          const rawCents = 1200 * Math.log2(freq / match.freq);
          setCents(Math.max(-50, Math.min(50, rawCents)));
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
      setIsListening(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('permission')) {
        setError('Microphone access denied. Allow mic access in your browser settings.');
      } else {
        setError('Could not access microphone. ' + msg);
      }
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { isListening, targetNote, cents, error, start, stop };
}
