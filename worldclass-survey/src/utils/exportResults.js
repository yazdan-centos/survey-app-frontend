import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Builds a plain-object snapshot of the survey results suitable for JSON export.
 */
export function buildResultsPayload({ role, demographics, dimensionScores, overallAverage, submittedAt }) {
  return {
    exportedAt: new Date().toISOString(),
    submittedAt,
    respondentRole: role?.label ?? null,
    demographics,
    overallAverage,
    dimensions: dimensionScores.map((d) => ({
      dimension: d.label,
      average: d.average,
      answered: d.answered,
      total: d.total,
      skipped: d.skipped,
    })),
  };
}

export function downloadJson(payload, filename = 'worldclass-survey-results.json') {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Renders a DOM node (the results dashboard) to a PDF file using html2canvas + jsPDF.
 */
export async function downloadNodeAsPdf(node, filename = 'worldclass-survey-results.pdf') {
  if (!node) return;
  const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}
