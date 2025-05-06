import jsPDF from 'jspdf';
import { DatePipe } from '@angular/common';
import { Event, EventReport } from '../models/event.model'; // Ajustar ruta

// --- Style Constants for Formal Report ---
const COLORS = {
    primary: '#2563eb',       // Keep for emphasis if needed (e.g., chart)
    text: '#1A202C',           // Darker text (like Chakra UI gray.800)
    textSecondary: '#718096', // Lighter gray (like Chakra UI gray.500)
    border: '#E2E8F0',          // Light gray border (like Chakra UI gray.200)
    tableHeaderBg: '#F7FAFC', // Very light gray for table header (like Chakra UI gray.50)
    danger: '#E53E3E'          // Red for errors
};

const FONT_SIZES = {
    title: 16,         
    h1: 14,            
    h2: 12,            
    normal: 10,
    small: 9,
    xsmall: 8
};

const SPACING = {
    margin: 18,        
    baseLineHeight: 5,
    section: 12,       
    item: 6,           
    tableCellPaddingY: 3,
    tableCellPaddingX: 4
};

const defaultFont = 'helvetica';
// --- End Style Constants ---

// Helper function to check and add new page
function checkAddPage(doc: jsPDF, currentY: number, neededHeight: number): number {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (currentY + neededHeight > pageHeight - SPACING.margin) {
        doc.addPage();
        return SPACING.margin;
    }
    return currentY;
}

