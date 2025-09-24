import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ReceiptForm } from './components/ReceiptForm';
import { ReceiptTable } from './components/ReceiptTable';
import { SearchBar } from './components/SearchBar';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { extractReceiptInfo } from './services/geminiService';
import type { ReceiptData, ReceiptFormData } from './types';

const App: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptFormData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);
  const [previewedReceipt, setPreviewedReceipt] = useState<ReceiptData | null>(null);

  const [submittedReceipts, setSubmittedReceipts] = useState<ReceiptData[]>(() => {
    try {
      const savedReceipts = window.localStorage.getItem('submittedReceipts');
      return savedReceipts ? JSON.parse(savedReceipts) : [];
    } catch (error) {
      console.error("Could not read receipts from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('submittedReceipts', JSON.stringify(submittedReceipts));
    } catch (error) {
      console.error("Could not save receipts to localStorage:", error);
    }
  }, [submittedReceipts]);


  const handleImageUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setReceiptData(null);
    setEditingReceiptId(null); // Exit edit mode when a new image is uploaded

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setImageUrl(dataUrl); // Use data URL for preview

      const base64String = dataUrl.split(',')[1];
      try {
        const data = await extractReceiptInfo(base64String, file.type);
        setReceiptData(data);
      } catch (e) {
        console.error(e);
        setError('Failed to extract receipt information. Please try another image.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);
  
  const handleReset = () => {
    setImageUrl(null);
    setReceiptData(null);
    setError(null);
    setIsLoading(false);
    setEditingReceiptId(null);
  };

  const handleSubmitReceipt = (formData: ReceiptFormData) => {
    if (editingReceiptId) {
      setSubmittedReceipts(prev => prev.map(r => 
        r.id === editingReceiptId ? { ...r, ...formData } : r
      ));
    } else {
      if (!imageUrl) {
        setError("Cannot submit without an image.");
        return;
      }
      const newReceipt: ReceiptData = {
        ...formData,
        id: `${Date.now()}-${formData.invoiceNumber}`,
        imageUrl: imageUrl,
      };
      setSubmittedReceipts(prev => [...prev, newReceipt]);
    }
    handleReset();
  };

  const handleEditReceipt = (id: string) => {
    const receiptToEdit = submittedReceipts.find(r => r.id === id);
    if (receiptToEdit) {
      const { id: receiptId, imageUrl: receiptImageUrl, ...formData } = receiptToEdit;
      setEditingReceiptId(receiptId);
      setReceiptData(formData);
      setImageUrl(receiptImageUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteReceipt = (id: string) => {
    if (window.confirm('Are you sure you want to delete this receipt? This action cannot be undone.')) {
      setSubmittedReceipts(prev => prev.filter(r => r.id !== id));
      if (id === editingReceiptId) {
        handleReset();
      }
    }
  };
  
  const handleOpenImagePreview = (receipt: ReceiptData) => setPreviewedReceipt(receipt);
  const handleCloseImagePreview = () => setPreviewedReceipt(null);

  const filteredReceipts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return submittedReceipts;
    }
    return submittedReceipts.filter(receipt =>
      receipt.vendorName.toLowerCase().includes(query) ||
      receipt.invoiceNumber.toLowerCase().includes(query)
    );
  }, [submittedReceipts, searchQuery]);


  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
          <div className="lg:pr-4">
             <ImageUploader onImageUpload={handleImageUpload} imageUrl={imageUrl} isLoading={isLoading} onReset={handleReset} />
          </div>

          <div className="lg:pl-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 h-full">
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-lg font-semibold text-indigo-500 dark:text-indigo-400">Extracting information...</p>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">AI is analyzing your receipt.</p>
                </div>
              )}
              {error && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                   <div className="w-16 h-16 text-red-500">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                     </svg>
                   </div>
                   <p className="mt-4 text-lg font-semibold text-red-600 dark:text-red-400">An Error Occurred</p>
                   <p className="mt-2 text-slate-500 dark:text-slate-400">{error}</p>
                 </div>
              )}
              {!isLoading && !error && receiptData && (
                <ReceiptForm 
                    receiptData={receiptData} 
                    setReceiptData={setReceiptData} 
                    onSubmit={handleSubmitReceipt}
                    isEditing={!!editingReceiptId}
                    onCancelEdit={handleReset}
                />
              )}
              {!isLoading && !error && !receiptData && (
                 <div className="flex flex-col items-center justify-center h-full text-center">
                   <div className="w-16 h-16 text-slate-400 dark:text-slate-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0A2.25 2.25 0 016.637 8.25l.493 1.555A2.25 2.25 0 019.348 11.25h5.304c1.09.001 2.053-.742 2.227-1.82l.493-1.555a2.25 2.25 0 012.016-1.526m-16.5 0c.112-.017.227-.026.344-.026" />
                      </svg>
                   </div>
                   <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">Extracted Data</p>
                   <p className="mt-2 text-slate-500 dark:text-slate-400">Upload a receipt to see the extracted information here.</p>
                 </div>
              )}
            </div>
          </div>
        </main>

        {submittedReceipts.length > 0 && (
          <div className="mt-12 space-y-6">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery}
              placeholder="Search by vendor name or invoice number..."
            />
            <ReceiptTable 
              receipts={filteredReceipts} 
              onEdit={handleEditReceipt}
              onDelete={handleDeleteReceipt}
              onImageClick={handleOpenImagePreview}
            />
          </div>
        )}
      </div>
      <ImagePreviewModal receipt={previewedReceipt} onClose={handleCloseImagePreview} />
    </div>
  );
};

export default App;
