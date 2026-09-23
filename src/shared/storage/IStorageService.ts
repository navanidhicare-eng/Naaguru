export interface IStorageService {
  /**
   * Generates a pre-signed URL for direct upload to storage.
   * @param key The object key (path) to upload to
   * @param contentType The MIME type of the file
   * @param maxSizeInBytes Maximum allowed file size
   * @returns The pre-signed upload URL and an optional required HTTP method (e.g. 'PUT' or 'POST')
   */
  generateUploadUrl(key: string, contentType: string, maxSizeInBytes: number): Promise<{ uploadUrl: string; method: string }>;

  /**
   * Returns a publicly accessible URL for the given key.
   * @param key The object key
   */
  getPublicUrl(key: string): string;

  /**
   * Deletes an object from storage.
   * @param key The object key
   */
  deleteObject(key: string): Promise<void>;
}
