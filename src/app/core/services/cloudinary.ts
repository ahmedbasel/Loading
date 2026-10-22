import { environment } from './../../../environments/environment';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Cloudinary {
  async uploadImage(file: File): Promise<string> {
    const { cloudName, uploadPreset } = environment.cloudinary;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary settings are incomplete.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary.');
    }

    const result = (await response.json()) as {
      secure_url: string;
    };

    return result.secure_url;
  }
}
