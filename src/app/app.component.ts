import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProctorComponent } from './proctor/proctor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProctorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'TrainingManagementSystem';
}
