import { useState, useCallback, useRef, useEffect } from "react";
import { RotateCcw, Volume2, VolumeX, History, Shuffle } from "lucide-react";
import { LuckyWheel } from "@/components/LuckyWheel";
import { WinnerPopup } from "@/components/WinnerPopup";
import { SpinHistory, type HistoryRound } from "@/components/SpinHistory";
import { Confetti } from "@/components/Confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  playWinSound,
  playButtonClick,
  startBackgroundMusic,
  stopBackgroundMusic,
  setBackgroundMusicMuted,
} from "@/utils/sound";
import wheelImg from "@/assets/wheel-decoration.png";
import logoTruong from "@/assets/logo-truong.png";
import logoKhoa from "@/assets/logo-khoa-square.png";
import anh1 from "@/assets/anh1.jpeg";
import anh2 from "@/assets/anh2.jpeg";
import anh3 from "@/assets/anh3.jpeg";
import anh4 from "@/assets/anh4.jpeg";

const TOTAL_NUMBERS = 300;
const ALL_NUMBERS = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
const STORAGE_KEY = "chance-wheel-state-v1";

type StoredHistoryRound = Omit<HistoryRound, "timestamp"> & {
  timestamp: string;
};

interface StoredState {
  remainingNumbers: number[];
  history: StoredHistoryRound[];
  round: number;
  winnerCount: string;
  isMuted: boolean;
}

