import React, { useState } from 'react';
import type { ReceiptFormData, ReceiptItem } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SheetIcon } from './icons/SheetIcon';

interface ReceiptFormProps {
  receiptData: ReceiptFormData;
  setReceiptData: React.Dispatch<React.SetStateAction<ReceiptFormData | null>>;
  onSubmit: (data: ReceiptFormData) => void;
  isEditing: boolean;
  onCancelEdit: () => void;
}

const FormInput: React.FC<{ label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string, error?: string }> = ({ label, value, onChange, type = "text", error }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border rounded-md text-sm shadow-sm placeholder-slate-400
                       focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                       ${error ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
            aria-invalid={!!error}
        />
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
);

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{title}</h3>
        {children}
    </div>
);

const ItemInput: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; readOnly?: boolean; error?: string }> = ({ label, value, onChange, readOnly = false, error }) => (
    <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
        <input
            type="number"
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            className={`mt-1 block w-full px-2 py-1.5 bg-white dark:bg-slate-800 border rounded-md text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 read-only:bg-slate-100 dark:read-only:bg-slate-700 read-only:cursor-not-allowed
                       ${error ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
             aria-invalid={!!error}
        />
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
);


export const ReceiptForm: React.FC<ReceiptFormProps> = ({ receiptData, setReceiptData, onSubmit, isEditing, onCancelEdit }) => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const validate = (): Record<string, string> => {
        const newErrors: Record<string, string> = {};
        if (!receiptData) return newErrors;

        if (!receiptData.vendorName.trim()) newErrors.vendorName = 'Vendor Name is required.';
        if (!receiptData.invoiceNumber.trim()) newErrors.invoiceNumber = 'Invoice Number is required.';
        if (!receiptData.date) newErrors.date = 'Date is required.';
        
        if (typeof receiptData.totalAmount !== 'number' || receiptData.totalAmount <= 0) {
            newErrors.totalAmount = 'Total Amount must be a positive number.';
        }

        receiptData.items.forEach((item, index) => {
            if (!item.name.trim()) {
                newErrors[`items.${index}.name`] = 'Item name is required.';
            }
            if (typeof item.quantity !== 'number' || item.quantity <= 0) {
                newErrors[`items.${index}.quantity`] = 'Qty must be a positive number.';
            }
            if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
                newErrors[`items.${index}.unitPrice`] = 'Unit Price cannot be negative.';
            }
        });

        return newErrors;
    };

    const handleFieldChange = (field: keyof ReceiptFormData, value: string | number) => {
        setReceiptData(prev => prev ? { ...prev, [field]: value } : null);
        if (errors[field]) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleItemChange = (index: number, field: keyof ReceiptItem, value: string | number) => {
        setReceiptData(prev => {
            if (!prev) return null;
            const newItems = [...prev.items];
            const currentItem = { ...newItems[index] };

            if (field === 'name') {
                currentItem[field] = value as string;
            } else {
                currentItem[field] = parseFloat(value as string) || 0;
            }

            if (field === 'quantity' || field === 'unitPrice') {
                currentItem.amount = parseFloat((currentItem.quantity * currentItem.unitPrice).toFixed(2));
            }

            newItems[index] = currentItem;
            return { ...prev, items: newItems };
        });
        
        const errorKey = `items.${index}.${field}`;
        if (errors[errorKey]) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    };
    
    const addItem = () => {
        setReceiptData(prev => prev ? { ...prev, items: [...prev.items, { name: '', quantity: 1, unitPrice: 0, amount: 0 }] } : null);
    };
    
    const removeItem = (index: number) => {
        setReceiptData(prev => prev ? { ...prev, items: prev.items.filter((_, i) => i !== index) } : null);
    };

    const handleSubmit = () => {
        const validationErrors = validate();
        setErrors(validationErrors);
        
        if (Object.keys(validationErrors).length === 0 && receiptData) {
            onSubmit(receiptData);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{isEditing ? 'Edit Information' : 'Extracted Information'}</h2>
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                {/* Vendor Details */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Vendor Name" value={receiptData.vendorName} onChange={(e) => handleFieldChange('vendorName', e.target.value)} error={errors.vendorName} />
                        <FormInput label="VAT Reg TIN / Non VAT Reg TIN" value={receiptData.tin} onChange={(e) => handleFieldChange('tin', e.target.value)} />
                    </div>
                    <FormInput label="Address" value={receiptData.address} onChange={(e) => handleFieldChange('address', e.target.value)} />
                </div>
                
                {/* Invoice Details */}
                <FormSection title="Invoice Details">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Invoice Number" value={receiptData.invoiceNumber} onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)} error={errors.invoiceNumber} />
                            <FormInput label="Date" type="date" value={receiptData.date} onChange={(e) => handleFieldChange('date', e.target.value)} error={errors.date} />
                        </div>
                         <FormInput label="Sold To" value={receiptData.soldTo} onChange={(e) => handleFieldChange('soldTo', e.target.value)} />
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sale Type</label>
                            <div className="flex gap-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="saleType"
                                        value="Cash"
                                        checked={receiptData.saleType === 'Cash'}
                                        onChange={(e) => handleFieldChange('saleType', e.target.value as 'Cash' | 'Charge')}
                                        className="h-4 w-4 accent-indigo-600"
                                    />
                                    <span className="text-sm text-slate-800 dark:text-slate-200">Cash Sales</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="saleType"
                                        value="Charge"
                                        checked={receiptData.saleType === 'Charge'}
                                        onChange={(e) => handleFieldChange('saleType', e.target.value as 'Cash' | 'Charge')}
                                        className="h-4 w-4 accent-indigo-600"
                                    />
                                    <span className="text-sm text-slate-800 dark:text-slate-200">Charge Sales</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </FormSection>

                {/* Items */}
                <FormSection title="Items">
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {receiptData.items.map((item, index) => (
                            <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-grow mr-2">
                                        <input
                                            type="text"
                                            placeholder="Item Name"
                                            value={item.name}
                                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                            className={`w-full px-3 py-2 bg-white dark:bg-slate-700 border rounded-md text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${errors[`items.${index}.name`] ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                                        />
                                        {errors[`items.${index}.name`] && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[`items.${index}.name`]}</p>}
                                    </div>
                                    <button onClick={() => removeItem(index)} className="p-2 text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <ItemInput label="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} error={errors[`items.${index}.quantity`]} />
                                    <ItemInput label="Unit Price" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} error={errors[`items.${index}.unitPrice`]}/>
                                    <ItemInput label="Amount" value={item.amount} onChange={() => {}} readOnly />
                                </div>
                            </div>
                        ))}
                    </div>
                     <button onClick={addItem} className="w-full mt-3 flex items-center justify-center gap-2 bg-indigo-50 dark:bg-slate-700/50 text-indigo-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-colors duration-200">
                        <PlusIcon className="h-5 w-5" />
                        Add Item
                    </button>
                </FormSection>
                
                {/* Summary */}
                <FormSection title="Summary">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Payment Method" value={receiptData.paymentMethod} onChange={(e) => handleFieldChange('paymentMethod', e.target.value)} />
                        <FormInput label="Total Amount" type="number" value={receiptData.totalAmount} onChange={(e) => handleFieldChange('totalAmount', parseFloat(e.target.value) || 0)} error={errors.totalAmount} />
                    </div>
                     <div className="mt-4">
                        <FormInput label="Authorized Representative" value={receiptData.authorizedRepresentative} onChange={(e) => handleFieldChange('authorizedRepresentative', e.target.value)} />
                    </div>
                </FormSection>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
                <button
                    onClick={handleSubmit}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                    <SheetIcon className="h-5 w-5" />
                    {isEditing ? 'Update Receipt' : 'Add to Sheet'}
                </button>
                 {isEditing && (
                    <button
                        onClick={onCancelEdit}
                        type="button"
                        className="w-full sm:w-auto bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};