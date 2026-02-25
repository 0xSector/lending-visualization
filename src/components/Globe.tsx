import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { cn } from "../lib/utils";

const hexToRgbNormalized = (hex: string): [number, number, number] => {
  let r = 0, g = 0, b = 0;
  const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }

  return [r / 255, g / 255, b / 255];
};

interface GlobeProps {
  className?: string;
  size?: number;
  baseColor?: string;
  glowColor?: string;
  markerColor?: string;
}

export function Globe({
  className,
  size = 400,
  baseColor = "#FFFFFF", // White globe surface
  glowColor = "#00A1E0", // Visa light blue glow
  markerColor = "#00A1E0", // Visa light blue for city markers
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const phiRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resolvedGlowColor = hexToRgbNormalized(glowColor);
    const resolvedMarkerColor = hexToRgbNormalized(markerColor);

    const devicePixelRatio = window.devicePixelRatio || 1;

    // Visa light blue for land dots
    const visaBlue: [number, number, number] = [0, 161/255, 224/255]; // #00A1E0

    globeRef.current = createGlobe(canvas, {
      devicePixelRatio,
      width: size * devicePixelRatio,
      height: size * devicePixelRatio,
      phi: 0,
      theta: 0.25,
      dark: 0, // Light mode - white background
      scale: 1.05,
      diffuse: 2,
      mapSamples: 20000,
      mapBrightness: 8,
      baseColor: visaBlue, // Visa blue for land dots
      markerColor: resolvedMarkerColor,
      glowColor: resolvedGlowColor,
      opacity: 1,
      offset: [0, 0],
      markers: [
        // Major DeFi hubs
        { location: [40.7128, -74.006], size: 0.06 },   // New York
        { location: [51.5074, -0.1278], size: 0.06 },   // London
        { location: [35.6762, 139.6503], size: 0.05 }, // Tokyo
        { location: [1.3521, 103.8198], size: 0.05 },  // Singapore
        { location: [22.3193, 114.1694], size: 0.05 }, // Hong Kong
        { location: [47.3769, 8.5417], size: 0.05 },   // Zurich
        { location: [37.7749, -122.4194], size: 0.05 }, // San Francisco
        { location: [52.52, 13.405], size: 0.04 },     // Berlin
        { location: [48.8566, 2.3522], size: 0.04 },   // Paris
        { location: [-33.8688, 151.2093], size: 0.04 }, // Sydney
      ],
      onRender: (state: Record<string, number>) => {
        state.phi = phiRef.current;
        phiRef.current += 0.002; // Slower, more elegant rotation
      },
    });

    return () => {
      if (globeRef.current) {
        globeRef.current.destroy();
        globeRef.current = null;
      }
    };
  }, [size, baseColor, glowColor, markerColor]);

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          aspectRatio: "1",
          display: "block",
        }}
      />
    </div>
  );
}

export default Globe;
