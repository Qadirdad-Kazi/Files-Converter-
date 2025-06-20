export interface FileInfo {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  extension: string;
  preview?: string;
  status?: 'pending' | 'converting' | 'completed' | 'error';
  error?: string;
  downloadUrl?: string;
}

export interface ConversionOption {
  format: string;
  label: string;
  description: string;
  disabled?: boolean;
}

export interface ConversionResult {
  id: string;
  fileId: string;
  fileName: string;
  format: string;
  downloadUrl: string;
  size: number;
  timestamp: number;
}

export const SUPPORTED_FORMATS = {
  // Document formats
  pdf: { mime: 'application/pdf', extensions: ['.pdf'] },
  docx: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extensions: ['.docx'] },
  doc: { mime: 'application/msword', extensions: ['.doc'] },
  txt: { mime: 'text/plain', extensions: ['.txt'] },
  rtf: { mime: 'application/rtf', extensions: ['.rtf'] },
  
  // Image formats
  jpg: { mime: 'image/jpeg', extensions: ['.jpg', '.jpeg'] },
  png: { mime: 'image/png', extensions: ['.png'] },
  gif: { mime: 'image/gif', extensions: ['.gif'] },
  bmp: { mime: 'image/bmp', extensions: ['.bmp'] },
  webp: { mime: 'image/webp', extensions: ['.webp'] },
  svg: { mime: 'image/svg+xml', extensions: ['.svg'] },
  
  // Data formats
  json: { mime: 'application/json', extensions: ['.json'] },
  xml: { mime: 'application/xml', extensions: ['.xml'] },
  csv: { mime: 'text/csv', extensions: ['.csv'] },
  yaml: { mime: 'application/x-yaml', extensions: ['.yaml', '.yml'] },
  
  // Other
  html: { mime: 'text/html', extensions: ['.html', '.htm'] },
  md: { mime: 'text/markdown', extensions: ['.md', '.markdown'] },
};

export type SupportedFormat = keyof typeof SUPPORTED_FORMATS;
