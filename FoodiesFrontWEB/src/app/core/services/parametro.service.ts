import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Parametro, ParametroRequest } from '../models/parametro.model';

@Injectable({
    providedIn: 'root'
})
export class ParametroService {

    private readonly apiUrl = `${environment.apiBaseUrl}/parameters-api`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Parametro[]> {
        return this.http.get<Parametro[]>(this.apiUrl);
    }

    getById(id: number): Observable<Parametro> {
        return this.http.get<Parametro>(`${this.apiUrl}/${id}`);
    }

    create(parametro: ParametroRequest): Observable<Parametro> {
        return this.http.post<Parametro>(this.apiUrl, parametro);
    }

    update(id: number, parametro: ParametroRequest): Observable<Parametro> {
        return this.http.put<Parametro>(`${this.apiUrl}/${id}`, parametro);
    }
}