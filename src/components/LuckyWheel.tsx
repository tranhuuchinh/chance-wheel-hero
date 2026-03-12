import { useRef, useEffect, useState } from "react";

interface LuckyWheelProps {
  isSpinning: boolean;
  onSpinComplete: () => void;
  remainingCount: number;
}

const SEGMENT_COLORS = [
  'hsl(145, 48%, 28%)',
  'hsl(43, 96%, 50%)',
  'hsl(145, 42%, 37%)',
  'hsl(36, 88%, 46%)',
  'hsl(145, 52%, 24%)',
  'hsl(43, 92%, 58%)',
  'hsl(160, 46%, 32%)',
  'hsl(36, 82%, 42%)',
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

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = cx - 12;
    const arc = (2 * Math.PI) / SEGMENTS;

    ctx.clearRect(0, 0, size, size);

    // Soft outer glow
    const glowGrad = ctx.createRadialGradient(cx, cy, r - 8, cx, cy, r + 20);
    glowGrad.addColorStop(0, 'hsla(43, 96%, 56%, 0.0)');
    glowGrad.addColorStop(0.5, 'hsla(43, 96%, 56%, 0.2)');
    glowGrad.addColorStop(1, 'hsla(43, 96%, 56%, 0.0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r + 20, 0, 2 * Math.PI);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // Shadow beneath wheel
    ctx.save();
    ctx.shadowColor = 'hsla(25, 35%, 15%, 0.25)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = 'transparent';
    ctx.fill();
    ctx.restore();

    // Draw segments
    for (let i = 0; i < SEGMENTS; i++) {
      const startAngle = angle + i * arc;
      const endAngle = startAngle + arc;
      const segColor = SEGMENT_COLORS[i % SEGMENT_COLORS.length];

      // Segment fill with radial gradient
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, 'hsla(38, 55%, 92%, 0.85)');
      grad.addColorStop(0.25, segColor);
      grad.addColorStop(1, segColor);
      ctx.fillStyle = grad;
      ctx.fill();

      // Segment border
      ctx.strokeStyle = 'hsla(38, 55%, 95%, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Emoji decoration
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arc / 2);
      ctx.translate(r * 0.67, 0);
      ctx.font = 'bold 15px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(['🌟', '🍀', '🌿', '✨', '🎯', '🌸'][i % 6], 0, 0);
      ctx.restore();

      // Number labels
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arc / 2);
      ctx.translate(r * 0.40, 0);
      ctx.rotate(Math.PI / 2);
      ctx.font = 'bold 10px Nunito, sans-serif';
      ctx.fillStyle = 'hsla(38, 55%, 97%, 0.95)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(['MAY', 'MẮN', '300', 'SỐ', '🎉', 'WIN'][i % 6], 0, 0);
      ctx.restore();
    }

    // Outer decorative ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = 'hsl(43, 96%, 52%)';
    ctx.lineWidth = 7;
    ctx.stroke();

    // Shiny top arc highlight
    const arcHighlight = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy);
    arcHighlight.addColorStop(0, 'hsla(43, 96%, 90%, 0.4)');
    arcHighlight.addColorStop(1, 'hsla(43, 96%, 90%, 0.0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = arcHighlight;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Gold dots on ring
    for (let i = 0; i < 24; i++) {
      const a = angle + (i / 24) * 2 * Math.PI;
      const dx = cx + r * Math.cos(a);
      const dy = cy + r * Math.sin(a);
      ctx.beginPath();
      ctx.arc(dx, dy, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? 'hsl(43, 96%, 72%)' : 'hsl(36, 82%, 46%)';
      ctx.fill();
    }

    // Inner hub circle
    const innerGrad = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, 30);
    innerGrad.addColorStop(0, 'hsl(43, 96%, 80%)');
    innerGrad.addColorStop(0.5, 'hsl(43, 96%, 58%)');
    innerGrad.addColorStop(1, 'hsl(36, 80%, 38%)');
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, 2 * Math.PI);
    ctx.fillStyle = innerGrad;
    ctx.fill();

    // Hub border
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, 2 * Math.PI);
    ctx.strokeStyle = 'hsl(38, 55%, 95%)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hub inner shine
    ctx.beginPath();
    ctx.arc(cx - 6, cy - 6, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'hsla(43, 96%, 95%, 0.3)';
    ctx.fill();

    // Center icon
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎱', cx, cy);
  }

  useEffect(() => {
    drawWheel(displayAngle);
  }, [displayAngle]);

  useEffect(() => {
    if (isSpinning && !isAnimating) {
      setIsAnimating(true);
      const startAngle = rotationRef.current;
      // 7-12 full rotations for more dramatic spin
      const extraRotations = (7 + Math.random() * 5) * 2 * Math.PI;
      const endAngle = startAngle + extraRotations;
      const duration = 5500; // longer, smoother
      const startTime = performance.now();

      // Smoother custom easing: fast start, long smooth deceleration
      function easeOutQuintic(t: number) {
        return 1 - Math.pow(1 - t, 5);
      }

      function animate(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuintic(progress);
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
        className="absolute z-10"
        style={{
          top: '-2px',
          left: '50%',
          transform: 'translateX(-50%)',
          filter: 'drop-shadow(0 4px 10px hsla(0, 80%, 55%, 0.7))',
        }}
      >
        <svg width="28" height="40" viewBox="0 0 28 40" fill="none">
          <path d="M14 38 L2 4 Q14 0 26 4 Z" fill="hsl(0, 78%, 52%)" />
          <path d="M14 38 L2 4 Q14 0 26 4 Z" stroke="hsl(0, 70%, 80%)" strokeWidth="1.5" />
          <circle cx="14" cy="10" r="5" fill="hsl(43, 96%, 70%)" />
          <circle cx="14" cy="10" r="2.5" fill="hsl(0, 78%, 52%)" />
        </svg>
      </div>

      {/* Wheel ambient glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 360,
          height: 360,
          background: isAnimating
            ? 'radial-gradient(circle, hsl(43 96% 56% / 0.2), transparent 65%)'
            : 'radial-gradient(circle, hsl(43 96% 56% / 0.08), transparent 65%)',
          filter: 'blur(24px)',
          transition: 'background 0.5s ease',
        }}
      />

      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        className="relative z-0"
        style={{
          filter: isAnimating
            ? 'drop-shadow(0 0 28px hsl(43 96% 56% / 0.75))'
            : 'drop-shadow(0 10px 28px hsl(25 35% 20% / 0.25))',
          transition: 'filter 0.4s ease',
        }}
      />

      {/* Remaining count badge */}
      <div
        className="absolute bottom-1 right-1 rounded-full text-xs font-bold px-2.5 py-1 z-20"
        style={{
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          fontSize: '10px',
          boxShadow: '0 2px 8px hsl(145 45% 32% / 0.4)',
        }}
      >
        {remainingCount} số còn lại
      </div>
    </div>
  );
}
