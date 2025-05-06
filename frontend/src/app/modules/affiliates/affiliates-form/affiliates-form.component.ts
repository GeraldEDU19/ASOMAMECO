import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AffiliateService, Affiliate, ApiResponse } from '../../services/affiliate.service';
import { LoadingService } from '../../../services/loading.service';
// import { ToastService } from '../../services/toast.service'; // TODO: Add back

@Component({
  selector: 'app-affiliates-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink, // For cancel button
    TranslateModule
  ],
  templateUrl: './affiliates-form.component.html',
  styleUrls: ['./affiliates-form.component.css']
})
export class AffiliatesFormComponent implements OnInit, OnDestroy {
  affiliateForm!: FormGroup;
  isEditMode: boolean = false;
  affiliateId: string | null = null;
  isLoading: boolean = false; // For loading existing data
  isSaving: boolean = false; // For submission state
  private routeSub?: Subscription;
  private affiliateSub?: Subscription;
  private saveSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private affiliateService: AffiliateService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    // private toastService: ToastService, // TODO: Add back
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      this.affiliateId = params.get('id');
      this.isEditMode = !!this.affiliateId;
      this.initializeForm();
      if (this.isEditMode && this.affiliateId) {
        this.loadAffiliateData(this.affiliateId);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.affiliateSub?.unsubscribe();
    this.saveSub?.unsubscribe();
  }

  initializeForm(affiliate: Affiliate | null = null): void {
    this.affiliateForm = this.fb.group({
      externalId: [affiliate?.externalId || '', Validators.required],
      firstName: [affiliate?.firstName || '', Validators.required],
      secondName: [affiliate?.secondName || null],
      firstLastName: [affiliate?.firstLastName || '', Validators.required],
      secondLastName: [affiliate?.secondLastName || '', Validators.required],
      email: [affiliate?.email || null, Validators.email],
      telephoneNumber: [affiliate?.telephoneNumber || '', Validators.required]
    });

    // Disable externalId field when editing? Optional.
    // if (this.isEditMode) {
    //   this.affiliateForm.get('externalId')?.disable();
    // }
  }

  loadAffiliateData(id: string): void {
    this.isLoading = true;
    this.loadingService.show();
    this.affiliateSub = this.affiliateService.getById(id).subscribe({
      next: (res: ApiResponse<Affiliate | null>) => {
        if (res.success && res.data) {
          this.initializeForm(res.data); // Re-initialize form with loaded data
        } else {
          // Use translation key
          console.error(this.translate.instant('affiliates.form.loadError'));
          // this.toastService.showError(this.translate.instant('affiliates.form.loadError'));
          this.router.navigate(['/affiliates/list']); // Navigate back if load fails
        }
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (err: any) => {
        console.error('Error loading affiliate data:', err);
        this.isLoading = false;
        this.loadingService.hide();
        // this.toastService.showError(this.translate.instant('affiliates.form.loadError'));
        this.router.navigate(['/affiliates/list']);
      }
    });
  }

  onSubmit(): void {
    if (this.affiliateForm.invalid) {
      this.affiliateForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.loadingService.show();
    const affiliateData: Affiliate = this.affiliateForm.getRawValue(); // Use getRawValue if fields might be disabled

    const operation = this.isEditMode && this.affiliateId
      ? this.affiliateService.update(this.affiliateId, affiliateData)
      : this.affiliateService.create(affiliateData);

    this.saveSub = operation.subscribe({
      next: (res: ApiResponse<Affiliate>) => {
        this.isSaving = false;
        this.loadingService.hide();
        if (res.success) {
          const successMsg = this.isEditMode ? 'affiliates.form.updateSuccess' : 'affiliates.form.createSuccess';
          // this.toastService.showSuccess(this.translate.instant(successMsg));
          console.log(this.translate.instant(successMsg)); // Placeholder for toast
          this.router.navigate(['/affiliates/list']);
        } else {
          // this.toastService.showError(res.message); // Use message from backend response (already translated)
          console.error(res.message); // Placeholder for toast
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        this.loadingService.hide();
        // const errorMsg = err.error?.message || this.translate.instant('affiliates.form.saveError');
        // this.toastService.showError(errorMsg);
        console.error(err.error?.message || this.translate.instant('affiliates.form.saveError')); // Placeholder for toast
      }
    });
  }
} 