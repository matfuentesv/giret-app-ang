import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CognitoService } from '../../auth/cognito.service';
import { Subscription } from 'rxjs';
import { DashboardService, DashboardData, EstadoCount } from '../../services/dashboard.service';

// Importaciones específicas para ng2-charts
import { BaseChartDirective } from 'ng2-charts';
// Importa los componentes de Chart.js que necesitas
import { Chart, ChartOptions, ChartData, ArcElement, Tooltip, Legend, PieController } from 'chart.js';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  userEmail: string | null = null;
  private userAttributesSubscription: Subscription | undefined;

  dashboardData: DashboardData | null = null;
  private dashboardDataSubscription: Subscription | undefined;

  estadoCounts: EstadoCount[] = [];
  private estadoCountsSubscription: Subscription | undefined;

  public pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1
    }]
  };

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const porcentaje = this.estadoCounts[tooltipItem.dataIndex]?.porcentaje || 0;
            return `${tooltipItem.label}: ${tooltipItem.raw} (${porcentaje.toFixed(1)}%)`;
          }
        }
      }
    }
  };

  public pieChartType: 'pie' = 'pie';
  public pieChartLegend = true;

  constructor(
    private cognitoService: CognitoService,
    private dashboardService: DashboardService
  ) {
    // ¡NUEVO CÓDIGO AQUÍ!
    // Registra los componentes necesarios de Chart.js
    Chart.register(PieController, ArcElement, Tooltip, Legend);
  }

  ngOnInit(): void {
    this.userAttributesSubscription = this.cognitoService.getUserAttributes().subscribe(
      attributes => {
        this.userEmail = attributes ? attributes['email'] : null;
      },
      error => {
        console.error('Error al obtener atributos del usuario en DashboardComponent:', error);
        this.userEmail = null;
      }
    );

    this.loadDashboardData();
    this.loadEstadoCounts();
  }

  ngOnDestroy(): void {
    if (this.userAttributesSubscription) {
      this.userAttributesSubscription.unsubscribe();
    }
    if (this.dashboardDataSubscription) {
      this.dashboardDataSubscription.unsubscribe();
    }
    if (this.estadoCountsSubscription) {
      this.estadoCountsSubscription.unsubscribe();
    }
  }

  loadDashboardData(): void {
    console.log('Cargando datos principales del dashboard...');
    this.dashboardDataSubscription = this.dashboardService.getDashboardData().subscribe({
      next: (data: DashboardData) => {
        this.dashboardData = data;
        console.log('Datos principales del dashboard cargados:', this.dashboardData);
      },
      error: (error) => {
        console.error('Error al cargar los datos principales del dashboard:', error);
        alert('No se pudieron cargar los datos principales del dashboard. Revisa la consola para más detalles.');
      }
    });
  }

  loadEstadoCounts(): void {
    console.log('Cargando conteo por estado...');
    this.estadoCountsSubscription = this.dashboardService.getCountByEstadoConPorcentaje().subscribe({
      next: (data: EstadoCount[]) => {
        this.estadoCounts = data;
        console.log('Conteo por estado cargado:', this.estadoCounts);
        this.prepareChartData();
      },
      error: (error) => {
        console.error('Error al cargar el conteo por estado:', error);
        alert('No se pudo cargar el conteo de recursos por estado. Revisa la consola para más detalles.');
      }
    });
  }

  private prepareChartData(): void {
    if (this.estadoCounts && this.estadoCounts.length > 0) {
      this.pieChartData.labels = this.estadoCounts.map(item => item.estado.charAt(0).toUpperCase() + item.estado.slice(1));

      this.pieChartData.datasets[0].data = this.estadoCounts.map(item => item.cantidad);
      this.pieChartData.datasets[0].backgroundColor = [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)'
      ];
      this.pieChartData.datasets[0].borderColor = [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
      ];
      this.pieChartData.datasets[0].borderWidth = 1;

    } else {
      this.pieChartData = {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1
        }]
      };
    }
  }
}