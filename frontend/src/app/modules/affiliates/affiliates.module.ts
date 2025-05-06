import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { affiliatesRoutes } from './affiliates.routes';
import { AffiliatesComponent } from './affiliates.component';
import { AffiliatesListComponent } from './affiliates-list/affiliates-list.component';
import { AffiliatesFormComponent } from './affiliates-form/affiliates-form.component';
import { AffiliatesViewComponent } from './affiliates-view/affiliates-view.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(affiliatesRoutes),
  ]
})
export class AffiliatesModule { }
