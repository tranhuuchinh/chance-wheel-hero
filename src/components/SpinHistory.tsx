import { ChevronDown, ChevronUp, Clock, Trophy } from "lucide-react";
import { useState } from "react";

export interface HistoryRound {
  round: number;
  winners: number[];
  timestamp: Date;
  totalPool: number;
}

interface SpinHistoryProps {
  history: HistoryRound[];
}

export function SpinHistory({ history }: SpinHistoryProps) {
  const [expandedRound, setExpandedRound] = useState<number | null>(null);

  if (history.length === 0) {
    return (
      <div
        className="rounded-2xl p-6 text-center border"
        style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
      >
        <div className="text-4xl mb-3">📜</div>
        <p className="font-bold" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Chưa có lịch sử quay
        </p>
        <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Hãy quay thử để xem kết quả nhé! 🎯
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((round) => {
        const isExpanded = expandedRound === round.round;
        return (
          <div
            key={round.round}
            className="rounded-2xl overflow-hidden border transition-all duration-200"
            style={{
              background: 'hsl(var(--card))',
              borderColor: isExpanded ? 'hsl(var(--primary))' : 'hsl(var(--border))',
              boxShadow: isExpanded ? '0 4px 16px hsl(145 45% 32% / 0.15)' : 'none',
            }}
          >
            {/* Round header */}
            <button
              className="w-full flex items-center justify-between px-4 py-3 hover:opacity-90 transition-opacity"
              onClick={() => setExpandedRound(isExpanded ? null : round.round)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-display text-sm"
                  style={{
                    background: 'var(--gradient-hero)',
                    color: 'hsl(var(--primary-foreground))',
                  }}
                >
                  {round.round}
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>
                    Lượt {round.round}
                    <span
                      className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: 'hsl(var(--accent) / 0.2)',
                        color: 'hsl(var(--accent-foreground))',
                      }}
                    >
                      <Trophy className="w-3 h-3" />
                      {round.winners.length} người trúng
                    </span>
                  </div>
                  <div
                    className="text-xs flex items-center gap-1 mt-0.5"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    <Clock className="w-3 h-3" />
                    {round.timestamp.toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                    <span className="mx-1">·</span>
                    Pool: {round.totalPool} số
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Preview first 3 winners */}
                <div className="hidden sm:flex gap-1">
                  {round.winners.slice(0, 3).map((w) => (
                    <span
                      key={w}
                      className="inline-flex items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        width: '28px',
                        height: '28px',
                        background: 'var(--gradient-gold)',
                        color: 'hsl(var(--bark))',
                        fontSize: w >= 100 ? '9px' : '11px',
                      }}
                    >
                      {w}
                    </span>
                  ))}
                  {round.winners.length > 3 && (
                    <span
                      className="inline-flex items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        width: '28px',
                        height: '28px',
                        background: 'hsl(var(--muted))',
                        color: 'hsl(var(--muted-foreground))',
                      }}
                    >
                      +{round.winners.length - 3}
                    </span>
                  )}
                </div>

                {isExpanded
                  ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--primary))' }} />
                  : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }} />
                }
              </div>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div
                className="px-4 pb-4 border-t"
                style={{ borderColor: 'hsl(var(--border))' }}
              >
                <p
                  className="text-xs font-semibold my-3"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Tất cả {round.winners.length} số trúng thưởng:
                </p>
                <div className="flex flex-wrap gap-2">
                  {round.winners.sort((a, b) => a - b).map((num) => (
                    <span
                      key={num}
                      className="inline-flex items-center justify-center rounded-full font-bold"
                      style={{
                        width: num >= 100 ? '38px' : '32px',
                        height: '32px',
                        fontSize: num >= 100 ? '10px' : '12px',
                        background: 'var(--gradient-gold)',
                        color: 'hsl(var(--bark))',
                        boxShadow: '0 2px 6px hsl(43 96% 56% / 0.3)',
                      }}
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
