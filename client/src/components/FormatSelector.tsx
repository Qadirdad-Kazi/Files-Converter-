import React, { useState, useEffect } from 'react';
import { FileType, ChevronDown } from 'lucide-react';
import { getSupportedFormats } from '../services/api';
import { FormatsResponse, FormatCategory } from '../types/api';

// Get human-readable format name
const getFormatName = (ext: string): string => {
  const formatNames: Record<string, string> = {
    '.pdf': 'PDF Document',
    '.docx': 'Word Document',
    '.doc': 'Word 97-2003',
    '.odt': 'OpenDocument Text',
    '.rtf': 'Rich Text Format',
    '.txt': 'Plain Text',
    '.xlsx': 'Excel Workbook',
    '.xls': 'Excel 97-2003',
    '.ods': 'OpenDocument Spreadsheet',
    '.csv': 'CSV',
    '.pptx': 'PowerPoint',
    '.ppt': 'PowerPoint 97-2003',
    '.odp': 'OpenDocument Presentation',
    '.jpg': 'JPEG Image',
    '.jpeg': 'JPEG Image',
    '.png': 'PNG Image',
    '.gif': 'GIF Image',
    '.webp': 'WebP Image',
    '.bmp': 'Bitmap Image',
    '.tiff': 'TIFF Image',
    '.svg': 'SVG Vector',
    '.heic': 'HEIC Image',
    '.json': 'JSON',
    '.xml': 'XML',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.md': 'Markdown',
    '.html': 'HTML',
    '.css': 'CSS',
    '.js': 'JavaScript',
    '.ts': 'TypeScript',
    '.jsx': 'JSX',
    '.tsx': 'TSX'
  };
  
  return formatNames[ext.toLowerCase()] || ext.toUpperCase();
};

type FormatSelectorProps = {
  selectedFormat: string;
  onFormatChange: (format: string) => void;
  disabled?: boolean;
  className?: string;
  fileType?: string; // Optional file type to filter available formats
};

const FORMAT_OPTIONS = [
  // Document formats
  { value: 'pdf', label: 'PDF Document (.pdf)' },
  { value: 'docx', label: 'Word Document (.docx)' },
  { value: 'doc', label: 'Word 97-2003 (.doc)' },
  { value: 'odt', label: 'OpenDocument Text (.odt)' },
  { value: 'rtf', label: 'Rich Text Format (.rtf)' },
  { value: 'txt', label: 'Plain Text (.txt)' },
  
  // Spreadsheet formats
  { value: 'xlsx', label: 'Excel Workbook (.xlsx)' },
  { value: 'xls', label: 'Excel 97-2003 (.xls)' },
  { value: 'ods', label: 'OpenDocument Spreadsheet (.ods)' },
  { value: 'csv', label: 'CSV (.csv)' },
  
  // Presentation formats
  { value: 'pptx', label: 'PowerPoint Presentation (.pptx)' },
  { value: 'ppt', label: 'PowerPoint 97-2003 (.ppt)' },
  { value: 'odp', label: 'OpenDocument Presentation (.odp)' },
  
  // Image formats
  { value: 'jpg', label: 'JPEG Image (.jpg)' },
  { value: 'jpeg', label: 'JPEG Image (.jpeg)' },
  { value: 'png', label: 'PNG Image (.png)' },
  { value: 'gif', label: 'GIF Image (.gif)' },
  { value: 'webp', label: 'WebP Image (.webp)' },
  { value: 'bmp', label: 'Bitmap Image (.bmp)' },
  { value: 'tiff', label: 'TIFF Image (.tiff)' },
  { value: 'svg', label: 'SVG Vector (.svg)' },
  { value: 'heic', label: 'HEIC Image (.heic)' },
  
  // E-book formats
  { value: 'epub', label: 'EPUB E-book (.epub)' },
  { value: 'mobi', label: 'Mobipocket (.mobi)' },
  
  // Archive formats
  { value: 'zip', label: 'ZIP Archive (.zip)' },
  { value: 'rar', label: 'RAR Archive (.rar)' },
  { value: '7z', label: '7-Zip Archive (.7z)' },
  
  // Audio formats
  { value: 'mp3', label: 'MP3 Audio (.mp3)' },
  { value: 'wav', label: 'WAV Audio (.wav)' },
  { value: 'flac', label: 'FLAC Audio (.flac)' },
  { value: 'aac', label: 'AAC Audio (.aac)' },
  { value: 'ogg', label: 'OGG Audio (.ogg)' },
  
  // Video formats
  { value: 'mp4', label: 'MP4 Video (.mp4)' },
  { value: 'webm', label: 'WebM Video (.webm)' },
  { value: 'mov', label: 'QuickTime (.mov)' },
  { value: 'avi', label: 'AVI Video (.avi)' },
  
  // Programming and data files
  { value: 'html', label: 'HTML Document (.html)' },
  { value: 'css', label: 'CSS Stylesheet (.css)' },
  { value: 'js', label: 'JavaScript (.js)' },
  { value: 'json', label: 'JSON File (.json)' },
  { value: 'xml', label: 'XML File (.xml)' },
  { value: 'yaml', label: 'YAML File (.yaml/.yml)' },
  { value: 'yml', label: 'YAML File (.yaml/.yml)' },
];



