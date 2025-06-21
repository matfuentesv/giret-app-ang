import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FooterComponent} from './shared/footer/footer.component';
import {HeaderComponent} from './shared/header/header.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,FooterComponent,SidebarComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'giret-app-ang';
   constructor(public router: Router) {}
}
