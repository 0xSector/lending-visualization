import { useEffect, useState, useMemo, useRef } from 'react';
import type { Asset } from '../types/transaction';

interface OrbitingDotProps {
  globeSize: number;
  phase: 'orbiting' | 'settling' | 'done';
  asset: Asset;
  onSettled: () => void;
  tablePosition: { x: number; y: number };
}

// Visa brand colors
const VISA_BLUE = '#00A1E0';
const VISA_BLUE_GLOW = 'rgba(0, 161, 224, 0.5)';

export function OrbitingDot({ globeSize, phase, asset, onSettled, tablePosition }: OrbitingDotProps) {
  // Start from behind the globe (left side, angle = 200 degrees)
  const [angle, setAngle] = useState(200);
  const [settleProgress, setSettleProgress] = useState(0);

  // Use refs for callback and interval tracking
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;
  const settleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSettledRef = useRef(false);

  const orbitRadiusX = globeSize * 0.55;
  const orbitRadiusY = globeSize * 0.2;
  const centerX = globeSize / 2;
  const centerY = globeSize / 2;

  // Store trail positions
  const [trail, setTrail] = useState<Array<{ x: number; y: number; angle: number }>>([]);

  // Orbit animation - single pass from behind (200°) to front-right (-20°)
  useEffect(() => {
    if (phase !== 'orbiting') return;

    const interval = setInterval(() => {
      setAngle((prev) => {
        const newAngle = prev - 3; // Move clockwise

        // Calculate position for trail
        const radians = (prev * Math.PI) / 180;
        const x = centerX + Math.cos(radians) * orbitRadiusX;
        const y = centerY + Math.sin(radians) * orbitRadiusY;

        setTrail((prevTrail) => {
          const newTrail = [{ x, y, angle: prev }, ...prevTrail].slice(0, 15);
          return newTrail;
        });

        return newAngle;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [phase, centerX, centerY, orbitRadiusX, orbitRadiusY]);

  // Handle settling animation with smooth interpolation
  useEffect(() => {
    if (phase === 'settling' && !hasSettledRef.current) {
      hasSettledRef.current = true;

      // Clear any existing interval
      if (settleIntervalRef.current) {
        clearInterval(settleIntervalRef.current);
      }

      // Animate settle progress from 0 to 1
      let progress = 0;
      settleIntervalRef.current = setInterval(() => {
        progress += 0.03;
        setSettleProgress(Math.min(progress, 1));

        // Fade out trail
        setTrail((prev) => prev.slice(1));

        if (progress >= 1) {
          if (settleIntervalRef.current) {
            clearInterval(settleIntervalRef.current);
            settleIntervalRef.current = null;
          }
          onSettledRef.current();
        }
      }, 16);
    }

    return () => {
      // Only clear if we're unmounting, not on re-render
      if (settleIntervalRef.current && phase !== 'settling') {
        clearInterval(settleIntervalRef.current);
        settleIntervalRef.current = null;
      }
    };
  }, [phase]);

  // Calculate current position
  const radians = (angle * Math.PI) / 180;

  // Orbit position
  const orbitX = centerX + Math.cos(radians) * orbitRadiusX;
  const orbitY = centerY + Math.sin(radians) * orbitRadiusY;

  // Smooth easing function
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const easedProgress = easeOutCubic(settleProgress);

  // Interpolate between orbit position and table position
  const currentX = phase === 'settling' || phase === 'done'
    ? orbitX + (tablePosition.x - orbitX) * easedProgress
    : orbitX;
  const currentY = phase === 'settling' || phase === 'done'
    ? orbitY + (tablePosition.y - orbitY) * easedProgress
    : orbitY;

  // Determine if in front of or behind the globe
  const isInFront = Math.cos(radians) > -0.2;

  // Scale based on depth and settle progress
  const orbitScale = 0.8 + (Math.cos(radians) + 1) * 0.2;
  const settleScale = 1 - settleProgress * 0.3;
  const depthScale = phase === 'orbiting' ? orbitScale : orbitScale * settleScale;

  const opacity = phase === 'done'
    ? 0
    : phase === 'settling'
      ? 1 - settleProgress * 0.5
      : isInFront ? 1 : 0.35;

  // Memoize trail elements
  const trailElements = useMemo(() => {
    return trail.map((point, i) => {
      const trailRadians = (point.angle * Math.PI) / 180;
      const trailIsInFront = Math.cos(trailRadians) > -0.2;
      const trailOpacity = ((15 - i) / 15) * 0.5 * (trailIsInFront ? 1 : 0.25);
      const trailScale = 1 - (i / 15) * 0.7;

      return (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: point.x,
            top: point.y,
            width: 10 * trailScale,
            height: 10 * trailScale,
            backgroundColor: VISA_BLUE,
            opacity: trailOpacity,
            transform: 'translate(-50%, -50%)',
            zIndex: trailIsInFront ? 15 : 3,
          }}
        />
      );
    });
  }, [trail]);

  return (
    <>
      {/* Trail */}
      {(phase === 'orbiting' || (phase === 'settling' && trail.length > 0)) && trailElements}

      {/* Main asset icon */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: currentX,
          top: currentY,
          transform: `translate(-50%, -50%) scale(${depthScale})`,
          opacity,
          zIndex: isInFront || phase === 'settling' ? 20 : 5,
        }}
      >
        {/* Outer glow effect */}
        <div
          className="absolute rounded-full blur-xl"
          style={{
            backgroundColor: VISA_BLUE_GLOW,
            width: 56,
            height: 56,
            left: -18,
            top: -18,
            opacity: 0.6,
          }}
        />
        {/* Inner glow */}
        <div
          className="absolute rounded-full blur-md"
          style={{
            backgroundColor: VISA_BLUE,
            width: 40,
            height: 40,
            left: -10,
            top: -10,
            opacity: 0.4,
          }}
        />
        {/* Asset circle */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-[10px] tracking-wide font-mono"
          style={{
            backgroundColor: VISA_BLUE,
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: `0 4px 20px ${VISA_BLUE_GLOW}, inset 0 1px 0 rgba(255,255,255,0.2)`,
          }}
        >
          {asset.slice(0, 4)}
        </div>
      </div>
    </>
  );
}
