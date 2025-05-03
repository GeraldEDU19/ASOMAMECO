import { Component, OnInit, OnDestroy } from '@angular/core';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CanvasJSAngularChartsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  // Gráfico en tiempo real
  dataPoints: any[] = [];
  timeout: any = null;
  xValue: number = 1;
  yValue: number = 10;
  newDataCount: number = 10;
  chart: any;

  // Opciones para todos los gráficos
  realTimeChartOptions = {
    theme: "light2",
    title: {
      text: "Gráfico en Tiempo Real"
    },
    axisX: {
      title: "Tiempo",
      crosshair: {
        enabled: true,
        snapToDataPoint: true
      }
    },
    axisY: {
      title: "Valores",
      minimum: 0,
      maximum: 100
    },
    data: [{
      type: "line",
      dataPoints: this.dataPoints
    }]
  }

  lineChartOptions = {
    theme: "light2",
    title: {
      text: "Gráfico de Líneas"
    },
    data: [{
      type: "line",
      dataPoints: [
        { x: 1, y: 10 },
        { x: 2, y: 15 },
        { x: 3, y: 20 },
        { x: 4, y: 25 }
      ]
    }]
  }

  columnChartOptions = {
    theme: "light2",
    title: {
      text: "Gráfico de Columnas"
    },
    data: [{
      type: "column",
      dataPoints: [
        { label: "Enero", y: 10 },
        { label: "Febrero", y: 15 },
        { label: "Marzo", y: 20 },
        { label: "Abril", y: 25 }
      ]
    }]
  }

  pieChartOptions = {
    theme: "light2",
    title: {
      text: "Gráfico Circular"
    },
    data: [{
      type: "pie",
      dataPoints: [
        { y: 30, label: "Categoría 1" },
        { y: 20, label: "Categoría 2" },
        { y: 50, label: "Categoría 3" }
      ]
    }]
  }

  barChartOptions = {
    theme: "light2",
    title: {
      text: "Gráfico de Barras"
    },
    data: [{
      type: "bar",
      dataPoints: [
        { label: "A", y: 10 },
        { label: "B", y: 15 },
        { label: "C", y: 20 },
        { label: "D", y: 25 }
      ]
    }]
  }

  getChartInstance(chart: object) {
    this.chart = chart;
    this.updateData();
  }

  ngOnInit() {
    // Inicializar con algunos datos para el gráfico en tiempo real
    for (let i = 0; i < 10; i++) {
      this.dataPoints.push({ x: i + 1, y: Math.floor(Math.random() * 100) });
    }
  }

  ngOnDestroy() {
    clearTimeout(this.timeout);
  }

  updateData() {
    // Simular datos en tiempo real
    this.dataPoints.shift(); // Eliminar el punto más antiguo
    this.xValue++;
    this.yValue = Math.floor(Math.random() * 100);
    this.dataPoints.push({ x: this.xValue, y: this.yValue });
    
    if (this.chart) {
      this.chart.render();
    }
    
    this.timeout = setTimeout(() => this.updateData(), 1000);
  }
}
