import { Component, OnInit } from '@angular/core';
import { ServerService } from './service/server.service';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-response';
import { DataState } from './enum/data-state.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'sever_app';
  appState$: Observable<AppState<CustomResponse>>;

  constructor(private server: ServerService) {}

  ngOnInit(): void {
    this.appState$ = this.server.servers$.pipe(
      map((response) => {
        return { dataState: DataState.LOADED_STATE, appData: response };
      }),
      startWith({ dataState: DataState.LOADING_STATE }),
      catchError((error: string) => {
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }

  
}
