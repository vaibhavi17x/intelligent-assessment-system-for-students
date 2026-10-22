import fs from 'fs/promises';
import path from 'path';
import { LocalStorageService } from '../services/storage/storageService.local';
import { FileUploadOptions } from '../services/storage/storageService.interface';

jest.mock('fs/promises');
jest.mock('../../config', () => ({
  config: {
    uploadDir: './test-uploads',
    maxFileSize: 10485760,
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt'],
  },
}));

describe('LocalStorageService', () => {
  let storageService: LocalStorageService;
  const mockFileBuffer = Buffer.from('test file content');

  beforeEach(() => {
    storageService = new LocalStorageService();
    jest.clearAllMocks();
  });

  describe('validateFile', () => {
    it('should validate file within size limit', async () => {
      const options: FileUploadOptions = {
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024,
        category: 'assignment_submission',
      };

      const result = await storageService.validateFile(options);
      expect(result.isValid).toBe(true);
    });

    it('should reject file exceeding size limit', async () => {
      const options: FileUploadOptions = {
        fileName: 'large.pdf',
        mimeType: 'application/pdf',
        fileSize: 20971520, // 20MB
        category: 'assignment_submission',
      };

      const result = await storageService.validateFile(options);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });

    it('should reject file with disallowed extension', async () => {
      const options: FileUploadOptions = {
        fileName: 'test.exe',
        mimeType: 'application/octet-stream',
        fileSize: 1024,
        category: 'assignment_submission',
      };

      const result = await storageService.validateFile(options);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('is not allowed');
    });

    it('should reject file with disallowed MIME type', async () => {
      const options: FileUploadOptions = {
        fileName: 'test.pdf',
        mimeType: 'application/octet-stream',
        fileSize: 1024,
        category: 'assignment_submission',
      };

      const result = await storageService.validateFile(options);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('MIME type');
    });

    it('should accept all allowed file types', async () => {
      const allowedTypes = [
        { fileName: 'test.pdf', mimeType: 'application/pdf' },
        { fileName: 'test.doc', mimeType: 'application/msword' },
        {
          fileName: 'test.docx',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
        { fileName: 'test.txt', mimeType: 'text/plain' },
      ];

      for (const file of allowedTypes) {
        const options: FileUploadOptions = {
          ...file,
          fileSize: 1024,
          category: 'assignment_submission',
        };

        const result = await storageService.validateFile(options);
        expect(result.isValid).toBe(true);
      }
    });
  });

  describe('uploadFile', () => {
    it('should upload valid file successfully', async () => {
      const options: FileUploadOptions = {
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        fileSize: mockFileBuffer.length,
        category: 'assignment_submission',
        userId: 'user-1',
      };

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.readFile as jest.Mock).mockResolvedValue('[]');

      const result = await storageService.uploadFile(mockFileBuffer, options);

      expect(result.id).toBeDefined();
      expect(result.fileName).toContain('.pdf');
      expect(result.originalName).toBe('test.pdf');
      expect(result.category).toBe('assignment_submission');
      expect(result.uploadedBy).toBe('user-1');
    });

    it('should throw error for invalid file', async () => {
      const options: FileUploadOptions = {
        fileName: 'test.exe',
        mimeType: 'application/octet-stream',
        fileSize: 1024,
        category: 'assignment_submission',
      };

      await expect(
        storageService.uploadFile(mockFileBuffer, options)
      ).rejects.toThrow('Invalid file');
    });

    it('should prevent path traversal in category', async () => {
      const options: FileUploadOptions = {
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        fileSize: mockFileBuffer.length,
        category: '../../../etc',
      };

      await expect(
        storageService.uploadFile(mockFileBuffer, options)
      ).rejects.toThrow('Invalid file category');
    });
  });

  describe('downloadFile', () => {
    it('should download file by ID', async () => {
      const mockFile = {
        id: 'file-1',
        fileName: 'test.pdf',
        filePath: '/uploads/test.pdf',
      };

      (fs.readFile as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify([mockFile]))
        .mockResolvedValueOnce(mockFileBuffer);

      const result = await storageService.downloadFile('file-1');
      expect(result).toEqual(mockFileBuffer);
    });

    it('should throw error for non-existent file', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue('[]');

      await expect(storageService.downloadFile('non-existent')).rejects.toThrow(
        'File not found'
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const mockFile = {
        id: 'file-1',
        fileName: 'test.pdf',
        filePath: '/uploads/test.pdf',
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify([mockFile]));
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      await storageService.deleteFile('file-1');

      expect(fs.unlink).toHaveBeenCalledWith('/uploads/test.pdf');
    });

    it('should throw error for non-existent file', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue('[]');

      await expect(storageService.deleteFile('non-existent')).rejects.toThrow(
        'File not found'
      );
    });
  });

  describe('getFileMetadata', () => {
    it('should return file metadata', async () => {
      const mockFile = {
        id: 'file-1',
        fileName: 'test.pdf',
        filePath: '/uploads/test.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        category: 'assignment_submission',
        uploadedAt: '2024-01-01T00:00:00.000Z',
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify([mockFile]));

      const result = await storageService.getFileMetadata('file-1');

      expect(result.id).toBe('file-1');
      expect(result.fileName).toBe('test.pdf');
    });

    it('should throw error for non-existent file', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue('[]');

      await expect(storageService.getFileMetadata('non-existent')).rejects.toThrow(
        'File not found'
      );
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      const mockFile = {
        id: 'file-1',
        fileName: 'test.pdf',
        filePath: '/uploads/test.pdf',
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify([mockFile]));
      (fs.access as jest.Mock).mockResolvedValue(undefined);

      const result = await storageService.fileExists('file-1');
      expect(result).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue('[]');

      const result = await storageService.fileExists('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('generateDownloadUrl', () => {
    it('should throw error for local storage', async () => {
      await expect(
        storageService.generateDownloadUrl('file-1')
      ).rejects.toThrow('Download URLs are not supported by local storage');
    });

    it('should throw error for invalid expiresIn', async () => {
      await expect(
        storageService.generateDownloadUrl('file-1', 0)
      ).rejects.toThrow('expiresIn must be greater than zero');
    });
  });
});
