import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, subscribeOn, tap } from 'rxjs/operators';

import { CustomResponse } from '../interface/custom-response';
import { Server } from '../interface/server';
import { Status } from '../enum/status.enum';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  private readonly apiUrl = 'any';

  constructor(private http: HttpClient) {}

  servers$ = <Observable<CustomResponse>>(
    this.http
      .get<CustomResponse>(`${this.apiUrl}http://localhost:8080/server/list`)
      .pipe(tap(console.log), catchError(this.handleError))
  );

  save$ = (server: Server) =>
    <Observable<CustomResponse>>(
      this.http
        .post<CustomResponse>(
          `${this.apiUrl}http://localhost:8080/server/save`,
          server
        )
        .pipe(tap(console.log), catchError(this.handleError))
    );

  ping$ = (ipAddress: string) =>
    <Observable<CustomResponse>>(
      this.http
        .get<CustomResponse>(
          `${this.apiUrl}http://localhost:8080/server/ping/${ipAddress}`
        )
        .pipe(tap(console.log), catchError(this.handleError))
    );

  delete$ = (id: number) =>
    <Observable<CustomResponse>>(
      this.http
        .delete<CustomResponse>(
          `${this.apiUrl}http://localhost:8080/server/${id}`
        )
        .pipe(tap(console.log), catchError(this.handleError))
    );

  filter$ = (status: Status, response: CustomResponse) =>
    <Observable<CustomResponse>>new Observable<CustomResponse>(
      (subscribeOn) => {
        console.log(response);
        subscribeOn.next(
          status === Status.ALL ? { ...response, message: `Server filtered by ${status} status` }
            : {
                ...response,
                message:
                  response.data.servers.filter(
                    (server) => server.status === status
                  ).length > 0
                    ? `Server filtered by ${status === Status.UP ? 'SERVER UP' : ' SERVER DOWN'} status`: `No servers of this status are found`,
                data: {
                  servers: response.data.servers.filter((server) => server.status === status),
                },
              }
        );
        subscribeOn.complete();
      }
    ).pipe(tap(console.log), catchError(this.handleError));

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    throw new Error(`An error occurred - Error code: ${error.status}`);
  }
}
