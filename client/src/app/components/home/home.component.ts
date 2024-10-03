import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';  // Importa NotificationService

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  notificationMessage: string | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    // Subscribirse a las notificaciones
    this.notificationService.notification$.subscribe(message => {
      this.notificationMessage = message;
    });
  }
}
