import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

const ReceiptUpload = ({ addReceiptTransaction, addMultipleTransactionsFromReceipt }) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a valid image (JPEG, PNG) or PDF file.');
            return;
        }

        // Validate file size (20MB limit)
        if (file.size > 20 * 1024 * 1024) {
            setError('File size must be less than 20MB.');
            return;
        }

        setError(null);
        setUploadedFile(file);
        setProcessing(true);

        try {
            // Simulate file upload and OCR processing
            const formData = new FormData();
            formData.append('receipt', file);

            // Mock OCR processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock extracted data
            const mockExtractedData = {
                type: 'single',
                transactionCount: 1,
                transactions: [{
                    id: 0,
                    type: 'expense',
                    amount: Math.floor(Math.random() * 5000) + 100,
                    date: new Date().toISOString().split('T')[0],
                    category: 'Food & Dining',
                    text: 'Receipt Transaction',
                    notes: 'Extracted from receipt',
                    confidence: 0.95,
                    needsReview: false,
                    extractedFields: {
                        merchant: 'Sample Store',
                        location: 'Sample Location',
                        time: '12:30',
                        tax: 0,
                        total: 0,
                        itemCount: 1,
                        paymentMethod: 'Card'
                    }
                }],
                summary: {
                    totalAmount: 0,
                    merchant: 'Sample Store',
                    date: new Date().toISOString().split('T')[0]
                }
            };

            setExtractedData(mockExtractedData);
        } catch (error) {
            console.error('Error processing receipt:', error);
            setError('Failed to process receipt. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleAddTransaction = async (transactionData) => {
        try {
            setUploading(true);
            await addReceiptTransaction(transactionData);
            setUploadedFile(null);
            setExtractedData(null);
            setError(null);
            alert('Transaction added successfully!');
        } catch (error) {
            console.error('Error adding transaction:', error);
            alert('Failed to add transaction. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleAddMultipleTransactions = async () => {
        try {
            setUploading(true);
            await addMultipleTransactionsFromReceipt(extractedData.transactions);
            setUploadedFile(null);
            setExtractedData(null);
            setError(null);
            alert('Transactions added successfully!');
        } catch (error) {
            console.error('Error adding transactions:', error);
            alert('Failed to add transactions. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const resetUpload = () => {
        setUploadedFile(null);
        setExtractedData(null);
        setError(null);
        setProcessing(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Upload Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-gradient-to-r from-blue-500 to-blue-600">
                        <Upload className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Upload Receipt</h2>
                    <p className="text-gray-600 mt-2">Upload a receipt image to automatically extract transaction data</p>
                </div>

                {!uploadedFile ? (
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            dragActive
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                            Drag and drop your receipt here
                        </p>
                        <p className="text-gray-600 mb-4">or</p>
                        <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={handleFileInput}
                            />
                        </label>
                        <p className="text-sm text-gray-500 mt-4">
                            Supports JPEG, PNG, and PDF files up to 20MB
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <FileText className="h-8 w-8 text-gray-600" />
                                <div>
                                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={resetUpload}
                                className="p-2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {processing && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Processing receipt...</p>
                            </div>
                        )}

                        {extractedData && (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 text-green-600">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-medium">Receipt processed successfully!</span>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-2">Extracted Data</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">Merchant:</span> {extractedData.summary.merchant}</p>
                                        <p><span className="font-medium">Date:</span> {extractedData.summary.date}</p>
                                        <p><span className="font-medium">Transactions:</span> {extractedData.transactionCount}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {extractedData.transactions.map((transaction, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900">
                                                    Transaction {index + 1}
                                                </h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    transaction.type === 'income' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p><span className="font-medium">Amount:</span> ₹{transaction.amount}</p>
                                                    <p><span className="font-medium">Category:</span> {transaction.category}</p>
                                                </div>
                                                <div>
                                                    <p><span className="font-medium">Description:</span> {transaction.text}</p>
                                                    <p><span className="font-medium">Confidence:</span> {(transaction.confidence * 100).toFixed(1)}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex space-x-3">
                                    {extractedData.transactionCount === 1 ? (
                                        <button
                                            onClick={() => handleAddTransaction(extractedData.transactions[0])}
                                            disabled={uploading}
                                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {uploading ? 'Adding...' : 'Add Transaction'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleAddMultipleTransactions}
                                            disabled={uploading}
                                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {uploading ? 'Adding...' : `Add ${extractedData.transactionCount} Transactions`}
                                        </button>
                                    )}
                                    <button
                                        onClick={resetUpload}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">Error</span>
                        </div>
                        <p className="text-red-700 mt-1">{error}</p>
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-800 mb-3">💡 Tips for Better Results</h3>
                <ul className="text-sm text-blue-700 space-y-2">
                    <li>• Ensure the receipt is well-lit and clearly visible</li>
                    <li>• Avoid blurry or low-resolution images</li>
                    <li>• Make sure all text is readable and not cut off</li>
                    <li>• For best results, use high-quality images or PDFs</li>
                </ul>
            </div>
        </div>
    );
};

export default ReceiptUpload;