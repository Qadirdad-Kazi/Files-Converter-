import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import FileUpload from './components/FileUpload';
import FormatSelector from './components/FormatSelector';
import ConversionResult from './components/ConversionResult';
import { ConversionHistory } from './components/ConversionHistory';
import { FilePreview } from './components/FilePreview';
import ApiExample from './pages/ApiExample';
import { convertFile, getSupportedFormats } from './services/api';
import { ConversionResponse, ConversionHistoryItem } from './types/api';

// Main App component with routing
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/api-example" element={<ApiExample />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Something went wrong. Please try again later.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Home page component
function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('pdf');
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [conversionHistory, setConversionHistory] = useState<ConversionHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setError('');
    // Reset download URL when a new file is selected
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
    }
  };

  const handleConvert = useCallback(async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setError('');

    try {
      // Call the actual API to convert the file
      const blob = await convertFile(selectedFile, targetFormat);
      
      // Create a download URL for the converted file
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      // Add to conversion history
      const newConversion = {
        id: `conv-${Date.now()}`,
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        extension: selectedFile.name.split('.').pop() || '',
        convertedAt: new Date()
      };
      
      setConversionHistory(prev => [newConversion, ...prev].slice(0, 10)); // Keep last 10 items
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to convert file. Please try again.';
      setError(errorMessage);
      console.error('Conversion error:', err);
    } finally {
      setIsConverting(false);
    }
  }, [selectedFile, targetFormat]);

  // Load conversion history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // TODO: Replace with actual API call to fetch history
        // const history = await fetchConversionHistory();
        // setConversionHistory(history);
        setIsLoadingHistory(false);
      } catch (err) {
        console.error('Failed to load conversion history:', err);
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="min-h-full">
      <ErrorBoundary>
        <Hero />
      </ErrorBoundary>
      
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* File Conversion Section */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">File Conversion</h2>
              <p className="mt-1 text-sm text-gray-500">
                Upload a file and select the target format to convert it.
              </p>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-6">
                {!selectedFile ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select a file
                    </label>
                    <FileUpload onFileUpload={handleFileUpload} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">File Preview</h3>
                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 bg-blue-100 p-2 rounded-md">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {selectedFile.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <span className="sr-only">Remove</span>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <FormatSelector
                        selectedFormat={targetFormat}
                        onFormatChange={setTargetFormat}
                        disabled={isConverting}
                        fileType={selectedFile?.name}
                      />

                      <button
                        type="button"
                        onClick={handleConvert}
                        disabled={isConverting}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          isConverting
                            ? 'bg-blue-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                      >
                        {isConverting ? 'Converting...' : 'Convert File'}
                      </button>

                      <ConversionResult
                        isConverting={isConverting}
                        downloadUrl={downloadUrl}
                        error={error}
                        fileName={selectedFile?.name}
                        targetFormat={targetFormat}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Features />
      </div>

      {/* Conversion History */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Conversions</h2>
        <ConversionHistory conversions={[]} />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} File Converter. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
