import React from 'react';
import { Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { ConversionHistoryItem } from '../types/api';

interface ConversionHistoryProps {
  conversions: ConversionHistoryItem[];
}

export const ConversionHistory: React.FC<ConversionHistoryProps> = ({ conversions }) => {
  const handleDownload = (conversion: ConversionHistoryItem) => {
    if (!conversion.downloadUrl) return;
    
    const link = document.createElement('a');
    link.href = conversion.downloadUrl;
    
    // Use name as fallback if originalFile is not available
    const fileName = conversion.originalFile || conversion.name;
    const outputFormat = conversion.outputFormat || conversion.extension;
    
    link.download = `${fileName.split('.')[0]}.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
        <Clock className="w-6 h-6" />
        <span>Conversion History</span>
      </h2>
      
      <div className="space-y-4">
        {conversions.map((conversion, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200/50 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {(conversion.status === 'success' || !conversion.status) ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              
              <div>
                <p className="font-medium text-gray-800">
                  {conversion.originalFile || conversion.name} → {(conversion.outputFormat || conversion.extension).toUpperCase()}
                </p>
                <p className="text-sm text-gray-500">
                  {(conversion.timestamp || conversion.convertedAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            {(conversion.status === 'success' || !conversion.status) && (
              <button
                onClick={() => handleDownload(conversion)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};