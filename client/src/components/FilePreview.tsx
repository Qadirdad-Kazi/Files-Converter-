import React from 'react';
import { FileInfo } from '../types';

interface FilePreviewProps {
  fileInfo: FileInfo;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ fileInfo }) => {
  const { file, type, extension } = fileInfo;
  
  if (type.startsWith('image/')) {
    const imageUrl = URL.createObjectURL(file);
    return (
      <div className="mt-2">
        <img
          src={imageUrl}
          alt={fileInfo.name}
          className="w-full h-32 object-cover rounded-lg"
          onLoad={() => URL.revokeObjectURL(imageUrl)}
        />
      </div>
    );
  }
  
  if (type.startsWith('text/') || extension === 'txt' || extension === 'md') {
    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 mb-1">Text Preview:</p>
        <div className="text-sm text-gray-700 font-mono bg-white p-2 rounded border max-h-20 overflow-y-auto">
          <TextPreview file={file} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">
        {extension.toUpperCase()} file ready for conversion
      </p>
    </div>
  );
};

const TextPreview: React.FC<{ file: File }> = ({ file }) => {
  const [preview, setPreview] = React.useState<string>('Loading...');
  
  React.useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setPreview(text.slice(0, 200) + (text.length > 200 ? '...' : ''));
    };
    reader.readAsText(file);
  }, [file]);
  
  return <span>{preview}</span>;
};