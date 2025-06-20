import React from 'react';
import { Loader2, CheckCircle, XCircle, Download } from 'lucide-react';

type ConversionResultProps = {
  isConverting: boolean;
  downloadUrl: string;
  error: string;
  fileName?: string;
  targetFormat: string;
};

const ConversionResult: React.FC<ConversionResultProps> = ({
  isConverting,
  downloadUrl,
  error,
  fileName,
  targetFormat,
}) => {
  if (isConverting) {
    return (
      <div className="mt-6 p-6 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Converting your file...</h3>
          <p className="mt-1 text-sm text-gray-500">
            {fileName ? (
              `Converting ${fileName} to ${targetFormat.toUpperCase()}. Please wait.`
            ) : (
              'Converting your file. Please wait.'
            )}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-6 border-2 border-dashed border-red-200 rounded-lg bg-red-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error during conversion</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (downloadUrl) {
    return (
      <div className="mt-6 p-6 border-2 border-dashed border-green-200 rounded-lg bg-green-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-green-800">Conversion complete!</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Your file has been converted to {targetFormat.toUpperCase()}.</p>
            </div>
            <div className="mt-4">
              <a
                href={downloadUrl}
                download={`${fileName ? fileName.split('.').slice(0, -1).join('.') : 'converted'}.${targetFormat}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Download className="-ml-1 mr-2 h-4 w-4" />
                Download {targetFormat.toUpperCase()} File
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null; // Don't render anything if no conversion has been attempted
};

export default ConversionResult;