# Receipt Capture & Extract

This is a web application designed to streamline expense tracking by automatically extracting information from receipt images using Google's Gemini API. Users can upload receipt images, review and edit the extracted data, and store it for later retrieval.

## Features

- **AI-Powered OCR**: Utilizes the Gemini API to intelligently parse and extract key information from receipt images.
- **Image Upload**: Supports drag-and-drop and file selection for uploading receipt images (PNG, JPG, etc.).
- **Editable Data**: Displays extracted data in an intuitive form, allowing users to make corrections or additions.
- **Local Storage**: All submitted receipts are saved securely in the browser's local storage for persistence.
- **Search & Filter**: Easily search through saved receipts by vendor name or invoice number.
- **Data Export**:
  - Export all receipts in the current view to a single CSV file.
  - Export individual receipts, including the receipt image, to a formatted PDF document.
- **Responsive UI**: A clean, modern interface built with Tailwind CSS that works seamlessly on both desktop and mobile devices.
- **Image Preview**: Click on a receipt's thumbnail in the table to view the full-size image in a modal.

## Tech Stack

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **AI/OCR**: Google Gemini API (`@google/genai`)
- **PDF Generation**: `jsPDF` & `jspdf-autotable`

## Getting Started

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox, Safari, Edge).
- A Google Gemini API Key.

### Setup

1.  **API Key Configuration**:
    - This application requires a Google Gemini API key to function.
    - The key must be provided as an environment variable named `API_KEY`. The application is configured to read this key from `process.env.API_KEY`.

2.  **Running the Application**:
    - Since the application uses modern JavaScript modules (`import`/`export`), it needs to be served by a web server.
    - A simple way to do this is to use a tool like the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension for Visual Studio Code.
    - Simply open the project folder in VS Code and click "Go Live" in the status bar.

## Firebase Integration Plan

This project is structured for a smooth transition to Firebase for cloud hosting and storage.

1.  **GitHub Repository**:
    - Initialize a Git repository in the project folder.
    - Commit all the project files.
    - Create a new repository on GitHub and push your code to it.

2.  **Firebase Project Setup**:
    - Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    - In your new project, register a new Web App.
    - Firebase will provide you with a `firebaseConfig` object. Copy this object.

3.  **Update Firebase Config**:
    - Open the `firebase/config.ts` file in this project.
    - Replace the placeholder `firebaseConfig` object with the one you copied from your Firebase project.

4.  **Firebase Hosting**:
    - In the Firebase Console, navigate to the "Hosting" section and follow the setup instructions.
    - You can connect your GitHub repository for continuous deployment, which automatically deploys your app whenever you push changes to your main branch.

5.  **Firebase Cloud Storage (Optional - for permanent image storage)**:
    - If you want to store uploaded images permanently instead of using data URLs in local storage, you can enable Cloud Storage.
    - You would then modify the application to upload images to a Firebase Storage bucket and save the storage URL instead of the full data URL.
