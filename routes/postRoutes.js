const express = require('express');
const router = express.Router();
const Post = require('../model/PostModel');
const User = require('../model/userModel');
const isAuthenticate = require('../middleware/isAuthenticate');
const upload = require('../middleware/multer');
const { uploadImage } = require('../services/cloudinaryService');

// Get all posts with pagination
router.get('/', isAuthenticate, async (req, res) => {
    try {
        let { page = 1, limit = 5 } = req.query;
        page = parseInt(page, 10);
        limit = parseInt(limit, 10);

        const posts = await Post.aggregate([
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author',
                    pipeline: [
                        {
                            $project: {
                                userName: 1,
                                profilePicture: 1,
                                interests: 1
                            }
                        }
                    ]
                }
            },
            { $unwind: '$author' },
            { $unwind: { path: '$comments', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'comments.user',
                    foreignField: '_id',
                    as: 'commentUser'
                }
            },
            { $unwind: { path: '$commentUser', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    'comments.user': {
                        _id: '$commentUser._id',
                        userName: '$commentUser.userName',
                        profilePicture: '$commentUser.profilePicture'
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    caption: { $first: "$caption" },
                    image: { $first: "$image" },
                    author: { $first: "$author" },
                    likes: { $first: "$likes" },
                    createdAt: { $first: "$createdAt" },
                    comments: {
                        $push: {
                            user: "$comments.user",
                            text: "$comments.text",
                            createdAt: "$comments.createdAt",
                            _id: "$comments._id"
                        }
                    }
                }
            }
        ]);

        const totalPosts = await Post.countDocuments();

        return res.status(200).json({
            success: true,
            posts,
            hasMore: page * limit < totalPosts
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Create a new post
router.post('/', isAuthenticate, upload.single('image'), async (req, res) => {
    try {
        const { caption } = req.body;
        const authorId = req.id;

        if (!caption) {
            return res.status(400).json({
                success: false,
                message: 'Caption is required'
            });
        }

        let imageUrl = null;
        if (req.file) {
            const buffer = req.file.buffer;
            imageUrl = await uploadImage(buffer);
        }

        const newPost = new Post({
            caption,
            image: imageUrl,
            author: authorId
        });

        await newPost.save();

        const populatedPost = await Post.findById(newPost._id)
            .populate('author', 'userName profilePicture');

        return res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post: populatedPost
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Get user's posts
router.get('/my-posts', isAuthenticate, async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId })
            .sort({ createdAt: -1 })
            .populate('author', 'userName profilePicture');

        return res.status(200).json({
            success: true,
            posts
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Like/Unlike a post
router.post('/:postId/like', isAuthenticate, async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const isLiked = post.likes.includes(userId);
        if (isLiked) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        return res.status(200).json({
            success: true,
            message: isLiked ? 'Post unliked' : 'Post liked',
            isLiked: !isLiked,
            likesCount: post.likes.length
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Add comment to a post
router.post('/:postId/comment', isAuthenticate, async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.id;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const comment = {
            user: userId,
            text,
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();

        const populatedPost = await Post.findById(postId)
            .populate('comments.user', 'userName profilePicture');

        return res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            comment: populatedPost.comments[populatedPost.comments.length - 1]
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Delete a post
router.delete('/:postId', isAuthenticate, async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        if (post.author.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own posts'
            });
        }

        await Post.findByIdAndDelete(postId);

        return res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Get a specific post by ID
router.get('/:postId', isAuthenticate, async (req, res) => {
    try {
        const postId = req.params.postId;

        const post = await Post.findById(postId)
            .populate('author', 'userName profilePicture')
            .populate('comments.user', 'userName profilePicture');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        return res.status(200).json({
            success: true,
            post
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;
