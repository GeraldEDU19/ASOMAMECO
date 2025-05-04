import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService, EventReportData } from '../../../services/event.service';
import { LoadingService } from '../../../services/loading.service';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { Event } from '../../../models/event.model';
import { Subscription } from 'rxjs';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-events-report',
  standalone: true,
  imports: [CommonModule, FormsModule, CanvasJSAngularChartsModule],
  templateUrl: './events-report.component.html',
  styleUrls: ['./events-report.component.css']
})
export class EventsReportComponent implements OnInit, OnDestroy {
  event: Event | null = null;
  report: EventReportData | null = null;
  error: string | null = null;
  chart: any;
  currentDate: string;
  loading: boolean = true;
  private loadingSub?: Subscription;

  pieChartOptions = {
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
      dataPoints: [
        { y: 0, name: "Confirmados" },
        { y: 0, name: "No Confirmados" },
        { y: 0, name: "Asistieron" },
        { y: 0, name: "Confirmados pero no asistieron" }
      ]
    }]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private loadingService: LoadingService
  ) {
    // Obtener la fecha actual en UTC y formatearla a la zona horaria local
    const now = new Date();
    this.currentDate = now.toLocaleString('es-ES', {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  ngOnInit() {
    this.loadingSub = this.loadingService.loading$.subscribe(
      val => this.loading = val
    );
    this.loadEvent();
  }

  ngOnDestroy() {
    this.loadingSub?.unsubscribe();
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

    // Cargar información del evento
    this.eventService.getEvent(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          if (Array.isArray(response.data) && response.data.length > 0) {
            this.event = response.data[0] as unknown as Event;
            // Una vez que tenemos el evento, cargamos el reporte
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
      next: (response: any) => {
        if (response.success && response.data) {
          this.report = response.data;
          this.updateChartData();
        } else {
          console.error('Invalid report response:', response);
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
    if (!this.report) return;

    const dataPoints = [
      { y: this.report.confirmed, name: "Confirmados" },
      { y: this.report.notConfirmed, name: "No Confirmados" },
      { y: this.report.attended, name: "Asistieron" },
      { y: this.report.confirmedButDidNotAttend, name: "Confirmados pero no asistieron" }
    ];

    this.pieChartOptions.data[0].dataPoints = dataPoints;

    if (this.chart) {
      this.chart.render();
    }
  }

  onBack() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/events/view', id]);
    } else {
      this.router.navigate(['/events']);
    }
  }

  async onPrint() {
    try {
      this.loadingService.show();
      
      // Obtener el elemento a imprimir
      const element = document.querySelector('.card');
      if (!element) {
        throw new Error('No se encontró el elemento a imprimir');
      }

      // Convertir el chart a imagen
      if (this.chart) {
        try {
          const chartContainer = document.querySelector('.chart-container');
          if (chartContainer) {
            // Obtener la imagen del chart
            const chartImage = this.chart.chart.canvas.toDataURL('image/png');
            
            // Crear una imagen temporal
            const img = document.createElement('img');
            img.src = chartImage;
            img.style.width = '100%';
            img.style.height = '300px';
            
            // Reemplazar el chart con la imagen
            const canvasElement = chartContainer.querySelector('canvas');
            if (canvasElement) {
              canvasElement.style.display = 'none';
              chartContainer.appendChild(img);
            }
          }
        } catch (chartError) {
          console.error('Error al procesar el chart:', chartError);
          // Continuar con la generación del PDF incluso si falla el procesamiento del chart
        }
      }

      // Configuración del PDF
      const opt = {
        margin: 1,
        filename: `reporte-${this.event?.name}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait'
        }
      };

      // Generar y descargar el PDF
      const worker = html2pdf().set(opt).from(element);
      await worker.save();

      // Restaurar el chart original
      if (this.chart) {
        try {
          const chartContainer = document.querySelector('.chart-container');
          if (chartContainer) {
            const canvasElement = chartContainer.querySelector('canvas');
            const imgElement = chartContainer.querySelector('img');
            if (canvasElement && imgElement) {
              canvasElement.style.display = 'block';
              imgElement.remove();
            }
          }
        } catch (restoreError) {
          console.error('Error al restaurar el chart:', restoreError);
        }
      }
    } catch (error) {
      console.error('Error detallado al generar el PDF:', error);
      this.error = 'Error al generar el reporte PDF. Por favor, intente nuevamente.';
    } finally {
      this.loadingService.hide();
    }
  }
} 