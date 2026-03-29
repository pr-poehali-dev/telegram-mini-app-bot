import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

// ─── Images ───────────────────────────────────────────────
const FROG_IMG = "https://cdn.poehali.dev/projects/a0c0532b-a700-4ada-820b-a9671cbaf08d/files/9dcc8ff6-da9b-49d3-82cb-14f797c868af.jpg";
const CASE_IMG = "https://cdn.poehali.dev/projects/a0c0532b-a700-4ada-820b-a9671cbaf08d/files/2a98b708-1774-49a3-bc1b-18eb2131f046.jpg";

// ─── Types ────────────────────────────────────────────────
type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
type Tab = "home" | "cases" | "inventory" | "top" | "profile";

interface GiftItem {
  id: number;
  name: string;
  emoji: string;
  rarity: Rarity;
  value: number;
  chance: number;
  nft?: boolean;
}

interface CaseType {
  id: number;
  name: string;
  price: number;
  emoji: string;
  gradient: string;
  borderColor: string;
  items: GiftItem[];
  freeDaily?: boolean;
}

interface InventoryItem {
  item: GiftItem;
  uid: number;
  openedAt: string;
  caseName: string;
}

// ─── Data ─────────────────────────────────────────────────
const COMMON_ITEMS: GiftItem[] = [
  { id: 1, name: "Плюшевый мишка", emoji: "🧸", rarity: "common", value: 15, chance: 35 },
  { id: 2, name: "Торт", emoji: "🎂", rarity: "common", value: 20, chance: 30 },
  { id: 3, name: "Воздушный шар", emoji: "🎈", rarity: "common", value: 12, chance: 35 },
];
const RARE_ITEMS: GiftItem[] = [
  { id: 4, name: "Хрустальный шар", emoji: "🔮", rarity: "rare", value: 80, chance: 15 },
  { id: 5, name: "Волшебная палочка", emoji: "🪄", rarity: "rare", value: 100, chance: 12 },
  { id: 6, name: "Золотая корона", emoji: "👑", rarity: "rare", value: 120, chance: 10 },
];
const EPIC_ITEMS: GiftItem[] = [
  { id: 7, name: "NFT Ракета", emoji: "🚀", rarity: "epic", value: 500, chance: 4, nft: true },
  { id: 8, name: "NFT Дракон", emoji: "🐉", rarity: "epic", value: 800, chance: 3, nft: true },
];
const LEGENDARY_ITEMS: GiftItem[] = [
  { id: 9, name: "NFT Алмаз", emoji: "💎", rarity: "legendary", value: 2000, chance: 1, nft: true },
  { id: 10, name: "NFT Звезда", emoji: "⭐", rarity: "legendary", value: 3000, chance: 0.5, nft: true },
];
const MYTHIC_ITEMS: GiftItem[] = [
  { id: 11, name: "NFT Феникс", emoji: "🔥", rarity: "mythic", value: 10000, chance: 0.1, nft: true },
];

const ALL_ITEMS = [...COMMON_ITEMS, ...RARE_ITEMS, ...EPIC_ITEMS, ...LEGENDARY_ITEMS, ...MYTHIC_ITEMS];

const CASES: CaseType[] = [
  {
    id: 0, name: "Бесплатный", price: 0, emoji: "🎁",
    gradient: "from-green-900/60 to-emerald-950",
    borderColor: "border-green-500/30",
    freeDaily: true,
    items: [...COMMON_ITEMS, ...RARE_ITEMS.slice(0, 1)],
  },
  {
    id: 1, name: "Стартовый", price: 50, emoji: "📦",
    gradient: "from-slate-700/50 to-slate-900",
    borderColor: "border-slate-500/30",
    items: [...COMMON_ITEMS, ...RARE_ITEMS],
  },
  {
    id: 2, name: "Золотой", price: 150, emoji: "🌟",
    gradient: "from-amber-800/50 to-amber-950",
    borderColor: "border-amber-500/30",
    items: [...RARE_ITEMS, ...EPIC_ITEMS.slice(0, 1)],
  },
  {
    id: 3, name: "Платиновый", price: 350, emoji: "💠",
    gradient: "from-indigo-800/50 to-indigo-950",
    borderColor: "border-indigo-500/30",
    items: [...RARE_ITEMS, ...EPIC_ITEMS, ...LEGENDARY_ITEMS.slice(0, 1)],
  },
  {
    id: 4, name: "NFT Элита", price: 800, emoji: "🏆",
    gradient: "from-pink-800/50 to-pink-950",
    borderColor: "border-pink-500/30",
    items: [...EPIC_ITEMS, ...LEGENDARY_ITEMS, ...MYTHIC_ITEMS],
  },
];

const RARITY_CFG: Record<Rarity, { label: string; color: string; bg: string; border: string }> = {
  common:    { label: "Обычный",     color: "#9ca3af", bg: "bg-gray-800",   border: "border-gray-600" },
  rare:      { label: "Редкий",      color: "#60a5fa", bg: "bg-blue-900",   border: "border-blue-500" },
  epic:      { label: "Эпический",   color: "#a855f7", bg: "bg-purple-900", border: "border-purple-500" },
  legendary: { label: "Легендарный", color: "#f59e0b", bg: "bg-amber-900",  border: "border-amber-400" },
  mythic:    { label: "Мифический",  color: "#ec4899", bg: "bg-pink-900",   border: "border-pink-400" },
};

