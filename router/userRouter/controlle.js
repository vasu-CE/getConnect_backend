const express = require("express");
const router = express.Router();
const User = require('../../model/userModel');
const isAuthenticate = require('../../middleware/isAuthenticate')
const upload = require('../../middleware/multer');
const { uploadImage } = require("../../services/cloudinaryService");

router.post('/edit', isAuthenticate ,upload.fields([
    {name : 'profilePic'},
    {name : 'resume'}
]) , async (req,res) => {
    // console.log("H");
    // console.log(req.id);
    
    const authorId = req.id;
    const {userName , experience , gender , bio , interests , deleteInterest} = req.body;  
    const { profilePic, resume } = req.files;
    // console.log(authorId);
    // console.log(user);
    try{
        let user =await User.findById(authorId);
        if(!user){
            return res.status(401).json({
                message : 'user not found'
            })
        }

        if(userName) user.userName = userName;
        if(bio) user.bio = bio;

        if (profilePic && profilePic.length > 0) {
            const buffer = profilePic[0].buffer;
            const imageUrl = await uploadImage(buffer);
            user.profilePicture = imageUrl;
        }

        if(experience) user.experience = experience;

        // const interest = req.body.interest 
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

        if(resume && resume.length > 0){
            // user.resume.data = resume[0].buffer;
            const buffer = resume[0].buffer;
            // const base64 = buffer.toString('base64');
            // user.resume = `data:application/pdf;base64,${base64}`;
            const resumeUrl = await uploadImage(buffer);
            user.resume = resumeUrl;
        }
        if (gender) user.gender = gender;

        await user.save();
        // console.log("Success");
        return res.status(200).json({
            message : "Edit successfully",
            success : true,
            user
        });
    }catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message,
            success: false,
        });
    }
})

module.exports = router;