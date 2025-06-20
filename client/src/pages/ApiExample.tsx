import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const ApiExample: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState('pdf');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [conversionResult, setConversionResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setDownloadUrl('');
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file to convert');
      return;
    }

    setIsLoading(true);
    setError('');
    setDownloadUrl('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('outputFormat', outputFormat);

      const response = await axios.post(
        `${API_BASE_URL}/convert`,
        formData,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Create a download URL for the converted file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
      setConversionResult({
        fileName: `${file.name.split('.')[0]}.${outputFormat}`,
        mimeType: response.headers['content-type'],
        size: response.data.size,
      });
    } catch (err: any) {
      console.error('Conversion error:', err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'An error occurred during conversion.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            File Converter API Example
          </h1>
          <p className="text-lg text-gray-600">
            Upload a file and convert it to your desired format
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select File
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {file && (
                <p className="mt-1 text-sm text-gray-500">
                  Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                </p>
              )}
            </div>

            {/* Output Format */}
            <div>
              <label
                htmlFor="outputFormat"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Output Format
              </label>
              <select
                id="outputFormat"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="txt">Text (TXT)</option>
                <option value="html">HTML</option>
                <option value="md">Markdown (MD)</option>
              </select>
            </div>

            {/* Convert Button */}
            <div>
              <button
                onClick={handleConvert}
                disabled={!file || isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  !file || isLoading
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isLoading ? 'Converting...' : 'Convert File'}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Download Link */}
            {downloadUrl && conversionResult && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      File converted successfully!
                    </p>
                    <div className="mt-2">
                      <a
                        href={downloadUrl}
                        download={conversionResult.fileName}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Download {conversionResult.fileName}
                      </a>
                    </div>
                    <div className="mt-1 text-xs text-green-600">
                      {conversionResult.size && (
                        <p>Size: {Math.round(conversionResult.size / 1024)} KB</p>
                      )}
                      <p>Type: {conversionResult.mimeType}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* API Documentation */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            API Documentation
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Convert File
              </h3>
              <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm">
                  <code>
                    {`POST /api/convert

Headers:
  Content-Type: multipart/form-data

Body:
  - file: The file to convert (required)
  - outputFormat: The desired output format (e.g., 'pdf', 'docx', 'txt') (required)

Response:
  - Success: File binary with appropriate Content-Type and Content-Disposition headers
  - Error: JSON with error details`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Get Supported Formats
              </h3>
              <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm">
                  <code>
                    {`GET /api/formats

Response:
  {
    "success": true,
    "data": {
      "document": {
        "input": [".pdf", ".docx", ".doc", ".rtf", ".odt", ".txt", ".md", ".html"],
        "output": [".pdf", ".docx", ".txt", ".html", ".md"]
      },
      "image": {
        "input": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"],
        "output": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".pdf"]
      },
      "text": {
        "input": [".txt", ".md", ".html", ".css", ".js", ".json", ".xml", ".yaml", ".yml"],
        "output": [".txt", ".md", ".html", ".pdf", ".json", ".xml", ".yaml"]
      },
      "data": {
        "input": [".json", ".xml", ".csv", ".yaml", ".yml"],
        "output": [".json", ".xml", ".csv", ".yaml", ".txt"]
      }
    }
  }`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Health Check
              </h3>
              <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm">
                  <code>
                    {`GET /api/health

Response:
  {
    "uptime": 123.45,
    "message": "OK",
    "timestamp": "2023-11-01T12:00:00.000Z",
    "checks": [
      {
        "name": "Memory Usage",
        "status": "ok",
        "data": {
          "rss": "45.5 MB",
          "heapTotal": "32.1 MB",
          "heapUsed": "12.3 MB",
          "external": "5.2 MB"
        }
      },
      {
        "name": "CPU Usage",
        "status": "ok",
        "data": {
          "user": 123456,
          "system": 23456
        }
      },
      {
        "name": "Environment",
        "status": "ok",
        "data": {
          "node": "v18.12.1",
          "platform": "darwin",
          "arch": "x64",
          "env": "development"
        }
      }
    ]
  }`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiExample;
