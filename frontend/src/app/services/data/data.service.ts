import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';
import {API_URL} from '../../../../env';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {

  }

  get(): Observable<any> {
    return this.http.get<any>(`${API_URL}/team_names`);
  }

  getAllTeams(): Observable<any> {
    return this.http.get<any>(`${API_URL}/team_names`);
  }
}
