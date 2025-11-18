const express = require('express');
const router = express.Router();
const User = require('../model/userModel');
const Post = require('../model/PostModel');
const isAuthenticate = require('../middleware/isAuthenticate');
const upload = require('../middleware/multer');
const { uploadImage } = require('../services/cloudinaryService');
const axios = require('axios');

const availableTechInterests = [
    '5G Technology', 'Agile', 'Azure', 'Agile Development', 'Android Development', 'API Development', 'API Testing', 'Artificial Intelligence', 'Augmented Reality',
    'Automated Testing', 'Big Data', 'Blockchain', 'Business Intelligence', 'Cloud Computing', 'Cloud Security', 'Containerization', 'Continuous Deployment',
    'Continuous Integration', 'C++', 'C#', 'Cybersecurity', 'Data Analytics', 'Data Science', 'Database Administration', 'Database Management', 'Deep Learning',
    'DevOps', 'DevSecOps', 'E-commerce', 'Edge Computing', 'Embedded Systems', 'Express.js', 'Firebase', 'Flutter', 'Game Development', 'Go', 'GraphQL',
    'GraphQL API', 'Google Cloud', 'HTML', 'IoT (Internet of Things)', 'Java', 'JavaScript', 'JavaScript Frameworks', 'Kotlin', 'Linux', 'Machine Learning',
    'Microservices', 'MongoDB', 'Node.js', 'PHP', 'Project Management', 'Python', 'Quantum Computing', 'React Native', 'React.js', 'Robotic Process Automation (RPA)',
    'Ruby', 'Ruby on Rails', 'Rust', 'Serverless Architecture', 'Serverless Computing', 'Scrum', 'Software Architecture', 'Software Development', 'Software Testing',
    'Tech for Good', 'Tech Innovations', 'Tech Startups', 'Testing Frameworks', 'TypeScript', 'UI/UX Design', 'Virtual Reality', 'Virtualization', 'Vue.js',
    'Wearable Tech', 'Web Development', 'Networking', 'SQL', 'Swift'
];

// Profile management routes
router.post('/edit', isAuthenticate, upload.fields([
    { name: 'profilePic' },
    { name: 'resume' }
]), async (req, res) => {
    try {
        const authorId = req.id;
        const { userName, experience, gender, bio, interests, deleteInterest } = req.body;
        const { profilePic, resume } = req.files;

        let user = await User.findById(authorId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        if (userName) user.userName = userName;
        if (bio) user.bio = bio;

        if (profilePic && profilePic.length > 0) {
            const buffer = profilePic[0].buffer;
            const imageUrl = await uploadImage(buffer);
            user.profilePicture = imageUrl;
        }

        if (experience) user.experience = experience;

        if (interests) {
            user.interests.push(...interests);
        }

        if (deleteInterest) {
            if (Array.isArray(deleteInterest)) {
                deleteInterest.forEach((interest) => {
                    user.interests.pull(interest);
                });
            } else {
                user.interests.pull(deleteInterest);
            }
        }

        if (resume && resume.length > 0) {
            const buffer = resume[0].buffer;
            const resumeUrl = await uploadImage(buffer);
            user.resume = resumeUrl;
        }

        if (gender) user.gender = gender;

        await user.save();

        return res.status(200).json({
            message: "Edit successfully",
            success: true,
            user
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: err.message,
            success: false,
        });
    }
});

router.post('/register', isAuthenticate, upload.fields([
    { name: 'profilePic' },
    { name: 'resume' }
]), async (req, res) => {
    try {
        const authorId = req.id;
        const user = await User.findById(authorId);
        const { userName, bio, experience, interest, gender } = req.body;
        const { profilePic, resume } = req.files;

        if (userName) {
            user.userName = userName;
        }
        if (bio) user.bio = bio;
        if (experience) user.experience = experience;
        if (interest) {
            await User.findOneAndUpdate(
                { _id: authorId },
                { $addToSet: { interests: interest } },
                { new: true, useFindAndModify: false }
            );
        }

        if (gender) {
            user.gender = gender;
        }
        if (profilePic && profilePic.length > 0) {
            const buffer = profilePic[0].buffer;
            const imageUrl = await uploadImage(buffer);
            user.profilePicture = imageUrl;
        }
        if (resume && resume.length > 0) {
            const buffer = resume[0].buffer;
            const resumeUrl = await uploadImage(buffer);
            user.resume = resumeUrl;
        }

        await user.save();
        return res.status(200).json({
            message: "Profile created Successfully",
            success: true,
            user
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message,
            success: false
        });
    }
});

// Profile viewing routes
router.get('/:id/profile', isAuthenticate, async (req, res) => {
    try {
        const userId = req.params.id;
        const author = await User.findById(userId).select('-password');

        if (!author) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const posts = await Post.find({ author: userId }).sort({ createdAt: -1 })
            .populate({
                path: 'author',
                select: 'userName profilePicture'
            });

        return res.status(200).json({
            success: true,
            author,
            posts
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error fetching profile"
        });
    }
});

router.get('/suggested', isAuthenticate, async (req, res) => {
    try {
        const suggestedUser = await User.find({ _id: { $ne: req.id } }).select('_id userName bio profilePicture');

        res.status(200).json({
            success: true,
            users: suggestedUser
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// User connections
router.get('/connections', isAuthenticate, async (req, res) => {
    try {
        const authorId = req.id;
        const author = await User.findById(authorId).select('connection');

        let users = await User.find().select('userName bio profilePicture');
        users = users.filter((user) => author.connection.includes(user._id));

        return res.status(200).json({
            success: true,
            users,
            author
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

// Interests management
router.get('/interests', isAuthenticate, async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const oldInterest = availableTechInterests.filter((interest) => user.interests.includes(interest));
        const newInterest = availableTechInterests.filter((interest) => !user.interests.includes(interest));

        res.status(200).json({
            success: true,
            oldInterest,
            newInterest
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

// Resume handling
router.get('/resume/:id', async (req, res) => {
    try {
        const authorId = req.params.id;
        const user = await User.findById(authorId);

        if (!user || !user.resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        const resumeUrl = user.resume;

        // Make a request to fetch the PDF from Cloudinary
        const response = await axios({
            method: 'get',
            url: resumeUrl,
            responseType: 'stream',
        });

        // Set content headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');

        // Pipe the PDF stream to the response
        response.data.pipe(res);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Could not retrieve resume',
        });
    }
});

module.exports = router;
