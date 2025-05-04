const mongoose = require('mongoose');
require('dotenv').config();
// console.log(process.env.MONGO_URI)

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/GT2")
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB:', err));

// Import the list of tech-related interests
const availableTechInterests = [
  'Web Development', 'JavaScript', 'Python', 'Java', 'Node.js', 'Express.js', 'React.js', 'Vue.js', 'CSS', 'HTML', 'SQL', 'MongoDB', 'Firebase', 'GraphQL', 
  'Machine Learning', 'Data Science', 'Artificial Intelligence', 'Deep Learning', 'Blockchain', 'Cybersecurity', 'Game Development', 'Mobile App Development', 
  'Android Development', 'iOS Development', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin', 'TypeScript', 'Cloud Computing', 'AWS', 'Azure', 
  'Google Cloud', 'Linux', 'DevOps', 'Software Testing', 'Agile', 'Scrum', 'Project Management', 'UI/UX Design', 'Software Architecture', 'DevSecOps', 
  'Database Management', 'Big Data', 'Data Analytics', 'Business Intelligence', 'Serverless Computing', 'Virtualization', 'IoT (Internet of Things)', 
  'Embedded Systems', 'Networking', 'Database Administration', 'Continuous Integration', 'Continuous Deployment', 'Tech Startups', 'E-commerce', 'SEO for Developers', 
  'Automated Testing', 'Cloud Security', 'Containerization', 'Microservices', 'API Development', 'Serverless Architecture', 'JavaScript Frameworks', 
  'Agile Development', 'Software Development', 'Ruby on Rails', 'React Native', 'Flutter', 'Testing Frameworks', 'GraphQL API', 'API Testing', 'Tech Innovations', 
  'Virtual Reality', 'Augmented Reality', '5G Technology', 'Quantum Computing', 'Robotic Process Automation (RPA)', 'Wearable Tech', 'Edge Computing', 'Tech for Good'
];

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: function() {
      // Only required if isVerified is true
      return this.isVerified === true;
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function() {
      return this.isVerified === true;
    }
  },
  bio: {
    type: String,
    default: "Learner",
  },
  profilePicture: {
    type: String,
  },
  experience: {
    type: String,
    default: "",
  },
  interests: {
    type: [String],  // Users can choose from the list of tech interests
  },
  score : {
    type : String,
    default : "0"
  },
  city: {
    type: String,
    enum: ['Anand', 'Surat', 'Jetpur'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  description: {
    type: String,
    default: "",
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],
  connection: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  resume: {
    type: String,
    default: "",
  },
  otp : {
    type : String
  },
  otpExpiry : {
    type : Date
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
