
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  LoadingOperation,
  LoadingService,
} from '../../core/services/loading';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly cdr = inject(ChangeDetectorRef);

  operations: LoadingOperation[] = [];
  loading = true;
  errorMessage = '';

  get totalGroups(): number {
    return this.operations.reduce(
      (total, operation) =>
        total + (operation.groups?.length ?? 0),
      0,
    );
  }

  get todayCount(): number {
    const today = new Date().toDateString();

    return this.operations.filter(
      (operation) =>
        this.getDate(operation.createdAt)?.toDateString() === today,
    ).length;
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      this.operations = await this.loadingService.getOperations();

      console.log('Dashboard operations:', this.operations);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      this.errorMessage =
        'Could not load operations. Check your Firebase connection and Firestore permissions.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  getDate(value: unknown): Date | null {
    if (!value) return null;

    if (
      typeof value === 'object' &&
      value !== null &&
      'toDate' in value &&
      typeof value.toDate === 'function'
    ) {
      return (value.toDate as () => Date)();
    }

    const date = new Date(value as string | number);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  formatDate(value: unknown): string {
    const date = this.getDate(value);

    return date ? date.toLocaleDateString('en-GB') : '—';
  }
}
