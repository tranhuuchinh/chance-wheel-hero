import { useRef, useEffect, useState } from "react";

interface LuckyWheelProps {
  isSpinning: boolean;
  onSpinComplete: () => void;
  remainingCount: number;
}

const SEGMENTS = 12;

const SEGMENT_FILLS = [
  { bg: '#b8232a', fg: '#fff' },
  { bg: '#f5c518', fg: '#3a2400' },
  { bg: '#1a6b3c', fg: '#fff' },
  { bg: '#f5c518', fg: '#3a2400' },
  { bg: '#b8232a', fg: '#fff' },
  { bg: '#1a6b3c', fg: '#fff' },
  { bg: '#b8232a', fg: '#fff' },
  { bg: '#f5c518', fg: '#3a2400' },
  { bg: '#1a6b3c', fg: '#fff' },
  { bg: '#f5c518', fg: '#3a2400' },
  { bg: '#b8232a', fg: '#fff' },
  { bg: '#1a6b3c', fg: '#fff' },
];

export function LuckyWheel({ isSpinning, onSpinComplete, remainingCount }: LuckyWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const [displayAngle, setDisplayAngle] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const SIZE = 380;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const OUTER_R = SIZE / 2 - 6;
  const RING_W = 22;
  const WHEEL_R = OUTER_R - RING_W;

  function drawWheel(angle: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (!Number.isFinite(angle)) angle = 0;

    ctx.clearRect(0, 0, SIZE, SIZE);
    const arc = (2 * Math.PI) / SEGMENTS;

    // --- Outer wooden ring ---
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, OUTER_R, 0, 2 * Math.PI);
    ctx.arc(CX, CY, WHEEL_R, 0, 2 * Math.PI, true);
    ctx.closePath();

    const ringGrad = ctx.createRadialGradient(CX, CY, WHEEL_R, CX, CY, OUTER_R);
    ringGrad.addColorStop(0, '#5c3a1e');
    ringGrad.addColorStop(0.3, '#8b5e3c');
    ringGrad.addColorStop(0.6, '#a0714a');
    ringGrad.addColorStop(0.85, '#7a4f30');
    ringGrad.addColorStop(1, '#4a2c12');
    ctx.fillStyle = ringGrad;
    ctx.fill();

    // Wood grain texture on ring
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const rr = WHEEL_R + 4 + Math.random() * (RING_W - 8);
      const x1 = CX + Math.cos(a) * rr;
      const y1 = CY + Math.sin(a) * rr;
      const x2 = CX + Math.cos(a + 0.03) * (rr + 2);
      const y2 = CY + Math.sin(a + 0.03) * (rr + 2);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = '#3a1f08';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Ring inner/outer edges (bevel)
    ctx.beginPath();
    ctx.arc(CX, CY, OUTER_R, 0, 2 * Math.PI);
    ctx.strokeStyle = '#3a1f08';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(CX, CY, OUTER_R - 1.5, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,220,160,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(CX, CY, WHEEL_R, 0, 2 * Math.PI);
    ctx.strokeStyle = '#3a1f08';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(CX, CY, WHEEL_R + 1.5, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,220,160,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // --- Metal pegs / bulbs around the outer ring ---
    const PEG_COUNT = 24;
    const PEG_R = 5.5;
    const pegRingR = (OUTER_R + WHEEL_R) / 2;
    for (let i = 0; i < PEG_COUNT; i++) {
      const a = (i / PEG_COUNT) * Math.PI * 2;
      const px = CX + Math.cos(a) * pegRingR;
      const py = CY + Math.sin(a) * pegRingR;

      // Peg shadow
      ctx.beginPath();
      ctx.arc(px + 1, py + 1, PEG_R, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(30,15,5,0.35)';
      ctx.fill();

      // Peg body - brass/gold metal
      const pegGrad = ctx.createRadialGradient(px - 1.5, py - 1.5, 0.5, px, py, PEG_R);
      pegGrad.addColorStop(0, '#ffe8a0');
      pegGrad.addColorStop(0.4, '#d4a843');
      pegGrad.addColorStop(0.8, '#a07828');
      pegGrad.addColorStop(1, '#6b4f1a');
      ctx.beginPath();
      ctx.arc(px, py, PEG_R, 0, 2 * Math.PI);
      ctx.fillStyle = pegGrad;
      ctx.fill();

      // Peg highlight
      ctx.beginPath();
      ctx.arc(px - 1.5, py - 1.5, 2, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255,245,200,0.6)';
      ctx.fill();
    }

    // --- Colored segments ---
    for (let i = 0; i < SEGMENTS; i++) {
      const startAngle = angle + i * arc;
      const endAngle = startAngle + arc;
      const colors = SEGMENT_FILLS[i % SEGMENT_FILLS.length];

      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, WHEEL_R - 1, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors.bg;
      ctx.fill();

      // Subtle inner shadow along edges for depth
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, WHEEL_R - 1, startAngle, endAngle);
      ctx.closePath();
      ctx.clip();

      const edgeGrad = ctx.createRadialGradient(CX, CY, WHEEL_R * 0.1, CX, CY, WHEEL_R);
      edgeGrad.addColorStop(0, 'rgba(0,0,0,0)');
      edgeGrad.addColorStop(0.85, 'rgba(0,0,0,0)');
      edgeGrad.addColorStop(1, 'rgba(0,0,0,0.2)');
      ctx.fillStyle = edgeGrad;
      ctx.fill();
      ctx.restore();

      // Segment divider lines - thin metallic
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      const ex = CX + Math.cos(startAngle) * (WHEEL_R - 1);
      const ey = CY + Math.sin(startAngle) * (WHEEL_R - 1);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = 'rgba(60,30,10,0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Lighter line beside it for metallic look
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      const lx = CX + Math.cos(startAngle + 0.008) * (WHEEL_R - 1);
      const ly = CY + Math.sin(startAngle + 0.008) * (WHEEL_R - 1);
      ctx.lineTo(lx, ly);
      ctx.strokeStyle = 'rgba(255,230,180,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Number label
      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(startAngle + arc / 2);
      ctx.translate(WHEEL_R * 0.6, 0);
      ctx.rotate(Math.PI / 2);

      ctx.font = '700 20px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Text shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillText((i + 1).toString(), 0.8, 0.8);

      ctx.fillStyle = colors.fg;
      ctx.fillText((i + 1).toString(), 0, 0);
      ctx.restore();
    }

    // --- Small pin pegs at segment dividers (on wheel face) ---
    const PIN_R = 3.5;
    const pinRingR = WHEEL_R - 8;
    for (let i = 0; i < SEGMENTS; i++) {
      const a = angle + i * arc;
      const px = CX + Math.cos(a) * pinRingR;
      const py = CY + Math.sin(a) * pinRingR;

      ctx.beginPath();
      ctx.arc(px + 0.5, py + 0.5, PIN_R, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(20,10,0,0.3)';
      ctx.fill();

      const pinGrad = ctx.createRadialGradient(px - 1, py - 1, 0.3, px, py, PIN_R);
      pinGrad.addColorStop(0, '#e8e0d0');
      pinGrad.addColorStop(0.5, '#c0b098');
      pinGrad.addColorStop(1, '#887860');
      ctx.beginPath();
      ctx.arc(px, py, PIN_R, 0, 2 * Math.PI);
      ctx.fillStyle = pinGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px - 0.8, py - 0.8, 1.2, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255,250,235,0.5)';
      ctx.fill();
    }

    // --- Center hub - metal bolt ---
    const HUB_R = 32;

    // Hub shadow
    ctx.beginPath();
    ctx.arc(CX + 2, CY + 2, HUB_R + 2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(20,10,0,0.3)';
    ctx.fill();

    // Hub base ring
    ctx.beginPath();
    ctx.arc(CX, CY, HUB_R + 4, 0, 2 * Math.PI);
    const hubRingGrad = ctx.createRadialGradient(CX, CY, HUB_R, CX, CY, HUB_R + 4);
    hubRingGrad.addColorStop(0, '#887058');
    hubRingGrad.addColorStop(1, '#5a3d22');
    ctx.fillStyle = hubRingGrad;
    ctx.fill();

    // Hub body - brushed metal
    const hubGrad = ctx.createRadialGradient(CX - 8, CY - 8, 2, CX, CY, HUB_R);
    hubGrad.addColorStop(0, '#f0e4c8');
    hubGrad.addColorStop(0.2, '#d4b878');
    hubGrad.addColorStop(0.5, '#b8952e');
    hubGrad.addColorStop(0.8, '#957520');
    hubGrad.addColorStop(1, '#6b5518');
    ctx.beginPath();
    ctx.arc(CX, CY, HUB_R, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();

    // Hub bevel
    ctx.beginPath();
    ctx.arc(CX, CY, HUB_R, 0, 2 * Math.PI);
    ctx.strokeStyle = '#4a3510';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Concentric rings on hub (machined look)
    for (let r = 8; r < HUB_R; r += 6) {
      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(80,55,20,${0.08 + (r / HUB_R) * 0.1})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // Center bolt dot
    const boltGrad = ctx.createRadialGradient(CX - 2, CY - 2, 0.5, CX, CY, 8);
    boltGrad.addColorStop(0, '#fffae0');
    boltGrad.addColorStop(0.5, '#c8a830');
    boltGrad.addColorStop(1, '#785818');
    ctx.beginPath();
    ctx.arc(CX, CY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = boltGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(CX, CY, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = '#503714';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bolt highlight
    ctx.beginPath();
    ctx.arc(CX - 2, CY - 2, 3, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255,248,220,0.5)';
    ctx.fill();

    // Hex bolt pattern (6 small indents around center)
    for (let i = 0; i < 6; i++) {
      const ba = (i / 6) * Math.PI * 2 - Math.PI / 6;
      const bx = CX + Math.cos(ba) * 18;
      const by = CY + Math.sin(ba) * 18;
      ctx.beginPath();
      ctx.arc(bx, by, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(50,30,10,0.25)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx - 0.5, by - 0.5, 1, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255,240,200,0.2)';
      ctx.fill();
    }
  }

  useEffect(() => {
    drawWheel(displayAngle);
  }, [displayAngle]);

  useEffect(() => {
    if (isSpinning && !isAnimating) {
      setIsAnimating(true);
      const startAngle = rotationRef.current;

      const baseRotations = 8 + Math.random() * 6;
      const extraRotations = baseRotations * 2 * Math.PI;
      const endAngle = startAngle + extraRotations;

      const duration = 6000 + Math.random() * 1000;
      const startTime = performance.now();

      function naturalEase(t: number): number {
        if (t < 0.4) {
          return Math.pow(t / 0.4, 1.8) * 0.6;
        } else {
          const slowPhase = (t - 0.4) / 0.6;
          const mainDecel = 1 - Math.pow(1 - slowPhase, 4);
          const oscillation = slowPhase > 0.85
            ? Math.sin((slowPhase - 0.85) * 20) * 0.008 * (1 - slowPhase)
            : 0;
          return 0.6 + mainDecel * 0.4 + oscillation;
        }
      }

      const noiseAmplitude = 0.015;
      const noiseFrequency = 0.3;

      function animate(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        let easedProgress = naturalEase(progress);

        if (progress > 0.15 && progress < 0.92) {
          const noiseFactor = Math.sin(elapsed * noiseFrequency) * noiseAmplitude;
          const fadeIn = Math.min((progress - 0.15) / 0.1, 1);
          const fadeOut = Math.max(1 - (progress - 0.85) / 0.07, 0);
          easedProgress += noiseFactor * fadeIn * fadeOut;
        }

        const currentAngle = startAngle + (endAngle - startAngle) * easedProgress;
        rotationRef.current = currentAngle;
        setDisplayAngle(currentAngle);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          rotationRef.current = endAngle;
          setIsAnimating(false);
          onSpinComplete();
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSpinning]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Pointer / clapper */}
      <div
        className="absolute z-10"
        style={{
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
        }}
      >
        <svg width="32" height="48" viewBox="0 0 32 48">
          {/* Clapper body */}
          <path
            d="M16 44 L3 10 C3 4 29 4 29 10 Z"
            fill="#c0272d"
            stroke="#8a1a1e"
            strokeWidth="1.5"
          />
          {/* Highlight stripe */}
          <path
            d="M14 42 L6 12 C8 8 14 7 16 7 L14 42Z"
            fill="rgba(255,255,255,0.15)"
          />
          {/* Top mount bolt */}
          <circle cx="16" cy="8" r="5" fill="#d4a843" stroke="#8a6a20" strokeWidth="1" />
          <circle cx="15" cy="7" r="2" fill="rgba(255,240,200,0.5)" />
          <circle cx="16" cy="8" r="2" fill="#a07828" />
        </svg>
      </div>

      {/* Subtle drop shadow beneath wheel */}
      <div
        className="absolute rounded-full"
        style={{
          width: SIZE + 10,
          height: SIZE + 10,
          background: 'radial-gradient(ellipse at 50% 55%, rgba(30,15,5,0.18) 0%, transparent 70%)',
          top: '8px',
        }}
      />

      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="relative z-0"
        style={{
          filter: isAnimating
            ? 'drop-shadow(0 2px 16px rgba(60,30,10,0.3))'
            : 'drop-shadow(0 4px 12px rgba(40,20,5,0.2))',
          transition: 'filter 0.4s ease',
        }}
      />

      {/* Remaining count - subtle label */}
      <div
        className="absolute bottom-0 right-0 rounded-lg text-xs font-bold px-2 py-1 z-20"
        style={{
          background: 'rgba(60,35,15,0.75)',
          color: '#e8dcc8',
          fontSize: '10px',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(140,100,60,0.3)',
        }}
      >
        Còn {remainingCount} số
      </div>
    </div>
  );
}
