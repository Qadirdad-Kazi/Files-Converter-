import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon } from 'lucide-react';

type FileUploadProps = {
  onFileUpload: (file: File) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
  maxSize?: number;
};

const DEFAULT_ACCEPT = {
  // Document formats
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc', '.dot'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx', '.dotx'],
  'application/vnd.ms-excel': ['.xls', '.xlt'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx', '.xlsm', '.xltx'],
  'application/vnd.ms-powerpoint': ['.ppt', '.pot', '.pps'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx', '.potx', '.ppsx'],
  'application/rtf': ['.rtf'],
  'application/json': ['.json'],
  'application/xml': ['.xml'],
  
  // Image formats
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif', '.heic', '.heif'],
  
  // Archive formats
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'application/x-7z-compressed': ['.7z'],
  'application/x-tar': ['.tar'],
  'application/gzip': ['.gz'],
  
  // E-book formats
  'application/epub+zip': ['.epub'],
  'application/x-mobipocket-ebook': ['.mobi'],
  'application/vnd.amazon.ebook': ['.azw'],
  
  // Audio formats
  'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.wma'],
  
  // Video formats
  'video/*': ['.mp4', '.webm', '.mov', '.avi', '.wmv', '.flv', '.mkv', '.m4v'],
  
  // Text and programming files
  'text/plain': ['.txt', '.csv', '.tsv', '.md', '.markdown', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.sass', '.less', '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.php', '.rb', '.go', '.swift', '.kt', '.dart', '.rs', '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd', '.yaml', '.yml'],
  
  // YAML specific
  'application/x-yaml': ['.yaml', '.yml'],
};

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  maxFiles = 1,
  accept = DEFAULT_ACCEPT,
  maxSize = 10 * 1024 * 1024, // 10MB
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setError(null);
      
      // Handle rejected files
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0].code === 'file-too-large') {
          setError(`File is too large. Max size is ${maxSize / (1024 * 1024)}MB`);
        } else if (rejection.errors[0].code === 'file-invalid-type') {
          setError('Invalid file type. Please upload a supported file format.');
        } else {
          setError('Error uploading file. Please try again.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive || isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="flex justify-center">
            <UploadIcon className="h-12 w-12 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600">
            {isDragActive
              ? 'Drop the file here'
              : 'Drag and drop a file here, or click to select'}
          </p>
          <p className="text-xs text-gray-500">
            Supported formats: PDF, DOC, DOCX, TXT, Images (max {maxSize / (1024 * 1024)}MB)
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
