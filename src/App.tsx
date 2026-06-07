import { useGuitarTuner } from './hooks/useGuitarTuner';
import { TunerDial } from './components/TunerDial';

function App() {
  const { isListening, targetNote, cents, start, stop } = useGuitarTuner();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-10 px-4">
      <p className="text-3xl font-semibold tracking-widest text-gray-400 uppercase m-0">
        Vibe Tuner
      </p>

      <div className="bg-gray-900 rounded-3xl p-10 shadow-2xl border border-gray-800">
        <TunerDial targetNote={targetNote} cents={cents} />
      </div>

      <button
        onClick={isListening ? stop : start}
        className={`px-10 py-3 rounded-full font-semibold text-white tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 ${
          isListening
            ? 'bg-red-600 hover:bg-red-500 focus-visible:ring-red-500'
            : 'bg-violet-600 hover:bg-violet-500 focus-visible:ring-violet-500'
        }`}
      >
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
    </div>
  );
}

export default App;
