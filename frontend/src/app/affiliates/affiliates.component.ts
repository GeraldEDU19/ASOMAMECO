// src/app/affiliates/affiliates.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { AffiliateService, Affiliate } from '../services/affiliate.service';

@Component({
  selector: 'app-affiliates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './affiliates.component.html'
})
export class AffiliatesComponent implements OnInit {
  affiliates: Affiliate[] = [];
  filtered:   Affiliate[] = [];
  search = '';
  editing = false;
  isNew   = false;
  form!: FormGroup;
  message = '';
  showToast = false;
  toastType: 'success'|'danger' = 'success';

  constructor(private svc: AffiliateService, private fb: FormBuilder) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.svc.getAll().subscribe(res => {
      if (res.success) {
        this.affiliates = res.data;
        this.filtered   = [...this.affiliates];
      }
    });
  }

  filter() {
    const term = this.search.trim();
    if (!term) {
      this.filtered = [...this.affiliates];
    } else {
      const re = new RegExp(term, 'i');
      this.filtered = this.affiliates.filter(a =>
        re.test(a.externalId) ||
        re.test(a.firstName) ||
        re.test(a.secondName || '') ||
        re.test(a.firstLastName) ||
        re.test(a.secondLastName) ||
        re.test(a.email || '') ||
        re.test(a.telephoneNumber)
      );
    }
  }

  onCreate() {
    this.editing = true;
    this.isNew = true;
    this.buildForm({
      externalId: '',
      firstName: '',
      secondName: null,
      firstLastName: '',
      secondLastName: '',
      email: null,
      telephoneNumber: '',
      active: true
    });
  }

  onEdit(a: Affiliate) {
    this.editing = true;
    this.isNew = false;
    this.buildForm(a);
  }

  buildForm(a: Affiliate) {
    this.form = this.fb.group({
      externalId:      [a.externalId, Validators.required],
      firstName:       [a.firstName,  Validators.required],
      secondName:      [a.secondName],
      firstLastName:   [a.firstLastName, Validators.required],
      secondLastName:  [a.secondLastName, Validators.required],
      email:           [a.email, Validators.email],
      telephoneNumber: [a.telephoneNumber, Validators.required],
      active:          [a.active]
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value as Affiliate;
    const obs = this.isNew
      ? this.svc.create(val)
      : this.svc.update(
          this.filtered.find(f => f.externalId === val.externalId)!._id!,
          val
        );
    obs.subscribe({
      next: res => this.handleResponse(res),
      error: err => {
        const msg = err.error?.message ?? 'Error de servidor';
        this.handleResponse({ success: false, message: msg, status: '', data: {} });
      }
    });
  }

  handleResponse(res: any) {
    this.toastType = res.success ? 'success' : 'danger';
    this.message   = res.success ? 'Operación exitosa' : res.message;
    this.showToast = true;
    if (res.success) {
      this.editing = false;
      this.load();
    }
    setTimeout(() => this.showToast = false, 3000);
  }

  onCancel() {
    this.editing = false;
  }
}
