import { env } from '@/shared/config';
import { IStorageService } from './IStorageService';
import { AppError } from '../errors';

export class SupabaseStorageService implements IStorageService {
  private readonly bucketName = 'naaguru-media';

  async generateUploadUrl(
    key: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _contentType: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _maxSizeInBytes: number
  ): Promise<{ uploadUrl: string; method: string; storageKey: string }> {
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase storage credentials are not configured');
    }

    // Creating a signed upload URL via Supabase Storage REST API
    // POST /storage/v1/object/upload/sign/{bucketName}/{wildcard}
    const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/upload/sign/${this.bucketName}/${key}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Failed to generate upload URL:', errText);
      throw new AppError('Failed to generate storage upload URL', 500, 'STORAGE_ERROR');
    }

    const data = await response.json();
    
    // The Supabase sign upload API returns a url (relative path) and a token.
    // The actual URL for uploading requires appending the token to the upload endpoint.
    // However, the standard supabase-js client uses `data.url` combined with the base URL.
    const uploadUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1${data.url}`;

    return { uploadUrl, method: 'PUT', storageKey: key };
  }

  getPublicUrl(key: string): string {
    if (!env.NEXT_PUBLIC_SUPABASE_URL) {
      if (process.env.NODE_ENV === 'production') {
        throw new AppError('Supabase storage credentials are not configured for production environment', 500, 'STORAGE_CONFIG_ERROR');
      }
      return `https://mock-storage.naaguru.local/${this.bucketName}/${key}`;
    }
    
    return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${this.bucketName}/${key}`;
  }

  async deleteObject(key: string): Promise<void> {
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return;
    }

    const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${this.bucketName}/${key}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      }
    });

    if (!response.ok) {
      console.error(`Failed to delete object ${key} from storage`);
    }
  }
}
