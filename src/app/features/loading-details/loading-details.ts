
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import {
  LoadingOperation,
  LoadingService,
} from '../../core/services/loading';

import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-loading-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './loading-details.html',
  styleUrl: './loading-details.css',
})
export class LoadingDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly loadingService = inject(LoadingService);
  private readonly cdr = inject(ChangeDetectorRef);

  operation: LoadingOperation | null = null;

  loading = true;
  deleting = false;
  downloadingPdf = false;
  showDeleteModal = false;

  errorMessage = '';

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Operation ID is missing.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    try {
      this.operation =
        await this.loadingService.getOperation(id);

      if (!this.operation) {
        this.errorMessage = 'Loading operation not found.';
      }
    } catch (error) {
      console.error('Failed to load operation:', error);
      this.errorMessage = 'Could not load operation details.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  formatDate(value: unknown): string {
    if (!value) return '—';

    let date: Date;

    if (
      typeof value === 'object' &&
      value !== null &&
      'toDate' in value &&
      typeof value.toDate === 'function'
    ) {
      date = (value.toDate as () => Date)();
    } else {
      date = new Date(value as string | number);
    }

    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleString('en-GB');
  }

  async downloadPdf(): Promise<void> {
    const operation = this.operation;

    if (
      !operation ||
      this.loading ||
      this.downloadingPdf ||
      this.deleting
    ) {
      return;
    }

    const element = document.getElementById('pdfContent');

    if (!element) {
      this.errorMessage = 'Could not find the report content.';
      this.cdr.detectChanges();
      return;
    }

    this.downloadingPdf = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      const options = {
        margin: 10,
        filename: `loading-${operation.workOrder || operation.id}.pdf`,
        image: {
          type: 'jpeg' as const,
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        },
        jsPDF: {
          unit: 'mm' as const,
          format: 'a4' as const,
          orientation: 'portrait' as const,
        },
        pagebreak: {
          mode: ['css', 'legacy'],
        },
      };

      await html2pdf()
        .set(options)
        .from(element)
        .save();
    } catch (error) {
      console.error('PDF export failed:', error);
      this.errorMessage =
        'An error occurred while creating the PDF. Please try again.';
    } finally {
      this.downloadingPdf = false;
      this.cdr.detectChanges();
    }
  }

  openDeleteModal(): void {
    if (
      !this.operation?.id ||
      this.deleting ||
      this.downloadingPdf
    ) {
      return;
    }

    this.errorMessage = '';
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    if (this.deleting) return;

    this.showDeleteModal = false;
    this.cdr.detectChanges();
  }

  async deleteOperation(): Promise<void> {
    const id = this.operation?.id;

    if (!id || this.deleting) return;

    this.deleting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      await this.loadingService.deleteOperation(id);

      this.showDeleteModal = false;
      await this.router.navigate(['/history']);
    } catch (error) {
      console.error('Failed to delete operation:', error);

      this.errorMessage =
        'Could not delete the operation. Check your Firebase permissions and try again.';

      this.showDeleteModal = false;
    } finally {
      this.deleting = false;
      this.cdr.detectChanges();
    }
  }
}
