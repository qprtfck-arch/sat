import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useApp } from '../lib/store.jsx';
import { Spinner, Section } from '../components/common.jsx';
import Icon from '../components/Icon.jsx';
import { useToast } from '../components/Toast.jsx';

const RARITY = {
  Common: { color: '#94a3b8', label: 'Обычный' },
  Rare: { color: '#3b82f6', label: 'Редкий' },
  Epic: { color: '#a855f7', label: 'Эпический' },
  Legendary: { color: '#f59e0b', label: 'Легендарный' },
};

function Card({ children, className = '' }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

function StreakCard({ data, onChange }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const checkin = async () => {
    setBusy(true);
    try {
      const r = await api.post('/gamification/streak/checkin');
      onChange();
      if (!r.already) {
        toast(
          r.bonus ? `Стрик ${r.streak} дней! +${5 + r.bonus} монет (бонус!)` : `+5 монет! Стрик: ${r.streak} 🔥`,
          'coins'
        );
      }
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <div className="flex items-center gap-2 text-orange-500">
        <Icon name="flame" size={20} />
        <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100">Дневной стрик</h3>
      </div>
      <div className="mt-3 font-display text-4xl font-extrabold nums">{data.streak} 🔥</div>
      <p className="mt-1 text-sm text-slate-500">Заходи каждый день: +5 монет, каждый 7-й день — бонус +50.</p>
      <button onClick={checkin} disabled={busy || data.checkedInToday} className="btn-primary mt-4 w-full">
        {data.checkedInToday ? 'Сегодня отмечено ✓' : busy ? 'Отмечаем…' : 'Отметиться сегодня'}
      </button>
    </Card>
  );
}

function TriviaCard({ onCoins }) {
  const [trivia, setTrivia] = useState(null);
  const [picked, setPicked] = useState(null);
  const toast = useToast();

  const load = () => api.get('/ai/daily-trivia').then(setTrivia).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const choose = async (i) => {
    if (picked != null) return;
    setPicked(i);
    const correct = i === trivia.correct_index;
    if (!trivia.alreadyClaimed) {
      const r = await api.post('/ai/daily-trivia/claim', { correct }).catch(() => null);
      if (r?.awarded) {
        onCoins();
        toast(`Верно! +${r.awarded} монет 🎉`, 'coins');
      }
    }
  };

  if (!trivia) return <Card><Spinner label="Загрузка викторины…" /></Card>;
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand-500">
          <Icon name="sparkles" size={20} />
          <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100">AI-викторина дня</h3>
        </div>
        <span className="chip bg-slate-100 text-slate-500 dark:bg-slate-800">
          {trivia.source === 'ai' ? 'Gemini' : 'offline'}
        </span>
      </div>
      <p className="mt-3 font-medium">{trivia.question}</p>
      <div className="mt-3 grid gap-2">
        {trivia.options.map((opt, i) => {
          const isCorrect = picked != null && i === trivia.correct_index;
          const isWrong = picked === i && i !== trivia.correct_index;
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={picked != null}
              className={`rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${
                isCorrect
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                  : isWrong
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                    : 'border-slate-200 hover:border-brand-300 dark:border-slate-700'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {picked != null && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
          {picked === trivia.correct_index ? (
            <span className="font-semibold text-emerald-600">
              Верно! {trivia.alreadyClaimed ? '(награда уже получена)' : '+15 монет'}
            </span>
          ) : (
            <span className="font-semibold text-red-500">Неверно.</span>
          )}
          <p className="mt-1 text-slate-500">{trivia.explanation}</p>
        </div>
      )}
    </Card>
  );
}

function CaseCard({ coins, onCoins }) {
  const [opening, setOpening] = useState(false);
  const [reward, setReward] = useState(null);
  const toast = useToast();
  const open = async () => {
    setOpening(true);
    setReward(null);
    try {
      const r = await api.post('/gamification/case/open');
      await new Promise((res) => setTimeout(res, 750)); // suspense
      setReward(r.item);
      onCoins();
      const rc = RARITY[r.item.rarity];
      toast(`${r.item.itemType} ${r.item.name} — ${rc.label}!`, r.item.rarity === 'Legendary' ? 'coins' : 'success');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setOpening(false);
    }
  };
  const rc = reward ? RARITY[reward.rarity] : null;
  return (
    <Card>
      <div className="flex items-center gap-2 text-violet-500">
        <Icon name="box" size={20} />
        <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100">Кейс Mentoria</h3>
      </div>
      <p className="mt-1 text-sm text-slate-500">Открой кейс за 100 монет (Common 70% · Rare 20% · Epic 8% · Legendary 2%).</p>

      <div
        className="my-4 flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 transition-colors dark:border-slate-700"
        style={reward ? { borderColor: rc.color, borderStyle: 'solid', boxShadow: `inset 0 0 40px ${rc.color}33` } : undefined}
      >
        {opening && !reward ? (
          <div className="animate-bounce text-5xl">🎁</div>
        ) : reward ? (
          <div className="animate-reveal-pop text-center" style={{ color: rc.color }}>
            <div className="text-5xl drop-shadow" style={{ filter: `drop-shadow(0 0 10px ${rc.color}88)` }}>
              {reward.itemType}
            </div>
            <div className="mt-1 font-display font-bold text-slate-900 dark:text-slate-100">{reward.name}</div>
            <div className="text-xs font-semibold uppercase tracking-wide">{rc.label}</div>
          </div>
        ) : (
          <div className="text-5xl opacity-40">📦</div>
        )}
      </div>

      <button onClick={open} disabled={opening || coins < 100} className="btn-primary w-full">
        <Icon name="box" size={16} /> {coins < 100 ? 'Нужно 100 монет' : opening ? 'Открываем…' : 'Открыть за 100'}
      </button>
    </Card>
  );
}

function PromoCard({ onChange }) {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);
  const toast = useToast();
  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const r = await api.post('/gamification/promo', { code });
      setMsg({ ok: true, text: r.message });
      toast(r.message, 'coins');
      setCode('');
      onChange();
    } catch (e) {
      setMsg({ ok: false, text: e.message });
      toast(e.message, 'error');
    }
  };
  return (
    <Card>
      <div className="flex items-center gap-2 text-emerald-500">
        <Icon name="zap" size={20} />
        <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100">Промокод</h3>
      </div>
      <p className="mt-1 text-sm text-slate-500">Попробуй: <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">WELCOME_BOOST</code></p>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Введи код" />
        <button className="btn-primary px-4">OK</button>
      </form>
      {msg && <p className={`mt-2 text-sm ${msg.ok ? 'text-emerald-600' : 'text-red-500'}`}>{msg.text}</p>}
    </Card>
  );
}

function GiftCard({ onChange }) {
  const [form, setForm] = useState({ toEmail: '', amount: 10 });
  const [msg, setMsg] = useState(null);
  const toast = useToast();
  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const r = await api.post('/gamification/gift', { toEmail: form.toEmail, amount: Number(form.amount) });
      setMsg({ ok: true, text: r.message });
      toast(r.message, 'success');
      onChange();
    } catch (e) {
      setMsg({ ok: false, text: e.message });
      toast(e.message, 'error');
    }
  };
  return (
    <Card>
      <div className="flex items-center gap-2 text-rose-500">
        <Icon name="gift" size={20} />
        <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100">Подарить монеты</h3>
      </div>
      <p className="mt-1 text-sm text-slate-500">P2P-перевод другу по email (например, admin@mentoria.io).</p>
      <form onSubmit={submit} className="mt-3 space-y-2">
        <input className="input" value={form.toEmail} onChange={(e) => setForm((f) => ({ ...f, toEmail: e.target.value }))} placeholder="email получателя" />
        <div className="flex gap-2">
          <input className="input" type="number" min={1} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          <button className="btn-primary px-4">Отправить</button>
        </div>
      </form>
      {msg && <p className={`mt-2 text-sm ${msg.ok ? 'text-emerald-600' : 'text-red-500'}`}>{msg.text}</p>}
    </Card>
  );
}

function Leaderboard() {
  const { user } = useApp();
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get('/gamification/leaderboard').then((d) => setItems(d.items || [])).catch(() => {});
  }, []);
  const medal = ['🥇', '🥈', '🥉'];
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2 text-amber-500">
        <Icon name="trophy" size={20} />
        <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100">Лидерборд</h3>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((u, i) => (
          <div key={u.id} className={`flex items-center justify-between py-2.5 ${u.id === user?.id ? 'font-bold text-brand-600' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="w-6 text-center">{medal[i] || i + 1}</span>
              <span>{u.name}</span>
            </div>
            <span className="flex items-center gap-1 text-amber-500 nums">
              <Icon name="coins" size={14} /> {u.coins}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Rewards() {
  const { refreshUser } = useApp();
  const [data, setData] = useState(null);

  const load = () => api.get('/gamification/me').then(setData);
  useEffect(() => {
    load();
  }, []);

  const onChange = () => {
    load();
    refreshUser();
  };

  if (!data) return <Spinner />;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Награды и геймификация</h1>
          <p className="mt-1 text-slate-500">Зарабатывай Mentoria Coins за обучение и открывай кейсы.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-5 py-3 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
          <Icon name="coins" size={28} />
          <span className="font-display text-3xl font-extrabold nums">{data.coins}</span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <StreakCard data={data} onChange={onChange} />
        <TriviaCard onCoins={onChange} />
        <CaseCard coins={data.coins} onCoins={onChange} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <PromoCard onChange={onChange} />
        <GiftCard onChange={onChange} />
        <Leaderboard />
      </div>

      <Section title="Инвентарь" subtitle="Предметы, выпавшие из кейсов">
        {data.inventory.length === 0 ? (
          <p className="text-sm text-slate-500">Пока пусто — открой кейс выше.</p>
        ) : (
          <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {data.inventory.map((it) => {
              const rc = RARITY[it.rarity] || RARITY.Common;
              return (
                <div key={it.id} className="card flex flex-col items-center p-4 text-center" style={{ borderColor: rc.color }}>
                  <div className="text-4xl">{it.itemType}</div>
                  <div className="mt-1 text-xs font-semibold">{it.name}</div>
                  <div className="text-[10px] font-bold uppercase" style={{ color: rc.color }}>{rc.label}</div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <div className="text-center">
        <Link to="/roadmap" className="btn-outline">
          <Icon name="map" size={16} /> Мой AI-Roadmap
        </Link>
      </div>
    </div>
  );
}
