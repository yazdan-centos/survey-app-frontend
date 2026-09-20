export default function ProgressBar({ percent, label }) {
    return (
        <div className="w-full">
            {label && (
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>{label}</span>
                    <span>{percent}%</span>
                </div>
            )}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                    className="h-full rounded-full bg-primary-700 transition-all duration-500 ease-out"
                    style={{ width: `${percent}%` }}
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
        </div>
    );
}
