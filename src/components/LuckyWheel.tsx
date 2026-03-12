import { useRef, useEffect, useState } from "react";

interface LuckyWheelProps {
  isSpinning: boolean;
  onSpinComplete: () => void;
  remainingCount: number;
}

const SEGMENT_COLORS = [
  'hsl(145, 45%, 30%)',
  'hsl(43, 96%, 52%)',
  'hsl(145, 40%, 38%)',
  'hsl(36, 85%, 48%)',
  'hsl(145, 50%, 26%)',
  'hsl(43, 90%, 60%)',
  'hsl(160, 45%, 34%)',
  'hsl(36, 80%, 44%)',
];

export function LuckyWheel({ isSpinning, onSpinComplete, remainingCount }: LuckyWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const [displayAngle, setDisplayAngle] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const SEGMENTS = 12;

  function drawWheel(angle: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 8;
    const arc = (2 * Math.PI) / SEGMENTS;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer glow ring
    const glowGrad = ctx.createRadialGradient(cx, cy, r - 10, cx, cy, r + 12);
    glowGrad.addColorStop(0, 'hsla(43, 96%, 56%, 0.0)');
    glowGrad.addColorStop(0.5, 'hsla(43, 96%, 56%, 0.3)');
    glowGrad.addColorStop(1, 'hsla(43, 96%, 56%, 0.0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r + 12, 0, 2 * Math.PI);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // Draw segments
    for (let i = 0; i < SEGMENTS; i++) {
      const startAngle = angle + i * arc;
      const endAngle = startAngle + arc;

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();

      const segColor = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, 'hsla(38, 55%, 95%, 0.9)');
      grad.addColorStop(0.3, segColor);
      grad.addColorStop(1, segColor);
      ctx.fillStyle = grad;
      ctx.fill();

      // Border
      ctx.strokeStyle = 'hsla(38, 55%, 90%, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Leaf/star decoration on segment
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arc / 2);
      ctx.translate(r * 0.65, 0);
      ctx.fillStyle = 'hsla(38, 55%, 95%, 0.7)';
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(['🌟', '🍀', '🌿', '✨', '🎯', '🌸'][i % 6], 0, 0);
      ctx.restore();
    }

    // Outer decorative ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = 'hsl(43, 96%, 50%)';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Gold dots on ring
    for (let i = 0; i < 24; i++) {
      const a = angle + (i / 24) * 2 * Math.PI;
      const dx = cx + (r + 0) * Math.cos(a);
      const dy = cy + (r + 0) * Math.sin(a);
      ctx.beginPath();
      ctx.arc(dx, dy, 3, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? 'hsl(43, 96%, 70%)' : 'hsl(36, 80%, 45%)';
      ctx.fill();
    }

    // Inner circle
    const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
    innerGrad.addColorStop(0, 'hsl(43, 96%, 75%)');
    innerGrad.addColorStop(0.5, 'hsl(43, 96%, 56%)');
    innerGrad.addColorStop(1, 'hsl(36, 80%, 40%)');
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
    ctx.fillStyle = innerGrad;
    ctx.fill();
    ctx.strokeStyle = 'hsl(38, 55%, 95%)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center icon
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎱', cx, cy);

    // Number display ring (inner numbers)
    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.fillStyle = 'hsla(38, 55%, 95%, 0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < SEGMENTS; i++) {
      const midAngle = angle + i * arc + arc / 2;
      const tx = cx + (r * 0.42) * Math.cos(midAngle);
      const ty = cy + (r * 0.42) * Math.sin(midAngle);
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(midAngle + Math.PI / 2);
      ctx.fillText(['MAY', 'MẮN', '300', 'SỐ', '🎉', 'WIN'][i % 6], 0, 0);
      ctx.restore();
    }
  }

  useEffect(() => {
    drawWheel(displayAngle);
  }, [displayAngle]);

  useEffect(() => {
    if (isSpinning && !isAnimating) {
      setIsAnimating(true);
      const startAngle = rotationRef.current;
      const extraRotations = (5 + Math.random() * 5) * 2 * Math.PI;
      const endAngle = startAngle + extraRotations;
      const duration = 4000;
      const startTime = performance.now();

      function easeOut(t: number) {
        return 1 - Math.pow(1 - t, 4);
      }

      function animate(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOut(progress);
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
      {/* Pointer */}
      <div
        className="absolute z-10 top-0"
        style={{
          left: '50%',
          transform: 'translateX(-50%) translateY(-4px)',
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '32px solid hsl(0, 80%, 55%)',
            filter: 'drop-shadow(0 4px 8px hsla(0, 80%, 55%, 0.6))',
          }}
        />
      </div>

      {/* Wheel glow bg */}
      <div
        className="absolute rounded-full"
        style={{
          width: 320,
          height: 320,
          background: 'radial-gradient(circle, hsl(43 96% 56% / 0.15), transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="relative z-0"
        style={{
          filter: isAnimating ? 'drop-shadow(0 0 20px hsl(43 96% 56% / 0.7))' : 'drop-shadow(0 8px 24px hsl(25 35% 20% / 0.3))',
          transition: 'filter 0.3s ease',
        }}
      />

      {/* Remaining count badge */}
      <div
        className="absolute bottom-0 right-0 rounded-full text-xs font-bold px-2 py-1 z-20"
        style={{
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          transform: 'translate(8px, 8px)',
          fontSize: '10px',
        }}
      >
        {remainingCount} số còn lại
      </div>
    </div>
  );
}
