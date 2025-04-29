import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { EventService, Event, Attendee, Affiliate } from '../services/event.service';
import { AffiliateService } from '../services/affiliate.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './events.component.html'
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  filtered: Event[] = [];
  search = '';
  editing = false;
  isNew = false;
  form!: FormGroup;
  updateFlag = false;

  editingEventId: string | null | undefined;
  selectedAttendees: { attendee: Attendee }[] = [];
  showAffiliatesModal = false;

  modalSearch = '';
  modalAffiliates: Affiliate[] = [];
  filteredModalAffiliates: Affiliate[] = [];

  loadingExcel = false;
  excelToast = false;
  excelToastType: 'success' | 'danger' = 'success';
  excelToastMessage = '';

  selectedAffiliateIndex: number | null = null;
  affiliateForm!: FormGroup;
  showAffiliateModal = false;

  // Spinner, bloqueo del botón y modales
  saving = false;
  resultMessage = '';
  showResultModal = false;
  resultIsError = false;

  // Modal para decisión de actualizar afiliados repetidos
  showConflictModal = false;
  payloadToRetry: any = null;
  eventIdToRetry: string | null = null;

  constructor(
    private fb: FormBuilder,
    private svc: EventService,
    private asvc: AffiliateService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.load();
  }

  private load() {
    this.svc.getAll().subscribe(r => {
      if (r.success) {
        this.events = r.data;
        this.filtered = [...this.events];
      }
    });
  }

  filter() {
    const t = this.search.trim();
    this.filtered = t
      ? this.events.filter(e =>
          new RegExp(t, 'i').test(e.name) ||
          new RegExp(t, 'i').test(new Date(e.date).toLocaleDateString())
        )
      : [...this.events];
  }

  onCreate() {
    this.editing = true;
    this.isNew = true;
    this.updateFlag = false;
    this.editingEventId = null;
    this.selectedAttendees = [];
    this.buildForm({ name: '', date: '', description: '', location: '', active: true, attendees: [] });
  }

  onEdit(e: Event) {
    this.editing = true;
    this.isNew = false;
    this.updateFlag = false;
    this.editingEventId = e._id;

    this.selectedAttendees = e.attendees.map(a => ({
      attendee: {
        _id: a._id,
        affiliate: a.affiliate,
        confirmed: a.confirmed,
        attended: a.attended
      }
    }));

    this.buildForm({ ...e, date: new Date(e.date).toISOString().slice(0, 16) });
  }

  private buildForm(e: Event) {
    this.form = this.fb.group({
      name: [e.name, Validators.required],
      date: [e.date, Validators.required],
      description: [e.description, Validators.required],
      location: [e.location, Validators.required],
      active: [e.active]
    });
  }

  openAffiliatesModal() {
    this.modalSearch = '';
    this.asvc.getAll().subscribe(r => {
      if (r.success) {
        this.modalAffiliates = r.data;
        this.filteredModalAffiliates = [...r.data];
        this.showAffiliatesModal = true;
      }
    });
  }

  filterModal() {
    const t = this.modalSearch.trim();
    this.filteredModalAffiliates = t
      ? this.modalAffiliates.filter(a =>
          new RegExp(t, 'i').test(a.externalId) ||
          new RegExp(t, 'i').test(a.fullName ?? '')
        )
      : [...this.modalAffiliates];
  }

  addAffiliate(a: Affiliate) {
    const exists = this.selectedAttendees.some(x => x.attendee.affiliate._id === a._id);
    if (!exists) {
      this.selectedAttendees.push({
        attendee: {
          affiliate: a,
          confirmed: true,
          attended: false
        }
      });
      this.selectedAttendees = [...this.selectedAttendees];
    }
  }

  removeAffiliate(i: number) {
    this.selectedAttendees.splice(i, 1);
    this.selectedAttendees = [...this.selectedAttendees];
  }

  openEditAffiliateModal(index: number) {
    this.selectedAffiliateIndex = index;
    const aff = this.selectedAttendees[index].attendee.affiliate;
    this.affiliateForm = this.fb.group({
      externalId: [aff.externalId, Validators.required],
      firstName: [aff.firstName, Validators.required],
      secondName: [aff.secondName],
      firstLastName: [aff.firstLastName, Validators.required],
      secondLastName: [aff.secondLastName],
      email: [aff.email],
      telephoneNumber: [aff.telephoneNumber, Validators.required],
      active: [aff.active]
    });
    this.showAffiliateModal = true;
  }

  saveAffiliateChanges() {
    if (this.affiliateForm.invalid || this.selectedAffiliateIndex === null) return;
    const updatedAffiliate = {
      ...this.selectedAttendees[this.selectedAffiliateIndex].attendee.affiliate,
      ...this.affiliateForm.value
    };
    this.selectedAttendees[this.selectedAffiliateIndex].attendee.affiliate = updatedAffiliate;
    this.selectedAttendees = [...this.selectedAttendees];
    this.showAffiliateModal = false;
  }

  closeAffiliateModal() {
    this.showAffiliateModal = false;
  }
  toggleConfirm(i: number) {
    this.selectedAttendees[i].attendee.confirmed = !this.selectedAttendees[i].attendee.confirmed;
    this.selectedAttendees = [...this.selectedAttendees];
  }

  toggleAttended(i: number) {
    if (!this.isNew) {
      this.selectedAttendees[i].attendee.attended = !this.selectedAttendees[i].attendee.attended;
      this.selectedAttendees = [...this.selectedAttendees];
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: any = {
      ...this.form.value,
      update: this.updateFlag,
      attendees: this.selectedAttendees.map(x => ({
        affiliate: x.attendee.affiliate,
        confirmed: x.attendee.confirmed,
        attended: this.isNew ? false : x.attendee.attended
      }))
    };

    this.sendPayload(payload);
  }

  private sendPayload(payload: any) {
    this.saving = true;
    const obs = this.isNew
      ? this.svc.create(payload)
      : this.svc.update(this.editingEventId!, payload);

    obs.subscribe({
      next: (response) => {
        this.saving = false;
        const attendeesResponse = response?.data?.attendeesResponse;
        const hasConflict = attendeesResponse?.some((attendee: any) => attendee.success === false);

        if (hasConflict && this.isNew && !payload.update) {
          this.payloadToRetry = payload;
          this.eventIdToRetry = response.data.event._id;
          this.showConflictModal = true;
        } else {
          this.resultMessage = response.message || 'Evento guardado correctamente.';
          this.resultIsError = false;
          this.showResultModal = true;
          this.editing = false;
          this.load();
        }
      },
      error: (error) => {
        this.saving = false;
        this.resultMessage = error?.message?.message || 'Error al guardar el evento.';
        this.resultIsError = true;
        this.showResultModal = true;
      }
    });
  }

  confirmRetryUpdate(choice: boolean) {
    this.showConflictModal = false;
    if (choice && this.payloadToRetry && this.eventIdToRetry) {
      // Si elige actualizar, se hace el update con la flag update: true
      const retryPayload = { ...this.payloadToRetry, update: true };
      this.saving = true;
      this.svc.update(this.eventIdToRetry, retryPayload).subscribe({
        next: (response) => {
          this.saving = false;
          this.resultMessage = response.message || 'Evento actualizado correctamente.';
          this.resultIsError = false;
          this.showResultModal = true;
          this.editing = false;
          this.load();
        },
        error: (error) => {
          this.saving = false;
          this.resultMessage = error?.message?.message || 'Error al actualizar el evento.';
          this.resultIsError = true;
          this.showResultModal = true;
        }
      });
    } else {
      // ✅ Si elige NO incluirlos, simplemente se considera creado y se vuelve a la lista
      this.resultMessage = 'El evento ha sido creado (sin actualizar afiliados existentes).';
      this.resultIsError = false;
      this.showResultModal = true;
      this.editing = false;
      this.load();
    }
  }
  

  private showExcelToast(type: 'success' | 'danger', msg: string) {
    this.excelToastType = type;
    this.excelToastMessage = msg;
    this.excelToast = true;
    setTimeout(() => (this.excelToast = false), 3000);
  }

  private importFromRows(rows: any[], all: Affiliate[]) {
    console.log('Data raw del Excel:', rows);
    const mapById = new Map<string, Affiliate>(all.map(a => [a.externalId, a]));

    rows.forEach(row => {
      const ext = String(row['Id'] ?? '').trim();
      const aff = mapById.get(ext);
      const confirmated = String(row['Estado 2'] ?? row['Estado 2 '] ?? '').trim() === 'Confirmado';

      if (aff) {
        if (!aff.fullName || aff.fullName.trim() === '') {
          aff.fullName = [
            aff.firstName,
            aff.secondName,
            aff.firstLastName,
            aff.secondLastName
          ].filter(Boolean).join(' ');
        }
        const exists = this.selectedAttendees.find(x => x.attendee.affiliate._id === aff._id);
        if (!exists) {
          this.selectedAttendees.push({ attendee: { affiliate: aff, confirmed: confirmated, attended: false } });
        } else {
          exists.attendee.confirmed = confirmated;
        }
      } else {
        const [firstLastName, secondLastName, firstName, secondName] = this.splitNombre(row['Nombre']);
        const newAffiliate: Affiliate = {
          externalId: ext,
          firstName: firstName ?? '',
          secondName: secondName || null,
          firstLastName: firstLastName ?? '',
          secondLastName: secondLastName ?? '',
          email: row['Correo'] ?? null,
          telephoneNumber: row['Telefono'] ?? '',
          active: row['Estatus 1'] === 'Activo',
          fullName: row['Nombre'].trim()
        };
        this.selectedAttendees.push({ attendee: { affiliate: newAffiliate, confirmed: confirmated, attended: false } });
      }
    });

    this.selectedAttendees = [...this.selectedAttendees];

    const payloadPreview = {
      ...this.form?.value,
      update: this.updateFlag,
      attendees: this.selectedAttendees.map(x => ({
        affiliate: x.attendee.affiliate,
        confirmed: x.attendee.confirmed,
        attended: this.isNew ? false : x.attendee.attended
      }))
    };
    console.log('Posible payload al cargar Excel:', payloadPreview);
  }

  private splitNombre(nombre: string): [string, string, string, string | null] {
    const parts = nombre.trim().split(/\s+/);
    const firstLastName = parts[0] ?? '';
    const secondLastName = parts[1] ?? '';
    const firstName = parts[2] ?? '';
    const secondName = parts.length > 3 ? parts.slice(3).join(' ') : null;
    return [firstLastName, secondLastName, firstName, secondName];
  }

  onExcelFile(evt: any) {
    const file: File = evt.target.files[0];
    if (!file) return;
    this.loadingExcel = true;
    this.excelToast = false;

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = new Uint8Array((ev.target as any).result);
        const wb = XLSX.read(data, { type: 'array' });
        const raw: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        const rows = raw.map(r => {
          const o: any = {};
          Object.keys(r).forEach(k => (o[k.trim()] = r[k]));
          return o;
        });
        console.log('Data raw procesada:', rows);
        this.asvc.getAll().subscribe(r => {
          this.ngZone.run(() => {
            if (!r.success) {
              this.showExcelToast('danger', 'Error al cargar afiliados del servidor');
            } else {
              this.importFromRows(rows, r.data);
              this.showExcelToast('success', 'Excel cargado correctamente');
            }
            this.loadingExcel = false;
          });
        });
      } catch {
        this.ngZone.run(() => {
          this.showExcelToast('danger', 'Formato de Excel inválido');
          this.loadingExcel = false;
        });
      }
    };
    reader.onerror = () => {
      this.ngZone.run(() => {
        this.showExcelToast('danger', 'No se pudo leer el archivo');
        this.loadingExcel = false;
      });
    };
    reader.readAsArrayBuffer(file);
  }
}