/**
 * File Storage Service Interface
 * 
 * This interface defines the contract for file storage operations.
 * Implementations can be swapped (local filesystem, S3, etc.) without affecting the core application.
 */

export interface FileUploadOptions {
  fileName: string;
  mimeType: string;
  fileSize: number;
  category: 'assignment_submission' | 'model_answer' | 'other';
  userId?: string;
}

export interface StoredFile {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: string;
  uploadedAt: Date;
  uploadedBy?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface IStorageService {
  /**
   * Validate a file before upload
   */
  validateFile(options: FileUploadOptions): Promise<FileValidationResult>;

  /**
   * Upload a file
   */
  uploadFile(buffer: Buffer, options: FileUploadOptions): Promise<StoredFile>;

  /**
   * Download a file
   */
  downloadFile(fileId: string): Promise<Buffer>;

  /**
   * Delete a file
   */
  deleteFile(fileId: string): Promise<void>;

  /**
   * Get file metadata
   */
  getFileMetadata(fileId: string): Promise<StoredFile>;

  /**
   * Check if a file exists
   */
  fileExists(fileId: string): Promise<boolean>;

  /**
   * Generate a download URL (for cloud storage)
   */
  generateDownloadUrl(fileId: string, expiresIn?: number): Promise<string>;
}
