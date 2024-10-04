import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService {
  private API_URI = 'http://localhost:3000/api/ubicacion';

  constructor(private http: HttpClient) {}

  obtenerHistorialUbicacion(idUser: string): Observable<any> {
    return this.http.get(`${this.API_URI}/historial/${idUser}`);
  }

  almacenarUbicacion(data: { idUsuario: string, latitud: number, longitud: number, fechaRegistro: string }): Observable<any> {
    if (!data.idUsuario || !data.latitud || !data.longitud || !data.fechaRegistro) {
      throw new Error('Todos los campos son obligatorios');
    }
    return this.http.post(`${this.API_URI}`, data);
  }
}
