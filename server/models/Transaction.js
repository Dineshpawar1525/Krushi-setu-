const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    // User association
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    
    type: { 
        type: String, 
        enum: ['income', 'expense'], 
        required: [true, 'Transaction type is required'] 
    },
    amount: { 
        type: Number, 
        required: [true, 'Amount is required'], 
        validate: { 
            validator: function(value) { 
                return typeof value === 'number' && !isNaN(value) && value > 0; 
            }, 
            message: 'Amount must be a valid positive number' 
        },
        set: function(value) {
            return parseFloat(value);
        }
    },
    date: { 
        type: Date, 
        required: [true, 'Date is required'], 
        default: Date.now 
    },
    category: { 
        type: String, 
        required: [true, 'Category is required'], 
        enum: [
            // Income categories
            'Salary', 'Freelance', 'Business', 'Investment', 'Bonus', 'Other Income',
            // Expense categories
            'Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Healthcare', 
            'Entertainment', 'Shopping', 'Education', 'Travel', 'Insurance', 'Other'
        ] 
    },
    text: { 
        type: String, 
        required: [true, 'Transaction description is required'], 
        trim: true, 
        minlength: [1, 'Description must be at least 1 character'], 
        maxlength: [200, 'Description cannot exceed 200 characters'] 
    },
    notes: { 
        type: String, 
        trim: true, 
        maxlength: [500, 'Notes cannot exceed 500 characters'] 
    },
    source: { 
        type: String, 
        enum: ['manual', 'receipt'], 
        default: 'manual' 
    },
    receiptUrl: { 
        type: String,
        required: function() { 
            return this.source === 'receipt'; 
        } 
    },
    
    // Agricultural specific fields
    season: {
        type: String,
        enum: ['Kharif', 'Rabi', 'Zaid', 'Year-round'],
        default: 'Year-round'
    },
    cropType: {
        type: String,
        trim: true
    },
    farmLocation: {
        type: String,
        trim: true
    },
    
    // Metadata
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

// Virtual for formatted amount
TransactionSchema.virtual('formattedAmount').get(function() {
    return `₹${this.amount.toLocaleString()}`;
});

// Virtual for transaction type display
TransactionSchema.virtual('typeDisplay').get(function() {
    return this.type === 'income' ? 'Income' : 'Expense';
});

// Index for better query performance
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ amount: 1 });
TransactionSchema.index({ userId: 1 });
TransactionSchema.index({ season: 1 });
TransactionSchema.index({ cropType: 1 });

// Pre-save middleware to update the updatedAt field
TransactionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to get summary
TransactionSchema.statics.getSummary = async function(userId) {
    const query = userId ? { userId } : {};
    const transactions = await this.find(query);
    
    const summary = {
        totalTransactions: transactions.length,
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        recentTransactions: await this.find(query).sort({ date: -1 }).limit(5),
        categoryBreakdown: {},
        seasonalBreakdown: {},
        cropBreakdown: {},
        monthlyBreakdown: {},
        averageMonthlyExpense: 0,
        averageMonthlyIncome: 0,
        savingsRate: 0,
        topCategories: [],
        transactionTrends: {}
    };
    
    // Initialize monthly breakdown for last 12 months
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        summary.monthlyBreakdown[monthKey] = {
            income: 0,
            expense: 0,
            balance: 0,
            transactions: 0
        };
    }
    
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            summary.totalIncome += transaction.amount;
        } else {
            summary.totalExpense += transaction.amount;
        }
        
        // Category breakdown
        if (!summary.categoryBreakdown[transaction.category]) {
            summary.categoryBreakdown[transaction.category] = { income: 0, expense: 0 };
        }
        if (transaction.type === 'income') {
            summary.categoryBreakdown[transaction.category].income += transaction.amount;
        } else {
            summary.categoryBreakdown[transaction.category].expense += transaction.amount;
        }
        
        // Seasonal breakdown
        if (!summary.seasonalBreakdown[transaction.season]) {
            summary.seasonalBreakdown[transaction.season] = { income: 0, expense: 0 };
        }
        if (transaction.type === 'income') {
            summary.seasonalBreakdown[transaction.season].income += transaction.amount;
        } else {
            summary.seasonalBreakdown[transaction.season].expense += transaction.amount;
        }
        
        // Crop breakdown
        if (transaction.cropType) {
            if (!summary.cropBreakdown[transaction.cropType]) {
                summary.cropBreakdown[transaction.cropType] = { income: 0, expense: 0 };
            }
            if (transaction.type === 'income') {
                summary.cropBreakdown[transaction.cropType].income += transaction.amount;
            } else {
                summary.cropBreakdown[transaction.cropType].expense += transaction.amount;
            }
        }
        
        // Monthly breakdown
        const transactionDate = new Date(transaction.date);
        const monthKey = transactionDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (summary.monthlyBreakdown[monthKey]) {
            if (transaction.type === 'income') {
                summary.monthlyBreakdown[monthKey].income += transaction.amount;
            } else {
                summary.monthlyBreakdown[monthKey].expense += transaction.amount;
            }
            summary.monthlyBreakdown[monthKey].transactions += 1;
        }
    });
    
    // Calculate balance and monthly averages
    summary.balance = summary.totalIncome - summary.totalExpense;
    
    // Calculate monthly averages
    const monthsWithData = Object.values(summary.monthlyBreakdown).filter(month => month.transactions > 0);
    if (monthsWithData.length > 0) {
        summary.averageMonthlyExpense = monthsWithData.reduce((sum, month) => sum + month.expense, 0) / monthsWithData.length;
        summary.averageMonthlyIncome = monthsWithData.reduce((sum, month) => sum + month.income, 0) / monthsWithData.length;
    }
    
    // Calculate savings rate
    if (summary.totalIncome > 0) {
        summary.savingsRate = summary.balance / summary.totalIncome;
    }
    
    // Calculate monthly balances
    Object.values(summary.monthlyBreakdown).forEach(month => {
        month.balance = month.income - month.expense;
    });
    
    // Get top expense categories
    summary.topCategories = Object.entries(summary.categoryBreakdown)
        .filter(([category, data]) => data.expense > 0)
        .sort(([, a], [, b]) => b.expense - a.expense)
        .slice(0, 5)
        .map(([category, data]) => ({
            category,
            amount: data.expense,
            percentage: (data.expense / summary.totalExpense) * 100
        }));
    
    return summary;
};

// Static method to get transactions with filters
TransactionSchema.statics.getFilteredTransactions = async function(filters, userId) {
    const query = userId ? { userId } : {};
    
    if (filters.type && filters.type !== 'All') {
        query.type = filters.type;
    }
    
    if (filters.category && filters.category !== 'All') {
        query.category = filters.category;
    }
    
    if (filters.season && filters.season !== 'All') {
        query.season = filters.season;
    }
    
    if (filters.cropType && filters.cropType !== 'All') {
        query.cropType = filters.cropType;
    }
    
    if (filters.startDate && filters.endDate) {
        query.date = {
            $gte: new Date(filters.startDate),
            $lte: new Date(filters.endDate)
        };
    }
    
    return await this.find(query).sort({ date: -1 });
};

module.exports = mongoose.model('Transaction', TransactionSchema);
