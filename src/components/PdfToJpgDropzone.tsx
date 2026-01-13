"use client";

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';
import { ConvertedPdfImage } from '../types/pdf';

interface PdfToJpgDropzoneProps {
  onImagesConverted: (images: ConvertedPdfImage[]) => void;
  isConverting: boolean;
  setIsConverting: (converting: boolean) => void;
}

export default function PdfToJpgDropzone({ 
  onImagesConverted, 
  isConverting, 
  setIsConverting 
}: PdfToJpgDropzoneProps) {
  const [conversionProgress, setConversionProgress] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
    }
  }, []);

  const convertPdfToImages = async (file: File): Promise<ConvertedPdfImage[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    const images: ConvertedPdfImage[] = [];

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) continue;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any).promise;

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        images.push({
          name: `${file.name.replace(/\.[^/.]+$/, '')}_page_${i}.jpg`,
          originalSize: file.size, // This is the total PDF size, not per page
          convertedSize: blob.size,
          url: url,
          pageNumber: i,
          totalPages: totalPages,
        });
      }
      
      // Update progress based on pages processed
      // We need to account for multiple files, but for now let's just update per page
      // Ideally this should be handled in the outer loop
    }

    return images;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsConverting(true);
    setConversionProgress(0);

    try {
      const filesToProcess = acceptedFiles.filter(file => file.type === 'application/pdf');

      if (filesToProcess.length === 0) {
        throw new Error('No valid PDF files found');
      }

      const allConvertedImages: ConvertedPdfImage[] = [];
      const totalFiles = filesToProcess.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = filesToProcess[i];
        const images = await convertPdfToImages(file);
        allConvertedImages.push(...images);
        setConversionProgress(((i + 1) / totalFiles) * 100);
      }

      onImagesConverted(allConvertedImages);
    } catch (error) {
      console.error('Conversion error:', error);
      alert('Error converting PDF. Please try again.');
    } finally {
      setIsConverting(false);
      setConversionProgress(0);
    }
  }, [onImagesConverted, setIsConverting]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    disabled: isConverting,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-16 text-center cursor-pointer transition-all duration-300
          ${isDragActive 
            ? 'border-black bg-gray-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${isConverting ? 'cursor-not-allowed opacity-60' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-6">
          {isConverting ? (
            <>
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto text-lg">
                ⚙️
              </div>
              <div>
                <h3 className="text-xl font-medium text-black mb-4">
                  Converting PDF to Images...
                </h3>
                <div className="w-full max-w-md mx-auto">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-black h-2 rounded-full transition-all duration-500"
                      style={{ width: `${conversionProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {Math.round(conversionProgress)}% Complete
                  </p>
                </div>
              </div>
            </>
          ) : isDragActive ? (
            <>
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto text-lg">
                📄
              </div>
              <div>
                <h3 className="text-xl font-medium text-black">
                  Drop your PDF here
                </h3>
                <p className="text-gray-600">
                  Release to start converting
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto text-lg">
                📄
              </div>
              <div>
                <h3 className="text-xl font-medium text-black mb-2">
                  Drop PDF here or click to browse
                </h3>
                <p className="text-gray-600 mb-4">
                  Convert PDF pages to high-quality JPG images
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Documents
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Slides
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    E-books
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {!isConverting && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Max file size: 50MB per PDF • Supported format: PDF
          </p>
        </div>
      )}
    </div>
  );
}
