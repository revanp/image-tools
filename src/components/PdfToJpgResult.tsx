"use client";

import { useState } from 'react';
import JSZip from 'jszip';
import { ConvertedPdfImage } from '../types/pdf';

interface PdfToJpgResultProps {
  images: ConvertedPdfImage[];
}

export default function PdfToJpgResult({ images }: PdfToJpgResultProps) {
  const [downloadingAll, setDownloadingAll] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadSingle = (image: ConvertedPdfImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = async () => {
    if (images.length === 0) return;
    
    setDownloadingAll(true);
    
    try {
      const zip = new JSZip();
      
      for (const image of images) {
        const response = await fetch(image.url);
        const blob = await response.blob();
        zip.file(image.name, blob);
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'converted-pdf-images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error creating ZIP:', error);
      alert('Error creating download. Please try again.');
    } finally {
      setDownloadingAll(false);
    }
  };

  const totalConvertedSize = images.reduce((sum, img) => sum + img.convertedSize, 0);

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-2xl font-semibold text-black">{images.length}</div>
          <div className="text-sm text-gray-600">Pages Converted</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-lg font-medium text-black">{formatFileSize(totalConvertedSize)}</div>
          <div className="text-sm text-gray-600">Total Size</div>
        </div>
      </div>

      {/* Download All Button */}
      <div className="flex justify-center">
        <button 
          className={`
            bg-black text-white px-6 py-3 rounded-md font-medium transition-all duration-200
            ${downloadingAll 
              ? 'opacity-75 cursor-not-allowed' 
              : 'hover:bg-gray-800 active:bg-gray-900'
            }
          `}
          onClick={downloadAll}
          disabled={downloadingAll}
        >
          {downloadingAll ? (
            <span className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating ZIP...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <span>📦</span>
              <span>Download All as ZIP</span>
            </span>
          )}
        </button>
      </div>

      {/* Individual Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="mb-4">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={image.url} 
                    alt={`Page ${image.pageNumber}`} 
                    className="w-full h-48 object-contain bg-gray-50 rounded border border-gray-200"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    Page {image.pageNumber}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-black text-sm truncate">{image.name}</h3>
                
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span>Size:</span>
                  <span className="font-medium text-black">
                    {formatFileSize(image.convertedSize)}
                  </span>
                </div>
                
                <button 
                  className="w-full bg-gray-100 hover:bg-gray-200 text-black py-2 px-4 rounded-md text-sm font-medium transition-colors"
                  onClick={() => downloadSingle(image)}
                >
                  📥 Download JPG
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
