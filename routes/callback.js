const express = require('express');
const router = express.Router();

// Controllers
const {
  registerCallback,
  getCallbacks,
  getCallbackById,
  updateCallback,
  deleteCallback,
} = require('../controllers/callback');

router.post('/', registerCallback);
router.get('/', getCallbacks);
router.get('/:id', getCallbackById);
router.put('/:id', updateCallback);
router.delete('/:id', deleteCallback);

module.exports = router;
