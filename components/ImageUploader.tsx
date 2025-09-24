import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { Spinner } from './Spinner';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imageUrl: string | null;
  isLoading: boolean;
  onReset: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imageUrl, isLoading, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
    // Reset the input value to allow re-uploading the same file
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragEvents = useCallback((e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        onImageUpload(file);
    }
  }, [onImageUpload, handleDragEvents]);

  const isDisabled = isLoading;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 h-full flex flex-col justify-between">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Upload Receipt</h2>
      <div 
        className={`relative flex-grow border-2 border-dashed rounded-xl transition-colors duration-300 flex items-center justify-center
          ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600'}`}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDrop={handleDrop}
        onClick={!imageUrl && !isDisabled ? handleUploadClick : undefined}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isDisabled}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900/50 rounded-xl flex flex-col items-center justify-center z-10">
            <Spinner />
            <p className="text-white mt-4 font-semibold">
              Analyzing receipt...
            </p>
          </div>
        )}
        
        {imageUrl ? (
          <img src={imageUrl} alt="Receipt preview" className="object-contain max-h-full max-w-full rounded-lg p-2" />
        ) : (
          <div className="text-center p-8 cursor-pointer">
            <UploadIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <p className="mt-4 font-semibold text-indigo-600 dark:text-indigo-400">Click to upload or drag and drop</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </div>
       {imageUrl && (
        <div className="mt-4 flex gap-4">
          <button
            onClick={handleUploadClick}
            disabled={isDisabled}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            Upload Another
          </button>
           <button
            onClick={onReset}
            disabled={isDisabled}
            className="w-full bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};