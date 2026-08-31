const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/TransactionController');
const { protect: auth } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(auth);

// GET /api/transactions - Get all transactions
router.get('/', transactionController.getTransactions);

// POST /api/transactions - Add a new transaction
router.post('/', transactionController.addTransaction);

// POST /api/transactions/filtered - Get filtered transactions
router.post('/filtered', transactionController.getFilteredTransactions);

// DELETE /api/transactions/:id - Delete a transaction
router.delete('/:id', transactionController.deleteTransaction);

// GET /api/transactions/stats - Get transaction statistics
router.get('/stats', transactionController.getTransactionStats);

// GET /api/transactions/categories - Get all available categories
router.get('/categories', transactionController.getCategories);

// GET /api/transactions/seasons - Get all available seasons
router.get('/seasons', transactionController.getSeasons);

// GET /api/transactions/crop-types - Get all available crop types
router.get('/crop-types', transactionController.getCropTypes);

module.exports = router;
