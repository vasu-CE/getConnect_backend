const express = require('express');
const isAuthenticate = require('../../middleware/isAuthenticate');
const userModel = require('../../model/userModel');
require('dotenv').config();
const router = express.Router();

router.get("/" ,isAuthenticate , async (req,res) => {
    try{
        const interest = req.query.interests;
        // console.log(interest);
        const { GoogleGenerativeAI } = require("@google/generative-ai");

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction : "IMPORTANT : give different question instead of repeating previous question"
         });

         let randomInterests;
        if(interest){
            randomInterests = interest
        }else{
            const userId = req.id;
            const user =await userModel.findById(userId);
            const interests = user.interests;
            randomInterests = interests.sort(() => Math.random() - 0.5).join(", ");
        }
        const prompt = "make a 10 question quiz with option and answer about tech " + randomInterests + "in this formate [{…}, {…}]";

        const result = await model.generateContent(prompt);
        // console.log(result.response.text());
        const quizData = result.response.text();
        const cleanQuizDataString = quizData.replace(/```json\n|\n```/g, '').trim();
        const parsedQuizData = JSON.parse(cleanQuizDataString);
        // console.log(parsedQuizData);
        // const parsedQuizData = JSON.parse(quizData);
        // console.log(parsedQuizData);
        if (result && result.response && result.response.text()) {
            return res.status(200).json({ quiz: parsedQuizData , success : true });  // Assuming response.text() is the correct format
        } else {
            return res.status(500).json({ error: "Failed to generate quiz",success : false });
        }

    }catch(err){
        return res.status(401).json({
            message : "Internal server error",
            success : false
        })
    }
})

router.post("/marks",isAuthenticate ,async (req,res) => {
    try{
   
        const userId = req.id;
        const {score} = req.body;
        
        const user = await userModel.findById(userId);
        if(user.score < score){
            user.score = score;
        };
        await user.save();
        return res.status(200).json({ success : true , message : `Your max score is ${user.score}` });
    } catch(err){
        return res.status(401).json({
            message : "Internal server error",
            success : false
        })
    }
})

module.exports = router;