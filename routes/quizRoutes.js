const express = require('express');
const router = express.Router();
const isAuthenticate = require('../middleware/isAuthenticate');
const userModel = require('../model/userModel');
require('dotenv').config();

// Generate quiz based on user interests
router.get('/', isAuthenticate, async (req, res) => {
    try {
        const interest = req.query.interests;
        const { GoogleGenerativeAI } = require("@google/generative-ai");

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "IMPORTANT : give different question instead of repeating previous question"
        });

        let randomInterests;
        if (interest) {
            randomInterests = interest;
        } else {
            const userId = req.id;
            const user = await userModel.findById(userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const interests = user.interests;
            if (!interests || interests.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No interests found for user'
                });
            }

            randomInterests = interests.sort(() => Math.random() - 0.5).join(", ");
        }

        const prompt = "make a 10 question quiz with option and answer about tech " + randomInterests + "in this formate [{…}, {…}]";

        const result = await model.generateContent(prompt);
        const quizData = result.response.text();
        const cleanQuizDataString = quizData.replace(/```json\n|\n```/g, '').trim();
        
        try {
            const parsedQuizData = JSON.parse(cleanQuizDataString);
            
            if (result && result.response && result.response.text()) {
                return res.status(200).json({ 
                    quiz: parsedQuizData, 
                    success: true 
                });
            } else {
                return res.status(500).json({ 
                    error: "Failed to generate quiz", 
                    success: false 
                });
            }
        } catch (parseError) {
            return res.status(500).json({
                success: false,
                message: 'Failed to parse quiz data',
                error: parseError.message
            });
        }
    } catch (err) {
        console.error('Quiz generation error:', err);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
});

// Submit quiz score
router.post('/submit-score', isAuthenticate, async (req, res) => {
    try {
        const userId = req.id;
        const { score } = req.body;

        if (typeof score !== 'number' || score < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid score is required'
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.score < score) {
            user.score = score;
        }

        await user.save();
        
        return res.status(200).json({ 
            success: true, 
            message: `Your max score is ${user.score}`,
            currentScore: user.score
        });
    } catch (err) {
        console.error('Score submission error:', err);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
});

// Get user's quiz statistics
router.get('/stats', isAuthenticate, async (req, res) => {
    try {
        const userId = req.id;
        const user = await userModel.findById(userId).select('score interests');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            maxScore: user.score || 0,
            interests: user.interests || []
        });
    } catch (err) {
        console.error('Stats retrieval error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
