import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {NgModule} from '@angular/core';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { PrestamosComponent } from './pages/prestamos/prestamos.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DetallesPrestamoComponent } from './pages/detalles-prestamo/detalles-prestamo.component';


export const routes: Routes = [
  { path: '',  redirectTo: 'home', pathMatch: 'full'},
  { path:'home',component: HomeComponent},
  { path:'inventario',component: InventarioComponent},
  { path:'prestamo',component: PrestamosComponent},
  { path:'detalle',component: DetallesPrestamoComponent},
  { path:'reporte',component: ReportesComponent},
  { path:'dashboard',component: DashboardComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
