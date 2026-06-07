import { motion } from 'framer-motion';

interface Props {
  targetNote: string;
  cents: number;
}

const CX = 150;
const CY = 160;
const RADIUS = 125;

function buildTicks() {
  const ticks = [];
  for (let i = -50; i <= 50; i += 5) {
    // Map -50..50 cents to -90..90 degrees from straight-up
    const angleDeg = (i / 50) * 90;
    const rad = (angleDeg * Math.PI) / 180;
    const isMajor = i % 10 === 0;
    const outer = RADIUS;
    const inner = isMajor ? RADIUS - 18 : RADIUS - 10;
    ticks.push({
      x1: CX + outer * Math.sin(rad),
      y1: CY - outer * Math.cos(rad),
      x2: CX + inner * Math.sin(rad),
      y2: CY - inner * Math.cos(rad),
      isMajor,
      label: i === 0 ? '0' : i === -50 ? '-' : i === 50 ? '+' : null,
      labelX: CX + (RADIUS - 30) * Math.sin(rad),
      labelY: CY - (RADIUS - 30) * Math.cos(rad),
    });
  }
  return ticks;
}

const TICKS = buildTicks();

export function TunerDial({ targetNote, cents }: Props) {
  const inTune = targetNote !== '--' && Math.abs(cents) <= 3;
  const accentColor = inTune ? '#22c55e' : '#e2e8f0';
  const needleRotation = (cents / 50) * 90;

  // Semi-circle arc path: left edge to right edge
  const arcD = `M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`;

  return (
    <div className="flex flex-col items-center select-none">
      <svg width="300" height="200" viewBox="0 0 300 200" aria-label="Tuner dial">
        {/* Outer arc track */}
        <path d={arcD} fill="none" stroke="#374151" strokeWidth="3" />

        {/* Tick marks */}
        {TICKS.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1}
            x2={t.x2} y2={t.y2}
            stroke={t.isMajor ? '#6b7280' : '#374151'}
            strokeWidth={t.isMajor ? 2 : 1}
          />
        ))}

        {/* Center labels */}
        {TICKS.filter(t => t.label).map((t, i) => (
          <text
            key={i}
            x={t.labelX}
            y={t.labelY + 4}
            textAnchor="middle"
            fill="#6b7280"
            fontSize="11"
            fontFamily="system-ui, sans-serif"
          >
            {t.label}
          </text>
        ))}

        {/* Needle */}
        <motion.g
          style={{ transformOrigin: `${CX}px ${CY}px` }}
          animate={{ rotate: needleRotation }}
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
        >
          {/* Shadow line for depth */}
          <line
            x1={CX} y1={CY}
            x2={CX} y2={CY - RADIUS + 22}
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <motion.line
            x1={CX} y1={CY}
            x2={CX} y2={CY - RADIUS + 22}
            stroke={accentColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ stroke: accentColor }}
            transition={{ duration: 0.3 }}
          />
        </motion.g>

        {/* Pivot dot */}
        <motion.circle
          cx={CX} cy={CY} r={6}
          animate={{ fill: accentColor }}
          transition={{ duration: 0.3 }}
        />
      </svg>

      {/* Note name */}
      <motion.div
        animate={{ color: accentColor }}
        transition={{ duration: 0.3 }}
        style={{ color: accentColor }}
        className="text-7xl font-bold tracking-tight mt-1"
      >
        {targetNote}
      </motion.div>

      {/* Cents readout */}
      <div className="text-sm text-gray-500 mt-2 font-mono">
        {targetNote === '--'
          ? 'waiting for signal'
          : cents >= 0
            ? `+${cents.toFixed(1)}¢`
            : `${cents.toFixed(1)}¢`}
      </div>
    </div>
  );
}