export default function Index() {
  const [remainingNumbers, setRemainingNumbers] = useState<number[]>([...ALL_NUMBERS]);
  const [winnerCount, setWinnerCount] = useState<string>("5");
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinners, setCurrentWinners] = useState<number[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [history, setHistory] = useState<HistoryRound[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [round, setRound] = useState(0);
  const [inputError, setInputError] = useState("");
  const roundRef = useRef(0);

  // Load saved state from localStorage on first mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<StoredState>;

      if (parsed.remainingNumbers && parsed.remainingNumbers.length > 0) {
        setRemainingNumbers(parsed.remainingNumbers);
      }

      if (parsed.history && Array.isArray(parsed.history)) {
        const hydratedHistory: HistoryRound[] = parsed.history.map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(hydratedHistory);

        // If round is not explicitly stored, infer from last history item
        if (parsed.round == null && hydratedHistory.length > 0) {
          const latestRound = hydratedHistory[0]?.round ?? 0;
          setRound(latestRound);
          roundRef.current = latestRound;
        }
      }

      if (typeof parsed.round === "number") {
        setRound(parsed.round);
        roundRef.current = parsed.round;
      }

      if (typeof parsed.winnerCount === "string") {
        setWinnerCount(parsed.winnerCount);
      }
    } catch (err) {
      // Nếu parse lỗi thì bỏ qua, dùng state mặc định
      console.error("Failed to load saved wheel state:", err);
    }
  }, []);

  // Thử bật nhạc nền ngay khi vào web (nếu không tắt tiếng trước đó)
  useEffect(() => {
    startBackgroundMusic(isMuted);
  }, [isMuted]);

  // Đảm bảo nhạc nền bật khi có tương tác đầu tiên
  const ensureMusic = useCallback(() => {
    startBackgroundMusic(isMuted);
  }, [isMuted]);

  useEffect(() => {
    return () => stopBackgroundMusic();
  }, []);

  // Persist current state to localStorage whenever it changes
  useEffect(() => {
    try {
      const stateToSave: StoredState = {
        remainingNumbers,
        history: history.map((h) => ({
          ...h,
          timestamp: h.timestamp.toISOString(),
        })),
        round,
        winnerCount,
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      }
    } catch (err) {
      console.error("Failed to save wheel state:", err);
    }
  }, [remainingNumbers, history, round, winnerCount, isMuted]);

  const sound = useCallback((fn: () => void) => {
    if (!isMuted) fn();
  }, [isMuted]);

  const handleToggleMute = useCallback(() => {
    ensureMusic();
    const next = !isMuted;
    setIsMuted(next);
    setBackgroundMusicMuted(next);
    if (!next) playButtonClick();
  }, [isMuted, ensureMusic]);

  const handleSpin = useCallback(() => {
    ensureMusic();
    const count = parseInt(winnerCount, 10);

    if (isNaN(count) || count <= 0) {
      setInputError("Vui lòng nhập số hợp lệ! 😅");
      return;
    }
    if (count > remainingNumbers.length) {
      setInputError(`Chỉ còn ${remainingNumbers.length} số thôi! 😮`);
      return;
    }

    setInputError("");
    setIsSpinning(true);
    sound(playButtonClick);
  }, [winnerCount, remainingNumbers, sound, ensureMusic]);

  const handleSpinComplete = useCallback(() => {
    const count = parseInt(winnerCount, 10);
    const pool = [...remainingNumbers];

    // Fisher-Yates shuffle then pick first `count`
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const winners = pool.slice(0, count);
    const newRemaining = pool.slice(count);

    roundRef.current += 1;
    const newRound = roundRef.current;

    setRound(newRound);
    setCurrentWinners(winners);
    setRemainingNumbers(newRemaining);
    setIsSpinning(false);
    setShowConfetti(true);
    setShowPopup(true);

    setHistory(prev => [{
      round: newRound,
      winners,
      timestamp: new Date(),
      totalPool: newRemaining.length,
    }, ...prev]);

    sound(playWinSound);

    setTimeout(() => setShowConfetti(false), 5000);
  }, [winnerCount, remainingNumbers, sound]);

  const handleReset = useCallback(() => {
    sound(playButtonClick);
    setRemainingNumbers([...ALL_NUMBERS]);
    setCurrentWinners([]);
    setShowPopup(false);
    setHistory([]);
    setRound(0);
    roundRef.current = 0;
    setWinnerCount("5");
    setInputError("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [sound]);

  const totalWon = TOTAL_NUMBERS - remainingNumbers.length;
  const progressPct = (totalWon / TOTAL_NUMBERS) * 100;

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-warm)' }}>
      <Confetti active={showConfetti} />

      {/* Ambient decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['🌿', '🍃', '🌸', '✨', '🍀', '🌿'].map((emoji, i) => (
          <span
            key={i}
            className="absolute text-2xl float opacity-20"
            style={{
              top: `${10 + i * 14}%`,
              left: i % 2 === 0 ? `${2 + i * 1.5}%` : `${90 - i * 2}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.4}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Header */}
      <header
        className="relative px-4 pt-4 pb-5"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div className="max-w-5xl mx-auto space-y-3">
          {/* Top banner with logos */}
          <div className="flex items-center justify-between gap-4">
            <div className="shrink-0 flex items-center justify-center">
              <img
                src={logoTruong}
                alt="Logo trường"
                className="h-14 sm:h-16 w-auto object-contain"
              />
            </div>

            <div className="flex-1 text-center leading-snug">
              <p className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide text-sky-50">
                ĐẠI HỌC Y DƯỢC THÀNH PHỐ HỒ CHÍ MINH
              </p>
              <p className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide text-sky-50">
                KHOA RĂNG HÀM MẶT
              </p>
              <p className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide text-sky-50">
                BỘ MÔN CẤY GHÉP NHA KHOA
              </p>
            </div>

            <div className="shrink-0 flex items-center justify-center">
              <img
                src={logoKhoa}
                alt="Logo khoa"
                className="h-14 sm:h-16 w-auto object-contain"
              />
            </div>
          </div>

          {/* Title + controls */}
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={handleToggleMute}
              className="rounded-full p-2.5 transition-all hover:scale-110 active:scale-95"
              style={{
                background: isMuted ? 'hsla(0, 70%, 50%, 0.25)' : 'hsla(38, 55%, 95%, 0.15)',
                color: 'hsl(38, 55%, 95%)',
              }}
              title={isMuted ? "Bật nhạc nền" : "Tắt nhạc nền"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <div className="text-center">
              <div className="flex items-center justify-center gap-3">
                <img src={wheelImg} alt="" className="w-10 h-10 object-contain float" />
                <h1
                  className="font-display text-3xl sm:text-4xl"
                  style={{ color: 'hsl(43, 96%, 78%)' }}
                >
                  🎡 Vòng Quay May Mắn
                </h1>
                <img src={wheelImg} alt="" className="w-10 h-10 object-contain float" style={{ animationDelay: '1s' }} />
              </div>
              <p
                className="text-sm mt-1 font-semibold tracking-wide"
                style={{ color: 'hsl(145, 55%, 75%)' }}
              >
                ✨ Vận may luôn mỉm cười với người dũng cảm ✨
              </p>
            </div>

            <button
              onClick={() => {
                sound(playButtonClick);
                ensureMusic();
                setShowHistory(true);
              }}
              className="rounded-full p-2.5 transition-all hover:scale-110 active:scale-95"
              style={{
                background: showHistory ? 'hsl(43, 96%, 56%)' : 'hsla(38, 55%, 95%, 0.15)',
                color: showHistory ? 'hsl(25, 35%, 15%)' : 'hsl(38, 55%, 95%)',
              }}
              title="Xem lịch sử"
            >
              <History className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'hsl(145, 55%, 80%)' }}>
              <span>🎯 {totalWon} số đã trúng</span>
              <span>{remainingNumbers.length} số còn lại / {TOTAL_NUMBERS} tổng</span>
            </div>
            <div
              className="h-2.5 rounded-full overflow-hidden"
              style={{ background: 'hsla(38, 55%, 95%, 0.15)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: 'var(--gradient-gold)',
                  boxShadow: '0 0 10px hsl(43 96% 56% / 0.7)',
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Image layout: 1 horizontal on top, 3 vertical below */}
      <section className="max-w-5xl mx-auto px-4 mt-6">
        {/* Ảnh ngang: anh2 */}
        <div className="mb-4">
          <img
            src={anh2}
            alt="Ảnh ngang"
            className="w-full rounded-2xl shadow-md object-cover"
          />
        </div>

        {/* 3 ảnh dọc: anh1, anh3, anh4 */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <img
            src={anh1}
            alt="Ảnh dọc 1"
            className="w-full h-full rounded-2xl shadow-md object-cover"
          />
          <img
            src={anh3}
            alt="Ảnh dọc 2"
            className="w-full h-full rounded-2xl shadow-md object-cover"
          />
          <img
            src={anh4}
            alt="Ảnh dọc 3"
            className="w-full h-full rounded-2xl shadow-md object-cover"
          />
        </div> */}
      </section>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-1">

          {/* Wheel area */}
          <div className="lg:col-span-1">
            <div
              className="rounded-3xl p-8 border"
              style={{
                background: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                boxShadow: 'var(--shadow-warm)',
              }}
            >
              {/* Wheel */}
              <div className="flex justify-center mb-8">
                <LuckyWheel
                  isSpinning={isSpinning}
                  onSpinComplete={handleSpinComplete}
                  remainingCount={remainingNumbers.length}
                />
              </div>

              {/* Controls */}
              <div className="space-y-5">
                {/* Winner count input */}
                <div>
                  <label
                    className="block text-sm font-bold mb-2 flex items-center gap-2"
                    style={{ color: 'hsl(var(--foreground))' }}
                  >
                    🎯 Số lượng người trúng thưởng
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={remainingNumbers.length}
                    value={winnerCount}
                    onChange={(e) => {
                      setWinnerCount(e.target.value);
                      setInputError("");
                    }}
                    disabled={isSpinning}
                    className="w-full rounded-2xl px-5 py-4 text-center text-2xl font-bold border-2 outline-none transition-all focus:ring-2"
                    style={{
                      background: 'hsl(var(--secondary))',
                      borderColor: inputError ? 'hsl(var(--destructive))' : 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                      '--tw-ring-color': 'hsl(var(--primary) / 0.3)',
                    } as React.CSSProperties}
                    placeholder="Nhập số..."
                    onClick={ensureMusic}
                  />
                  {inputError && (
                    <p className="text-xs mt-1.5 font-semibold" style={{ color: 'hsl(var(--destructive))' }}>
                      ⚠️ {inputError}
                    </p>
                  )}
                </div>

                {/* Spin button */}
                {remainingNumbers.length === 0 ? (
                  <div
                    className="rounded-2xl p-5 text-center"
                    style={{ background: 'hsl(var(--secondary))' }}
                  >
                    <p className="text-lg font-bold" style={{ color: 'hsl(var(--primary))' }}>
                      🎊 Tất cả {TOTAL_NUMBERS} số đã được quay!
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      Nhấn reset để bắt đầu lại
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleSpin}
                    disabled={isSpinning || remainingNumbers.length === 0}
                    className="btn-spin w-full"
                  >
                    {isSpinning ? (
                      <span className="flex items-center justify-center gap-2">
                        <Shuffle className="w-5 h-5 animate-spin" />
                        Đang quay... 🎡
                      </span>
                    ) : (
                      <span>🎰 Quay Ngay! ({remainingNumbers.length} số)</span>
                    )}
                  </button>
                )}

                {/* Reset button */}
                <button
                  onClick={handleReset}
                  disabled={isSpinning}
                  className="w-full rounded-full py-3 font-bold text-sm transition-all hover:opacity-80 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{
                    background: 'hsl(var(--secondary))',
                    color: 'hsl(var(--secondary-foreground))',
                    border: '2px solid hsl(var(--border))',
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Bắt đầu lại từ đầu
                </button>
              </div>

              {/* Fun stats */}
              <div
                className="mt-5 rounded-2xl p-4 grid grid-cols-3 gap-4 text-center"
                style={{ background: 'hsl(var(--secondary))' }}
              >
                <div>
                  <div className="text-3xl mb-1">🏆</div>
                  <div className="text-xl font-display" style={{ color: 'hsl(var(--primary))' }}>{totalWon}</div>
                  <div className="text-xs font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>Đã trúng</div>
                </div>
                <div>
                  <div className="text-3xl mb-1">🎡</div>
                  <div className="text-xl font-display" style={{ color: 'hsl(var(--primary))' }}>{round}</div>
                  <div className="text-xs font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>Lượt quay</div>
                </div>
                <div>
                  <div className="text-3xl mb-1">🎯</div>
                  <div className="text-xl font-display" style={{ color: 'hsl(var(--primary))' }}>{remainingNumbers.length}</div>
                  <div className="text-xs font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>Còn lại</div>
                </div>
              </div>
            </div>

            {/* Numbers remaining preview */}
            <div
              className="mt-4 rounded-2xl p-4 border"
              style={{
                background: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
              }}
            >
              <h3 className="font-display text-base mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
                🔢 Số còn trong vòng quay
                <span
                  className="text-xs font-sans font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                >
                  {remainingNumbers.length}
                </span>
              </h3>
              <div
                className="rounded-xl p-3 max-h-32 overflow-y-auto"
                style={{ background: 'hsl(var(--secondary))' }}
              >
                <div className="flex flex-wrap gap-1">
                  {remainingNumbers.slice(0, 80).map((n) => (
                    <span
                      key={n}
                      className="inline-flex items-center justify-center rounded-md text-xs font-semibold"
                      style={{
                        width: n >= 100 ? '32px' : '26px',
                        height: '22px',
                        background: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                        fontSize: '10px',
                      }}
                    >
                      {n}
                    </span>
                  ))}
                  {remainingNumbers.length > 80 && (
                    <span
                      className="inline-flex items-center justify-center rounded-md text-xs font-semibold px-2"
                      style={{
                        height: '22px',
                        background: 'hsl(var(--muted))',
                        color: 'hsl(var(--muted-foreground))',
                      }}
                    >
                      +{remainingNumbers.length - 80} nữa...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer quote */}
        <div className="mt-8 text-center pb-6">
          <p
            className="text-sm font-semibold italic"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            🌿 "May mắn không tự đến, hãy quay để đón nhận nó!" 🌿
          </p>
        </div>
      </main>

      {/* Winner popup */}
      {showPopup && (
        <WinnerPopup
          winners={currentWinners}
          round={round}
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* History popup */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>📜 Lịch Sử Quay</DialogTitle>
            <DialogDescription>
              Xem lại tất cả các lượt quay và các số đã trúng thưởng.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 max-h-[65vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span>✅ Tổng lượt quay:</span>
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {history.length}
                </span>
              </div>
              {history.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  Nhấn từng lượt để xem chi tiết các số trúng.
                </span>
              )}
            </div>
            <SpinHistory history={history} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