const LEADERBOARD = [
  { rank: 1, name: "CryptoKing",  avatar: "👑", prize: "NFT Феникс", stars: 128400 },
  { rank: 2, name: "StarWhale",   avatar: "🐳", prize: "NFT Звезда", stars: 87200 },
  { rank: 3, name: "GiftMaster",  avatar: "🎩", prize: "NFT Алмаз",  stars: 65800 },
  { rank: 4, name: "LuckyDragon", avatar: "🐉", prize: "NFT Дракон", stars: 41300 },
  { rank: 5, name: "NeonHunter",  avatar: "⚡", prize: "NFT Ракета", stars: 28900 },
  { rank: 6, name: "CrystalBoy",  avatar: "💎", prize: "Корона",     stars: 15600 },
  { rank: 7, name: "RocketMan",   avatar: "🚀", prize: "NFT Ракета", stars: 9800 },
];

function weightedRandom(items: GiftItem[]): GiftItem {
  const total = items.reduce((s, i) => s + i.chance, 0);
  let rand = Math.random() * total;
  for (const item of items) { rand -= item.chance; if (rand <= 0) return item; }
  return items[items.length - 1];
}

function makeDrum(win: GiftItem, pool: GiftItem[]): GiftItem[] {
  const items: GiftItem[] = [];
  for (let i = 0; i < 48; i++) items.push(pool[Math.floor(Math.random() * pool.length)]);
  items[36] = win;
  return items;
}

function RarityBadge({ rarity }: { rarity: Rarity }) {
  const c = RARITY_CFG[rarity];
  return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: c.color, background: `${c.color}22`, border: `1px solid ${c.color}55` }}>
      {c.label}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────
