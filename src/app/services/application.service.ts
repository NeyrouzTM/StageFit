import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application } from '../model/application';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private apiUrl = 'http://localhost:3001/applications';

  constructor(private http: HttpClient) {}

  getByStage(stageRef: number): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}?stageRef=${stageRef}`);
  }

  create(app: Application): Observable<Application> {
    return this.http.post<Application>(this.apiUrl, app);
  }
}
