// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  type: string;
  message: string;
  details?: unknown;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common Types
export interface ErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    details?: unknown;
  };
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}
