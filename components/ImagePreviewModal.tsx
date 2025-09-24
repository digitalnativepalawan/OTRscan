import React, { useEffect, useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { LinkIcon } from './icons/LinkIcon';
import type { ReceiptData } from '../types';

interface ImagePreviewModalProps {
  receipt: ReceiptData | null;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ receipt, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (receipt) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setCopied(false); // Reset copied state when modal opens
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [receipt, onClose]);

  if (!receipt) {
    return null;
  }

  const getFileExtension = (dataUrl: string): string => {
    try {
        const mimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
        return mimeType.split('/')[1] || 'png';
    } catch(e) {
        return 'png';
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = receipt.imageUrl;
    const extension = getFileExtension(receipt.imageUrl);
    const fileName = `receipt-${receipt.invoiceNumber || receipt.id}.${extension}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(receipt.imageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      alert('Failed to copy link.');
    });
  };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ease-out animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
      `}</style>
      <div 
        className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 max-w-4xl w-11/12 max-h-[90vh] animate-scale-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute -top-4 -right-4 bg-white dark:bg-slate-700 rounded-full p-2 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all z-10"
          aria-label="Close image preview"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
        <div className="flex-grow min-h-0">
             <img src={receipt.imageUrl} alt={`Receipt for ${receipt.vendorName}`} className="object-contain w-full h-full max-h-[calc(90vh-100px)] rounded" />
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-center items-center gap-4">
            <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-colors duration-200"
            >
                <DownloadIcon className="h-5 w-5" />
                <span>Download Image</span>
            </button>
            <button
                onClick={handleCopy}
                disabled={copied}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 transition-colors duration-200 disabled:opacity-75"
            >
                <LinkIcon className="h-5 w-5" />
                <span>{copied ? 'Copied!' : 'Copy Data URL'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};