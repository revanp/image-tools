"use client";

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import PdfToJpgResult from '../../components/PdfToJpgResult';
import { ConvertedPdfImage } from '../../types/pdf';

const PdfToJpgDropzone = dynamic(() => import('../../components/PdfToJpgDropzone'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">Loading converter...</div>
    </div>
  ),
});

export default function PdfToJpgPage() {
  const [convertedImages, setConvertedImages] = useState<ConvertedPdfImage[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const handleImagesConverted = (images: ConvertedPdfImage[]) => {
    setConvertedImages(prev => [...prev, ...images]);
  };

  const handleClearAll = () => {
    setConvertedImages([]);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <h1 className="text-lg sm:text-xl font-medium text-black">
                PDF to JPG Converter
              </h1>
              <div className="flex space-x-2 text-sm">
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  WebP Converter
                </Link>
                <span className="text-gray-400">•</span>
                <span className="text-black">PDF to JPG</span>
              </div>
            </div>
            <a 
              href="https://revanpratamas.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-black transition-colors self-start sm:self-auto"
            >
              revanpratamas.com →
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-black mb-4 sm:mb-6 leading-tight">
            Convert PDF to JPG
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            Turn your PDF documents into high-quality JPG images instantly.
            Perfect for sharing, editing, and viewing on any device.
          </p>
        </div>

        {/* Dropzone */}
        <div className="mb-12 sm:mb-16">
          <PdfToJpgDropzone 
            onImagesConverted={handleImagesConverted}
            isConverting={isConverting}
            setIsConverting={setIsConverting}
          />
        </div>

        {/* Results */}
        {convertedImages.length > 0 && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h3 className="text-xl sm:text-2xl font-medium text-black">
                Results ({convertedImages.length} {convertedImages.length === 1 ? 'page' : 'pages'})
              </h3>
              <button 
                className="text-sm text-gray-600 hover:text-black transition-colors border border-gray-300 px-4 py-2 rounded-md hover:border-gray-400 self-start sm:self-auto"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
            
            <PdfToJpgResult images={convertedImages} />
          </div>
        )}

        {/* Features */}
        <div className="mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg">
                ⚡
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Fast Conversion</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Convert multi-page PDFs to images in seconds
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg">
                🔒
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Files are processed locally in your browser
              </p>
            </div>
            
            <div className="text-center sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg">
                ✨
              </div>
              <h3 className="text-lg font-medium text-black mb-2">High Quality</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get crisp, clear JPG images from your documents
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 sm:mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-600 space-y-4 sm:space-y-0">
            <p>© 2025 Revan Pratama. All rights reserved.</p>
            <div className="flex space-x-6">
              <a 
                href="https://github.com/revanp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-black transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
