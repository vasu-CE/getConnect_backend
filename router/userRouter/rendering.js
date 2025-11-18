const express  = require('express');
const router = express.Router();
const User = require('../../model/userModel');
const isAuthenticate = require('../../middleware/isAuthenticate');
const axios = require('axios');


const availableTechInterests = [
    '5G Technology', 'Agile', 'Azure' , 'Agile Development', 'Android Development', 'API Development', 'API Testing', 'Artificial Intelligence', 'Augmented Reality', 
    'Automated Testing', 'Big Data', 'Blockchain', 'Business Intelligence', 'Cloud Computing', 'Cloud Security', 'Containerization', 'Continuous Deployment', 
    'Continuous Integration', 'C++', 'C#', 'Cybersecurity', 'Data Analytics', 'Data Science', 'Database Administration', 'Database Management', 'Deep Learning', 
    'DevOps', 'DevSecOps', 'E-commerce', 'Edge Computing', 'Embedded Systems', 'Express.js', 'Firebase', 'Flutter', 'Game Development', 'Go', 'GraphQL', 
    'GraphQL API', 'Google Cloud', 'HTML', 'IoT (Internet of Things)', 'Java', 'JavaScript', 'JavaScript Frameworks', 'Kotlin', 'Linux', 'Machine Learning', 
    'Microservices', 'MongoDB', 'Node.js', 'PHP', 'Project Management', 'Python', 'Quantum Computing', 'React Native', 'React.js', 'Robotic Process Automation (RPA)', 
    'Ruby', 'Ruby on Rails', 'Rust', 'Serverless Architecture', 'Serverless Computing', 'Scrum', 'Software Architecture', 'Software Development', 'Software Testing', 
    'Tech for Good', 'Tech Innovations', 'Tech Startups', 'Testing Frameworks', 'TypeScript', 'UI/UX Design', 'Virtual Reality', 'Virtualization', 'Vue.js', 
    'Wearable Tech', 'Web Development', 'Networking', 'SQL', 'Swift'
];

  
router.get('/edit',isAuthenticate ,async (req,res) => {
    const authorId = req.id;
    const user = await User.findById(authorId);
    res.render('profileEdit' , {user});
})

router.get('/profile' , (req,res) => {
    res.render('register');
})

router.get('/resume/:id', async (req, res) => {
    try {
      const authorId = req.params.id;
      const user = await User.findById(authorId);
  
      const resumeUrl = user.resume;
  
      // Make a request to fetch the PDF from Cloudinary
      const response = await axios({
        method: 'get',
        url: resumeUrl,
        responseType: 'stream', // important to stream binary content
      });
  
      // Set content headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');
  
      // Pipe the PDF stream to the response
      response.data.pipe(res);
    } catch (err) {
      console.error(err);
      return res.status(401).json({
        success: false,
        message: 'Could not retrieve resume',
      });
    }
  });

//     const userId = req.params.userId;
//     const user = await User.findById(userId);
  
//     if (!user || !user.resume) {
//       return res.status(404).send('Resume not found');
//     }
//     res.send(user.resume);
// });

router.get('/resume1/:id' , (req,res) => {
    const authorId = req.params.id;
    // const author = User.findById(authorId);
    res.render('resume' , {authorId});
})

router.get('/users' ,isAuthenticate ,async (req,res) => {
    try{
        const authorId = req.id;
        const author =await User.findById(authorId).select('connection');
        
        // const user = await User.findById(userId);
        let users = await User.find().select('userName bio profilePicture');
        users = users.filter((user) => author.connection.includes(user._id));
        // res.send({users});
        return res.status(200).json({
            success : true,
            users,
            author
        })
    }catch(err){
        return res.status(500).json({
            success : false,
            message : 'Internal Server Error'
        })
    }
})

router.get('/interests',isAuthenticate,async (req,res) => {
    const userId = req.id;
    const user = await User.findById(userId);
   
    const oldInterest = availableTechInterests.filter((interest) => user.interests.includes(interest));
    const newInterest = availableTechInterests.filter((interest) => !user.interests.includes(interest));
    // console.log(oldInterest)
    res.send({oldInterest , newInterest});

})
module.exports = router;