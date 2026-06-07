Act as an expert React and Web Audio API developer. I am building a guitar tuner application.

1. The Audio Hook (src/hooks/useGuitarTuner.ts):
Write a custom React hook that requests microphone permissions (navigator.mediaDevices.getUserMedia) and sets up an AudioContext and AnalyserNode.

    Create a requestAnimationFrame loop to extract a Float32Array of time-domain data.

    Implement a robust YIN or Autocorrelation algorithm in pure TypeScript to detect the fundamental frequency (Hz) from the array.

    Include standard guitar tuning frequencies (E2: 82.41, A2: 110.00, D3: 146.83, G3: 196.00, B3: 246.94, E4: 329.63). Map the detected Hz to the closest string.

    Calculate the cents deviation using the formula: Cents = 1200 * log2(Detected_Hz / Target_Hz).

    Return the current targetNote, the cents deviation (clamped between -50 and 50), and a boolean isListening. Ensure proper cleanup of the audio context on unmount.

2. The UI Component (src/components/TunerDial.tsx):
Create a dark-mode, GuitarTuna-style semi-circular dial using Tailwind CSS and inline SVGs.

    Display the targetNote prominently in the center.

    Draw a needle originating from the bottom center. Map the cents prop to the needle's rotation (-50 cents is far left, +50 cents is far right, 0 is straight up).

    Crucial: Use framer-motion (motion.div or motion.path) with a spring transition for the needle's rotation so it moves fluidly and smooths out the raw audio data jitter.

    If the string is in tune (cents between -3 and +3), transition the needle and text color to a vibrant green. Otherwise, keep it white/neutral.

3. The Main View (src/App.tsx):
Wire the hook and the UI component together. Add a prominent "Start Listening" button to initialize the audio context (required by browsers to prevent auto-play audio).
