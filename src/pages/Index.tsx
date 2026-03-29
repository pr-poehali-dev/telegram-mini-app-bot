import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";

const CASE_IMG = "https://cdn.poehali.dev/projects/a0c0532b-a700-4ada-820b-a9671cbaf08d/files/2a98b708-1774-49a3-bc1b-18eb2131f046.jpg";
const NFT_IMG = "https://cdn.poehali.dev/projects/a0c0532b-a700-4ada-820b-a9671cbaf08d/files/a1eb2156-9fa0-4c7a-b0e5-0faadbfb52f2.jpg";
const PRIZES_IMG = "https://cdn.poehali.dev/projects/a0c0532b-a700-4ada-820b-a9671cbaf08d/files/de1ab74b-d2a5-4bc2-b8d2-f9e1c1a4e055.jpg";

type Rarity = "common" | "rare" | "epic" | "legendary";

interface Prize {
  id: number;
  name: string;
  emoji: string;
  rarity: Rarity;
  value: number;
  chance: number;
}

interface Case {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

const PRIZES: Prize[] = [
  { id: 1, name: "NFT Звезда", emoji: "⭐", rarity: "legendary", value: 5000, chance: 0.5 },
  { id: 2, name: "NFT Дракон", emoji: "🐉", rarity: "legendary", value: 3000, chance: 1 },
  { id: 3, name: "NFT Алмаз", emoji: "💎", rarity: "epic", value: 1500, chance: 3 },
  { id: 4, name: "NFT Огонь", emoji: "🔥", rarity: "epic", value: 800, chance: 5 },
  { id: 5, name: "100 звезд", emoji: "✨", rarity: "rare", value: 500, chance: 10 },
  { id: 6, name: "50 звезд", emoji: "🌟", rarity: "rare", value: 250, chance: 15 },
  { id: 7, name: "25 звезд", emoji: "💫", rarity: "common", value: 125, chance: 25 },
  { id: 8, name: "10 звезд", emoji: "⚡", rarity: "common", value: 50, chance: 40.5 },
];

const CASES: Case[] = [
  { id: 1, name: "Стартовый", price: 50, image: CASE_IMG, category: "basic" },
  { id: 2, name: "Золотой", price: 150, image: CASE_IMG, category: "gold" },
  { id: 3, name: "Платиновый", price: 350, image: CASE_IMG, category: "platinum" },
  { id: 4, name: "NFT Элита", price: 800, image: CASE_IMG, category: "nft" },
];

const LEADERBOARD = [
  { rank: 1, name: "CryptoKing", avatar: "👑", won: "NFT Дракон", value: 3000, total: 47800 },
  { rank: 2, name: "StarHunter", avatar: "⭐", won: "NFT Звезда", value: 5000, total: 32100 },
  { rank: 3, name: "NFTmaster", avatar: "🔥", won: "NFT Алмаз", value: 1500, total: 28500 },
  { rank: 4, name: "LuckyOne", avatar: "🍀", won: "100 звезд", value: 500, total: 15200 },
  { rank: 5, name: "GoldRush", avatar: "💰", won: "NFT Огонь", value: 800, total: 12400 },
];

const RARITY_LABELS: Record<Rarity, string> = {
  common: "Обычный",
  rare: "Редкий",
  epic: "Эпический",
  legendary: "Легендарный"
};

function weightedRandom(prizes: Prize[]): Prize {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const prize of prizes) {
    cumulative += prize.chance;
    if (rand <= cumulative) return prize;
  }
  return prizes[prizes.length - 1];
}

function generateDrumItems(winPrize: Prize): Prize[] {
  const items: Prize[] = [];
  for (let i = 0; i < 40; i++) {
    items.push(PRIZES[Math.floor(Math.random() * PRIZES.length)]);
  }
  items[32] = winPrize;
  return items;
}

