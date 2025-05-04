const express = require('express');
const isAuthenticate = require('../../middleware/isAuthenticate');
const router = express.Router();

const Post = require('../../model/PostModel');

// router.post('/', isAuthenticate, async (req, res) => {
//     try {
//       let { page = 1, limit = 1 } = req.query;
//       page = parseInt(page, 10);
//       limit = parseInt(limit, 10);
  
//       let posts = await Post.find()
//         .sort({ createdAt: -1 })
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .populate('author', 'userName profilePicture interests')
//         .populate({
//           path: 'comments.user',
//           select: 'userName profilePicture'
//         });
  
//       const totalPosts = await Post.countDocuments();
  
//       return res.status(200).json({
//         success: true,
//         posts,
//         hasMore: page * limit < totalPosts
//       });
//     } catch (err) {
//       return res.status(500).json({
//         success: false,
//         message: err.message
//       });
//     }
// });

router.post('/', isAuthenticate, async (req, res) => {
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
          pipeline : [
            {
              $project : {
                userName : 1,
                profilePicture : 1,
                interests : 1
              }
            }
          ]
        }
      },
      { $unwind: '$author' },
    
      { $unwind: { path: '$comments', preserveNullAndEmptyArrays: true } }, // Unwind each comment
    
      {
        $lookup: {
          from: 'users',
          localField: 'comments.user',
          foreignField: '_id',
          as: 'commentUser'
        }
      },
      { $unwind: { path: '$commentUser', preserveNullAndEmptyArrays: true } }, // Get single user object
    
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
        $group : {
          _id : "$_id",
          caption : {$first : "$caption"},
          image : {$first : "$image"},
          author : {$first : "$author"},
          likes : {$first : "$likes"},
          createdAt : { $first: "$createdAt" },
          comments : {
            $push : {
              user : "$comments.user",
              text : "$comments.text",
              createdAt: "$comments.createdAt",
              _id : "$comments._id"
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

module.exports = router;
