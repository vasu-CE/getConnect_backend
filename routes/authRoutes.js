const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller');
const isAuthenticate = require('../middleware/isAuthenticate');
const userModel = require('../model/userModel');
const { userChatIo } = require('../socket/socket');

// Authentication routes
router.post('/signup', authController.signup);
router.post('/sendotp', authController.sendOTP);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Connection management routes
router.get('/is-following/:id', isAuthenticate, async (req, res) => {
    try {
        const myid = req.id;
        const another = req.params.id;

        const user = await userModel.findById(myid);
        const target = await userModel.findById(another);

        if (!user || !target) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.connection?.includes(another)) {
            return res.status(200).json({
                isFollowing: true,
                success: true
            });
        } else {
            return res.status(200).json({
                isFollowing: false,
                success: true
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: "Error in isFollowing",
            success: false
        });
    }
});

router.get('/connection', isAuthenticate, async (req, res) => {
    try {
        const myid = req.id;
        const follower = await userModel.findById(myid).select('connection');

        return res.status(200).json({
            follower: follower.connection,
            success: true
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error in connection",
            success: false
        });
    }
});

router.post('/connection/:id', isAuthenticate, async (req, res) => {
    try {
        const myid = req.id;
        const another = req.params.id;

        if (myid === another) {
            return res.status(400).json({ 
                success: false, 
                message: "You can't follow yourself" 
            });
        }

        const user = await userModel.findById(myid);
        const target = await userModel.findById(another);

        if (!user || !target) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        const isConnection = user.connection.includes(another);
        if (isConnection) {
            await Promise.all([
                userModel.updateOne({ _id: myid }, { $pull: { connection: another } }),
                userModel.updateOne({ _id: another }, { $pull: { connection: myid } })
            ]);

            userChatIo.to(another).emit('connection-updated', {
                userId: myid,
                following: false
            });

            return res.json({ 
                success: true, 
                message: "Unfollowed successfully", 
                following: false 
            });
        } else {
            await Promise.all([
                userModel.updateOne({ _id: myid }, { $push: { connection: another } }),
                userModel.updateOne({ _id: another }, { $push: { connection: myid } })
            ]);

            userChatIo.to(another).emit('connection-updated', {
                userId: myid,
                following: true
            });

            return res.json({ 
                success: true, 
                message: "Followed successfully", 
                following: true 
            });
        }
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});

module.exports = router;
