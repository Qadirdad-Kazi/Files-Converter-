import React, { useState } from 'react';
import { ArrowRight, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { FileInfo, ConversionOption, SUPPORTED_FORMATS } from '../types';

interface ConversionPanelProps {
  files: FileInfo[];
  onConversionComplete: (conversion: any) => void;
}

const getOutputFormats = (extension: string): ConversionOption[] => {
  const ext = extension.toLowerCase();
  
  // Document formats
  if (['.pdf', '.docx', '.doc', '.txt', '.rtf'].includes(ext)) {
    return [
      { format: 'pdf', label: 'PDF', description: 'Portable Document Format' },
      { format: 'docx', label: 'DOCX', description: 'Microsoft Word Document' },
      { format: 'txt', label: 'TXT', description: 'Plain Text' },
      { format: 'html', label: 'HTML', description: 'Web Page' },
      { format: 'md', label: 'Markdown', description: 'Markdown Document' }
    ];
  }
  
  // Image formats
  if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg'].includes(ext)) {
    return [
      { format: 'jpg', label: 'JPG', description: 'JPEG Image' },
      { format: 'png', label: 'PNG', description: 'Portable Network Graphics' },
      { format: 'gif', label: 'GIF', description: 'Graphics Interchange Format' },
      { format: 'webp', label: 'WebP', description: 'Modern Web Image' },
      { format: 'pdf', label: 'PDF', description: 'Portable Document Format' }
    ];
  }
  
  // Text/Data formats
  if (['.json', '.xml', '.csv', '.yaml', '.yml', '.txt'].includes(ext)) {
    return [
      { format: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
      { format: 'xml', label: 'XML', description: 'Extensible Markup Language' },
      { format: 'csv', label: 'CSV', description: 'Comma-Separated Values' },
      { format: 'yaml', label: 'YAML', description: 'YAML Ain\'t Markup Language' },
      { format: 'txt', label: 'TXT', description: 'Plain Text' }
    ];
  }
  
  // Default options
  return [
    { format: 'txt', label: 'TXT', description: 'Plain Text' },
    { format: 'pdf', label: 'PDF', description: 'Portable Document Format' }
  ];
};

export const ConversionPanel: React.FC<ConversionPanelProps> = ({
  files,
  onConversionComplete
}) => {
  const [selectedFormats, setSelectedFormats] = useState<{ [fileId: string]: string }>({});
  const [converting, setConverting] = useState<{ [fileId: string]: boolean }>({});
  const [results, setResults] = useState<{ [fileId: string]: any }>({});
  
  const handleFormatChange = (fileId: string, format: string) => {
    setSelectedFormats(prev => ({ ...prev, [fileId]: format }));
  };
  
  const handleConvert = async (fileInfo: FileInfo) => {
    const outputFormat = selectedFormats[fileInfo.id];
    if (!outputFormat) return;
    
    setConverting(prev => ({ ...prev, [fileInfo.id]: true }));
    
    try {
      const formData = new FormData();
      formData.append('file', fileInfo.file);
      formData.append('outputFormat', outputFormat);
      
      const response = await fetch('http://localhost:3001/api/convert', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Conversion failed');
      }
      
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const result = {
        id: fileInfo.id,
        originalFile: fileInfo.name,
        outputFormat,
        downloadUrl,
        timestamp: new Date(),
        status: 'success' as const
      };
      
      setResults(prev => ({ ...prev, [fileInfo.id]: result }));
      onConversionComplete(result);
      
    } catch (error) {
      const result = {
        id: fileInfo.id,
        originalFile: fileInfo.name,
        outputFormat,
        timestamp: new Date(),
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setResults(prev => ({ ...prev, [fileInfo.id]: result }));
    } finally {
      setConverting(prev => ({ ...prev, [fileInfo.id]: false }));
    }
  };
  
  const handleDownload = (result: any) => {
    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.download = `${result.originalFile.split('.')[0]}.${result.outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Convert Your Files</h2>
      
      <div className="space-y-6">
        {files.map((fileInfo) => {
          const outputFormats = getOutputFormats(`.${fileInfo.extension}`);
          const isConverting = converting[fileInfo.id];
          const result = results[fileInfo.id];
          
          return (
            <div key={fileInfo.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{fileInfo.name}</h3>
                  <p className="text-sm text-gray-500">
                    {fileInfo.extension.toUpperCase()} • {(fileInfo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                {result && (
                  <div className="flex items-center space-x-2">
                    {result.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Convert to:
                  </label>
                  <select
                    value={selectedFormats[fileInfo.id] || ''}
                    onChange={(e) => handleFormatChange(fileInfo.id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isConverting}
                  >
                    <option value="">Select output format</option>
                    {outputFormats.map((option) => (
                      <option key={option.format} value={option.format}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!result && (
                    <button
                      onClick={() => handleConvert(fileInfo)}
                      disabled={!selectedFormats[fileInfo.id] || isConverting}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Converting...</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          <span>Convert</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  {result && result.status === 'success' && (
                    <button
                      onClick={() => handleDownload(result)}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>
              
              {result && result.status === 'error' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">
                    Conversion failed: {result.error}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};