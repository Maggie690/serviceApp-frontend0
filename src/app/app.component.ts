import { Component, OnInit } from '@angular/core';
import { ServerService } from './service/server.service';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  startWith,
} from 'rxjs';
import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-response';
import { DataState } from './enum/data-state.enum';
import { Status } from './enum/status.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'sever_app';

  appState$: Observable<AppState<CustomResponse>>;
  readonly DataState = DataState; // to be used in .html
  readonly Status = Status;
  private filterSubject = new BehaviorSubject<string>('');
  filterStatus$ = this.filterSubject.asObservable();

  private dataSubject = new BehaviorSubject<CustomResponse>(null);

  constructor(private server: ServerService) {}

  ngOnInit(): void {
    this.appState$ = this.server.servers$.pipe(
      map((response) => {
        this.dataSubject.next(response); //1
        return { dataState: DataState.LOADED_STATE, appData: response };
      }),
      startWith({ dataState: DataState.LOADING_STATE }),
      catchError((error: string) => {
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }

  pingServer(ipAddress: string): void {
    this.filterSubject.next(ipAddress);

    this.appState$ = this.server.ping$(ipAddress).pipe(
      map((response) => {
        const index =  this.dataSubject.value.data.servers.findIndex((s) => s.id === response.data.server.id);
        this.dataSubject.value.data.servers[index] = response.data.server; //whatever index found seted to response data server
    
        this.filterSubject.next(''); //to stop showing the loading symbol

        return { dataState: DataState.LOADED_STATE, appData: response };
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value,
      }), //1.1
      catchError((error: string) => {
        this.filterSubject.next(''); //to stop spinner
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }
}
