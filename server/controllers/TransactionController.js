const Transaction = require('../models/Transaction');

// Get all transactions
exports.getTransactions = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ 
                error: 'Authentication error',
                message: 'User not authenticated' 
            });
        }

        const transactions = await Transaction.find({ userId }).sort({ date: -1 });
        console.log(`Fetched ${transactions.length} transactions for user ${userId}`);
        
        res.json(transactions);
    } catch (err) {
        console.error('Error fetching transactions:', err.message);
        res.status(500).json({ 
            error: 'Server error', 
            message: 'Failed to fetch transactions',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Add a new transaction
exports.addTransaction = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ 
                error: 'Authentication error',
                message: 'User not authenticated' 
            });
        }

        const { 
            type, 
            amount, 
            date, 
            category, 
            notes, 
            text, 
            source = 'manual',
            season,
            cropType,
            farmLocation
        } = req.body;
        
        // Validation
        if (!type || !['income', 'expense'].includes(type)) {
            return res.status(400).json({ 
                error: 'Validation error',
                message: 'Transaction type must be either "income" or "expense"' 
            });
        }
        
        if (!text || text.trim() === '') {
            return res.status(400).json({ 
                error: 'Validation error',
                message: 'Transaction description is required' 
            });
        }
        
        if (!category) {
            return res.status(400).json({ 
                error: 'Validation error',
                message: 'Category is required' 
            });
        }
        
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ 
                error: 'Validation error',
                message: 'Amount must be a valid positive number' 
            });
        }

        // Create new transaction with user ID
        const transaction = new Transaction({
            userId,
            type,
            text: text.trim(), 
            amount: parsedAmount,
            date: date ? new Date(date) : new Date(),
            category,
            notes: notes || '',
            source,
            season: season || 'Year-round',
            cropType: cropType || '',
            farmLocation: farmLocation || ''
        });
        
        const savedTransaction = await transaction.save();
        console.log('Transaction created for user:', userId, 'Transaction ID:', savedTransaction._id);
        
        res.status(201).json(savedTransaction);
    } catch (err) {
        console.error('Error adding transaction:', err.message);
        
        // Handle validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation error',
                message: Object.values(err.errors).map(e => e.message).join(', ')
            });
        }
        
        res.status(500).json({ 
            error: 'Server error', 
            message: 'Failed to add transaction',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get filtered transactions
exports.getFilteredTransactions = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ 
                error: 'Authentication error',
                message: 'User not authenticated' 
            });
        }

        const filters = req.body;
        const transactions = await Transaction.getFilteredTransactions(filters, userId);
        console.log(`Fetched ${transactions.length} filtered transactions for user ${userId}`);
        res.json(transactions);
    } catch (err) {
        console.error('Error fetching filtered transactions:', err.message);
        res.status(500).json({ 
            error: 'Server error', 
            message: 'Failed to fetch filtered transactions',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ 
                error: 'Authentication error',
                message: 'User not authenticated' 
            });
        }

        const { id } = req.params;
        
        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                error: 'Invalid ID format',
                message: 'Transaction ID is not valid'
            });
        }
        
        // Find and delete transaction only if it belongs to the user
        const transaction = await Transaction.findOneAndDelete({ _id: id, userId });
        
        if (!transaction) {
            return res.status(404).json({ 
                error: 'Not found',
                message: 'Transaction not found or you do not have permission to delete it' 
            });
        }
        
        console.log('Transaction deleted for user:', userId, 'Transaction ID:', id);
        res.json({ 
            message: 'Transaction deleted successfully', 
            id,
            deletedTransaction: transaction
        });
    } catch (err) {
        console.error('Error deleting transaction:', err.message);
        res.status(500).json({ 
            error: 'Server error',
            message: 'Failed to delete transaction',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get transaction statistics
exports.getTransactionStats = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ 
                error: 'Authentication error',
                message: 'User not authenticated' 
            });
        }

        const stats = await Transaction.getSummary(userId);
        res.json(stats);
    } catch (err) {
        console.error('Error getting stats:', err.message);
        res.status(500).json({ 
            error: 'Server error',
            message: 'Failed to get statistics',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get categories
exports.getCategories = async (req, res) => {
    try {
        const categories = [
            // Income categories
            'Salary', 'Freelance', 'Business', 'Investment', 'Bonus', 'Other Income',
            // Expense categories
            'Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Healthcare', 
            'Entertainment', 'Shopping', 'Education', 'Travel', 'Insurance', 'Other'
        ];
        res.json(categories);
    } catch (err) {
        console.error('Error getting categories:', err.message);
        res.status(500).json({ 
            error: 'Server error',
            message: 'Failed to get categories',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get seasons
exports.getSeasons = async (req, res) => {
    try {
        const seasons = ['Kharif', 'Rabi', 'Zaid', 'Year-round'];
        res.json(seasons);
    } catch (err) {
        console.error('Error getting seasons:', err.message);
        res.status(500).json({ 
            error: 'Server error',
            message: 'Failed to get seasons',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get crop types
exports.getCropTypes = async (req, res) => {
    try {
        const cropTypes = [
            'Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Soybean', 'Groundnut', 'Sunflower',
            'Potato', 'Onion', 'Tomato', 'Chilli', 'Turmeric', 'Ginger', 'Coconut', 'Mango',
            'Banana', 'Grapes', 'Pomegranate', 'Guava', 'Papaya', 'Other'
        ];
        res.json(cropTypes);
    } catch (err) {
        console.error('Error getting crop types:', err.message);
        res.status(500).json({ 
            error: 'Server error',
            message: 'Failed to get crop types',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};
