const express = require('express');
const isAuthenticate = require('../../middleware/isAuthenticate');
const User = require('../../model/userModel');
const Post = require('../../model/PostModel');
const router = express.Router();

//getprofile
router.get('/:id/profile', isAuthenticate ,async (req,res) => {
    // console.log('hyy');
    try{
        const userId = req.params.id;
        const id = req.id;
        let author =await User.findById(userId).select('-password');

        const posts = await Post.find({author : userId}).sort({createdAt : -1}) 
        .populate({
            path : 'author',
            select : 'userName profilePicture'
        });
        let user = await User.findById(id);
        // res.render('profile' , {author , posts , user});
        return res.status(200).json({
            success : true,
            author,
            posts
        })
            
    }catch(err){
        return res.status(401).json({
            success : false,
            message : "Error fetching profile"
        })
    }
})

router.get('/suggested' , isAuthenticate , async (req,res) => {
    try{
        const suggestedUser = await User.find({_id : {$ne:req._id}}).select('-password');

        res.status(200).send(suggestedUser);
    }catch(err){
        res.send(err.message);
    }
})

module.exports = router;