type Tab = "cases" | "profile" | "withdraw" | "deposit" | "leaders" | "support";

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("cases");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [drumItems, setDrumItems] = useState<Prize[]>([]);
  const [spinOffset, setSpinOffset] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [balance, setBalance] = useState(500);
  const [history, setHistory] = useState<{ prize: Prize; case: string; time: string }[]>([]);
  const drumRef = useRef<HTMLDivElement>(null);
  const [depositMethod, setDepositMethod] = useState<"stars" | "crypto">("stars");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const openCase = (c: Case) => {
    if (balance < c.price) return;
    setSelectedCase(c);
    setShowWin(false);
    setWonPrize(null);
    setIsSpinning(false);
    setSpinOffset(0);
    setDrumItems([]);
  };

  const startSpin = () => {
    if (!selectedCase || isSpinning) return;
    if (balance < selectedCase.price) return;
    const win = weightedRandom(PRIZES);
    const items = generateDrumItems(win);
    setDrumItems(items);
    setIsSpinning(true);
    setShowWin(false);
    setBalance(b => b - selectedCase.price);

    const itemWidth = 118;
    const targetIndex = 32;
    const offset = -(targetIndex * itemWidth - (150 - itemWidth / 2));

    setTimeout(() => setSpinOffset(offset), 50);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(win);
      setShowWin(true);
      setHistory(prev => [{
        prize: win,
        case: selectedCase.name,
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
      }, ...prev.slice(0, 19)]);
    }, 4000);
  };

  const closeSpin = () => {
    if (isSpinning) return;
    setSelectedCase(null);
    setShowWin(false);
    setWonPrize(null);
    setDrumItems([]);
    setSpinOffset(0);
  };

  const FAQs = [
    { q: "Как работают шансы?", a: "Каждый предмет имеет свой шанс. Легендарные — 0.5-1%, эпические — 3-5%, редкие — 10-15%, обычные — 25-40%." },
    { q: "Как вывести NFT?", a: "После получения NFT перейдите в «Вывод», введите адрес кошелька. Вывод через @sexwinds занимает до 24 часов." },
    { q: "Какие способы пополнения?", a: "Telegram Stars и криптовалюта через CryptoBot (USDT, TON, BTC, ETH)." },
    { q: "Минимальный вывод?", a: "100 Stars или $5 в криптовалюте." },
    { q: "Как связаться с поддержкой?", a: "Напишите в Telegram @support." },
  ];

  return (
    <div className="min-h-screen bg-background font-montserrat relative max-w-[430px] mx-auto overflow-x-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[200px] rounded-full bg-[hsl(43_96%_56%/0.04)] blur-[80px]" />
        <div className="absolute bottom-1/3 left-0 w-[200px] h-[200px] rounded-full bg-[hsl(270_80%_60%/0.04)] blur-[60px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[hsl(220_20%_6%/0.96)] backdrop-blur-md border-b border-[hsl(220_15%_15%)]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <span className="font-orbitron font-bold text-base shimmer-text">GiftDrop</span>
          </div>
          <button
            onClick={() => setActiveTab("deposit")}
            className="flex items-center gap-1.5 bg-[hsl(220_15%_13%)] border border-[hsl(43_96%_56%/0.3)] rounded-full px-3 py-1.5 hover:border-[hsl(43_96%_56%/0.6)] transition-all"
          >
            <span className="text-sm">⭐</span>
            <span className="font-bold text-sm text-gold">{balance.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground font-bold">+</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="pb-24 px-4">

        {/* ── CASES ── */}
        {activeTab === "cases" && (
          <div className="animate-fade-in">
            <div className="relative mt-4 rounded-2xl overflow-hidden h-32 mb-5">
              <img src={PRIZES_IMG} alt="prizes" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Telegram Mini App</p>
                <h1 className="font-orbitron font-black text-lg text-gold leading-tight">ОТКРЫВАЙ КЕЙСЫ</h1>
                <p className="text-xs text-muted-foreground mt-0.5">NFT вывод через @sexwinds</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CASES.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => openCase(c)}
                  className={`card-dark rounded-2xl overflow-hidden transition-all active:scale-95 ${balance < c.price ? "opacity-60" : "hover:scale-[1.02]"}`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="relative h-28 overflow-hidden">
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220_20%_8%)] via-transparent to-transparent" />
                    {c.category === "nft" && (
                      <div className="absolute top-2 right-2 text-[9px] font-bold bg-[hsl(270_80%_60%)] text-white px-2 py-0.5 rounded-full">NFT</div>
                    )}
                    {c.category === "gold" && (
                      <div className="absolute top-2 right-2 text-[9px] font-bold bg-gold text-background px-2 py-0.5 rounded-full">ТОП</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm text-foreground">{c.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-yellow-400 text-xs">⭐</span>
                      <span className="text-gold font-bold text-sm">{c.price}</span>
                    </div>
                    {balance < c.price && (
                      <p className="text-[9px] text-destructive mt-1">Мало средств</p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {history.length > 0 && (
              <div className="mt-5">
                <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-widest mb-3">Мои последние выигрыши</h3>
                <div className="space-y-2">
                  {history.slice(0, 5).map((h, i) => (
                    <div key={i} className={`rounded-xl px-3 py-2.5 flex items-center justify-between rarity-bg-${h.prize.rarity} animate-fade-in`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{h.prize.emoji}</span>
                        <div>
                          <p className={`text-sm font-bold rarity-${h.prize.rarity}`}>{h.prize.name}</p>
                          <p className="text-[10px] text-muted-foreground">{h.case}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gold font-bold text-sm">+{h.prize.value}⭐</p>
                        <p className="text-[10px] text-muted-foreground">{h.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeTab === "profile" && (
          <div className="animate-fade-in pt-4">
            <div className="card-gold-border rounded-2xl p-5 mb-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[hsl(43_96%_56%/0.04)] to-transparent pointer-events-none" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(43_96%_56%)] to-[hsl(35_90%_45%)] flex items-center justify-center text-4xl mx-auto mb-3 shadow-[0_0_30px_hsl(43_96%_56%/0.4)]">
                👤
              </div>
              <h2 className="font-bold text-xl text-foreground">Игрок</h2>
              <p className="text-muted-foreground text-sm">@username</p>
              <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xl font-orbitron font-bold text-gold">{balance.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Баланс ⭐</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-xl font-orbitron font-bold text-foreground">{history.length}</p>
                  <p className="text-[10px] text-muted-foreground">Открытий</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-xl font-orbitron font-bold text-[hsl(270_80%_70%)]">
                    {history.filter(h => h.prize.rarity === "legendary" || h.prize.rarity === "epic").length}
                  </p>
                  <p className="text-[10px] text-muted-foreground">NFT</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mb-5">
              <button onClick={() => setActiveTab("deposit")} className="btn-gold flex-1 py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                ⭐ Пополнить
              </button>
              <button onClick={() => setActiveTab("withdraw")} className="flex-1 py-3 rounded-xl text-sm font-bold border border-[hsl(270_80%_60%/0.4)] text-[hsl(270_80%_70%)] hover:border-[hsl(270_80%_60%/0.8)] transition-all">
                💎 Вывести NFT
              </button>
            </div>

            <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-widest mb-3">История</h3>
            {history.length === 0 ? (
              <div className="card-dark rounded-2xl p-8 text-center">
                <span className="text-4xl block mb-3">🎁</span>
                <p className="text-muted-foreground text-sm">Открой первый кейс!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className={`rounded-xl px-3 py-2.5 flex items-center justify-between rarity-bg-${h.prize.rarity}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{h.prize.emoji}</span>
                      <div>
                        <p className={`text-sm font-bold rarity-${h.prize.rarity}`}>{h.prize.name}</p>
                        <p className="text-[10px] text-muted-foreground">{RARITY_LABELS[h.prize.rarity]} · {h.case}</p>
                      </div>
                    </div>
                    <p className="text-gold font-bold text-sm">+{h.prize.value}⭐</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── WITHDRAW ── */}
        {activeTab === "withdraw" && (
          <div className="animate-fade-in pt-4">
            <div className="text-center mb-5">
              <img src={NFT_IMG} alt="NFT" className="w-20 h-20 rounded-2xl mx-auto mb-3 object-cover shadow-[0_0_30px_hsl(270_80%_60%/0.5)]" />
              <h2 className="font-orbitron font-bold text-xl text-foreground">Вывод NFT</h2>
              <p className="text-muted-foreground text-sm mt-1">Через <span className="text-[hsl(270_80%_70%)] font-bold">@sexwinds</span></p>
            </div>

            <div className="space-y-4">
              <div className="card-dark rounded-2xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Доступные NFT</p>
                {history.filter(h => h.prize.rarity === "legendary" || h.prize.rarity === "epic").length === 0 ? (
                  <div className="text-center py-5">
                    <span className="text-3xl block mb-2">💎</span>
                    <p className="text-muted-foreground text-sm">Выиграй NFT в кейсах!</p>
                    <button onClick={() => setActiveTab("cases")} className="btn-gold mt-3 px-5 py-2 rounded-xl text-sm">
                      Открыть кейс
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.filter(h => h.prize.rarity === "legendary" || h.prize.rarity === "epic").map((h, i) => (
                      <div key={i} className={`rounded-xl p-3 flex items-center justify-between rarity-bg-${h.prize.rarity}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{h.prize.emoji}</span>
                          <span className={`font-bold text-sm rarity-${h.prize.rarity}`}>{h.prize.name}</span>
                        </div>
                        <button className="text-xs font-bold bg-[hsl(270_80%_60%)] text-white px-3 py-1.5 rounded-full hover:bg-[hsl(270_80%_70%)] transition-all">
                          Вывести
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-dark rounded-2xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">TON-адрес кошелька</p>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={e => setWithdrawAddress(e.target.value)}
                  placeholder="UQ... адрес"
                  className="w-full bg-[hsl(220_20%_8%)] border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(270_80%_60%/0.6)] transition-colors"
                />
                <button className="w-full mt-3 py-3 rounded-xl font-bold text-sm bg-[hsl(270_80%_60%)] text-white hover:bg-[hsl(270_80%_70%)] transition-all">
                  Отправить в @sexwinds
                </button>
              </div>

              <div className="card-dark rounded-2xl p-4 border border-[hsl(43_96%_56%/0.2)]">
                <div className="flex gap-3 items-start">
                  <span className="text-lg">ℹ️</span>
                  <div>
                    <p className="text-sm font-bold text-gold mb-1">Условия вывода</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Минимум: 100 Stars или $5</li>
                      <li>• Обработка до 24 часов</li>
                      <li>• NFT через @sexwinds</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DEPOSIT ── */}
        {activeTab === "deposit" && (
          <div className="animate-fade-in pt-4">
            <div className="text-center mb-6">
              <span className="text-5xl block mb-3 animate-float">💰</span>
              <h2 className="font-orbitron font-bold text-xl">Пополнение</h2>
              <p className="text-muted-foreground text-sm mt-1">Выбери способ</p>
            </div>

            <div className="flex gap-2 mb-5 bg-[hsl(220_15%_11%)] p-1 rounded-xl">
              <button
                onClick={() => setDepositMethod("stars")}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${depositMethod === "stars" ? "btn-gold" : "text-muted-foreground"}`}
              >
                ⭐ Stars
              </button>
              <button
                onClick={() => setDepositMethod("crypto")}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${depositMethod === "crypto" ? "bg-[hsl(270_80%_60%)] text-white" : "text-muted-foreground"}`}
              >
                💎 Крипто
              </button>
            </div>

            {depositMethod === "stars" && (
              <div className="space-y-2 animate-fade-in">
                {[
                  { stars: 50, price: "~$0.5" },
                  { stars: 100, price: "~$1", popular: true },
                  { stars: 250, price: "~$2.5" },
                  { stars: 500, price: "~$5" },
                  { stars: 1000, price: "~$10", bonus: "+50" },
                  { stars: 5000, price: "~$50", bonus: "+500" },
                ].map((opt) => (
                  <button key={opt.stars} className="w-full card-dark rounded-xl p-4 flex items-center justify-between hover:border-[hsl(43_96%_56%/0.4)] border border-transparent transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⭐</span>
                      <div className="text-left">
                        <p className="font-bold text-foreground">{opt.stars} Stars</p>
                        <p className="text-xs text-muted-foreground">{opt.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {opt.popular && <span className="text-[10px] bg-gold text-background font-bold px-2 py-0.5 rounded-full">Топ</span>}
                      {opt.bonus && <span className="text-[10px] bg-[hsl(270_80%_60%)] text-white font-bold px-2 py-0.5 rounded-full">+{opt.bonus}⭐</span>}
                      <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {depositMethod === "crypto" && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-xs text-muted-foreground text-center mb-3">Оплата через @CryptoBot</p>
                {[
                  { coin: "TON", emoji: "💎", name: "Toncoin" },
                  { coin: "USDT", emoji: "💵", name: "Tether" },
                  { coin: "BTC", emoji: "₿", name: "Bitcoin" },
                  { coin: "ETH", emoji: "Ξ", name: "Ethereum" },
                ].map((c) => (
                  <button key={c.coin} className="w-full card-dark rounded-xl p-4 flex items-center justify-between hover:border-[hsl(270_80%_60%/0.4)] border border-transparent transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[hsl(220_15%_18%)] flex items-center justify-center text-xl">{c.emoji}</div>
                      <div className="text-left">
                        <p className="font-bold text-foreground">{c.coin}</p>
                        <p className="text-xs text-muted-foreground">{c.name}</p>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── LEADERS ── */}
        {activeTab === "leaders" && (
          <div className="animate-fade-in pt-4">
            <div className="text-center mb-6">
              <span className="text-5xl block mb-3">🏆</span>
              <h2 className="font-orbitron font-bold text-xl">Таблица лидеров</h2>
              <p className="text-muted-foreground text-sm mt-1">По сумме выигрышей</p>
            </div>

            <div className="space-y-2 mb-4">
              {LEADERBOARD.map((player) => (
                <div
                  key={player.rank}
                  className={`rounded-xl p-3.5 flex items-center gap-3 ${player.rank === 1 ? "card-gold-border" : player.rank === 2 ? "card-dark border border-[#94a3b8]/30" : player.rank === 3 ? "card-dark border border-[#a16207]/30" : "card-dark"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-orbitron font-bold text-sm flex-shrink-0 ${player.rank === 1 ? "bg-gold text-background" : player.rank === 2 ? "bg-[#94a3b8] text-background" : player.rank === 3 ? "bg-[#a16207] text-white" : "bg-[hsl(220_15%_18%)] text-muted-foreground"}`}>
                    {player.rank}
                  </div>
                  <span className="text-2xl">{player.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{player.name}</p>
                    <p className="text-[10px] text-muted-foreground">Победа: {player.won}</p>
                  </div>
                  <p className="font-orbitron font-bold text-sm text-gold flex-shrink-0">{player.total.toLocaleString()}⭐</p>
                </div>
              ))}
            </div>

            <div className="card-dark rounded-xl p-3.5 flex items-center gap-3 border border-dashed border-[hsl(220_15%_25%)]">
              <div className="w-8 h-8 rounded-full bg-[hsl(220_15%_18%)] flex items-center justify-center font-bold text-sm text-muted-foreground">—</div>
              <span className="text-xl">👤</span>
              <div className="flex-1">
                <p className="font-bold text-sm text-foreground">Ты</p>
                <p className="text-[10px] text-muted-foreground">Открытий: {history.length}</p>
              </div>
              <p className="font-orbitron font-bold text-sm text-muted-foreground">{balance.toLocaleString()}⭐</p>
            </div>
          </div>
        )}

        {/* ── SUPPORT ── */}
        {activeTab === "support" && (
          <div className="animate-fade-in pt-4">
            <div className="text-center mb-5">
              <span className="text-5xl block mb-3">💬</span>
              <h2 className="font-orbitron font-bold text-xl">Поддержка</h2>
            </div>

            <a href="https://t.me/support" target="_blank" rel="noopener noreferrer"
              className="card-gold-border rounded-2xl p-4 flex items-center gap-4 mb-5 hover:scale-[1.01] active:scale-[0.99] transition-transform block">
              <div className="w-12 h-12 rounded-xl bg-[hsl(200_100%_50%/0.1)] border border-[hsl(200_100%_50%/0.3)] flex items-center justify-center text-2xl flex-shrink-0">📱</div>
              <div>
                <p className="font-bold text-foreground">Telegram поддержка</p>
                <p className="text-sm text-[hsl(200_100%_60%)]">@support · обычно онлайн</p>
              </div>
              <Icon name="ChevronRight" size={18} className="text-muted-foreground ml-auto" />
            </a>

            <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-widest mb-3">Частые вопросы</h3>
            <div className="space-y-2">
              {FAQs.map((faq, i) => (
                <div key={i} className="card-dark rounded-xl overflow-hidden">
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3"
                  >
                    <span className="font-bold text-sm text-foreground">{faq.q}</span>
                    <Icon name={faqOpen === i ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground flex-shrink-0" />
                  </button>
                  {faqOpen === i && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border pt-3 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[hsl(220_20%_6%/0.97)] backdrop-blur-md border-t border-[hsl(220_15%_13%)] z-40">
        <div className="flex items-center justify-around px-1 py-2">
          {([
            { id: "cases", emoji: "🎁", label: "Кейсы" },
            { id: "leaders", emoji: "🏆", label: "Топ" },
            { id: "deposit", emoji: "💳", label: "Баланс" },
            { id: "withdraw", emoji: "💎", label: "Вывод" },
            { id: "profile", emoji: "👤", label: "Профиль" },
            { id: "support", emoji: "💬", label: "FAQ" },
          ] as { id: Tab; emoji: string; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-xl transition-all min-w-0 ${activeTab === tab.id ? "text-gold" : "text-muted-foreground"}`}
            >
              <span className={`text-lg transition-transform ${activeTab === tab.id ? "scale-110" : ""}`}>{tab.emoji}</span>
              <span className={`text-[8px] font-bold leading-tight ${activeTab === tab.id ? "text-gold" : ""}`}>{tab.label}</span>
              {activeTab === tab.id && <div className="w-1 h-1 rounded-full bg-gold mt-0.5" />}
            </button>
          ))}
        </div>
      </nav>

      {/* ── CASE OPENING MODAL ── */}
      {selectedCase && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm"
          onClick={!isSpinning && !showWin ? closeSpin : undefined}
        >
          <div
            className="w-full max-w-[430px] bg-[hsl(220_20%_7%)] rounded-t-3xl p-5 border-t border-[hsl(43_96%_56%/0.25)] animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {!showWin ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Открываем</p>
                    <h3 className="font-orbitron font-bold text-lg text-gold">{selectedCase.name}</h3>
                  </div>
                  <button onClick={closeSpin} disabled={isSpinning} className="w-8 h-8 rounded-full bg-[hsl(220_15%_15%)] flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40">
                    <Icon name="X" size={16} />
                  </button>
                </div>

                {/* Drum machine */}
                <div className="relative overflow-hidden rounded-2xl mb-4 bg-[hsl(220_20%_5%)]" style={{ height: 118 }}>
                  <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[hsl(220_20%_5%)] to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[hsl(220_20%_5%)] to-transparent z-10 pointer-events-none" />
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gold z-20" style={{ boxShadow: "0 0 10px hsl(43 96% 56%)" }} />
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-px w-[114px] -ml-[57px] border-2 border-gold/40 rounded-lg z-20 pointer-events-none" />

                  <div
                    ref={drumRef}
                    className="flex items-center gap-2 px-2 absolute top-0 left-0 h-full"
                    style={{
                      transition: isSpinning ? "transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 1)" : "none",
                      transform: `translateX(${spinOffset}px)`,
                      willChange: "transform"
                    }}
                  >
                    {(drumItems.length > 0 ? drumItems : PRIZES).map((item, i) => (
                      <div
                        key={i}
                        className={`spin-item rarity-bg-${item.rarity}`}
                        style={{ width: 110, height: 100 }}
                      >
                        <span className="text-3xl">{item.emoji}</span>
                        <span className={`text-[9px] font-bold mt-1 rarity-${item.rarity} text-center px-1 leading-tight`}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contents grid */}
                <div className="mb-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Содержимое кейса</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PRIZES.map(p => (
                      <div key={p.id} className={`rounded-lg p-2 text-center rarity-bg-${p.rarity}`}>
                        <span className="text-lg block">{p.emoji}</span>
                        <span className={`text-[9px] font-bold rarity-${p.rarity}`}>{p.chance}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={closeSpin} disabled={isSpinning} className="px-5 py-3 rounded-xl border border-border text-muted-foreground font-bold text-sm hover:text-foreground transition-colors disabled:opacity-40">
                    Отмена
                  </button>
                  <button
                    onClick={startSpin}
                    disabled={isSpinning}
                    className="flex-1 py-3 rounded-xl btn-gold font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSpinning ? "🎰 Крутим..." : `Открыть за ${selectedCase.price} ⭐`}
                  </button>
                </div>
              </>
            ) : wonPrize && (
              <div className="text-center py-2 animate-win-bounce">
                <p className="text-muted-foreground text-sm uppercase tracking-widest mb-3">🎉 Поздравляем!</p>
                <div
                  className={`w-32 h-32 rounded-3xl mx-auto mb-4 flex flex-col items-center justify-center rarity-bg-${wonPrize.rarity}`}
                  style={{
                    boxShadow: wonPrize.rarity === "legendary"
                      ? "0 0 50px hsl(43 96% 56% / 0.7), 0 0 100px hsl(43 96% 56% / 0.3)"
                      : wonPrize.rarity === "epic"
                      ? "0 0 50px hsl(270 80% 60% / 0.7)"
                      : "none"
                  }}
                >
                  <span className="text-5xl">{wonPrize.emoji}</span>
                  <span className={`text-[10px] font-bold mt-1 rarity-${wonPrize.rarity}`}>{RARITY_LABELS[wonPrize.rarity]}</span>
                </div>
                <h3 className={`font-orbitron font-bold text-2xl rarity-${wonPrize.rarity} mb-1`}>{wonPrize.name}</h3>
                <p className="text-gold font-bold text-xl mb-5">+{wonPrize.value} ⭐</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowWin(false); setIsSpinning(false); setSpinOffset(0); setDrumItems([]); }}
                    className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-bold text-sm hover:text-foreground transition-colors"
                  >
                    Ещё раз
                  </button>
                  <button onClick={closeSpin} className="flex-1 py-3 rounded-xl btn-gold font-bold text-sm">
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
