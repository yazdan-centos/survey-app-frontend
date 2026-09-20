import { Check } from 'lucide-react';
import { DIMENSIONS } from '../../data/dimensions';
import { useSurvey } from '../../context/SurveyContext';

export default function DimensionStepper({ activeKey }) {
  const { isDimensionComplete, goToStep } = useSurvey();
  const activeIndex = DIMENSIONS.findIndex((d) => d.key === activeKey);

  return (
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {DIMENSIONS.map((dim, idx) => {
          const complete = isDimensionComplete(dim.key);
          const isActive = dim.key === activeKey;
          const isPast = idx < activeIndex;
          const reachable = complete || isPast || isActive;

          return (
              <li key={dim.key} className="flex flex-1 items-center gap-1.5 sm:gap-2">
                <button
                    type="button"
                    disabled={!reachable}
                    onClick={() => reachable && goToStep(dim.key)}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={dim.label}
                    className={[
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors sm:h-9 sm:w-9',
                      isActive
                          ? 'border-primary-700 bg-primary-700 text-white'
                          : complete
                              ? 'border-primary-700 bg-white text-primary-700'
                              : 'border-slate-300 bg-white text-slate-400',
                      reachable ? 'cursor-pointer' : 'cursor-not-allowed',
                    ].join(' ')}
                    title={dim.label}
                >
                  {complete && !isActive ? <Check size={16} /> : idx + 1}
                </button>
                {idx < DIMENSIONS.length - 1 && (
                    <span
                        className={[
                          'h-0.5 flex-1 rounded-full',
                          isPast || complete ? 'bg-primary-700' : 'bg-slate-200',
                        ].join(' ')}
                    />
                )}
              </li>
          );
        })}
      </ol>
  );
}
