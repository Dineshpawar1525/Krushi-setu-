const express = require('express');
const router = express.Router();
const {
  getSchemes,
  getSchemeById,
  getCategories,
  getStates,
  createScheme,
  updateScheme,
  deleteScheme,
  seedSchemes,
  getAISchemes
} = require('../controllers/SchemeController');
const { protect: authenticateToken } = require('../middlewares/auth');

// Public routes (no authentication required)
router.get('/', getSchemes);
router.get('/categories', getCategories);
router.get('/states', getStates);
router.get('/:id', getSchemeById);
router.post('/ai', getAISchemes);

// Admin routes (authentication required)
router.post('/', authenticateToken, createScheme);
router.put('/:id', authenticateToken, updateScheme);
router.delete('/:id', authenticateToken, deleteScheme);
router.post('/seed', authenticateToken, seedSchemes);

module.exports = router;
