import React from 'react';
import { FileText, Image, Music, Video, Database, Code, Lock, Download } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Documents',
    description: 'PDF, DOCX, TXT, HTML, Markdown and more',
    formats: ['PDF', 'DOCX', 'TXT', 'HTML', 'MD']
  },
  {
    icon: Image,
    title: 'Images',
    description: 'JPG, PNG, GIF, SVG, WebP and more',
    formats: ['JPG', 'PNG', 'GIF', 'SVG', 'WebP']
  },
  {
    icon: Music,
    title: 'Audio',
    description: 'MP3, WAV, OGG, AAC and more',
    formats: ['MP3', 'WAV', 'OGG', 'AAC']
  },
  {
    icon: Video,
    title: 'Video',
    description: 'MP4, AVI, MOV, GIF and more',
    formats: ['MP4', 'AVI', 'MOV', 'GIF']
  },
  {
    icon: Database,
    title: 'Data',
    description: 'JSON, XML, CSV, YAML and more',
    formats: ['JSON', 'XML', 'CSV', 'YAML']
  },
  {
    icon: Code,
    title: 'Code',
    description: 'JS, Python, CSS, HTML and more',
    formats: ['JS', 'PY', 'CSS', 'HTML']
  }
];

const securityFeatures = [
  {
    icon: Lock,
    title: 'Privacy Protected',
    description: 'Files are processed locally and never stored on our servers'
  },
  {
    icon: Download,
    title: 'Instant Download',
    description: 'Get your converted files immediately without any delays'
  }
];

export const Features: React.FC = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Support for All Major File Types
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Convert between hundreds of file formats with just a few clicks
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 hover:border-blue-200">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <div className="flex flex-wrap gap-2">
                {feature.formats.map((format) => (
                  <span key={format} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {format}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200/50">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};