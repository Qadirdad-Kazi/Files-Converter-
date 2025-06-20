import React from 'react';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-blue-900 bg-clip-text text-transparent mb-6 leading-tight">
            Convert Any File Format
            <span className="block text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text">
              Instantly & Securely
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Transform documents, images, audio, and data files between hundreds of formats. 
            No registration required, files processed locally, and results delivered instantly.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Privacy First</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
              <Globe className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">200+ Formats</span>
            </div>
          </div>
          
          <button className="group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            Start Converting Now
            <ArrowRight className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};