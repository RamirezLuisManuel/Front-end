import { Component, OnInit } from '@angular/core';
import { IngresosService } from '../../services/ingresos.service';
import { PresupuestosService } from '../../services/presupuestos.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-ingreso-list',
  templateUrl: './ingreso-list.component.html',
  styleUrls: ['./ingreso-list.component.css']
})
export class IngresoListComponent implements OnInit {
  ingresos: any = [];
  notificationMessage: string | null = null;
  idUsuario: string | null = null;
  presupuestos: any = [];

  constructor(
    private ingresosService: IngresosService,
    private presupuestosService: PresupuestosService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.idUsuario = localStorage.getItem('IdUsuario');
    if (this.idUsuario) {
      this.loadIngresos();
      this.loadPresupuestos();
    } else {
      console.error('Usuario no autenticado');
      this.router.navigate(['/login']);
    }

    this.notificationService.notification$.subscribe(message => {
      this.notificationMessage = message;
    });
  }

  loadIngresos() {
    if (this.idUsuario) {
      this.ingresosService.getIngresos(this.idUsuario).subscribe(
        (resp: any) => {
          this.ingresos = resp;
        },
        err => console.log(err)
      );
    }
  }

  deleteIngreso(id: number) {
    if (this.idUsuario) {
      this.ingresosService.deleteIngreso(id.toString(), this.idUsuario).subscribe(
        () => {
          this.ingresos = this.ingresos.filter((ingreso: any) => ingreso.IdIngreso !== id);
          this.loadPresupuestos();
          this.notificationService.showNotification('Ingreso eliminado correctamente');
        },
        err => console.log(err)
      );
    }
  }

  editIngreso(id: number) {
    this.router.navigate(['/ingresos/edit', id]);
  }
  
  loadPresupuestos() {
    if (this.idUsuario) {
      this.presupuestosService.getPresupuestos(this.idUsuario).subscribe(
        (resp: any) => {
          this.presupuestos = resp;
        },
        err => console.log(err)
      );
    }
  }
}
