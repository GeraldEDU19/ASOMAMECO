import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AffiliateService, Affiliate } from '../../services/affiliate.service';
import { LoadingService } from '../../../services/loading.service';
// import { ToastService } from '../../services/toast.service'; // TODO: Add ToastService back once available/verified

@Component({
  selector: 'app-affiliates-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslateModule
  ],
  templateUrl: './affiliates-list.component.html',
  styleUrls: ['./affiliates-list.component.css']
})
export class AffiliatesListComponent implements OnInit, OnDestroy {
  affiliates: Affiliate[] = [];
  filteredAffiliates: Affiliate[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  private affiliatesSub?: Subscription;
  private langChangeSub?: Subscription;

  constructor(
    private affiliateService: AffiliateService,
    private loadingService: LoadingService,
    // private toastService: ToastService, // TODO: Add back
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadAffiliates();
    // Optional: Subscribe to lang changes if dynamic text needs update
    // this.langChangeSub = this.translate.onLangChange.subscribe(() => {
    //   // Potentially re-fetch or re-process data if needed on lang change
    // });
  }

  ngOnDestroy(): void {
    this.affiliatesSub?.unsubscribe();
    this.langChangeSub?.unsubscribe();
  }

  loadAffiliates(): void {
    this.isLoading = true;
    this.loadingService.show();
    this.affiliatesSub = this.affiliateService.getAll().subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.affiliates = res.data;
          this.filteredAffiliates = [...this.affiliates];
        } else {
          this.affiliates = [];
          this.filteredAffiliates = [];
          // TODO: Replace with toastService.showError()
          console.error(this.translate.instant('affiliates.list.loadError'));
        }
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Error loading affiliates:', err);
        this.isLoading = false;
        this.loadingService.hide();
        this.affiliates = [];
        this.filteredAffiliates = [];
        // TODO: Replace with toastService.showError()
        console.error(this.translate.instant('affiliates.list.loadError'));
      }
    });
  }

  filterAffiliates(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredAffiliates = [...this.affiliates];
    } else {
      this.filteredAffiliates = this.affiliates.filter(affiliate =>
        (affiliate.externalId?.toLowerCase() || '').includes(term) ||
        (affiliate.fullName?.toLowerCase() || '').includes(term) ||
        (affiliate.email?.toLowerCase() || '').includes(term) ||
        (affiliate.telephoneNumber?.toLowerCase() || '').includes(term)
      );
    }
  }

  // Add delete functionality later if needed
  // onDelete(affiliateId: string): void { ... }
} 