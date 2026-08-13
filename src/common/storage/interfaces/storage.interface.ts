export interface StorageUploadResult {
  objectName: string;
  objectKey: string;
  bucket: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface StorageUploadOptions {
  bucket?: string;
  mimetype?: string;
  metadata?: Record<string, string>;
  /** Préfixe d'objet MinIO, ex. admissions/cv */
  prefix?: string;
  /** Si vrai, aucun accès public : l'URL renvoyée est la clé d'objet. */
  privateObject?: boolean;
  originalName?: string;
}

export interface StoredFileMetadata {
  size: number;
  etag?: string;
  lastModified?: Date;
  contentType?: string;
}

export interface PresignedUpload {
  uploadUrl: string;
  objectKey: string;
  bucket: string;
  publicUrl: string;
  expiresIn: number;
  headers: Record<string, string>;
}

export interface PresignedDownload {
  url: string;
  objectKey: string;
  bucket: string;
  expiresIn: number;
}
