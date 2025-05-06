import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventService, EventReportData } from '../../../services/event.service';
import { LoadingService } from '../../../services/loading.service';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { Event } from '../../../models/event.model';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';
import { generateReportPdfContent } from '../../../utils/pdf-report-generator';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language.service';

// Interfaz para los puntos de datos del gráfico
interface ChartDataPoint {
  y: number;
  name: string;
}

@Component({
  selector: 'app-events-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CanvasJSAngularChartsModule,
    TranslateModule
  ],
  templateUrl: './events-report.component.html',
  styleUrls: ['./events-report.component.css'],
  providers: [DatePipe]
})
export class EventsReportComponent implements OnInit, OnDestroy {
  event: Event | null = null;
  report: EventReportData | null = null;
  error: string | null = null;
  chart: any;
  currentDate = new Date();
  loading: boolean = true;
  private loadingSub?: Subscription;
  private eventSubscription: Subscription | null = null;
  private reportSubscription: Subscription | null = null;
  private langChangeSub?: Subscription;

  pieChartOptions: any = {
    theme: "light2",
    title: {
      text: "Estadísticas de Asistencia"
    },
    legend: {
      verticalAlign: "bottom",
      horizontalAlign: "center"
    },
    data: [{
      type: "pie",
      showInLegend: false,
      toolTipContent: "{name}: {y}",
      indexLabel: "{name} - {y}",
      legendText: "{name}",
      dataPoints: [] as ChartDataPoint[]
    }]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    public loadingService: LoadingService,
    private datePipe: DatePipe,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.loadingSub = this.loadingService.loading$.subscribe(val => this.loading = val);
    this.loadEvent();
    
    this.langChangeSub = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      console.log(`TranslateService onLangChange event for lang: ${event.lang}, updating chart labels...`);
      if (this.report) {
        this.updateChartData();
      }
    });
  }

  ngOnDestroy() {
    this.loadingSub?.unsubscribe();
    this.eventSubscription?.unsubscribe();
    this.reportSubscription?.unsubscribe();
    this.langChangeSub?.unsubscribe();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  getChartInstance(chart: object) {
    this.chart = chart;
  }

  loadEvent() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/events']);
      return;
    }

    this.loadingService.show();

    this.eventService.getEvent(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          if (Array.isArray(response.data) && response.data.length > 0) {
            this.event = response.data[0] as unknown as Event;
            this.loadReport(id);
          } else {
            console.error('Invalid event response format:', response);
            this.error = 'Formato de respuesta inválido';
            this.loadingService.hide();
          }
        } else {
          console.error('Invalid event response:', response);
          this.error = 'No se pudo cargar el evento';
          this.loadingService.hide();
        }
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.error = 'Error al cargar el evento';
        this.loadingService.hide();
      }
    });
  }

  loadReport(id: string) {
    this.eventService.getEventReport(id).subscribe({
      next: (reportResponse: { success: boolean, data: EventReportData }) => {
        if (reportResponse.success && reportResponse.data) {
          this.report = reportResponse.data;
          console.log('Report data loaded:', this.report);
          this.updateChartData();
        } else {
          console.error('Invalid report response:', reportResponse);
          this.error = 'No se pudo cargar el reporte';
        }
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading event report:', error);
        this.error = 'Error al cargar el reporte';
        this.loadingService.hide();
      }
    });
  }

  updateChartData() {
    if (!this.report) {
      console.warn('updateChartData called but report is null');
      return;
    }
    const currentLang = this.translate.currentLang;
    console.log(`Updating chart data for language: ${currentLang} (called from ${ new Error().stack?.split('\n')[2]?.trim() })`);

    const keysToTranslate = [
      'eventsReport.confirmed',
      'eventsReport.notConfirmed',
      'eventsReport.attended',
      'eventsReport.confirmedNotAttended',
      'eventsReport.title'
    ];

    this.translate.get(keysToTranslate).subscribe(translations => {
      console.log('Translations received:', translations);
      
      const confirmed = this.report!.confirmed ?? 0;
      const notConfirmed = this.report!.notConfirmed ?? 0;
      const attended = this.report!.attended ?? 0;
      const confirmedButDidNotAttend = this.report!.confirmedButDidNotAttend ?? 0;

      const newDataPoints: ChartDataPoint[] = [
        { y: confirmed, name: translations[keysToTranslate[0]] },
        { y: notConfirmed, name: translations[keysToTranslate[1]] },
        { y: attended, name: translations[keysToTranslate[2]] },
        { y: confirmedButDidNotAttend, name: translations[keysToTranslate[3]] }
      ];
      
      const translatedTitle = translations[keysToTranslate[4]];
      console.log(`Assigning title: ${translatedTitle}`);
      console.log(`Assigning dataPoints:`, newDataPoints);

      this.pieChartOptions = {
        ...this.pieChartOptions,
        title: {
          text: translatedTitle || "Estadísticas (Error Título)"
        },
        data: [{
          ...this.pieChartOptions.data[0],
          dataPoints: newDataPoints
        }]
      };

      if (this.chart) {
        this.chart.options = this.pieChartOptions;
        this.chart.render();
        console.log('Chart re-rendered attempt with new options object.');
      } else {
        console.log('Chart instance not available yet for re-rendering.');
      }
    });
  }

  onBack() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/events/view', id]);
    } else {
      this.router.navigate(['/events']);
    }
  }

  onPrint(): void {
    console.log('jsPDF onPrint started...');
    if (!this.event || !this.report) {
      console.error('Cannot generate PDF: Event or Report data is missing.');
      return;
    }

    this.loadingService.show();

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      
      generateReportPdfContent(
          doc,
          this.event!, 
          this.report!, 
          this.chart, 
          this.datePipe,
          this.currentDate
      );

      const eventNameForFile: string = this.event!.name ?? 'evento';
      const safeEventName: string = eventNameForFile.replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`reporte_${safeEventName}.pdf`);
      console.log('PDF save initiated.');

      this.loadingService.hide();

    } catch (error) {
      console.error("Error during PDF generation process:", error);
      this.error = "Error generating PDF. Check console for details.";
      this.loadingService.hide();
    }
  }

  // Añadir handleError si no existe o ajustar el existente
  handleError(message: string): void {
    this.error = message; // Asignar a la propiedad de error del componente
    // Opcional: mostrar un toast/alerta visual
    console.error('PDF Generation/Translation Error:', message);
  }
} 