export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface ReceiptFormData {
  vendorName: string;
  address: string;
  tin: string;
  invoiceNumber: string;
  date: string;
  soldTo: string;
  saleType: 'Cash' | 'Charge';
  items: ReceiptItem[];
  totalAmount: number;
  paymentMethod: string;
  authorizedRepresentative: string;
}

export interface ReceiptData extends ReceiptFormData {
  id: string;
  imageUrl: string;
}