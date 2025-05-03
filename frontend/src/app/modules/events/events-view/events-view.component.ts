import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-events-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './events-view.component.html',
  styleUrls: ['./events-view.component.css']
})
export class EventsViewComponent implements OnInit {
  event: any;
  selectedAttendances: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        // Aquí iría la lógica para obtener el evento por ID
        this.event = {
          id: params['id'],
          name: 'Evento de Ejemplo',
          date: '2024-05-01T10:00',
          description: 'Descripción detallada del evento',
          location: 'Sala Principal',
          active: true
        };

        // Simulación de carga de asistentes
        this.selectedAttendances = [
          {
            attendance: {
              affiliate: {
                fullName: 'Juan Pérez',
                externalId: '123',
                email: 'juan@example.com'
              },
              confirmed: true,
              attended: true
            }
          },
          {
            attendance: {
              affiliate: {
                fullName: 'María García',
                externalId: '456',
                email: 'maria@example.com'
              },
              confirmed: true,
              attended: false
            }
          }
        ];
      }
    });
  }

  onEdit() {
    this.router.navigate(['/events/edit', this.event.id]);
  }

  onBack() {
    this.router.navigate(['/events']);
  }
} 