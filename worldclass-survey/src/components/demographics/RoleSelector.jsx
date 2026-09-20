import { ROLES } from '../../data/roles';
import { Check } from 'lucide-react';

export default function RoleSelector({ value, onChange }) {
    return (
        <fieldset>
            <legend className="mb-3 text-sm font-semibold text-slate-700">
                نقش شما در ارتباط با شرکت کدام است؟
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {ROLES.map((role) => {
                    const selected = value === role.id;
                    return (
                        <button
                            key={role.id}
                            type="button"
                            onClick={() => onChange(role.id)}
                            aria-pressed={selected}
                            className={[
                                'relative flex flex-col items-start gap-1 rounded-xl border p-4 text-right transition-all',
                                selected
                                    ? 'border-primary-700 bg-primary-50 ring-1 ring-primary-700'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                            ].join(' ')}
                        >
                            {selected && (
                                <span className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary-700 text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
                            )}
                            <span className="font-semibold text-slate-900">{role.label}</span>
                            <span className="text-xs text-slate-500">{role.description}</span>
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}
