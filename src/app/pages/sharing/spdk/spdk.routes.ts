import { Routes } from '@angular/router';
import { SPDKComponent } from 'app/pages/sharing/spdk/spdk.component';

export const spdkRoutes: Routes = [
  {
    path: '',
    component: SPDKComponent,
    data: { title: 'SPDK', breadcrumb: null },
  },
  {
    path: ':name',
    component: SPDKComponent,
    data: { title: 'SPDK', breadcrumb: null },
  },
];
