import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DataService } from '../../../services/data/data.service';
import { GameInfo } from '../../../models/data_interfaces';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-uncovered-games-dialog',
  standalone: true,
  imports: [MatPaginatorModule, MatDialogModule, MatTooltipModule, MatCardModule, MatButtonModule],
  templateUrl: './uncovered-games-dialog.component.html',
  styleUrl: './uncovered-games-dialog.component.css'
})
export class UncoveredGamesDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<UncoveredGamesDialogComponent>);
  readonly data = inject<{ uncoveredGames: number[] }>(MAT_DIALOG_DATA);

  pageSizes: number[] = [5,10,25]
  uncoveredGames = this.data.uncoveredGames;
  paginatedGames: GameInfo[] = [];

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.getPaginatorData({pageIndex: 0, pageSize: 5});
  }

  async getPaginatorData(event: any) {
    const start = event.pageIndex * event.pageSize;
    let end = start + event.pageSize;

    // check that end is not greater than the number of games
    if (end > this.uncoveredGames.length) {
      end = this.uncoveredGames.length;
    }

    const gameIds = this.uncoveredGames.slice(start, end);
    this.paginatedGames = await firstValueFrom(this.dataService.getGameInfo(gameIds));
  }
}
