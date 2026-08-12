export interface StorageUploadResult {
  objectName: string;
  bucket: string;
  url: string;
}

export interface StorageUploadOptions {
  bucket?: string;
  mimetype?: string;
  metadata?: Record<string, string>;
}

export interface StoredFileMetadata {
  size: number;
  etag?: string;
  lastModified?: Date;
  contentType?: string;
}
