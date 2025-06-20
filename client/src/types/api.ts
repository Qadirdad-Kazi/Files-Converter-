/**
 * TypeScript definitions for API responses
 */

// Base response interface for all API calls
export interface ApiResponse {
  success: boolean;
  error?: string;
  stack?: string;
}

// Format category for supported formats
export interface FormatCategory {
  input: string[];
  output: string[];
}

// Response for getSupportedFormats API call
export interface FormatsResponse extends ApiResponse {
  data: {
    document?: FormatCategory;
    image?: FormatCategory;
    data?: FormatCategory;
    text?: FormatCategory;
  };
}

// Response for convertFile API call
export interface ConversionResponse extends ApiResponse {
  data: Blob;
  mimeType?: string;
  fileName?: string;
}

// Conversion history item
export interface ConversionHistoryItem {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  convertedAt: Date;
  // Additional properties used in ConversionHistory component
  downloadUrl?: string;
  originalFile?: string;
  outputFormat?: string;
  status?: 'success' | 'error';
  timestamp?: Date;
}
