import React from 'react';
import { FileType, Github, Star } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
              <FileType className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Universal Converter
              </h1>
              <p className="text-sm text-gray-500">Convert any file format instantly</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Star</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors">
              <Github className="w-4 h-4" />
              <span className="text-sm font-medium">GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};