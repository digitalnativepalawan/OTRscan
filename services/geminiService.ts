import { GoogleGenAI, Type } from "@google/genai";
import type { ReceiptFormData } from '../types';

const receiptSchema = {
  type: Type.OBJECT,
  properties: {
    vendorName: { type: Type.STRING, description: "The name of the store or vendor. If the name has more than two words, return only the first two words." },
    address: { type: Type.STRING, description: "The full address of the vendor. If not present, use 'N/A'." },
    tin: { type: Type.STRING, description: "The TIN (Taxpayer Identification Number) of the vendor, including 'VAT Reg' or 'Non VAT Reg' if specified. If not present, use 'N/A'." },
    invoiceNumber: { type: Type.STRING, description: "The invoice or receipt number. If not present, use 'N/A'." },
    date: { type: Type.STRING, description: "The date of the transaction in YYYY-MM-DD format. Infer the year if missing." },
    soldTo: { type: Type.STRING, description: "The name of the customer or entity to whom the items were sold. If not present, use 'N/A'." },
    saleType: { type: Type.STRING, description: "The type of sale, either 'Cash' or 'Charge'. Infer from checkboxes or text on the receipt. Default to 'Cash' if unspecified." },
    items: {
      type: Type.ARRAY,
      description: "List of all items purchased. If you cannot find any items, return an empty array.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The name or description of the item." },
          quantity: { type: Type.NUMBER, description: "The quantity of the item purchased. Default to 1 if not specified." },
          unitPrice: { type: Type.NUMBER, description: "The price for a single unit of the item." },
          amount: { type: Type.NUMBER, description: "The total amount for this line item (quantity * unit price)." },
        },
        required: ["name", "quantity", "unitPrice", "amount"]
      }
    },
    totalAmount: { type: Type.NUMBER, description: "The final total amount paid." },
    paymentMethod: { type: Type.STRING, description: "The method of payment (e.g., Credit Card, Cash, Debit Card, Visa). If unknown, use 'Unknown'." },
    authorizedRepresentative: { type: Type.STRING, description: "The name of the authorized representative, if mentioned. If not present, use 'N/A'." },
  },
  required: ["vendorName", "address", "tin", "invoiceNumber", "date", "soldTo", "saleType", "items", "totalAmount", "paymentMethod", "authorizedRepresentative"]
};

export async function extractReceiptInfo(imageBase64: string, mimeType: string): Promise<ReceiptFormData> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: "You are an expert receipt scanner. Analyze the receipt image and extract the vendor name, full address, TIN (VAT Reg or Non VAT Reg), invoice number, date, sale type ('Cash' or 'Charge'), who it was 'Sold To', a list of items with their quantity, unit price, and total amount, the final total amount, the payment method, and the authorized representative. Provide the output in the requested JSON format. If a value is not clearly present, make a reasonable inference or use an appropriate default like 'N/A' or 'Unknown'. For items, if quantity or unit price are not specified, infer them (e.g., quantity of 1). The amount should be the product of quantity and unit price.",
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: receiptSchema,
    },
  });

  const jsonText = response.text.trim();
  try {
    const parsedData = JSON.parse(jsonText);
    // Basic validation to ensure the parsed data looks like ReceiptFormData
    if (
      'vendorName' in parsedData &&
      'address' in parsedData &&
      'tin' in parsedData &&
      'invoiceNumber' in parsedData &&
      'date' in parsedData &&
      'soldTo' in parsedData &&
      'saleType' in parsedData &&
      'items' in parsedData &&
      'totalAmount' in parsedData &&
      'paymentMethod' in parsedData &&
      'authorizedRepresentative' in parsedData
    ) {
      return parsedData as ReceiptFormData;
    } else {
      throw new Error("Parsed JSON does not match the expected ReceiptFormData structure.");
    }
  } catch (error) {
    console.error("Failed to parse JSON response:", jsonText, error);
    throw new Error("Could not parse the data from the receipt.");
  }
}