import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {NgModule} from '@angular/core';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { PrestamosComponent } from './pages/prestamos/prestamos.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DetallesPrestamoComponent } from './pages/detalles-prestamo/detalles-prestamo.component';
import {AuthGuard} from './auth/auth.guard';


export const routes: Routes = [
  { path: '',  redirectTo: 'home', pathMatch: 'full'},
  { path:'home',component: HomeComponent},
  { path:'inventario',component: InventarioComponent,canActivate: [AuthGuard]},
  { path:'prestamo',component: PrestamosComponent,canActivate: [AuthGuard]},
  { path:'detalle',component: DetallesPrestamoComponent,canActivate: [AuthGuard]},
  { path:'reporte',component: ReportesComponent,canActivate: [AuthGuard]},
  { path:'dashboard',component: DashboardComponent,canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