// Function to draw the statistics table
function drawStatisticsTable(doc: jsPDF, report: EventReport, startY: number): number {
    let currentY = startY;
    const tableStartX = SPACING.margin;
    const tableWidth = doc.internal.pageSize.getWidth() - SPACING.margin * 2;
    const colWidths = [tableWidth * 0.55, tableWidth * 0.2, tableWidth * 0.25]; // Adjust widths: Métrica, Valor, %
    const rowHeight = FONT_SIZES.normal / 2 + SPACING.tableCellPaddingY * 2; // Approximate row height
    const headerHeight = rowHeight;

    currentY = checkAddPage(doc, currentY, headerHeight);

    // --- Table Header ---
    doc.setFillColor(COLORS.tableHeaderBg);
    doc.rect(tableStartX, currentY, tableWidth, headerHeight, 'F');
    doc.setDrawColor(COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(tableStartX, currentY, tableStartX + tableWidth, currentY); // Top border
    doc.line(tableStartX, currentY + headerHeight, tableStartX + tableWidth, currentY + headerHeight); // Bottom border of header
    
    doc.setFont(defaultFont, 'bold');
    doc.setFontSize(FONT_SIZES.normal);
    doc.setTextColor(COLORS.text);

    let currentX = tableStartX;
    doc.text("Metric", currentX + SPACING.tableCellPaddingX, currentY + rowHeight / 1.5, { baseline: 'middle' });
    currentX += colWidths[0];
    doc.line(currentX, currentY, currentX, currentY + headerHeight);
    doc.text("Value", currentX + SPACING.tableCellPaddingX, currentY + rowHeight / 1.5, { baseline: 'middle' });
    currentX += colWidths[1];
    doc.line(currentX, currentY, currentX, currentY + headerHeight);
    doc.text("Percentage", currentX + SPACING.tableCellPaddingX, currentY + rowHeight / 1.5, { baseline: 'middle' });
    
    currentY += headerHeight;

    // --- Table Body ---
    doc.setFont(defaultFont, 'normal');
    doc.setFontSize(FONT_SIZES.normal);
    doc.setTextColor(COLORS.text);

    const totalAttendances: number = report.totalAttendances ?? 0;
    const getPercentage = (value: number | null | undefined): string => {
        if (totalAttendances <= 0 || value == null) return '-'; // Use dash if no percentage
        return `${((value / totalAttendances) * 100).toFixed(0)}%`;
    };

    const tableData = [
        { metric: "Total Invited", value: totalAttendances, percentage: '100%' },
        { metric: "Confirmed", value: report.confirmed ?? 0, percentage: getPercentage(report.confirmed) },
        { metric: "Not Confirmed", value: report.notConfirmed ?? 0, percentage: getPercentage(report.notConfirmed) },
        { metric: "Attended", value: report.attended ?? 0, percentage: getPercentage(report.attended) },
        { metric: "Confirmed, Did Not Attend", value: report.confirmedButDidNotAttend ?? 0, percentage: getPercentage(report.confirmedButDidNotAttend) }
    ];

    tableData.forEach((row, index) => {
        currentY = checkAddPage(doc, currentY, rowHeight);
        currentX = tableStartX;
        
        doc.line(tableStartX, currentY + rowHeight, tableStartX + tableWidth, currentY + rowHeight); // Bottom border of row

        // Metric Column
        doc.text(row.metric, currentX + SPACING.tableCellPaddingX, currentY + rowHeight / 1.5, { baseline: 'middle' });
        currentX += colWidths[0];
        doc.line(currentX, currentY, currentX, currentY + rowHeight); // Vertical line
        
        // Value Column
        doc.text(row.value.toString(), currentX + SPACING.tableCellPaddingX, currentY + rowHeight / 1.5, { baseline: 'middle' });
        currentX += colWidths[1];
        doc.line(currentX, currentY, currentX, currentY + rowHeight); // Vertical line

        // Percentage Column
        doc.text(row.percentage, currentX + SPACING.tableCellPaddingX, currentY + rowHeight / 1.5, { baseline: 'middle' });

        currentY += rowHeight;
    });
    
    // Draw side borders for the whole table
    doc.line(tableStartX, startY, tableStartX, currentY); // Left border
    doc.line(tableStartX + tableWidth, startY, tableStartX + tableWidth, currentY); // Right border

    return currentY; // Return the Y position after the table
}

// Función principal
export function generateReportPdfContent(
    doc: jsPDF,
    event: Event,
    report: EventReport,
    chartInstance: any,
    datePipe: DatePipe,
    currentDate: Date
) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxLineWidth = pageWidth - SPACING.margin * 2;
    let currentY = SPACING.margin;

    // --- Report Header ---
    doc.setFont(defaultFont, 'bold');
    doc.setFontSize(FONT_SIZES.title);
    doc.setTextColor(COLORS.text);
    console.log(`DEBUG: Before printing report title. Y: ${currentY}`);
    try {
      doc.text("Event Report", pageWidth / 2, currentY, { align: 'center' }); 
    } catch (e) {
      console.error('ERROR printing reportTitle:', e);
      throw e; 
    }
    console.log(`DEBUG: After printing report title.`);
    currentY += SPACING.baseLineHeight * 2;
    doc.setDrawColor(COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(SPACING.margin, currentY, pageWidth - SPACING.margin, currentY); 
    currentY += SPACING.section;

    // --- Event Information ---
    doc.setFont(defaultFont, 'bold');
    doc.setFontSize(FONT_SIZES.h1);
    doc.setTextColor(COLORS.text);
    const originalEventName: string = event.name ?? 'Evento sin nombre';
    const sanitizedEventName = originalEventName.replace(/[^a-zA-Z0-9 áéíóúÁÉÍÓÚñÑüÜ .,;:()-]/g, '');
    
    const eventNameLines: string[] = doc.splitTextToSize(sanitizedEventName, maxLineWidth);
    currentY = checkAddPage(doc, currentY, SPACING.baseLineHeight * eventNameLines.length);
    
    if (typeof currentY !== 'number' || !isFinite(currentY)) {
        console.error(`ERROR: Invalid currentY value before printing event name: ${currentY}`);
        currentY = SPACING.margin; 
    }
    console.log(`DEBUG: Before printing event name lines. currentY=${currentY}, lines=${eventNameLines.length}`);

    // Imprimir línea por línea
    eventNameLines.forEach((line: string) => {
        if (typeof currentY !== 'number' || !isFinite(currentY)) {
             console.error(`ERROR: Invalid currentY value inside loop: ${currentY}`);
             return; 
        }
        console.log(`DEBUG: Printing line: '${line}', Y=${currentY}`);
        // --- Re-establecer fuente explícitamente --- 
        doc.setFont(defaultFont, 'bold'); 
        doc.setFontSize(FONT_SIZES.h1); 
        doc.setTextColor(COLORS.text);
        // --- Fin re-establecer fuente --- 
        try {
          doc.text(line, SPACING.margin, currentY); 
        } catch(e) {
           console.error(`ERROR printing event name line: '${line}' at Y=${currentY}`, e);
           throw e; // Re-lanzar para ver el error original
        }
        currentY += SPACING.baseLineHeight; 
    });

    doc.setFont(defaultFont, 'normal');
    doc.setFontSize(FONT_SIZES.normal);
    doc.setTextColor(COLORS.textSecondary);
    const transformedDate: string = datePipe.transform(event.date, 'medium', 'local') ?? 'N/A';
    const locationText: string = event.location ?? 'N/A';
    const totalText: string = (report.totalAttendances ?? 0).toString();

    currentY = checkAddPage(doc, currentY, SPACING.baseLineHeight);
    doc.text(`Date: ${transformedDate}`, SPACING.margin, currentY); currentY += SPACING.item;
    currentY = checkAddPage(doc, currentY, SPACING.baseLineHeight);
    doc.text(`Location: ${locationText}`, SPACING.margin, currentY); currentY += SPACING.item;
    currentY = checkAddPage(doc, currentY, SPACING.baseLineHeight);
    doc.text(`Total Attendees: ${totalText}`, SPACING.margin, currentY); currentY += SPACING.section;

    // --- Description ---
    if (event.description) {
        currentY = checkAddPage(doc, currentY, SPACING.item);
        doc.setFont(defaultFont, 'bold');
        doc.setFontSize(FONT_SIZES.h2);
        doc.setTextColor(COLORS.text);
        doc.text("Description:", SPACING.margin, currentY); currentY += SPACING.item;

        doc.setFont(defaultFont, 'normal');
        doc.setFontSize(FONT_SIZES.normal);
        doc.setTextColor(COLORS.textSecondary);
        const descriptionText: string = event.description ?? '';
        const descriptionLines: string[] = doc.splitTextToSize(descriptionText, maxLineWidth);
        descriptionLines.forEach((line: string, index: number) => {
            currentY = checkAddPage(doc, currentY, SPACING.baseLineHeight);
            doc.text(line, SPACING.margin, currentY); currentY += SPACING.baseLineHeight;
        });
        currentY += SPACING.section;
    }

    // --- Statistics Section Title ---
    currentY = checkAddPage(doc, currentY, SPACING.item);
    doc.setFont(defaultFont, 'bold');
    doc.setFontSize(FONT_SIZES.h2);
    doc.setTextColor(COLORS.text);
    doc.text("Attendance Statistics", SPACING.margin, currentY); currentY += SPACING.item * 1.5; // Space before table

    // --- Draw Statistics Table ---
    currentY = drawStatisticsTable(doc, report, currentY);
    currentY += SPACING.section; // Space after table

    // --- Chart ---
    if (chartInstance && chartInstance.canvas) {
        currentY = checkAddPage(doc, currentY, SPACING.item * 1.5); // Space for title
        doc.setFont(defaultFont, 'bold');
        doc.setFontSize(FONT_SIZES.h2);
        doc.setTextColor(COLORS.text);
        doc.text("Attendance Chart", pageWidth / 2, currentY, { align: 'center' });
        currentY += SPACING.item * 1.5;

        console.log('Attempting to add chart canvas to PDF...');
        try {
            const chartDataURL = chartInstance.canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(chartDataURL);
            const chartRenderHeight = 70; // Slightly smaller chart
            const imgScaledWidth = (imgProps.width * chartRenderHeight) / imgProps.height;
            let imgWidth = imgScaledWidth > maxLineWidth ? maxLineWidth : imgScaledWidth;
            let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            const imgX = SPACING.margin + (maxLineWidth - imgWidth) / 2; // Centered
            
            // --- ADD CHECK for valid dimensions ---
            if (!isFinite(imgWidth) || !isFinite(imgHeight) || imgWidth <= 0 || imgHeight <= 0) {
              console.error(`Invalid chart image dimensions calculated: width=${imgWidth}, height=${imgHeight}. Skipping chart.`);
              currentY = checkAddPage(doc, currentY, SPACING.baseLineHeight);
              doc.setFont(defaultFont, 'italic'); doc.setFontSize(FONT_SIZES.small);
              doc.setTextColor(COLORS.danger);
              doc.text("Error rendering chart in PDF." + " (Invalid Dimensions)", SPACING.margin, currentY);
              currentY += SPACING.section;
            } else {
              // --- END ADD CHECK ---
              currentY = checkAddPage(doc, currentY, imgHeight);
              doc.addImage(chartDataURL, 'PNG', imgX, currentY, imgWidth, imgHeight);
              currentY += imgHeight + SPACING.section;
              console.log('Chart added to PDF successfully.');
            } // --- ADD closing brace for else ---
        } catch (e) {
            console.error("Error adding chart to PDF:", e);
            currentY = checkAddPage(doc, currentY, SPACING.baseLineHeight);
            doc.setFont(defaultFont, 'italic'); doc.setFontSize(FONT_SIZES.small);
            doc.setTextColor(COLORS.danger);
            doc.text("Error rendering chart in PDF.", SPACING.margin, currentY);
            currentY += SPACING.section;
        }
    } else {
        console.warn("Chart instance or canvas not found for PDF generation.");
        currentY = checkAddPage(doc, currentY, SPACING.baseLineHeight);
        doc.setFont(defaultFont, 'italic'); doc.setFontSize(FONT_SIZES.small);
        doc.setTextColor(COLORS.textSecondary);
        doc.text("Chart not available.", SPACING.margin, currentY);
        currentY += SPACING.section;
    }

    // --- Footer Timestamp ---
    doc.setFont(defaultFont, 'normal');
    doc.setTextColor(COLORS.textSecondary);
    const transformedTimestamp: string = datePipe.transform(currentDate, 'medium', 'local') ?? 'N/A';
    const generationTimeStr = `Generated: ${transformedTimestamp}`;
    let footerY = pageHeight - SPACING.margin / 2;
    const requiredFooterSpace = SPACING.margin / 2 + FONT_SIZES.xsmall / 2;
    // --- ADD CHECK for currentY before calculating footerY ---
    if (!isFinite(currentY)) {
        console.error(`ERROR: currentY became invalid (${currentY}) before footer calculation. Resetting to margin.`);
        currentY = pageHeight - requiredFooterSpace - 1; // Place it just above the required space
    }
    // --- END ADD CHECK ---
    if (currentY > pageHeight - requiredFooterSpace) {
       if (currentY > pageHeight - SPACING.margin) { 
           footerY = pageHeight - SPACING.margin / 2;
       } else {
           footerY = currentY + SPACING.baseLineHeight;
       }
    }
    // --- Reset font to default before setting size ---
    doc.setFont(defaultFont, 'normal'); 
    // --- End reset ---
    doc.setFontSize(FONT_SIZES.xsmall);
    // --- ADD CHECK for footerY ---
    if (!isFinite(footerY)) {
        console.error(`ERROR: Calculated footerY is invalid (${footerY}). Using default value.`);
        footerY = pageHeight - SPACING.margin / 2; // Default fallback
    }
    // --- END ADD CHECK ---
    // --- ADD Clamp footerY to be within page bounds ---
    footerY = Math.min(footerY, pageHeight - SPACING.margin / 2); // Ensure it's not past the bottom margin area
    // --- END Clamp ---
    doc.text(generationTimeStr, SPACING.margin, footerY); 
} 