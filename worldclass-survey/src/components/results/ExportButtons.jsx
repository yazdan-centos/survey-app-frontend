import { useState } from 'react';
import { FileJson, FileDown, Loader2 } from 'lucide-react';
import { buildResultsPayload, downloadJson, downloadNodeAsPdf } from '../../utils/exportResults';

export default function ExportButtons({ dashboardRef, role, demographics, dimensionScores, overallAverage, submittedAt }) {
    const [exportingPdf, setExportingPdf] = useState(false);

    const handleJsonExport = () => {
        const payload = buildResultsPayload({ role, demographics, dimensionScores, overallAverage, submittedAt });
        downloadJson(payload);
    };

    const handlePdfExport = async () => {
        setExportingPdf(true);
        try {
            await downloadNodeAsPdf(dashboardRef.current);
        } finally {
            setExportingPdf(false);
        }
    };

    return (
        <div className="flex flex-wrap gap-3">
            <button
                type="button"
                onClick={handleJsonExport}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
                <FileJson size={16} />
                دریافت JSON
            </button>
            <button
                type="button"
                onClick={handlePdfExport}
                disabled={exportingPdf}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-900 disabled:opacity-60"
            >
                {exportingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                دریافت PDF
            </button>
        </div>
    );
}
