import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import {API_URL} from '../../../../env';
import { StreamingPackageOverview } from '../../models/data_interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {

  }

  getAllTeams(): Observable<string[]> {
    return this.http.get<string[]>(`${API_URL}/team_names`);
  }

  getAllTurnaments(): Observable<string[]> {
    return this.http.get<string[]>(`${API_URL}/tournaments`);
  }

  get_tournament_coverage(): Observable<any> {
    return this.http.get(`${API_URL}/get_tournament_coverage`);
  }

  getStreamingPackagesForTeamAndTournaments(teams: string[], tournaments: string[],start_date?: string): Observable<StreamingPackageOverview> {
    let params: any = { teams: teams, tournaments: tournaments };
    if (start_date) {
      console.log('start_date', start_date);
      params.start_date = start_date;
    }
    return this.http.get<StreamingPackageOverview>(`${API_URL}/get_streaming_packages_for_team_and_tournament`, { params });
  }

  getStreamingPackagesForAllGames(): Observable<StreamingPackageOverview> {
    return this.http.get<StreamingPackageOverview>(`${API_URL}/get_streaming_packages_for_all_games`);
  }

  getGameInfo(game_ids: number[]): Observable<any> {
    return this.http.get(`${API_URL}/get_game_info`, {params: {game_id: game_ids}});
  }
}
