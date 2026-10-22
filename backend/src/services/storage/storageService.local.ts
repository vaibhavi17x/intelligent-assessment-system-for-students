
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import {
  IStorageService,
  FileUploadOptions,
  StoredFile,
  FileValidationResult,
} from './storageService.interface';
import { config } from '../../config';

export class LocalStorageService implements IStorageService {
  private readonly uploadDir: string;
  private readonly metadataPath: string;

  constructor() {
    this.uploadDir = path.resolve(config.uploadDir);
    this.metadataPath = path.join(this.uploadDir, 'file-metadata.json');
    void this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }

  private async readMetadata(): Promise<StoredFile[]> {
    await this.ensureUploadDir();

    try {
      const content = await fs.readFile(this.metadataPath, 'utf8');
      return JSON.parse(content) as StoredFile[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  private async writeMetadata(files: StoredFile[]): Promise<void> {
    await this.ensureUploadDir();
    await fs.writeFile(
      this.metadataPath,
      JSON.stringify(files, null, 2),
      'utf8'
    );
  }

  async validateFile(
    options: FileUploadOptions
  ): Promise<FileValidationResult> {
    if (options.fileSize > config.maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${config.maxFileSize} bytes`,
      };
    }

    const fileExtension = path.extname(options.fileName).toLowerCase();

    if (!config.allowedFileTypes.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File type ${fileExtension} is not allowed. Allowed types: ${config.allowedFileTypes.join(', ')}`,
      };
    }

    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedMimeTypes.includes(options.mimeType)) {
      return {
        isValid: false,
        error: `MIME type ${options.mimeType} is not allowed`,
      };
    }

    return { isValid: true };
  }

  async uploadFile(
    buffer: Buffer,
    options: FileUploadOptions
  ): Promise<StoredFile> {
    const validation = await this.validateFile(options);

    if (!validation.isValid) {
      throw new Error(validation.error ?? 'Invalid file');
    }

    await this.ensureUploadDir();

    const fileId = randomUUID();
    const fileExtension = path.extname(options.fileName).toLowerCase();
    const storedFileName = `${fileId}${fileExtension}`;
    const categoryDir = path.resolve(this.uploadDir, options.category);

    // Prevent category path traversal outside the upload directory.
    if (
      categoryDir !== this.uploadDir &&
      !categoryDir.startsWith(this.uploadDir + path.sep)
    ) {
      throw new Error('Invalid file category');
    }

    await fs.mkdir(categoryDir, { recursive: true });

    const filePath = path.join(categoryDir, storedFileName);
    await fs.writeFile(filePath, buffer, { flag: 'wx' });

    const storedFile: StoredFile = {
      id: fileId,
      fileName: storedFileName,
      originalName: path.basename(options.fileName),
      filePath,
      fileSize: buffer.length,
      mimeType: options.mimeType,
      category: options.category,
      uploadedAt: new Date(),
      uploadedBy: options.userId,
    };

    try {
      const files = await this.readMetadata();
      files.push(storedFile);
      await this.writeMetadata(files);
    } catch (error) {
      await fs.unlink(filePath).catch(() => undefined);
      throw error;
    }

    return storedFile;
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    const metadata = await this.getFileMetadata(fileId);
    return fs.readFile(metadata.filePath);
  }

  async deleteFile(fileId: string): Promise<void> {
    const files = await this.readMetadata();
    const file = files.find((item) => item.id === fileId);

    if (!file) {
      throw new Error('File not found');
    }

    await fs.unlink(file.filePath);

    await this.writeMetadata(
      files.filter((item) => item.id !== fileId)
    );
  }

  async getFileMetadata(fileId: string): Promise<StoredFile> {
    const files = await this.readMetadata();
    const file = files.find((item) => item.id === fileId);

    if (!file) {
      throw new Error('File not found');
    }

    return {
      ...file,
      uploadedAt: new Date(file.uploadedAt),
    };
  }

  async fileExists(fileId: string): Promise<boolean> {
    try {
      const metadata = await this.getFileMetadata(fileId);
      await fs.access(metadata.filePath);
      return true;
    } catch {
      return false;
    }
  }

  async generateDownloadUrl(
    fileId: string,
    expiresIn?: number
  ): Promise<string> {
    // Local filesystem storage has no public URL endpoint.
    // A download URL must be implemented through an authenticated route.
    await this.getFileMetadata(fileId);

    if (expiresIn !== undefined && expiresIn <= 0) {
      throw new Error('expiresIn must be greater than zero');
    }

    throw new Error(
      'Download URLs are not supported by local storage. Use an authenticated download route.'
    );
  }
}

export const storageService = new LocalStorageService();
