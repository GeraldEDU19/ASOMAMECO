import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { Event } from '../../../models/event.model';
import { Affiliate, Attendance } from '../../../models/attendance.model';
import { TranslateModule } from '@ngx-translate/core';

interface SelectedAttendanceItem {
  attendance: {
    _id?: string;
    affiliate: Affiliate;
    confirmed: boolean;
    attended: boolean;
    event?: string;
  };
}

interface LoadedAttendance {
  _id?: string;
  affiliate: Affiliate;
  confirmed?: boolean;
  attended?: boolean;
  event?: string;
}

@Component({
  selector: 'app-events-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './events-form.component.html',
  styleUrls: ['./events-form.component.css']
})
export class EventsFormComponent implements OnInit {
  form: FormGroup;
  affiliateForm: FormGroup;
  isNew = true;
  eventId: string | null = null;
  isProcessing = false;
  showResultModal = false;
  resultIsError = false;
  resultMessage = '';
  showConflictModal = false;
  showAffiliatesModal = false;
  showAffiliateModal = false;
  modalSearch = '';
  selectedAttendances: SelectedAttendanceItem[] = [];
  allAffiliates: Affiliate[] = [];
  filteredModalAffiliates: Affiliate[] = [];
  editingAffiliateIndex: number | null = null;
  initialAttendances: any[] | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required]
    });

    this.affiliateForm = this.fb.group({
      _id: [null],
      externalId: ['', Validators.required],
      firstName: ['', Validators.required],
      secondName: [''],
      firstLastName: ['', Validators.required],
      secondLastName: [''],
      email: ['', [Validators.email]],
      telephoneNumber: [''],
      active: [true]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isNew = false;
        this.eventId = params['id'];
        this.loadEvent(this.eventId!);
      } else {
        this.isNew = true;
        this.eventId = null;
        this.form.reset();
        this.selectedAttendances = [];
        this.initialAttendances = [];
      }
    });
    this.loadAllAffiliates();
  }

  loadEvent(id: string) {
    this.isProcessing = true;
    this.eventService.getEvent(id).subscribe({
      next: (response) => {
        if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
          const eventData = response.data[0] as Event;
          this.form.patchValue({
            name: eventData.name,
            date: this.formatDateForInput(eventData.date),
            description: eventData.description,
            location: eventData.location
          });

          if (eventData.attendances) {
            this.selectedAttendances = eventData.attendances.map((att: LoadedAttendance) => ({
              attendance: { 
                _id: att._id,
                affiliate: att.affiliate, 
                confirmed: att.confirmed ?? false, 
                attended: att.attended ?? false,   
                event: att.event 
              }
            }));
          }
          
          this.initialAttendances = eventData.attendances || [];
          console.log('Event loaded:', eventData);
          console.log('Mapped Attendances:', this.selectedAttendances);
        } else {
          console.error('Failed to load event or invalid data format:', response);
          this.showResultModal = true;
          this.resultIsError = true;
          this.resultMessage = 'Error al cargar el evento.';
          this.router.navigate(['/events']);
        }
        this.isProcessing = false;
      },
      error: (err) => {
        console.error('Error fetching event:', err);
        this.isProcessing = false;
        this.showResultModal = true;
        this.resultIsError = true;
        this.resultMessage = 'Error al cargar el evento.';
        this.router.navigate(['/events']);
      }
    });
  }

  formatDateForInput(isoDate: string | Date | undefined): string {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) {
        return '';
      }
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
      console.error("Error formatting date:", e);
      return '';
    }
  }

  loadAllAffiliates() {
    this.allAffiliates = [
      { _id: 'aff1', externalId: '123', firstName: 'Juan', firstLastName: 'Perez', fullName: 'Juan Perez', active: true },
      { _id: 'aff2', externalId: '456', firstName: 'Maria', firstLastName: 'Garcia', fullName: 'Maria Garcia', active: true },
      { _id: 'aff3', externalId: '789', firstName: 'Pedro', firstLastName: 'Lopez', fullName: 'Pedro Lopez', active: false },
      { _id: "68103467b40a140d51ec5ce0", externalId: "00000111", firstName: "PAOLA", secondName: "DANIELA", firstLastName: "GONZALEZ", secondLastName: "QUIROS", email: "1ab@aso.co.cr", telephoneNumber: "8888-88-199", active: true, fullName: "PAOLA DANIELA GONZALEZ QUIROS" },
      { _id: "68103468b40a140d51ec5ce5", externalId: "00000112", firstName: "MARIA", secondName: "JOSE", firstLastName: "GRANADOS", secondLastName: "CORDERO", email: "1ab@aso.co.cr", telephoneNumber: "8888-88-200", active: true, fullName: "MARIA JOSE GRANADOS CORDERO" }
    ];
    this.filteredModalAffiliates = [...this.allAffiliates];
    console.log('Mock affiliates loaded for modal');
  }

  openAffiliatesModal() {
    this.modalSearch = '';
    this.filterModal();
    this.showAffiliatesModal = true;
  }

  filterModal() {
    const searchTerm = this.modalSearch.toLowerCase();
    this.filteredModalAffiliates = this.allAffiliates.filter(aff => 
      (aff.fullName?.toLowerCase().includes(searchTerm) || 
       aff.externalId?.toLowerCase().includes(searchTerm) ||
       aff.email?.toLowerCase().includes(searchTerm)) &&
      !this.selectedAttendances.some(sa => sa.attendance.affiliate._id === aff._id)
    );
  }

  addAffiliate(affiliate: Affiliate) {
    if (this.selectedAttendances.some(sa => sa.attendance.affiliate._id === affiliate._id)) {
      console.warn(`Affiliate ${affiliate.fullName} already added.`);
      return;
    }
    this.selectedAttendances.push({
      attendance: {
        affiliate: affiliate,
        confirmed: false,
        attended: false,
      }
    });
    this.showAffiliatesModal = false;
    this.filterModal();
  }

  openEditAffiliateModal(index: number) {
    this.editingAffiliateIndex = index;
    const selectedItem = this.selectedAttendances[index];
    if (selectedItem && selectedItem.attendance && selectedItem.attendance.affiliate) {
      this.affiliateForm.patchValue(selectedItem.attendance.affiliate);
      this.showAffiliateModal = true;
    } else {
      console.error('Cannot edit: Invalid selected attendance data at index', index);
    }
  }

  closeAffiliateModal() {
    this.showAffiliateModal = false;
    this.editingAffiliateIndex = null;
    this.affiliateForm.reset();
  }

  saveAffiliateChanges() {
    if (this.affiliateForm.valid && this.editingAffiliateIndex !== null) {
      const updatedAffiliateData = this.affiliateForm.value as Affiliate;
      this.selectedAttendances[this.editingAffiliateIndex].attendance.affiliate = updatedAffiliateData;
      
      console.log('Affiliate changes saved locally for index:', this.editingAffiliateIndex);
      this.closeAffiliateModal();
    } else {
       console.error('Cannot save affiliate changes: Form invalid or index missing.');
    }
  }

  toggleConfirm(index: number) {
    if (this.selectedAttendances[index]?.attendance) {
       this.selectedAttendances[index].attendance.confirmed = !this.selectedAttendances[index].attendance.confirmed;
    }
  }

  removeAffiliate(index: number) {
    this.selectedAttendances.splice(index, 1);
    this.filterModal();
  }

  submit() {
    if (this.form.invalid) {
      console.error('Main form is invalid');
      this.form.markAllAsTouched();
      return;
    }

    this.isProcessing = true;
    const formData = this.form.value;

    const payload: any = {
      name: formData.name,
      date: new Date(formData.date).toISOString(),
      description: formData.description,
      location: formData.location,
      attendances: this.selectedAttendances.map(sa => ({
        _id: sa.attendance._id,
        affiliate: sa.attendance.affiliate._id, 
        confirmed: sa.attendance.confirmed
      }))
    };

    console.log('Submitting payload:', payload);

    const operation = this.isNew
      ? this.eventService.createEvent(payload)
      : this.eventService.updateEvent(this.eventId!, payload);

    operation.subscribe({
      next: (response) => {
        this.isProcessing = false;
        if (response.success) {
          this.showResultModal = true;
          this.resultIsError = false;
          this.resultMessage = `Evento ${this.isNew ? 'creado' : 'actualizado'} correctamente.`;
          setTimeout(() => {
             this.showResultModal = false; 
             this.router.navigate(['/events']); 
          }, 1500); 
        } else {
          this.showResultModal = true;
          this.resultIsError = true;
          this.resultMessage = `Error al ${this.isNew ? 'crear' : 'actualizar'} el evento: ${response.message || 'Error desconocido'}`;
        }
      },
      error: (err) => {
        this.isProcessing = false;
        this.showResultModal = true;
        this.resultIsError = true;
        this.resultMessage = `Error al ${this.isNew ? 'crear' : 'actualizar'} el evento. Ver consola.`;
        console.error(`Error ${this.isNew ? 'creating' : 'updating'} event:`, err);
      }
    });
  }

  confirmRetryUpdate(update: boolean) {
    this.showConflictModal = false;
    if (update) {
      console.log('User chose to update conflicts (logic not implemented here).');
    } else {
      console.log('User chose not to update conflicts.');
    }
  }

  onCancel() {
    this.router.navigate(['/events']);
  }
}
