import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PdfExportOptions {
  filename: string;
  margin: number;
  pageSelector?: string;
}

export async function exportElementToPdf(element: HTMLElement, options: PdfExportOptions): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210 - options.margin * 2;
  const pageHeight = 297 - options.margin * 2;

  const pageElements = options.pageSelector
    ? Array.from(element.querySelectorAll<HTMLElement>(options.pageSelector))
    : [element];

  for (let i = 0; i < pageElements.length; i++) {
    const pageEl = pageElements[i];
    const canvas = await html2canvas(pageEl, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
    const imageData = canvas.toDataURL('image/png');
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    if (i > 0) {
      pdf.addPage();
    }

    const yOffset = options.margin;
    pdf.addImage(imageData, 'PNG', options.margin, yOffset, pageWidth, Math.min(imgHeight, pageHeight));
  }

  pdf.save(options.filename);
}

