import { useEffect, useState, useMemo, useRef } from 'react';
import type { Asset } from '../types/transaction';

interface OrbitingDotProps {
  globeSize: number;
  globeCenter: { x: number; y: number };
  phase: 'orbiting' | 'settling' | 'done';
  asset: Asset;
  onSettled: () => void;
  tablePosition: { x: number; y: number };
}

// Asset brand colors
const ASSET_COLORS: Record<string, string> = {
  USDC: '#2775CA', // USDC blue
  USDT: '#26A17B', // Tether green
  ETH: '#627EEA',  // Ethereum purple
  WETH: '#627EEA', // Wrapped ETH
  WBTC: '#F7931A', // Bitcoin orange
  DAI: '#F5AC37',  // DAI yellow
  cbETH: '#0052FF', // Coinbase blue
  stETH: '#00A3FF', // Lido blue
  PYUSD: '#0047BB', // PayPal blue
};

// Asset logo paths
const ASSET_LOGOS: Record<string, string> = {
  USDC: '/tokens/usdc.png',
  USDT: '/tokens/usdt.png',
};

function getAssetColor(asset: string): string {
  return ASSET_COLORS[asset] || '#87CEEB';
}

function getAssetLogo(asset: string): string | null {
  return ASSET_LOGOS[asset] || null;
}

export function OrbitingDot({ globeSize, globeCenter, phase, asset, onSettled, tablePosition }: OrbitingDotProps) {
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
  // Use globeCenter for positioning relative to main container
  const centerX = globeCenter.x;
  const centerY = globeCenter.y;

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

  // Keep fully visible during settling until the very end
  const opacity = phase === 'done'
    ? 0
    : phase === 'settling'
      ? settleProgress > 0.9 ? 1 - (settleProgress - 0.9) * 10 : 1 // Fade only in last 10%
      : isInFront ? 1 : 0.4;

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
            backgroundColor: getAssetColor(asset),
            opacity: trailOpacity,
            transform: 'translate(-50%, -50%)',
            zIndex: trailIsInFront ? 15 : 3,
          }}
        />
      );
    });
  }, [trail, asset]);

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
          zIndex: phase === 'settling' ? 100 : isInFront ? 20 : 5,
          transition: phase === 'settling' ? 'none' : undefined,
        }}
      >
        {/* Asset circle */}
        {getAssetLogo(asset) ? (
          <img
            src={getAssetLogo(asset)!}
            alt={asset}
            className="w-10 h-10 rounded-full"
            style={{
              border: '2px solid #FFFFFF',
            }}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-[10px] tracking-wide font-mono"
            style={{
              backgroundColor: getAssetColor(asset),
              color: '#FFFFFF',
              border: '2px solid #FFFFFF',
            }}
          >
            {asset.slice(0, 4)}
          </div>
        )}
      </div>
    </>
  );
}
