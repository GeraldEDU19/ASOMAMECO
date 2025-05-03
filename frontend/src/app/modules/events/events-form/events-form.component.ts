import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-events-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './events-form.component.html',
  styleUrls: ['./events-form.component.css']
})
export class EventsFormComponent implements OnInit {
  form: FormGroup;
  editing = true;
  isNew = true;
  saving = false;
  updateFlag = false;
  loadingExcel = false;
  excelToast = false;
  excelToastType = 'success';
  excelToastMessage = '';
  showResultModal = false;
  resultIsError = false;
  resultMessage = '';
  showConflictModal = false;
  showAffiliatesModal = false;
  showAffiliateModal = false;
  modalSearch = '';
  selectedAttendances: any[] = [];
  filteredModalAffiliates: any[] = [];
  affiliateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      active: [true]
    });

    this.affiliateForm = this.fb.group({
      externalId: [''],
      firstName: [''],
      secondName: [''],
      firstLastName: [''],
      secondLastName: [''],
      email: [''],
      telephoneNumber: [''],
      active: [true]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isNew = false;
        // Aquí iría la lógica para cargar el evento existente
        this.loadEvent(params['id']);
      }
    });
  }

  loadEvent(id: string) {
    // Simulación de carga de evento
    const mockEvent = {
      name: 'Evento de Ejemplo',
      date: '2024-05-01T10:00',
      description: 'Descripción detallada del evento',
      location: 'Sala Principal',
      active: true
    };
    this.form.patchValue(mockEvent);
  }

  onExcelFile(event: any) {
    this.loadingExcel = true;
    // Aquí iría la lógica para procesar el archivo Excel
    setTimeout(() => {
      this.loadingExcel = false;
      this.excelToast = true;
      this.excelToastType = 'success';
      this.excelToastMessage = 'Archivo procesado correctamente';
    }, 2000);
  }

  openAffiliatesModal() {
    this.showAffiliatesModal = true;
    // Aquí iría la lógica para cargar la lista de afiliados
    this.filteredModalAffiliates = [
      { id: 1, fullName: 'Juan Pérez', externalId: '123', email: 'juan@example.com' },
      { id: 2, fullName: 'María García', externalId: '456', email: 'maria@example.com' }
    ];
  }

  filterModal() {
    // Aquí iría la lógica para filtrar afiliados
  }

  addAffiliate(affiliate: any) {
    this.selectedAttendances.push({
      attendance: {
        affiliate: affiliate,
        confirmed: false,
        attended: false
      }
    });
    this.showAffiliatesModal = false;
  }

  openEditAffiliateModal(index: number) {
    const attendance = this.selectedAttendances[index];
    this.affiliateForm.patchValue(attendance.attendance.affiliate);
    this.showAffiliateModal = true;
  }

  closeAffiliateModal() {
    this.showAffiliateModal = false;
  }

  saveAffiliateChanges() {
    // Aquí iría la lógica para guardar los cambios del afiliado
    this.showAffiliateModal = false;
  }

  toggleConfirm(index: number) {
    this.selectedAttendances[index].attendance.confirmed = !this.selectedAttendances[index].attendance.confirmed;
  }

  toggleAttended(index: number) {
    this.selectedAttendances[index].attendance.attended = !this.selectedAttendances[index].attendance.attended;
  }

  removeAffiliate(index: number) {
    this.selectedAttendances.splice(index, 1);
  }

  submit() {
    if (this.form.valid) {
      this.saving = true;
      // Aquí iría la lógica para guardar el evento
      setTimeout(() => {
        this.saving = false;
        this.showResultModal = true;
        this.resultIsError = false;
        this.resultMessage = 'Evento guardado correctamente';
        this.router.navigate(['/events']);
      }, 2000);
    }
  }

  confirmRetryUpdate(update: boolean) {
    this.showConflictModal = false;
    if (update) {
      // Aquí iría la lógica para actualizar los afiliados existentes
    }
  }

  onCancel() {
    this.router.navigate(['/events']);
  }
} 