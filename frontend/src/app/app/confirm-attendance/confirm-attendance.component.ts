import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../services/attendance.service'; // ✅ Importamos el servicio

@Component({
  selector: 'app-confirm-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-attendance.component.html'
})
export class ConfirmAttendanceComponent implements OnInit {
  loading = true;
  success: boolean | null = null;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private attendanceService: AttendanceService // ✅ Inyectamos el servicio
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.attendanceService.validateAttendance(token).subscribe({
        next: (response) => {
          this.success = response.success;
          this.message = response.message || 'Asistencia confirmada correctamente.';
          this.loading = false;
        },
        error: (error) => {
          console.log(error)
          this.success = false;
          this.message = error?.error?.message || 'Error al confirmar la asistencia.';
          this.loading = false;
        }
      });
    } else {
      this.success = false;
      this.message = 'Token inválido.';
      this.loading = false;
    }
  }
}