const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormat,
  onFormatChange,
  disabled = false,
  className = '',
  fileType,
}) => {
  const [formatOptions, setFormatOptions] = useState<{value: string, label: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch supported formats from the API
  useEffect(() => {
    const fetchFormats = async () => {
      try {
        setLoading(true);
        const response = await getSupportedFormats();
        
        if (response?.success && response?.data) {
          const responseData = response.data as FormatsResponse['data'];
          let availableFormats: {value: string, label: string}[] = [];
          
          if (fileType) {
            // Determine category based on file extension
            let category: keyof FormatsResponse['data'] | null = null;
            
            if (/\.(jpg|jpeg|png|gif|webp|bmp|tiff|svg|heic)$/i.test(fileType)) {
              category = 'image';
            } else if (/\.(pdf|docx?|odt|rtf|pptx?|odp|xlsx?|ods)$/i.test(fileType)) {
              category = 'document';
            } else if (/\.(json|xml|yaml|yml|csv)$/i.test(fileType)) {
              category = 'data';
            } else if (/\.(txt|md|html?|css|js|ts|jsx|tsx)$/i.test(fileType)) {
              category = 'text';
            }
            
            if (category && responseData[category]?.output) {
              // Get available output formats for this file type
              const outputFormats = responseData[category]?.output || [];
              
              // Map to format options with proper labels
              availableFormats = outputFormats.map((ext: string) => ({
                value: ext.replace(/^\./, ''), // Remove leading dot
                label: `${getFormatName(ext)} (${ext})`
              }));
              
              // Sort formats by label for better UX
              availableFormats.sort((a, b) => a.label.localeCompare(b.label));
            } else {
              // If no specific formats found, show all formats
              const allFormats = new Set<string>();
              
              Object.values(responseData).forEach((cat) => {
                if (cat?.output) {
                  cat.output.forEach((format: string) => allFormats.add(format));
                }
              });
              
              availableFormats = Array.from(allFormats).map(ext => ({
                value: ext.replace(/^\./, ''),
                label: `${getFormatName(ext)} (${ext})`
              })).sort((a, b) => a.label.localeCompare(b.label));
            }
          } else {
            // If no file type provided, show all formats
            const allFormats = new Set<string>();
            
            Object.values(responseData).forEach((cat) => {
              if (cat?.output) {
                cat.output.forEach((format: string) => allFormats.add(format));
              }
            });
            
            availableFormats = Array.from(allFormats).map(ext => ({
              value: ext.replace(/^\./, ''),
              label: `${getFormatName(ext)} (${ext})`
            })).sort((a, b) => a.label.localeCompare(b.label));
          }
          
          // Set the available formats, fallback to default if empty
          const finalFormats = (availableFormats?.length ?? 0) > 0 ? availableFormats : FORMAT_OPTIONS;
          setFormatOptions(finalFormats);
          
          // If the currently selected format is not in the available formats, select the first one
          if (finalFormats.length > 0 && !finalFormats.some(f => f.value === selectedFormat)) {
            onFormatChange(finalFormats[0].value);
          }
        } else {
          // Fallback to hardcoded formats
          setFormatOptions(FORMAT_OPTIONS);
        }
      } catch (err) {
        console.error('Failed to fetch formats:', err);
        setError('Failed to load supported formats');
        setFormatOptions(FORMAT_OPTIONS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormats();
  }, [fileType, selectedFormat, onFormatChange]);

  // Use available formats or fallback to hardcoded ones
  const options = formatOptions.length > 0 ? formatOptions : FORMAT_OPTIONS;
  const selectedOption = options.find(opt => opt.value === selectedFormat) || options[0];

  return (
    <div className={`relative ${className}`}>
      <label htmlFor="format-select" className="block text-sm font-medium text-gray-700 mb-1">
        Convert to:
      </label>
      <div className="relative">
        <select
          id="format-select"
          value={selectedFormat}
          onChange={(e) => onFormatChange(e.target.value)}
          disabled={disabled || loading}
          className="appearance-none block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white disabled:bg-gray-100 disabled:text-gray-500"
        >
          {loading ? (
            <option value="">Loading formats...</option>
          ) : (
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          )}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          {loading ? (
            <span className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></span>
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormatSelector;