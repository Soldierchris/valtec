const express = require('express');
const router = express.Router();
const tabletController = require('../controllers/TabletController');

router.get('/', (req, res) => tabletController.listar(req, res));
router.get('/', tabletController.listar)
module.exports = router;