export default function Index() {
  const [tab, setTab] = useState<Tab>("home");
  const [balance, setBalance] = useState(150);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [dailyUsed, setDailyUsed] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);

  // Case opening
  const [openingCase, setOpeningCase] = useState<CaseType | null>(null);
  const [drumItems, setDrumItems] = useState<GiftItem[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [spinOffset, setSpinOffset] = useState(0);
  const [wonItem, setWonItem] = useState<GiftItem | null>(null);
  const [showWin, setShowWin] = useState(false);
  const drumRef = useRef<HTMLDivElement>(null);

  // Crash game
  const [crashMulti, setCrashMulti] = useState(1.0);
  const [crashRunning, setCrashRunning] = useState(false);
  const [crashBet, setCrashBet] = useState(20);
  const [crashCashedOut, setCrashedOut] = useState(false);
  const [crashCrashed, setCrashCrashed] = useState(false);
  const [crashResult, setCrashResult] = useState<string | null>(null);
  const crashRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const crashTargetRef = useRef(0);

  // Upgrade
  const [upgradeFrom, setUpgradeFrom] = useState<InventoryItem | null>(null);
  const [upgradeRunning, setUpgradeRunning] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<"win" | "lose" | null>(null);
  const [upgradeAngle, setUpgradeAngle] = useState(0);
  const upgradeChance = 50;

  // Withdraw
  const [withdrawTab, setWithdrawTab] = useState<"nft" | "stars">("nft");
  const [withdrawAddr, setWithdrawAddr] = useState("");

  // Referral
  const refLink = "https://t.me/YourBot?start=ref_12345";
  const [refCopied, setRefCopied] = useState(false);

  // ── Crash ──
  const stopCrash = useCallback(() => {
    if (crashRef.current) clearInterval(crashRef.current);
    setCrashRunning(false);
  }, []);

  const startCrash = () => {
    if (balance < crashBet) return;
    setBalance(b => b - crashBet);
    setCrashMulti(1.0);
    setCrashedOut(false);
    setCrashCrashed(false);
    setCrashResult(null);
    setCrashRunning(true);
    crashTargetRef.current = 1.3 + Math.random() * 8;
    let m = 1.0;
    crashRef.current = setInterval(() => {
      m += 0.03 + m * 0.008;
      m = parseFloat(m.toFixed(2));
      setCrashMulti(m);
      if (m >= crashTargetRef.current) {
        stopCrash();
        setCrashCrashed(true);
        setCrashResult(`Краш ×${m.toFixed(2)} — −${crashBet}⭐`);
      }
    }, 100);
  };

  const cashOut = () => {
    if (!crashRunning || crashCashedOut) return;
    stopCrash();
    setCrashedOut(true);
    const win = Math.floor(crashBet * crashMulti);
    setBalance(b => b + win);
    setCrashResult(`×${crashMulti.toFixed(2)} = +${win}⭐`);
  };

  useEffect(() => () => { if (crashRef.current) clearInterval(crashRef.current); }, []);

  // ── Case ──
  const handleOpenCase = (c: CaseType) => {
    if (c.freeDaily && dailyUsed) return;
    if (!c.freeDaily && balance < c.price) return;
    if (!c.freeDaily) setBalance(b => b - c.price);
    if (c.freeDaily) setDailyUsed(true);
    setOpeningCase(c);
    setShowWin(false);
    setWonItem(null);
    setSpinning(false);
    setSpinOffset(0);
    setDrumItems([]);
  };

  const startSpin = () => {
    if (!openingCase || spinning) return;
    const win = weightedRandom(openingCase.items);
    const drum = makeDrum(win, openingCase.items);
    setDrumItems(drum);
    setSpinning(true);
    const ITEM_W = 120;
    const offset = -(36 * ITEM_W - 215 + ITEM_W / 2 - 8);
    setTimeout(() => setSpinOffset(offset), 60);
    setTimeout(() => {
      setSpinning(false);
      setWonItem(win);
      setShowWin(true);
      setBalance(b => b + Math.floor(win.value * 0.05));
      setInventory(prev => [{
        item: win, uid: Date.now(),
        openedAt: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        caseName: openingCase.name,
      }, ...prev]);
    }, 4500);
  };

  const closeCase = () => {
    if (spinning) return;
    setOpeningCase(null); setShowWin(false); setWonItem(null); setDrumItems([]); setSpinOffset(0);
  };

  // ── Upgrade ──
  const startUpgrade = () => {
    if (!upgradeFrom || upgradeRunning) return;
    setUpgradeRunning(true);
    setUpgradeResult(null);
    let elapsed = 0;
    const totalSpins = 1080 + Math.random() * 360;
    const iv = setInterval(() => {
      elapsed += 12;
      setUpgradeAngle(elapsed % 360);
      if (elapsed >= totalSpins) {
        clearInterval(iv);
        setUpgradeRunning(false);
        const win = Math.random() * 100 < upgradeChance;
        setUpgradeResult(win ? "win" : "lose");
        if (win) {
          const nextR: Record<Rarity, Rarity> = { common: "rare", rare: "epic", epic: "legendary", legendary: "mythic", mythic: "mythic" };
          const nr = nextR[upgradeFrom.item.rarity];
          const pool = ALL_ITEMS.filter(i => i.rarity === nr);
          const upgraded = pool[Math.floor(Math.random() * pool.length)];
          setInventory(prev => prev
            .filter(i => i.uid !== upgradeFrom!.uid)
            .concat([{ item: upgraded, uid: Date.now(), openedAt: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }), caseName: "Апгрейд" }])
          );
        } else {
          setInventory(prev => prev.filter(i => i.uid !== upgradeFrom!.uid));
        }
        setUpgradeFrom(null);
      }
    }, 20);
  };

  const claimBonus = () => {
    if (!subscribed || bonusClaimed) return;
    setBonusClaimed(true);
    setBalance(b => b + 100);
  };

  const copyRef = () => {
    navigator.clipboard.writeText(refLink).catch(() => {});
    setRefCopied(true);
    setTimeout(() => setRefCopied(false), 2000);
  };

  // ─── UI ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f0f1a] font-montserrat text-white max-w-[430px] mx-auto relative overflow-x-hidden select-none">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-indigo-600/5 blur-3xl rounded-full" />
        <div className="absolute bottom-24 right-0 w-48 h-48 bg-pink-600/4 blur-3xl rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f0f1a]/95 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎁</span>
          <span className="font-bold text-base tracking-tight">TopGift</span>
        </div>
        <button
          onClick={() => setTab("profile")}
          className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 hover:border-yellow-400/40 transition-all"
        >
          <span className="text-yellow-400 text-sm">⭐</span>
          <span className="font-bold text-sm text-yellow-300">{balance.toLocaleString()}</span>
        </button>
      </header>

      {/* Content */}
      <main className="pb-24">

        {/* ════ HOME ════ */}
        {tab === "home" && (
          <div className="px-4 pt-4 space-y-4">

            {/* Bonus banner */}
            {!bonusClaimed && (
              <div className="rounded-2xl bg-gradient-to-r from-indigo-900/80 to-purple-900/80 border border-indigo-500/30 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-sm text-indigo-200">🎉 Приветственный бонус</p>
                    <p className="text-xs text-white/50 mt-0.5">Подпишись на канал → получи <span className="text-yellow-400 font-bold">100 ⭐</span></p>
                  </div>
                  <span className="text-3xl">🎁</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSubscribed(true)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${subscribed ? "bg-green-700 text-green-200" : "bg-indigo-600 text-white hover:bg-indigo-500"}`}
                  >
                    {subscribed ? "✓ Подписан" : "Подписаться"}
                  </button>
                  <button
                    onClick={claimBonus}
                    disabled={!subscribed}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Получить 100 ⭐
                  </button>
                </div>
              </div>
            )}

            {/* Daily free case */}
            <div className={`rounded-2xl border flex items-center gap-3 p-4 transition-all ${dailyUsed ? "bg-white/2 border-white/5 opacity-50" : "bg-gradient-to-r from-green-900/50 to-emerald-950 border-green-500/30"}`}>
              <div className="w-12 h-12 rounded-xl bg-green-800/50 flex items-center justify-center text-2xl flex-shrink-0">🎁</div>
              <div className="flex-1">
                <p className="font-bold text-sm text-green-300">Бесплатный кейс</p>
                <p className="text-xs text-white/40">{dailyUsed ? "Уже открыт — приходи завтра" : "Каждые 24 часа"}</p>
              </div>
              <button
                onClick={() => !dailyUsed && handleOpenCase(CASES[0])}
                disabled={dailyUsed}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${dailyUsed ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-green-500 text-black hover:bg-green-400"}`}
              >
                {dailyUsed ? "✓" : "Открыть"}
              </button>
            </div>

            {/* Crash game */}
            <div className="rounded-2xl bg-[#1a1228] border border-orange-500/20 overflow-hidden">
              <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                <img src={FROG_IMG} alt="crash" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">🐸 Краш</p>
                    <span className="text-[9px] bg-orange-500 text-black font-black px-1.5 py-0.5 rounded-full">ИГРА</span>
                  </div>
                  <p className="text-[10px] text-white/40">Умножай ставку, не допусти краш!</p>
                </div>
                <span className={`ml-auto font-orbitron font-black text-xl ${crashCrashed ? "text-red-400" : crashRunning ? "text-orange-300" : "text-white/30"}`}>
                  ×{crashMulti.toFixed(2)}
                </span>
              </div>

              {/* Multiplier bar */}
              <div className="mx-4 rounded-xl bg-black/50 h-16 flex items-center justify-center mb-3 relative overflow-hidden">
                <div className="absolute inset-0" style={{
                  background: crashCrashed
                    ? "linear-gradient(90deg, #7f1d1d44, #ef444422)"
                    : crashRunning
                    ? "linear-gradient(90deg, #431407, #ea580c22)"
                    : "transparent"
                }} />
                {crashCrashed ? (
                  <div className="text-center z-10">
                    <p className="font-orbitron font-black text-2xl text-red-400">КРАШ!</p>
                    <p className="text-[10px] text-red-300/60">{crashResult}</p>
                  </div>
                ) : crashCashedOut ? (
                  <div className="text-center z-10">
                    <p className="font-orbitron font-black text-2xl text-green-400">✓ {crashResult}</p>
                  </div>
                ) : (
                  <p className={`font-orbitron font-black text-3xl z-10 ${crashRunning ? "text-orange-300" : "text-white/20"}`}>
                    ×{crashMulti.toFixed(2)}
                  </p>
                )}
                {crashRunning && (
                  <div className="absolute bottom-2 right-3 flex gap-1 z-10">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: `${i*0.1}s` }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Bet selector */}
              <div className="flex gap-2 px-4 mb-3">
                {[10, 20, 50, 100].map(v => (
                  <button
                    key={v}
                    onClick={() => !crashRunning && setCrashBet(v)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${crashBet === v ? "bg-orange-500 text-black" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 px-4 pb-4">
                <button
                  onClick={startCrash}
                  disabled={crashRunning || balance < crashBet}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-orange-500 text-black hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {crashRunning ? "В полёте..." : `Старт (${crashBet}⭐)`}
                </button>
                <button
                  onClick={cashOut}
                  disabled={!crashRunning || crashCashedOut}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-green-500 text-black hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Вывести ×{crashMulti.toFixed(2)}
                </button>
              </div>
            </div>

            {/* Recent wins */}
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Последние выигрыши</p>
              <div className="space-y-1.5">
                {(inventory.length > 0 ? inventory.slice(0, 4) : [
                  { item: LEGENDARY_ITEMS[0], uid: 0, openedAt: "12:04", caseName: "NFT Элита" },
                  { item: MYTHIC_ITEMS[0],    uid: 1, openedAt: "11:58", caseName: "NFT Элита" },
                  { item: EPIC_ITEMS[1],      uid: 2, openedAt: "11:44", caseName: "Платиновый" },
                  { item: RARE_ITEMS[0],      uid: 3, openedAt: "11:30", caseName: "Золотой" },
                ] as InventoryItem[]).map((inv, i) => {
                  const cfg = RARITY_CFG[inv.item.rarity];
                  return (
                    <div key={i} className={`rounded-xl px-3 py-2.5 flex items-center gap-3 border ${cfg.border} ${cfg.bg}/50`}>
                      <span className="text-2xl">{inv.item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: cfg.color }}>{inv.item.name}</p>
                        <p className="text-[10px] text-white/30">{inv.caseName} · {inv.openedAt}</p>
                      </div>
                      <p className="text-yellow-400 font-bold text-sm flex-shrink-0">+{inv.item.value}⭐</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════ CASES ════ */}
        {tab === "cases" && (
          <div className="px-4 pt-4">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Выбери кейс</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {CASES.map((c) => {
                const locked = c.freeDaily ? dailyUsed : balance < c.price;
                return (
                  <button
                    key={c.id}
                    onClick={() => !locked && handleOpenCase(c)}
                    className={`rounded-2xl bg-gradient-to-b ${c.gradient} border text-left overflow-hidden transition-all ${locked ? `${c.borderColor} opacity-50 cursor-not-allowed` : `${c.borderColor} hover:brightness-110 active:scale-95`}`}
                  >
                    <div className="relative h-28 overflow-hidden">
                      <img src={CASE_IMG} alt={c.name} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-2 left-2 text-3xl">{c.emoji}</div>
                      {c.freeDaily && <span className="absolute top-2 right-2 text-[9px] font-black bg-green-500 text-black px-1.5 py-0.5 rounded-full">FREE</span>}
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-sm text-white">{c.name}</p>
                      {c.freeDaily ? (
                        <p className="text-[10px] text-green-400 font-bold mt-0.5">{dailyUsed ? "Открыт сегодня" : "Бесплатно"}</p>
                      ) : (
                        <p className="text-[10px] text-yellow-400 font-bold mt-0.5">⭐ {c.price}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Все предметы</p>
            <div className="grid grid-cols-4 gap-2">
              {ALL_ITEMS.map(item => {
                const cfg = RARITY_CFG[item.rarity];
                return (
                  <div key={item.id} className={`rounded-xl p-2 flex flex-col items-center gap-0.5 border ${cfg.border} ${cfg.bg}/60 relative`}>
                    {item.nft && <span className="absolute top-1 right-1 text-[7px] font-black bg-pink-600 text-white px-1 rounded-full">NFT</span>}
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-[8px] text-white/50">{item.chance}%</span>
                    <span className="text-[8px] font-bold" style={{ color: cfg.color }}>{item.value}⭐</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ INVENTORY ════ */}
        {tab === "inventory" && (
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Инвентарь ({inventory.length})</p>
            </div>

            {inventory.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl block mb-3">📦</span>
                <p className="text-white/30 text-sm mb-4">Открой кейс — предметы появятся здесь</p>
                <button onClick={() => setTab("cases")} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-all">
                  К кейсам
                </button>
              </div>
            ) : (
              <>
                {/* Upgrade block */}
                <div className="rounded-2xl bg-[#1a1a2e] border border-white/8 p-4 mb-4">
                  <p className="font-bold text-sm mb-3">⬆️ Апгрейд</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      {upgradeFrom ? (
                        <div className={`rounded-xl p-2.5 flex items-center gap-2 border ${RARITY_CFG[upgradeFrom.item.rarity].border} ${RARITY_CFG[upgradeFrom.item.rarity].bg}/50`}>
                          <span className="text-2xl">{upgradeFrom.item.emoji}</span>
                          <div>
                            <p className="text-xs font-bold" style={{ color: RARITY_CFG[upgradeFrom.item.rarity].color }}>{upgradeFrom.item.name}</p>
                            <p className="text-[9px] text-white/30">{upgradeFrom.item.value}⭐</p>
                          </div>
                          <button onClick={() => setUpgradeFrom(null)} className="ml-auto text-white/30 hover:text-white">
                            <Icon name="X" size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-xl p-3 border border-dashed border-white/15 text-center text-[11px] text-white/30">
                          Выбери предмет ниже
                        </div>
                      )}
                    </div>
                    {/* Spinner wheel */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div
                        className="w-14 h-14 rounded-full border-4 border-indigo-500 relative flex items-center justify-center overflow-hidden"
                        style={{ background: `conic-gradient(#22c55e 0deg ${upgradeChance * 3.6}deg, #ef4444 ${upgradeChance * 3.6}deg 360deg)` }}
                      >
                        <div
                          className="absolute w-0.5 h-6 bg-white rounded-full origin-bottom z-10"
                          style={{ transform: `translateY(-50%) rotate(${upgradeAngle}deg)`, bottom: "50%", left: "50%" }}
                        />
                        <div className="w-3 h-3 bg-white rounded-full z-20" />
                      </div>
                      <p className="text-[9px] font-bold text-green-400">{upgradeChance}%</p>
                    </div>
                  </div>

                  {upgradeResult && (
                    <div className={`rounded-xl p-2 text-center text-xs font-bold mb-3 ${upgradeResult === "win" ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"}`}>
                      {upgradeResult === "win" ? "🎉 Апгрейд успешен! Предмет улучшен" : "💀 Предмет сгорел"}
                    </div>
                  )}

                  <button
                    onClick={startUpgrade}
                    disabled={!upgradeFrom || upgradeRunning}
                    className="w-full py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {upgradeRunning ? "Крутим..." : "Апгрейд (50%)"}
                  </button>
                </div>

                {/* Items grid */}
                <div className="grid grid-cols-3 gap-2">
                  {inventory.map((inv) => {
                    const cfg = RARITY_CFG[inv.item.rarity];
                    const selected = upgradeFrom?.uid === inv.uid;
                    return (
                      <button
                        key={inv.uid}
                        onClick={() => setUpgradeFrom(selected ? null : inv)}
                        className={`rounded-xl p-3 flex flex-col items-center gap-1 border transition-all ${selected ? "border-white scale-95 bg-white/10" : `${cfg.border} ${cfg.bg}/50 hover:scale-[1.02]`}`}
                      >
                        <span className="text-3xl">{inv.item.emoji}</span>
                        <p className="text-[9px] font-bold text-center leading-tight" style={{ color: cfg.color }}>{inv.item.name}</p>
                        <p className="text-[9px] text-yellow-400">{inv.item.value}⭐</p>
                        {inv.item.nft && <span className="text-[7px] bg-pink-600 text-white px-1 rounded-full font-black">NFT</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════ TOP ════ */}
        {tab === "top" && (
          <div className="px-4 pt-4">
            <div className="text-center mb-5">
              <span className="text-4xl block mb-2">🏆</span>
              <h2 className="font-bold text-xl">Топ игроков</h2>
              <p className="text-white/30 text-xs mt-0.5">По сумме выигрышей</p>
            </div>

            {/* Podium */}
            <div className="flex items-end justify-center gap-3 mb-5 h-32">
              {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((p, i) => {
                const h = ["h-20", "h-32", "h-16"];
                const colors = ["bg-slate-600", "bg-yellow-500", "bg-amber-700"];
                const labels = ["2", "1", "3"];
                return (
                  <div key={p.rank} className="flex flex-col items-center gap-1 flex-1">
                    <span className={i === 1 ? "text-3xl" : "text-2xl"}>{p.avatar}</span>
                    <p className="text-[9px] font-bold truncate w-full text-center">{p.name}</p>
                    <div className={`w-full ${h[i]} ${colors[i]} rounded-t-xl flex items-start justify-center pt-2`}>
                      <span className="font-orbitron font-black text-sm text-black">{labels[i]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              {LEADERBOARD.map((p) => (
                <div key={p.rank} className={`rounded-xl p-3 flex items-center gap-3 ${p.rank === 1 ? "bg-yellow-900/25 border border-yellow-500/30" : "bg-white/3 border border-white/5"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${p.rank <= 3 ? "bg-yellow-500 text-black" : "bg-white/10 text-white/40"}`}>
                    {p.rank}
                  </div>
                  <span className="text-xl">{p.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{p.name}</p>
                    <p className="text-[10px] text-white/30">Лучший: {p.prize}</p>
                  </div>
                  <p className="font-orbitron font-bold text-sm text-yellow-400 flex-shrink-0">{p.stars.toLocaleString()}⭐</p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-xl p-3 flex items-center gap-3 border border-dashed border-white/10">
              <div className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center font-bold text-xs text-white/30">—</div>
              <span className="text-xl">👤</span>
              <div className="flex-1">
                <p className="font-bold text-sm">Ты</p>
                <p className="text-[10px] text-white/30">Открытий: {inventory.length}</p>
              </div>
              <p className="font-orbitron font-bold text-sm text-white/30">{balance.toLocaleString()}⭐</p>
            </div>
          </div>
        )}

        {/* ════ PROFILE ════ */}
        {tab === "profile" && (
          <div className="px-4 pt-4 space-y-4">

            {/* Avatar */}
            <div className="rounded-2xl bg-gradient-to-b from-indigo-900/40 to-[#1a1a2e] border border-indigo-500/20 p-5 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg shadow-indigo-500/30">
                👤
              </div>
              <h2 className="font-bold text-lg">Игрок</h2>
              <p className="text-white/40 text-sm mb-4">@username</p>
              <div className="flex justify-center gap-5 pt-4 border-t border-white/8">
                <div>
                  <p className="font-orbitron font-bold text-lg text-yellow-400">{balance.toLocaleString()}</p>
                  <p className="text-[10px] text-white/30">Stars</p>
                </div>
                <div className="w-px bg-white/8" />
                <div>
                  <p className="font-orbitron font-bold text-lg">{inventory.length}</p>
                  <p className="text-[10px] text-white/30">Открытий</p>
                </div>
                <div className="w-px bg-white/8" />
                <div>
                  <p className="font-orbitron font-bold text-lg text-pink-400">{inventory.filter(i => i.item.nft).length}</p>
                  <p className="text-[10px] text-white/30">NFT</p>
                </div>
              </div>
            </div>

            {/* Deposit */}
            <div className="rounded-2xl bg-[#1a1a2e] border border-white/8 p-4">
              <p className="font-bold text-sm mb-3">💳 Пополнение</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "50 Stars",  sub: "~$0.5" },
                  { label: "100 Stars", sub: "~$1", top: true },
                  { label: "500 Stars", sub: "~$5" },
                  { label: "TON / USDT", sub: "CryptoBot" },
                ].map((opt, i) => (
                  <button key={i} className={`rounded-xl p-3 text-left border transition-all hover:brightness-110 active:scale-95 ${opt.top ? "border-yellow-500/40 bg-yellow-900/20" : "border-white/8 bg-white/3"}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-lg">{i < 3 ? "⭐" : "💎"}</span>
                      {opt.top && <span className="text-[8px] bg-yellow-500 text-black font-black px-1.5 rounded-full">ТОП</span>}
                    </div>
                    <p className="font-bold text-sm">{opt.label}</p>
                    <p className="text-[10px] text-white/30">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Withdraw */}
            <div className="rounded-2xl bg-[#1a1a2e] border border-white/8 p-4">
              <p className="font-bold text-sm mb-3">💎 Вывод</p>
              <div className="flex gap-1.5 bg-black/30 p-1 rounded-xl mb-3">
                <button onClick={() => setWithdrawTab("nft")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${withdrawTab === "nft" ? "bg-pink-600 text-white" : "text-white/40 hover:text-white/60"}`}>
                  NFT → @sexwinds
                </button>
                <button onClick={() => setWithdrawTab("stars")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${withdrawTab === "stars" ? "bg-yellow-500 text-black" : "text-white/40 hover:text-white/60"}`}>
                  Stars
                </button>
              </div>

              {withdrawTab === "nft" && (
                <div className="space-y-2">
                  {inventory.filter(i => i.item.nft).length === 0 ? (
                    <p className="text-center text-xs text-white/30 py-3">Выиграй NFT в кейсах</p>
                  ) : inventory.filter(i => i.item.nft).slice(0, 3).map(inv => {
                    const cfg = RARITY_CFG[inv.item.rarity];
                    return (
                      <div key={inv.uid} className={`rounded-xl p-2.5 flex items-center justify-between border ${cfg.border} ${cfg.bg}/40`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{inv.item.emoji}</span>
                          <span className="text-xs font-bold" style={{ color: cfg.color }}>{inv.item.name}</span>
                        </div>
                        <button className="text-[10px] bg-pink-600 text-white px-2 py-1 rounded-lg font-bold hover:bg-pink-500 transition-all">Вывести</button>
                      </div>
                    );
                  })}
                  <input
                    value={withdrawAddr}
                    onChange={e => setWithdrawAddr(e.target.value)}
                    placeholder="TON адрес (UQ...)"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs placeholder:text-white/25 text-white focus:outline-none focus:border-pink-500/50 mt-1"
                  />
                  <button className="w-full py-2.5 rounded-xl font-bold text-sm bg-pink-600 text-white hover:bg-pink-500 transition-all">
                    Отправить в @sexwinds
                  </button>
                </div>
              )}

              {withdrawTab === "stars" && (
                <div className="space-y-2">
                  <p className="text-xs text-white/30">Минимум: 100 Stars</p>
                  <div className="flex gap-2">
                    {[100, 250, 500, 1000].map(v => (
                      <button key={v} className="flex-1 py-2 rounded-lg bg-white/5 text-xs font-bold text-white/50 hover:bg-white/10 transition-all">{v}</button>
                    ))}
                  </div>
                  <button className="w-full py-2.5 rounded-xl font-bold text-sm bg-yellow-500 text-black hover:bg-yellow-400 transition-all">
                    Вывести Stars
                  </button>
                </div>
              )}
            </div>

            {/* Referral */}
            <div className="rounded-2xl bg-[#1a1a2e] border border-white/8 p-4">
              <p className="font-bold text-sm mb-1">👥 Рефералы</p>
              <p className="text-xs text-white/30 mb-3">+<span className="text-yellow-400 font-bold">50 ⭐</span> за каждого друга</p>
              <div className="bg-black/40 rounded-xl px-3 py-2.5 flex items-center gap-2 mb-3">
                <p className="flex-1 text-xs text-white/40 truncate font-mono">{refLink}</p>
                <button
                  onClick={copyRef}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 transition-all ${refCopied ? "bg-green-600 text-white" : "bg-white/10 text-white/50 hover:bg-white/20"}`}
                >
                  {refCopied ? "✓" : "Копировать"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/3 rounded-xl py-2.5 text-center">
                  <p className="font-bold text-lg">0</p>
                  <p className="text-[9px] text-white/30">Рефералов</p>
                </div>
                <div className="bg-white/3 rounded-xl py-2.5 text-center">
                  <p className="font-bold text-lg text-yellow-400">0⭐</p>
                  <p className="text-[9px] text-white/30">Заработано</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#0f0f1a]/97 backdrop-blur-md border-t border-white/6 z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {([
            { id: "inventory", emoji: "🎒", label: "Инвентарь" },
            { id: "cases",     emoji: "📦", label: "Кейсы" },
            { id: "home",      emoji: "🏠", label: "Главная" },
            { id: "top",       emoji: "🏆", label: "Топ" },
            { id: "profile",   emoji: "👤", label: "Профиль" },
          ] as { id: Tab; emoji: string; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all relative ${tab === t.id ? "text-white" : "text-white/25 hover:text-white/50"}`}
            >
              {t.id === "inventory" && inventory.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 rounded-full text-[8px] font-black flex items-center justify-center">
                  {Math.min(inventory.length, 9)}{inventory.length > 9 ? "+" : ""}
                </span>
              )}
              <span className={`text-xl transition-transform ${tab === t.id ? "scale-110" : ""}`}>{t.emoji}</span>
              <span className="text-[8px] font-bold leading-tight">{t.label}</span>
              {tab === t.id && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white rounded-full" />}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Case Opening Modal ── */}
      {openingCase && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
          onClick={!spinning && !showWin ? closeCase : undefined}
        >
          <div
            className="w-full max-w-[430px] bg-[#0f0f1a] rounded-t-3xl border-t border-white/10 p-5 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {!showWin ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Открываем</p>
                    <h3 className="font-bold text-lg">{openingCase.emoji} {openingCase.name}</h3>
                  </div>
                  <button onClick={closeCase} disabled={spinning} className="w-8 h-8 rounded-full bg-white/6 flex items-center justify-center disabled:opacity-30 hover:bg-white/12 transition-all">
                    <Icon name="X" size={14} />
                  </button>
                </div>

                {/* Drum */}
                <div className="relative rounded-2xl overflow-hidden mb-4 bg-black/60" style={{ height: 108 }}>
                  <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-px w-0.5 bg-yellow-400/80 z-20" style={{ boxShadow: "0 0 8px #fbbf24, 0 0 20px #fbbf2440" }} />
                  <div className="absolute top-1.5 bottom-1.5 left-1/2 w-[116px] -translate-x-[58px] border border-yellow-400/30 rounded-xl z-20 pointer-events-none" />

                  <div
                    ref={drumRef}
                    className="flex items-center gap-2 px-2 absolute top-0 left-0 h-full"
                    style={{
                      transition: spinning ? "transform 4.2s cubic-bezier(0.12, 0.67, 0.1, 1)" : "none",
                      transform: `translateX(${spinOffset}px)`,
                      willChange: "transform",
                    }}
                  >
                    {(drumItems.length > 0 ? drumItems : openingCase.items.concat([...openingCase.items, ...openingCase.items])).map((item, i) => {
                      const cfg = RARITY_CFG[item.rarity];
                      return (
                        <div
                          key={i}
                          className={`flex-shrink-0 rounded-xl flex flex-col items-center justify-center border ${cfg.border} ${cfg.bg}/70`}
                          style={{ width: 112, height: 92 }}
                        >
                          <span className="text-3xl">{item.emoji}</span>
                          <span className="text-[9px] font-bold mt-1 text-center px-1 leading-tight" style={{ color: cfg.color }}>{item.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items preview */}
                <div className="grid grid-cols-4 gap-1.5 mb-4">
                  {openingCase.items.map(item => {
                    const cfg = RARITY_CFG[item.rarity];
                    return (
                      <div key={item.id} className={`rounded-xl p-2 flex flex-col items-center border ${cfg.border} ${cfg.bg}/60`}>
                        <span className="text-xl">{item.emoji}</span>
                        <span className="text-[8px] text-white/40 mt-0.5">{item.chance}%</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button onClick={closeCase} disabled={spinning} className="px-5 py-3 rounded-xl bg-white/5 text-white/50 font-bold text-sm hover:bg-white/10 disabled:opacity-30 transition-all">
                    Отмена
                  </button>
                  <button
                    onClick={startSpin}
                    disabled={spinning}
                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {spinning ? "🎰 Открываем..." : `Открыть${openingCase.price > 0 ? ` (${openingCase.price}⭐)` : " бесплатно"}`}
                  </button>
                </div>
              </>
            ) : wonItem && (
              <div className="text-center py-3 animate-win-bounce">
                <p className="text-white/30 text-[10px] uppercase tracking-widest mb-4">Поздравляем!</p>
                <div
                  className={`w-36 h-36 rounded-3xl mx-auto mb-4 flex flex-col items-center justify-center border-2 ${RARITY_CFG[wonItem.rarity].border} ${RARITY_CFG[wonItem.rarity].bg}`}
                  style={
                    wonItem.rarity === "mythic" ? { boxShadow: "0 0 60px #ec489980, 0 0 120px #ec489930" } :
                    wonItem.rarity === "legendary" ? { boxShadow: "0 0 50px #f59e0b70" } :
                    wonItem.rarity === "epic" ? { boxShadow: "0 0 40px #a855f750" } : undefined
                  }
                >
                  <span className="text-6xl">{wonItem.emoji}</span>
                  <RarityBadge rarity={wonItem.rarity} />
                </div>
                <h3 className="font-bold text-2xl mb-1" style={{ color: RARITY_CFG[wonItem.rarity].color }}>{wonItem.name}</h3>
                {wonItem.nft && <span className="inline-block text-xs bg-pink-600 text-white px-2 py-0.5 rounded-full font-black mb-2">NFT</span>}
                <p className="font-orbitron font-bold text-2xl text-yellow-400 mb-1">+{wonItem.value}⭐</p>
                <p className="text-white/25 text-xs mb-5">+{Math.floor(wonItem.value * 0.05)}⭐ на баланс</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowWin(false); setSpinning(false); setSpinOffset(0); setDrumItems([]); }}
                    className="flex-1 py-3 rounded-xl bg-white/5 text-white/50 font-bold text-sm hover:bg-white/10 transition-all"
                  >
                    Ещё раз
                  </button>
                  <button onClick={closeCase} className="flex-1 py-3 rounded-xl bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-all">
                    Забрать ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
