const express = require('express');
const router = express.Router();
const aiController = require('../../controller/ai.controller');

router.get('/get-result' , aiController.getResult);

module.exports = router