
import { Routes } from '@angular/router';

import { Dashboard } from './features/dashboard/dashboard';
import { History } from './features/history/history'; 
import { LoadingForm } from './features/loading-form/loading-form';
import { LoadingDetails } from './features/loading-details/loading-details';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'history', component: History },
  { path: 'loading/new', component: LoadingForm },
  { path: 'loading/:id', component: LoadingDetails },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
