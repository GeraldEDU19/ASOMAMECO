import { Routes } from '@angular/router';

// Import child components directly, like in events.routes.ts
import { AffiliatesListComponent } from './affiliates-list/affiliates-list.component';
import { AffiliatesFormComponent } from './affiliates-form/affiliates-form.component';
import { AffiliatesViewComponent } from './affiliates-view/affiliates-view.component';

// Child component loaders - No longer needed if using component property

export const affiliatesRoutes: Routes = [
    {
      path: '',
      redirectTo: 'list',
      pathMatch: 'full'
    },
    {
      path: 'list',
      component: AffiliatesListComponent
    },
    {
      path: 'create',
      component: AffiliatesFormComponent
    },
    {
      path: 'view/:id',
      component: AffiliatesViewComponent
    },
    {
      path: 'edit/:id',
      component: AffiliatesFormComponent
    },
  ]; 