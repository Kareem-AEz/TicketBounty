import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Constants
// ============================================================================

const WIDTH = 100;
const SEGMENTS_HEIGHT = 2;
const SPACING = 4;

const SEGMENTS = [
  { color: "stroke-rose-600", label: "Weak" },
  { color: "stroke-orange-500", label: "Fair" },
  { color: "stroke-yellow-400", label: "Strong" },
  { color: "stroke-green-500", label: "Very Strong" },
] as const;

// ============================================================================
// Animation Variants
// ============================================================================

const labelVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    y: 10 * direction,
    scale: 0.93,
    filter: "blur(4px)",
  }),
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    opacity: 0,
    y: -10 * direction,
    scale: 0.93,
    filter: "blur(4px)",
  }),
};

// ============================================================================
// Types
// ============================================================================

export type StrengthLevel = 0 | 1 | 2 | 3 | 4;

interface SegmentPosition {
  start: number;
  end: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateSegmentPositions(segmentCount: number): SegmentPosition[] {
  if (segmentCount === 0) return [];

  const effectiveWidth = WIDTH - SEGMENTS_HEIGHT;
  const totalSpacing = (segmentCount - 1) * SPACING;
  const segmentLength = (effectiveWidth - totalSpacing) / segmentCount;
  const offset = SEGMENTS_HEIGHT / 2;

  return Array.from({ length: segmentCount }, (_, i) => {
    const start = offset + i * (segmentLength + SPACING);
    return {
      start,
      end: start + segmentLength,
    };
  });
}

// ============================================================================
// Component
// ============================================================================

export default function PasswordStrengthMeter({
  strength = 0,
}: {
  strength: StrengthLevel;
}) {
  // ========================================
  // State - Track animation direction
  // ========================================

  const [state, setState] = useState({
    previousStrength: strength,
    direction: 0,
  });

  if (strength !== state.previousStrength) {
    const newDirection = strength > state.previousStrength ? -1 : 1;
    setState({ previousStrength: strength, direction: newDirection });
  }

  // ========================================
  // Derived Values
  // ========================================

  const segments = useMemo(() => SEGMENTS.slice(0, strength), [strength]);

  const segmentPositions = useMemo(
    () => calculateSegmentPositions(segments.length),
    [segments.length],
  );

  const label = segments.at(-1)?.label || "Password Strength";

  // ========================================
  // Render Animated Lines
  // ========================================

  const lines = useMemo(
    () =>
      segments.map((segment, i: number) => {
        const { start, end } = segmentPositions[i];
        const offset = SEGMENTS_HEIGHT / 2;
        const length = end - start;

        return (
          <motion.line
            key={segment.label}
            initial={{
              x1: WIDTH + offset,
              y1: offset,
              x2: WIDTH + length,
              y2: offset,
            }}
            animate={{
              x1: start,
              y1: offset,
              x2: end,
              y2: offset,
            }}
            exit={{
              x1: WIDTH + offset + SPACING,
              y1: offset,
              x2: WIDTH + length,
              y2: offset,
            }}
            className={cn(segment.color)}
            stroke="currentColor"
            strokeWidth={SEGMENTS_HEIGHT}
            strokeLinecap="round"
          />
        );
      }),
    [segments, segmentPositions],
  );

  // ========================================
  // Render
  // ========================================

  return (
    <MotionConfig transition={{ type: "spring", duration: 0.6, bounce: 0.05 }}>
      <div className="flex h-9 flex-col items-center justify-center">
        {/* Strength Meter Segments */}
        {segments.length > 0 && (
          <motion.svg
            width="100%"
            viewBox={`0 0 ${WIDTH} ${SEGMENTS_HEIGHT}`}
            preserveAspectRatio="none"
            className="mb-auto"
            style={{
              overflow: "visible",
              filter: "drop-shadow(0 0 0px rgba(0,0,0,0))",
            }}
          >
            <defs>
              <clipPath id="rounded-clip">
                <rect
                  x="0"
                  y="0"
                  width={WIDTH}
                  height={SEGMENTS_HEIGHT}
                  rx={SEGMENTS_HEIGHT / 2}
                  ry={SEGMENTS_HEIGHT / 2}
                />
              </clipPath>
            </defs>
            <g clipPath="url(#rounded-clip)">
              <AnimatePresence mode="popLayout">{lines}</AnimatePresence>
            </g>
          </motion.svg>
        )}

        {/* Animated Label */}
        <AnimatePresence mode="popLayout" custom={state.direction}>
          <motion.span
            key={label}
            layout="position"
            variants={labelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            custom={state.direction}
            className="text-muted-foreground w-full text-center text-xs font-medium will-change-transform"
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
