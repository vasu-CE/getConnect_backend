const express = require('express');
const router = express.Router();
const User = require('../model/userModel');
const Post = require('../model/PostModel');
const isAuthenticate = require('../middleware/isAuthenticate');

// Search users
router.get('/users', isAuthenticate, async (req, res) => {
    try {
        const { q: searchQuery } = req.query;
        const userId = req.id;

        let searchFilter = { _id: { $ne: userId } };

        if (searchQuery) {
            searchFilter.$or = [
                { userName: { $regex: searchQuery, $options: 'i' } },
                { bio: { $regex: searchQuery, $options: 'i' } },
                { interests: { $in: [new RegExp(searchQuery, 'i')] } }
            ];
        }

        const users = await User.find(searchFilter)
            .select('userName bio profilePicture interests experience')
            .limit(20);

        res.status(200).json({
            success: true,
            users
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Search posts
router.get('/posts', isAuthenticate, async (req, res) => {
    try {
        const { q: searchQuery, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let searchFilter = {};

        if (searchQuery) {
            searchFilter.$or = [
                { caption: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        const posts = await Post.find(searchFilter)
            .populate('author', 'userName profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalPosts = await Post.countDocuments(searchFilter);

        res.status(200).json({
            success: true,
            posts,
            hasMore: skip + posts.length < totalPosts,
            total: totalPosts
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Search by interests
router.get('/by-interests', isAuthenticate, async (req, res) => {
    try {
        const { interests } = req.query;
        const userId = req.id;

        if (!interests) {
            return res.status(400).json({
                success: false,
                message: 'Interests parameter is required'
            });
        }

        const interestArray = interests.split(',').map(interest => interest.trim());

        const users = await User.find({
            _id: { $ne: userId },
            interests: { $in: interestArray }
        })
            .select('userName bio profilePicture interests experience')
            .limit(20);

        res.status(200).json({
            success: true,
            users
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;
