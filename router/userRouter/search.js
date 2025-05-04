const express = require('express');
const User = require('../../model/userModel');
const router = express.Router()
const isAuthenticate = require('../../middleware/isAuthenticate');
const mongoose = require('mongoose');

router.get('/users', isAuthenticate, async (req, res) => {
    const userId = req.id;
    const users = await User.find({ _id: { $ne: userId } }).select('_id -password'); 

    res.json(users);
});

module.exports = router;