import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DataService } from '../../services/data/data.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-team-selection',
  standalone: true,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    provideNativeDateAdapter(),
  ],
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    FormsModule,
    MatCardModule,
    MatDatepickerModule,
    AsyncPipe,
    NgSelectModule,
    MatChipsModule,
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './team-selection.component.html',
  styleUrl: './team-selection.component.css',
})
export class TeamSelectionComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [];
  readonly DEFAULT_START_DATE = '2023-07-28';
  readonly DEFAULT_END_DATE = '2025-06-01';
  @Input() start_date: string | null = null;
  @Input() end_date: string | null = null;
  @Input() selectedTeams: string[] = [];
  @Input() selectedTournaments: string[] = [];
  @Input() all_selected = false;

  options: { [key: string]: string } = {};
  teamControl = new FormControl();
  selectedOptions: string[] = [];
  filteredOptions: string[] = [];

  showFilters: boolean = false; // Track if the filters form is visible
  filterForm: FormGroup = new FormGroup({}); // Form group for filters

  @ViewChild('teamInput')
  teamInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (this.all_selected) {
      this.selectedOptions.push('Alle Spiele');
    }
    for (const team of this.selectedTeams) {
      this.selectedOptions.push(team);
    }
    for (const tournament of this.selectedTournaments) {
      this.selectedOptions.push(tournament);
    }
    // Initialize the filter form
    this.filterForm = this.fb.group({
      start_date: new FormControl<Date | null>(
        this.start_date ? new Date(this.start_date) : null
      ),
      end_date: new FormControl<Date | null>(
        this.end_date ? new Date(this.end_date) : null
      ),
    });

    // Preload teams from the API
    const teams: string[] = await firstValueFrom(
      this.dataService.getAllTeams()
    );
    for (const team of teams) {
      this.options[team] = 'team';
    }
    const tournaments: string[] = await firstValueFrom(
      this.dataService.getAllTurnaments()
    );
    for (const tournament of tournaments) {
      this.options[tournament] = 'tournament';
    }

    this.options['Alle Spiele'] = 'special';

    this.filteredOptions = this._filterOptions('');

    this.teamControl.valueChanges.subscribe((input) => {
      this.filteredOptions = this._filterOptions(input);
    });
  }

  /**
   * Filters the list of options based on the user's input and selected options.
   *
   * - Excludes options that have already been selected or are named 'Alle Spiele'.
   * - Returns empty list if `this.all_selected` is true.
   * - If no input is provided (`value` is empty), returns the first 10 sorted options.
   * - If input is provided, filters options that include the input string (case-insensitive).
   * - Optionally appends 'Alle Spiele' to the results if `this.all_selected` is false.
   *
   * @param value - The search input provided by the user.
   * @returns A list of up to 10 matching options, sorted alphabetically. Includes 'Alle Spiele' if `this.all_selected` is false.
   */
  private _filterOptions(value: string): string[] {
    if (this.all_selected) {
      return [];
    }
    const remainingOptions = Object.keys(this.options)
      .filter(
        (option) =>
          !this.selectedOptions.includes(option) && option !== 'Alle Spiele'
      )
      .sort();

    const filteredOptions = value
      ? remainingOptions.filter((option) =>
          option.toLowerCase().includes(value.toLowerCase())
        )
      : remainingOptions;

    const result = filteredOptions.slice(0, 10);

    return !this.all_selected ? result.concat(['Alle Spiele']) : result;
  }

  /**
   * Removes an option from the selected options list and updates the filtered options.
   *
   * @param {string} option - The option to be removed.
   */
  removeOption(option: string) {
    if (option === 'Alle Spiele') {
      this.all_selected = false;
    }
    const index = this.selectedOptions.indexOf(option);

    if (index >= 0) {
      this.selectedOptions.splice(index, 1);
    }

    this.filteredOptions = this._filterOptions(this.teamControl.value);
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (
      this.selectedOptions.includes(event.option.viewValue) ||
      this.all_selected
    ) {
      return;
    } else if (event.option.viewValue === 'Alle Spiele') {
      this.all_selected = true;
    }

    this.selectedOptions.push(event.option.viewValue);

    this.teamInput.nativeElement.value = '';
    this.teamControl.setValue(null);

    event.option.deselect();
  }

  // Redirect to the streaming packages page with selected teams
  redirectToPackages() {
    const teams = this.selectedOptions
      .filter((option) => {
        return this.options[option] === 'team';
      })
      .join(',');

    const tournaments = this.selectedOptions
      .filter((option) => {
        return this.options[option] === 'tournament';
      })
      .join(',');

    const params: any = {};
    if (this.all_selected) {
      params['all'] = true;
    } else {
      if (teams) {
        params['teams'] = teams;
      }
      if (tournaments) {
        params['tournaments'] = tournaments;
      }
    }
    // Add start date with time zone offset or default value
    params['start'] = this.getFormattedDate(
      this.filterForm.value.start_date,
      this.DEFAULT_START_DATE
    );
    
    // Add end date with time zone offset or default value
    params['end'] = this.getFormattedDate(
      this.filterForm.value.end_date,
      this.DEFAULT_END_DATE
    );

    this.router.navigate(['/streaming-packages'], {
      queryParams: params,
    });
  }
  /**
   * Formats a date value with a time zone offset or returns a default value if the date is not provided.
   *
   * @param {string | null} date - The input date value from the filter form.
   * @param {string} defaultValue - The default date value to use if the input date is not provided.
   * @returns {string} - The formatted date string (YYYY-MM-DD).
   */
  private getFormattedDate(date: string | null, defaultValue: string): string {
    if (date) {
      const adjustedDate = new Date(date);
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      return adjustedDate.toISOString().split('T')[0];
    }
    return defaultValue;
  }
}
