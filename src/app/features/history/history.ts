
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  LoadingOperation,
  LoadingService,
} from '../../core/services/loading';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly cdr = inject(ChangeDetectorRef);

  operations: LoadingOperation[] = [];
  searchTerm = '';
  selectedMonth = '';
  loading = true;
  errorMessage = '';

  get filteredOperations(): LoadingOperation[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.operations.filter((operation) => {
      const matchesSearch =
        !term ||
        operation.clientName.toLowerCase().includes(term) ||
        operation.workOrder.toLowerCase().includes(term) ||
        (operation.groups ?? []).some((group) =>
          group.containerNumber.toLowerCase().includes(term),
        );

      const date = this.getDate(operation.createdAt);

      const month = date
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : '';

      return (
        matchesSearch &&
        (!this.selectedMonth || month === this.selectedMonth)
      );
    });
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      this.operations = await this.loadingService.getOperations();
    } catch (error) {
      console.error('Failed to load history:', error);
      this.errorMessage = 'Could not load the operation history.';
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
