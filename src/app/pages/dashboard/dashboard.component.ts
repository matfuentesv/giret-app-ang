// src/app/pages/dashboard/dashboard.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CognitoService } from '../../auth/cognito.service';
import { Subscription, finalize, forkJoin } from 'rxjs'; // Import forkJoin
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

  loansDue: LoanDue[] = [];
  private loansDueSubscription: Subscription | undefined;

  isLoading: boolean = true; // Initialize to true

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
    'mantenimiento': { backgroundColor: 'rgba(108, 117, 125, 0.7)', borderColor: 'rgba(108, 117, 125, 1)' },
    'bodega': { backgroundColor: 'rgba(0, 123, 255, 0.7)', borderColor: 'rgba(0, 123, 255, 1)' },
  };


  constructor(
    private cognitoService: CognitoService,
    private dashboardService: DashboardService
  ) {
    Chart.register(PieController, ArcElement, Tooltip, Legend);
  }

  ngOnInit(): void {
    this.isLoading = true; // Set to true at the beginning of ngOnInit
    this.userAttributesSubscription = this.cognitoService.getUserAttributes().subscribe(
      attributes => {
        this.userEmail = attributes ? attributes['email'] : null;
      },
      error => {
        console.error('Error al obtener atributos del usuario en DashboardComponent:', error);
        this.userEmail = null;
      }
    );


    forkJoin([
      this.dashboardService.getDashboardData(),
      this.dashboardService.getCountByEstadoConPorcentaje(),
      this.dashboardService.getLoansDue()
      ]).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: ([dashboardData, estadoCounts, loansDue]) => {
        this.dashboardData = dashboardData;
        this.estadoCounts = estadoCounts;
        this.loansDue = loansDue;
        this.prepareChartData();
        console.log('Todos los datos del dashboard cargados exitosamente.');
      },
      error: (error) => {
        console.error('Error al cargar uno o más datos del dashboard:', error);
        window.alert('Ocurrió un error al cargar algunos datos del dashboard. Revisa la consola para más detalles.');
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy(): void {
    if (this.userAttributesSubscription) {
      this.userAttributesSubscription.unsubscribe();
    }
    // Subscriptions created with forkJoin are typically managed by forkJoin itself,
    // but if you have other individual subscriptions, keep their unsubscriptions.
    if (this.dashboardDataSubscription) { // These might not be needed if using forkJoin exclusively for data loading
      this.dashboardDataSubscription.unsubscribe();
    }
    if (this.estadoCountsSubscription) {
      this.estadoCountsSubscription.unsubscribe();
    }
    if (this.loansDueSubscription) {
      this.loansDueSubscription.unsubscribe();
    }
  }

  // loadDashboardData, loadEstadoCounts, loadLoansDue methods can be removed
  // or adapted if you still want to load them individually for other reasons,
  // but for the loading spinner, forkJoin is more efficient.
  loadDashboardData(): void {
    // This method is now handled by forkJoin in ngOnInit
  }

  loadEstadoCounts(): void {
    // This method is now handled by forkJoin in ngOnInit
  }

  loadLoansDue(): void {
    // This method is now handled by forkJoin in ngOnInit
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