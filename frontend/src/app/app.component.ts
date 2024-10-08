import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DataService } from './services/data/data.service';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    MatToolbarModule, 
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatAutocompleteModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  teams: string[] = [];
  teamControl = new FormControl();
  filteredTeams: string[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    // Preload teams from the API
    this.dataService.getAllTeams().subscribe((data: string[]) => {
      this.teams = data;
      this.filteredTeams = this.teams;
    });

    // Filter teams as the user types
    this.teamControl.valueChanges.subscribe((input) => {
      this.filteredTeams = this._filterTeams(input);
      console.log(this.filteredTeams);
    });
  }

  private _filterTeams(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.teams.filter(team => team.toLowerCase().includes(filterValue));
  }
}

