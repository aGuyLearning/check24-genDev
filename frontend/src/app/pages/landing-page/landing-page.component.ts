import { Component } from '@angular/core';
import { TeamSelectionComponent } from '../../shared_components/team-selection/team-selection.component';
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [TeamSelectionComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

}
