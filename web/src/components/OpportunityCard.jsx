import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import {
  directionRu,
  directionColor,
  categoryRuLabel,
  formatRuLabel,
  deadlineLabel,
} from '../lib/ui.js';

const toneClass = {
  red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export default function OpportunityCard({ opp, saved, onToggleSave }) {
  const dl = deadlineLabel(opp.deadline);
  return (
    <div className="card flex flex-col p-5 transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover dark:hover:border-brand-800">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={`chip ${directionColor(opp.direction)}`}>{directionRu(opp.direction)}</span>
          <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {categoryRuLabel(opp.category)}
          </span>
        </div>
        <button
          onClick={() => onToggleSave?.(opp)}
          className={`-m-1.5 flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 active:scale-90 ${
            saved
              ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30'
              : 'text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800'
          }`}
          title={saved ? 'Убрать из избранного' : 'Сохранить'}
          aria-label={saved ? 'Убрать из избранного' : 'Сохранить в избранное'}
          aria-pressed={!!saved}
        >
          <Icon name="heart" size={20} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <Link to={`/opportunities/${opp.id}`} className="group">
        <h3 className="font-display text-base font-semibold leading-snug group-hover:text-brand-600">
          {opp.title}
        </h3>
      </Link>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">{opp.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Icon name="map-pin" size={13} /> {opp.location}
        </span>
        <span aria-hidden="true">·</span>
        <span>{formatRuLabel(opp.format)}</span>
        <span aria-hidden="true">·</span>
        <span>
          {opp.gradeMin}–{opp.gradeMax} класс
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <span className={`chip ${toneClass[dl.tone]}`}>
          <Icon name="clock" size={13} /> {dl.text}
        </span>
        <Link
          to={`/opportunities/${opp.id}`}
          className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600 hover:gap-1.5"
        >
          Подробнее <Icon name="chevron-right" size={15} />
        </Link>
      </div>
    </div>
  );
}
