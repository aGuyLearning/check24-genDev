import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet, RouterLink } from '@angular/router';
import { DataService } from '../../services/data/data.service';
import {
  SelectedStreamingPackageInfo,
  StreamingPackageInfo,
  StreamingPackageOverview,
  GameInfo,
  IcalEvent,
} from '../../models/data_interfaces';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, JsonPipe, KeyValuePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { TeamSelectionComponent } from '../../shared_components/team-selection/team-selection.component';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { createEvent } from '../../services/ical/ical.service';
import { firstValueFrom, forkJoin, map, take } from 'rxjs';
import { PackageDialogComponent } from './package-dialog/package-dialog.component';
import { UncoveredGamesDialogComponent } from './uncovered-games-dialog/uncovered-games-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-streaming-packages',
  standalone: true,
  imports: [
    RouterOutlet,
    MatIconModule,
    KeyValuePipe,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    JsonPipe,
    TeamSelectionComponent,
    MatButtonModule,
    RouterLink,
    MatPaginatorModule,
    MatTooltipModule,
    CommonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './streaming-packages.component.html',
  styleUrl: './streaming-packages.component.css',
})
export class StreamingPackagesComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  streamingPackages: { [key: string]: StreamingPackageInfo } = {};
  selectedPackages: { [key: string]: SelectedStreamingPackageInfo[] } = {};
  sortedPackages: string[] = [];
  pageSizes: number[] = [5, 10, 25];
  tournamentPagination: { [key: string]: GameInfo[] } = {};
  totalCost: number = 0;
  uncovered_games: number[] = [];
  selectedTeams: string[] = [];
  selectedTournaments: string[] = [];
  competition_to_games: { [key: string]: number[] } = {};
  tournament_foldout: { [key: string]: boolean } = {};
  icalFileName: string = 'games.ics';
  start_date: string = '';
  end_date: string = '';
  all_selected: boolean = false;
  loading: boolean = false;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute
  ) {}

  /**
   * Initializes the component by processing query parameters and fetching streaming packages.
   * Subscribes to query parameter changes, extracts values, and loads the necessary data.
   *
   * @returns {Promise<void>}
   */
  async ngOnInit(): Promise<void> {
    // Subscribe to query parameters and process them
    this.route.queryParams.subscribe(async (params) => {
      this.processQueryParams(params); // Process query parameters

      // Fetch streaming packages based on the query parameters
      await this.getStreamingPackages();

      // Initialize paginator data for each tournament
      this.initializePaginatorData();
    });
  }

  async getStreamingPackages(): Promise<void> {
    try {
      // Wait for the response using firstValueFrom
      this.loading = true;
      const streamingPackageOverview: StreamingPackageOverview =
        await firstValueFrom(
          this.all_selected
            ? this.dataService.getStreamingPackagesForAllGames()
            : this.dataService.getStreamingPackagesForTeamAndTournaments(
                this.selectedTeams,
                this.selectedTournaments,
                this.start_date,
                this.end_date
              )
        );

      // Handle the response data
      this.streamingPackages = streamingPackageOverview['packages'];
      this.competition_to_games =
        streamingPackageOverview['competition_to_games'];

      // Initialize foldout for each tournament
      for (let key in this.streamingPackages) {
        this.tournament_foldout[key] = false;
      }

      this.selectedPackages = streamingPackageOverview['selected_packages'];
      this.totalCost = streamingPackageOverview['total_cost'];
      this.uncovered_games = streamingPackageOverview['uncovered_games'];

      // Sort streaming packages, so that the selected packages are at the top
      const selectedPackages = Object.keys(this.selectedPackages);
      const unselectedPackages = Object.keys(this.streamingPackages).filter(
        (x) => !selectedPackages.includes(x)
      );
      // sort packages by the number of games covered
      selectedPackages.sort(
        (a, b) =>
          this.streamingPackages[b].covered_games.length -
          this.streamingPackages[a].covered_games.length
      );
      unselectedPackages.sort(
        (a, b) =>
          this.streamingPackages[b].covered_games.length -
          this.streamingPackages[a].covered_games.length
      );
      this.sortedPackages = selectedPackages.concat(unselectedPackages);
      this.loading = false;
    } catch (error) {
      this.loading = false;
      console.error('Error fetching streaming packages', error);
    }
  }

  openPackageDetailsDialog(packageName: string): void {
    const dialogRef = this.dialog.open(PackageDialogComponent, {
      height: '500px',
      width: '400px',
      data: {
        packageName: packageName,
        packageInfo: this.streamingPackages[packageName],
      },
    });
  }

  openUncoveredGamesDialog(): void {
    const dialogRef = this.dialog.open(UncoveredGamesDialogComponent, {
      height: '500px',
      width: '400px',
      data: {
        uncoveredGames: this.uncovered_games,
      },
    });
  }

  downloadIcal(): void {
    const events: IcalEvent[] = [];
    const observables = [];
    let icalData = '';
    for (let key in this.selectedPackages) {
      for (let i = 0; i < this.selectedPackages[key].length; i++) {
        const games = this.selectedPackages[key][i].games;
        observables.push(
          this.dataService.getGameInfo(games).pipe(
            map((data: GameInfo[]) =>
              data.map((game) => ({
                start: new Date(game.starts_at),
                end: new Date(game.starts_at),
                title: `${game.team_home} vs ${game.team_away}`,
                description: `Spiel in der ${game.tournament_name}. Abgedeckt durch das ${key} Abo`,
              }))
            )
          )
        );
      }
      // create event for each timeframe
      const timeframes = this.selectedPackages[key];
      for (let i = 0; i < timeframes.length; i++) {
        events.push({
          start: new Date(timeframes[i].start_time),
          end: new Date(timeframes[i].end_time),
          title: `${key} Abo`,
          description: 'Abozeitraum für das Streamingpaket',
        });
      }
    }

    // Wait for all observables to complete
    forkJoin(observables).subscribe((results) => {
      results.forEach((eventArray) => events.push(...eventArray));

      // At this point, all events are ready, and you can proceed
      icalData = createEvent(events);
      const element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(icalData)
      );
      element.setAttribute('download', this.icalFileName);
      element.setAttribute('target', '_blank');
      element.style.display = 'none';
      element.click();
    });
  }

  // UTILITY FUNCTIONS

  toggleTournamentFoldout(tournament: string): void {
    this.tournament_foldout[tournament] = !this.tournament_foldout[tournament];
  }

  selectedPackagePrice(packageName: string): number {
    if (packageName in this.selectedPackages) {
      if (this.streamingPackages[packageName].has_monthly_price) {
        return (
          this.streamingPackages[packageName].monthly_price_cents *
          this.selectedPackages[packageName].length
        );
      }
      return (
        this.streamingPackages[packageName]
          .monthly_price_yearly_subscription_in_cents *
        this.selectedPackages[packageName].length *
        12
      );
    }
    return 0;
  }

  totalCoveredGames(): number {
    // use set to remove duplicates
    const coveredGames = new Set();
    for (let key in this.selectedPackages) {
      for (let i = 0; i < this.selectedPackages[key].length; i++) {
        for (let j = 0; j < this.selectedPackages[key][i].games.length; j++) {
          coveredGames.add(this.selectedPackages[key][i].games[j]);
        }
      }
    }
    return coveredGames.size;
  }

  coveredGamesPercentage(): number {
    const totalGames = this.uncovered_games.length + this.totalCoveredGames();
    if (totalGames === 0) {
      return 0;
    }
    return (this.totalCoveredGames() / totalGames) * 100;
  }

  getPaginatorData(event: PageEvent, tournamentName: string): void {
    const start = event.pageIndex * event.pageSize;
    let end = start + event.pageSize;
    // check that end is not greater than the number of games
    if (end > this.competition_to_games[tournamentName].length) {
      end = this.competition_to_games[tournamentName].length;
    }
    const gameIds = this.competition_to_games[tournamentName].slice(start, end);

    this.dataService.getGameInfo(gameIds).subscribe((data) => {
      this.tournamentPagination[tournamentName] = data;
    });
  }

  /**
   * Processes query parameters and assigns values to the corresponding properties.
   *
   * @param {any} params - The query parameters from the route.
   */
  private processQueryParams(params: any): void {
    this.selectedTournaments = params['tournaments']?.split(',') || [];
    this.selectedTeams = params['teams']?.split(',') || [];
    this.start_date = params['start'] || '';
    this.end_date = params['end'] || '';
    this.all_selected = params['all'] === 'true' || false;
  }

  /**
   * Initializes paginator data for each tournament by setting default values.
   */
  private initializePaginatorData(): void {
    Object.keys(this.competition_to_games).forEach((tournamentName) => {
      const tournamentLength = this.competition_to_games[tournamentName].length;

      this.getPaginatorData(
        {
          pageIndex: 0,
          pageSize: 5,
          length: tournamentLength,
        } as PageEvent,
        tournamentName
      );
    });
  }
}
