import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Stage } from '../model/stage';

@Injectable({
  providedIn: 'root'
})
export class StageService {

  private apiUrl = 'http://localhost:3001/stages';
  private stageAddedSubject = new Subject<void>();
  public stageAdded$ = this.stageAddedSubject.asObservable();

  constructor(private http: HttpClient) {}

  getStages(): Observable<Stage[]> {
    return this.http.get<Stage[]>(this.apiUrl);
  }

  addStage(stage: Stage): Observable<Stage> {
    return this.http.post<Stage>(this.apiUrl, stage).pipe(
      tap(() => this.stageAddedSubject.next())
    );
  }
}
