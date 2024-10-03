import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PresupuestosService } from '../../services/presupuestos.service';
import { Router } from '@angular/router';
import { GoogleMap } from '@angular/google-maps';
import { HttpClient } from '@angular/common/http';
import { UbicacionService } from '../../services/ubicacion.service'; // Asegúrate de que el servicio esté importado

@Component({
  selector: 'app-inicio-usuario',
  templateUrl: './inicio-usuario.component.html',
  styleUrls: ['./inicio-usuario.component.css']
})
export class InicioUsuarioComponent implements OnInit, AfterViewInit {
  presupuestos: any = [];
  idUsuario: string | null = null;
  lugaresVisitados: { ubicacion: string, hora: string }[] = [];
  
  initialPosition = { lat: 19.433668, lng: -99.115728 };
  center: google.maps.LatLngLiteral = this.initialPosition;
  zoom = 15;

  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  markers: google.maps.Marker[] = [];
  historialUbicaciones: any[] = [];

  constructor(
    private presupuestosService: PresupuestosService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private ubicacionService: UbicacionService // Agregado el servicio de ubicación
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.idUsuario = localStorage.getItem('IdUsuario');
      if (this.idUsuario) {
        this.loadPresupuestos();
        this.trackLocation();
        this.getHistorialUbicacion();
        this.getLugaresVisitados();
      } else {
        console.error('Usuario no autenticado');
        this.router.navigate(['/login']);
      }
    } else {
      console.warn('No se puede acceder a localStorage en el lado del servidor.');
      this.router.navigate(['/login']);
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('load', () => {
        this.getCurrentLocation();
      });
    }
  }

  loadPresupuestos() {
    if (this.idUsuario) {
      this.presupuestosService.getPresupuestos(this.idUsuario).subscribe(
        (resp: any) => {
          this.presupuestos = resp;
        },
        (err) => console.log(err)
      );
    }
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.initializeMap();

          const hora = new Date().toLocaleTimeString();
          this.addLugarVisitado(`${this.center.lat}, ${this.center.lng}`, hora);
        },
        (error) => {
          console.error('Error obteniendo la ubicación: ', error);
        }
      );
    } else {
      console.warn('Geolocalización no es soportada por este navegador.');
    }
  }

  initializeMap() {
    if (this.map?.googleMap) {
      this.addMarker(this.center);
    } else {
      console.error('Mapa no está inicializado.');
    }
  }

  addMarker(location: google.maps.LatLngLiteral) {
    this.clearMarkers();

    const marker = new google.maps.Marker({
      position: location,
      map: this.map.googleMap!,
      title: 'Estoy aquí'
    });

    this.markers.push(marker);
  }

  clearMarkers() {
    this.markers.forEach((marker) => marker.setMap(null));
    this.markers = [];
  }

  trackLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const latitud = position.coords.latitude;
        const longitud = position.coords.longitude;

        if (this.idUsuario) {
          // Utiliza el servicio de ubicación para almacenar la ubicación
          this.ubicacionService.almacenarUbicacion({
            idUsuario: this.idUsuario,
            latitud: latitud,
            longitud: longitud,
            fechaRegistro: new Date().toISOString()
          }).subscribe({
            next: (data) => {
              console.log('Ubicación almacenada correctamente:', data);
            },
            error: (error) => {
              console.error('Error al almacenar la ubicación:', error);
            }
          });
        }
      });
    } else {
      console.log("La geolocalización no es compatible con este navegador.");
    }
  }

  getHistorialUbicacion() {
    if (this.idUsuario) {
      // Utiliza el servicio de ubicación para obtener el historial
      this.ubicacionService.obtenerHistorialUbicacion(this.idUsuario).subscribe({
        next: (data: any) => {
          this.historialUbicaciones = data;
          console.log('Historial de ubicaciones:', this.historialUbicaciones);
        },
        error: (error) => {
          console.error('Error al obtener historial de ubicaciones:', error);
        }
      });
    }
  }

  addLugarVisitado(ubicacion: string, hora: string): void {
    const lugarConHora = { ubicacion: ubicacion, hora: hora };
    this.lugaresVisitados.push(lugarConHora);
    localStorage.setItem('lugaresVisitados', JSON.stringify(this.lugaresVisitados));
  }

  getLugaresVisitados(): void {
    const lugares = localStorage.getItem('lugaresVisitados');
    if (lugares) {
      this.lugaresVisitados = JSON.parse(lugares);
    }
  }

  // Nueva función para mover el mapa al hacer clic
  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.center = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      this.addMarker(this.center);
    }
  }

  // Nueva función para manejar el movimiento del ratón sobre el mapa
  move(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      console.log(`Movimiento del ratón en: ${event.latLng.lat()}, ${event.latLng.lng()}`);
    }
  }

  // Nueva función para recentrar el mapa en la ubicación actual
  recenterMap() {
    this.getCurrentLocation();
  }
}
