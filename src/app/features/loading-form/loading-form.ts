
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Cloudinary } from '../../core/services/cloudinary';
import { LoadingService } from '../../core/services/loading';

interface GroupDraft {
  containerNumber: string;
  photoFile: File | null;
}

@Component({
  selector: 'app-loading-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './loading-form.html',
  styleUrl: './loading-form.css',
})
export class LoadingForm {
  private readonly loadingService = inject(LoadingService);
  private readonly cloudinary = inject(Cloudinary);
  private readonly cdr = inject(ChangeDetectorRef);

  clientName = '';
  workOrder = '';

  groups: GroupDraft[] = [
    { containerNumber: '', photoFile: null },
  ];

  saving = false;
  errorMessage = '';
  successMessage = '';

  addGroup(): void {
    this.groups.push({
      containerNumber: '',
      photoFile: null,
    });

    this.cdr.detectChanges();
  }

  removeGroup(index: number): void {
    if (this.groups.length > 1) {
      this.groups.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  onPhotoSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file && !file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file.';
      input.value = '';
      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';
    this.groups[index].photoFile = file;

    this.cdr.detectChanges();
  }

  async submit(): Promise<void> {
    if (this.saving) return;

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.clientName.trim() || !this.workOrder.trim()) {
      this.errorMessage = 'Enter the client name and work order number.';
      this.cdr.detectChanges();
      return;
    }

    if (
      this.groups.some(
        (group) => !group.containerNumber.trim() || !group.photoFile
      )
    ) {
      this.errorMessage =
        'Enter a container number and select a photo for each group.';
      this.cdr.detectChanges();
      return;
    }

    this.saving = true;
    this.cdr.detectChanges();

    try {
      const savedGroups = await Promise.all(
        this.groups.map(async (group) => {
          const photoUrl = await this.cloudinary.uploadImage(
            group.photoFile!
          );

          return {
            containerNumber: group.containerNumber.trim(),
            photoUrl,
          };
        })
      );

      const operationId = await this.loadingService.addOperation({
        clientName: this.clientName.trim(),
        workOrder: this.workOrder.trim(),
        groups: savedGroups,
      });

      this.successMessage =
        `Operation saved successfully. Operation ID: ${operationId}`;

      this.clientName = '';
      this.workOrder = '';
      this.groups = [
        { containerNumber: '', photoFile: null },
      ];
    } catch (error) {
      console.error('Failed to save loading operation:', error);

      this.errorMessage =
        'An error occurred while uploading photos or saving the operation. Check your Firebase and Cloudinary settings, then try again.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }
}
