import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AffiliateService, Affiliate, ApiResponse } from '../../services/affiliate.service';
import { LoadingService } from '../../../services/loading.service';
// import { ToastService } from '../../services/toast.service'; // TODO: Add back

@Component({
  selector: 'app-affiliates-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, // For edit/back buttons
    TranslateModule
  ],
  templateUrl: './affiliates-view.component.html',
  styleUrls: ['./affiliates-view.component.css']
})
export class AffiliatesViewComponent implements OnInit, OnDestroy {
  affiliate: Affiliate | null = null;
  isLoading: boolean = false;
  private routeSub?: Subscription;
  private affiliateSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private affiliateService: AffiliateService,
    private loadingService: LoadingService,
    // private toastService: ToastService, // TODO: Add back
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadAffiliate(id);
      } else {
        // Handle case where ID is missing (e.g., navigate back)
        console.error('Affiliate ID missing from route');
        this.router.navigate(['/affiliates/list']);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.affiliateSub?.unsubscribe();
  }

  loadAffiliate(id: string): void {
    this.isLoading = true;
    this.loadingService.show();
    this.affiliateSub = this.affiliateService.getById(id).subscribe({
      next: (res: ApiResponse<Affiliate | null>) => {
        if (res.success && res.data) {
          this.affiliate = res.data;
        } else {
          this.affiliate = null;
          // this.toastService.showError(this.translate.instant('affiliates.view.loadError'));
          console.error(this.translate.instant('affiliates.view.loadError')); // Placeholder
          this.router.navigate(['/affiliates/list']);
        }
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (err: any) => {
        console.error('Error loading affiliate:', err);
        this.affiliate = null;
        this.isLoading = false;
        this.loadingService.hide();
        // this.toastService.showError(this.translate.instant('affiliates.view.loadError'));
        console.error(this.translate.instant('affiliates.view.loadError')); // Placeholder
        this.router.navigate(['/affiliates/list']);
      }
    });
  }
} 