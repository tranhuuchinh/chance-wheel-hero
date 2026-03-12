import { useEffect, useRef } from "react";
import { X, Trophy, Star } from "lucide-react";
import { playPopupSound, playConfettiSound } from "@/utils/sound";

interface WinnerPopupProps {
  winners: number[];
  round: number;
  onClose: () => void;
}

export function WinnerPopup({ winners, round, onClose }: WinnerPopupProps) {
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (!hasPlayed.current) {
      hasPlayed.current = true;
      playPopupSound();
      setTimeout(() => playConfettiSound(), 400);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'hsla(25, 35%, 10%, 0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg pop-in rounded-3xl overflow-hidden"
        style={{
          background: 'hsl(var(--warm-white))',
          boxShadow: '0 25px 60px hsla(25, 35%, 10%, 0.4), 0 0 0 2px hsl(43, 96%, 56%)',
        }}
      >
        {/* Header gradient */}
        <div
          className="relative px-6 py-6 text-center"
          style={{ background: 'var(--gradient-hero)' }}
        >
          {/* Stars decoration */}
          {['⭐', '🌟', '✨'].map((s, i) => (
            <span
              key={i}
              className="absolute sparkle text-2xl"
              style={{
                top: `${10 + i * 15}px`,
                left: i === 0 ? '12px' : i === 1 ? '85%' : '5%',
                animationDelay: `${i * 0.4}s`,
              }}
            >
              {s}
            </span>
          ))}

          <div className="flex justify-center mb-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl winner-glow"
              style={{ background: 'var(--gradient-gold)' }}
            >
              🏆
            </div>
          </div>

          <h2
            className="text-3xl font-display"
            style={{ color: 'hsl(43, 96%, 80%)' }}
          >
            🎉 Chúc Mừng! 🎉
          </h2>
          <p
            className="mt-1 text-sm font-semibold"
            style={{ color: 'hsl(145, 60%, 75%)' }}
          >
            Lượt {round} — {winners.length} số may mắn đã được chọn!
          </p>
        </div>

        {/* Winners grid */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-gold" style={{ color: 'hsl(var(--gold))' }} />
            <span className="font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>
              Những số trúng thưởng:
            </span>
          </div>

          <div
            className="rounded-2xl p-4 max-h-60 overflow-y-auto"
            style={{ background: 'hsl(var(--secondary))' }}
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {winners.sort((a, b) => a - b).map((num, idx) => (
                <div
                  key={num}
                  className="number-badge pop-in"
                  style={{
                    animationDelay: `${idx * 0.05}s`,
                    minWidth: '3rem',
                    height: '3rem',
                    fontSize: num >= 100 ? '0.75rem' : '0.875rem',
                  }}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          <p
            className="text-center text-xs mt-3 font-semibold"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            🍀 Vận may đang mỉm cười với bạn! 🍀
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="btn-spin w-full"
          >
            🎊 Tiếp Tục Quay Thêm!
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-1.5 transition-opacity hover:opacity-70"
          style={{ background: 'hsla(38, 55%, 95%, 0.2)', color: 'hsl(38, 55%, 95%)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
