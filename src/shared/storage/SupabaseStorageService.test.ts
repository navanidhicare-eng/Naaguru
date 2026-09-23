import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupabaseStorageService } from './SupabaseStorageService';
import { env } from '@/shared/config';
import { AppError } from '../errors';

vi.mock('@/shared/config', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-secret-key',
  }
}));

describe('SupabaseStorageService', () => {
  let service: SupabaseStorageService;

  beforeEach(() => {
    service = new SupabaseStorageService();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    env.SUPABASE_SERVICE_ROLE_KEY = 'test-secret-key';
  });

  describe('generateUploadUrl', () => {
    it('valid configuration generates upload authorization', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ url: '/test-upload-url-token' })
      } as Response);

      const result = await service.generateUploadUrl('colleges/1/media.jpg', 'image/jpeg', 1024);

      expect(result.uploadUrl).toBe('https://test.supabase.co/storage/v1/test-upload-url-token');
      expect(result.method).toBe('PUT');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.supabase.co/storage/v1/object/upload/sign/naaguru-media/colleges/1/media.jpg',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-secret-key'
          })
        })
      );
    });

    it('throws if configuration is missing', async () => {
      env.SUPABASE_SERVICE_ROLE_KEY = '';
      await expect(service.generateUploadUrl('test', 'image/jpeg', 1024)).rejects.toThrow(/not configured/);
    });
  });

  describe('getPublicUrl', () => {
    it('returns public URL if configured', () => {
      const url = service.getPublicUrl('test.jpg');
      expect(url).toBe('https://test.supabase.co/storage/v1/object/public/naaguru-media/test.jpg');
    });

    it('missing production configuration fails clearly', () => {
      env.NEXT_PUBLIC_SUPABASE_URL = '';
      vi.stubEnv('NODE_ENV', 'production');
      
      expect(() => service.getPublicUrl('test.jpg')).toThrowError(AppError);
      expect(() => service.getPublicUrl('test.jpg')).toThrowError(/not configured for production/);
    });

    it('returns mock URL in development if missing config', () => {
      env.NEXT_PUBLIC_SUPABASE_URL = '';
      vi.stubEnv('NODE_ENV', 'development');
      
      const url = service.getPublicUrl('test.jpg');
      expect(url).toBe('https://mock-storage.naaguru.local/naaguru-media/test.jpg');
    });
  });
});
