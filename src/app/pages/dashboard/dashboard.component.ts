import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CognitoService } from '../../auth/cognito.service';
import { Subscription, finalize, forkJoin } from 'rxjs'; 
import { DashboardService, DashboardData, EstadoCount, LoanDue } from '../../services/dashboard.service';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartOptions, ChartData, ArcElement, Tooltip, Legend, PieController } from 'chart.js';

/**
 * @fileoverview Este componente `DashboardComponent` muestra un panel de control
 * con información relevante sobre los recursos y préstamos. Incluye un gráfico de pastel
 * que visualiza la distribución de recursos por estado y una lista de préstamos próximos a vencer.
 * También gestiona el estado de carga y la obtención de datos del usuario.
 */
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

  /**
   * @description Almacena el email del usuario logueado, obtenido del `CognitoService`.
   * @type {string | null}
   */
  userEmail: string | null = null;

  /**
   * @description Suscripción a los atributos del usuario, utilizada para gestionar la desuscripción
   * y evitar fugas de memoria.
   * @type {Subscription | undefined}
   */
  private userAttributesSubscription: Subscription | undefined;

  /**
   * @description Almacena los datos generales del dashboard, como el total de recursos y préstamos.
   * @type {DashboardData | null}
   */
  dashboardData: DashboardData | null = null;

  /**
   * @description Suscripción a los datos generales del dashboard.
   * @type {Subscription | undefined}
   */
  private dashboardDataSubscription: Subscription | undefined;

  /**
   * @description Almacena el conteo de recursos por cada estado, junto con su porcentaje.
   * Utilizado para poblar el gráfico de pastel.
   * @type {EstadoCount[]}
   */
  estadoCounts: EstadoCount[] = [];

  /**
   * @description Suscripción a los conteos de recursos por estado.
   * @type {Subscription | undefined}
   */
  private estadoCountsSubscription: Subscription | undefined;

  /**
   * @description Almacena la lista de préstamos próximos a vencer.
   * @type {LoanDue[]}
   */
  loansDue: LoanDue[] = [];

  /**
   * @description Suscripción a la lista de préstamos próximos a vencer.
   * @type {Subscription | undefined}
   */
  private loansDueSubscription: Subscription | undefined;

  /**
   * @description Bandera que indica si los datos del dashboard están siendo cargados.
   * Utilizada para mostrar un indicador de carga en la interfaz de usuario.
   * @type {boolean}
   */
  isLoading: boolean = true; 

  /**
   * @description Configuración de los datos para el gráfico de pastel.
   * Incluye etiquetas (estados), valores (cantidades) y estilos de color.
   * @type {ChartData<'pie', number[], string>}
   */
  public pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1
    }]
  };

  /**
   * @description Opciones de configuración para el gráfico de pastel.
   * Define la responsividad, posición de la leyenda y callbacks para tooltips.
   * @type {ChartOptions<'pie'>}
   */
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

  /**
   * @description Tipo de gráfico, en este caso 'pie' (pastel).
   * @type {'pie'}
   */
  public pieChartType: 'pie' = 'pie';

  /**
   * @description Indica si la leyenda del gráfico de pastel debe ser visible.
   * @type {boolean}
   */
  public pieChartLegend = true;

  /**
   * @description Mapa de colores para los diferentes estados de los recursos en el gráfico de pastel.
   * Asocia cada estado con un color de fondo y un color de borde.
   * @private
   * @type {{ [key: string]: { backgroundColor: string, borderColor: string } }}
   */
  private estadoColorMap: { [key: string]: { backgroundColor: string, borderColor: string } } = {
    'eliminado': { backgroundColor: 'rgba(220, 53, 69, 0.7)', borderColor: 'rgba(220, 53, 69, 1)' },
    'asignado': { backgroundColor: 'rgba(40, 167, 69, 0.7)', borderColor: 'rgba(40, 167, 69, 1)' },
    'prestado': { backgroundColor: 'rgba(255, 193, 7, 0.7)', borderColor: 'rgba(255, 193, 7, 1)' },
    'mantenimiento': { backgroundColor: 'rgba(108, 117, 125, 0.7)', borderColor: 'rgba(108, 117, 125, 1)' },
    'bodega': { backgroundColor: 'rgba(0, 123, 255, 0.7)', borderColor: 'rgba(0, 123, 255, 1)' },
  };

  /**
   * @description Constructor del componente DashboardComponent.
   * Inyecta los servicios necesarios y registra los elementos de Chart.js.
   * @param {CognitoService} cognitoService - Servicio para obtener información del usuario.
   * @param {DashboardService} dashboardService - Servicio para obtener los datos del dashboard.
   */
  constructor(
    private cognitoService: CognitoService,
    private dashboardService: DashboardService
  ) {
    Chart.register(PieController, ArcElement, Tooltip, Legend);
  }

  /**
   * @description Hook del ciclo de vida de Angular que se ejecuta después de que el componente
   * haya sido inicializado.
   * Inicia la carga de todos los datos del dashboard (atributos de usuario, datos generales,
   * conteo por estado y préstamos próximos a vencer) de forma concurrente.
   * Gestiona el estado de carga y maneja posibles errores durante la obtención de datos.
   * @returns {void}
   */
  ngOnInit(): void {
    this.isLoading = true; 
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

  /**
   * @description Hook del ciclo de vida de Angular que se ejecuta justo antes de que el componente
   * sea destruido.
   * Desuscribe todas las suscripciones para evitar fugas de memoria.
   * @returns {void}
   */
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
    if (this.loansDueSubscription) {
      this.loansDueSubscription.unsubscribe();
    }
  }

  /**
   * @description Método auxiliar para cargar los datos generales del dashboard.
   * Actualmente, la lógica de carga principal se encuentra en `ngOnInit` usando `forkJoin`.
   * Este método podría ser extendido si se necesitara una recarga específica de solo estos datos.
   * @returns {void}
   */
  loadDashboardData(): void {
  }

  /**
   * @description Método auxiliar para cargar el conteo de recursos por estado.
   * Actualmente, la lógica de carga principal se encuentra en `ngOnInit` usando `forkJoin`.
   * Este método podría ser extendido si se necesitara una recarga específica de solo estos datos.
   * @returns {void}
   */
  loadEstadoCounts(): void {
  }

  /**
   * @description Método auxiliar para cargar los préstamos próximos a vencer.
   * Actualmente, la lógica de carga principal se encuentra en `ngOnInit` usando `forkJoin`.
   * Este método podría ser extendido si se necesitara una recarga específica de solo estos datos.
   * @returns {void}
   */
  loadLoansDue(): void {
  }

  /**
   * @description Prepara los datos para el gráfico de pastel (`pieChartData`)
   * basándose en la propiedad `estadoCounts`.
   * Asigna las etiquetas, los valores y los colores correspondientes a cada estado.
   * Si no hay datos de estado, el gráfico se inicializa vacío.
   * @private
   * @returns {void}
   */
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

  /**
   * @description Formatea una cadena de fecha de 'YYYY-MM-DD' a 'DD/MM/YYYY'.
   * @param {string} dateString - La cadena de fecha a formatear.
   * @returns {string} La fecha formateada o una cadena vacía si la entrada es nula o vacía.
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';

    const parts = dateString.split('-'); 
    const year = parseInt(parts[0]);

    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    const date = new Date(year, month, day);

    // Formatear la fecha a 'DD/MM/YYYY'
    const formattedDay = date.getDate().toString().padStart(2, '0');
    const formattedMonth = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const formattedYear = date.getFullYear();

    return `${formattedDay}/${formattedMonth}/${formattedYear}`;
  }
}