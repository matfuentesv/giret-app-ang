// src/app/pages/dashboard/dashboard.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CognitoService } from '../../auth/cognito.service';
import { Subscription } from 'rxjs';
import { DashboardService, DashboardData, EstadoCount, LoanDue } from '../../services/dashboard.service';

// Importaciones específicas para ng2-charts
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartOptions, ChartData, ArcElement, Tooltip, Legend, PieController } from 'chart.js';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
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

  loansDue: LoanDue[] = []; // Asegúrate de que esta propiedad esté declarada e inicializada
  private loansDueSubscription: Subscription | undefined;

  // --- Propiedades para el gráfico de pastel (Chart.js con ng2-charts) ---
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

  // Define un mapeo de estados a colores
  private estadoColorMap: { [key: string]: { backgroundColor: string, borderColor: string } } = {
    'eliminado': { backgroundColor: 'rgba(220, 53, 69, 0.7)', borderColor: 'rgba(220, 53, 69, 1)' },
    'asignado': { backgroundColor: 'rgba(40, 167, 69, 0.7)', borderColor: 'rgba(40, 167, 69, 1)' },
    'prestado': { backgroundColor: 'rgba(255, 193, 7, 0.7)', borderColor: 'rgba(255, 193, 7, 1)' },
    'enMantenimiento': { backgroundColor: 'rgba(108, 117, 125, 0.7)', borderColor: 'rgba(108, 117, 125, 1)' },
    'enBodega': { backgroundColor: 'rgba(0, 123, 255, 0.7)', borderColor: 'rgba(0, 123, 255, 1)' },
  };


  constructor(
    private cognitoService: CognitoService,
    private dashboardService: DashboardService
  ) {
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
    this.loadLoansDue(); // Asegúrate de llamar a este método
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
    if (this.loansDueSubscription) { // ¡Importante desuscribirse!
      this.loansDueSubscription.unsubscribe();
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

  loadLoansDue(): void {
    console.log('Cargando préstamos por vencer...');
    this.loansDueSubscription = this.dashboardService.getLoansDue().subscribe({
      next: (data: LoanDue[]) => {
        this.loansDue = data; // Asegúrate de asignar los datos aquí
        console.log('Préstamos por vencer cargados:', this.loansDue);
      },
      error: (error) => {
        console.error('Error al cargar los préstamos por vencer:', error);
        alert('No se pudieron cargar los préstamos por vencer. Revisa la consola para más detalles.');
      }
    });
  }

  private prepareChartData(): void {
    if (this.estadoCounts && this.estadoCounts.length > 0) {
      this.pieChartData.labels = this.estadoCounts.map(item => item.estado.charAt(0).toUpperCase() + item.estado.slice(1));

      const backgroundColors: string[] = [];
      const borderColors: string[] = [];

      this.estadoCounts.forEach(item => {
        const normalizedEstado = item.estado.toLowerCase();
        const colors = this.estadoColorMap[normalizedEstado];

        if (colors) {
          backgroundColors.push(colors.backgroundColor);
          borderColors.push(colors.borderColor);
        } else {
          console.warn(`Color no definido para el estado: ${item.estado}. Usando color por defecto.`);
          backgroundColors.push('rgba(200, 200, 200, 0.7)');
          borderColors.push('rgba(200, 200, 200, 1)');
        }
      });

      this.pieChartData.datasets[0].data = this.estadoCounts.map(item => item.cantidad);
      this.pieChartData.datasets[0].backgroundColor = backgroundColors;
      this.pieChartData.datasets[0].borderColor = borderColors;
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

  formatDate(dateString: string): string {
    if (!dateString) return '';

    // Dividir la cadena 'YYYY-MM-DD' en sus componentes
    const parts = dateString.split('-'); // Ejemplo: "2025-06-29" -> ["2025", "06", "29"]
    const year = parseInt(parts[0]);
    
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    const date = new Date(year, month, day);

    // Formatear la fecha a 'DD/MM/YYYY'
    const formattedDay = date.getDate().toString().padStart(2, '0');
    const formattedMonth = (date.getMonth() + 1).toString().padStart(2, '0'); // Volver a sumar 1 para el mes
    const formattedYear = date.getFullYear();

    return `${formattedDay}/${formattedMonth}/${formattedYear}`;
  }
}