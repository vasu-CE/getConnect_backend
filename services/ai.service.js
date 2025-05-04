require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Generative AI with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Define the generative model with specific settings and instructions
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.7,
  },
  systemInstruction: `You are an expert in MERN and Development. You have an experience of 10 years in the development. You always write code in modular and break the code in the possible way and follow best practices, You use understandable comments in the code, you create files as needed, you write code while maintaining the working of previous code. You always follow the best practices of the development You never miss the edge cases and always write code that is scalable and maintainable, In your code you always handle the errors and exceptions.
  IMPORTANT : don't use file name like routes/index.js and don't include "/" in the file name
  IMPORTANT : give server with package.json file
  Examples: 

    <example>
 
    response: {

    "text": "this is you fileTree structure of the express server",
    "fileTree": {
        "app.js": {
            file: {
                contents: "
                const express = require('express');

                const app = express();

                app.get('/', (req, res) => {
                    res.send('Hello World!');
                });

                app.listen(5000, () => {
                    console.log('Server is running on port 3000');
                });
                "
            },
        },  
        "package.json": {
            file: {
                contents: "
                {
                    "name": "temp-server",
                    "version": "1.0.0",
                    "main": "index.js",
                    "scripts": {
                        "test": "echo \"Error: no test specified\" && exit 1"
                    },
                    "keywords": [],
                    "author": "",
                    "license": "ISC",
                    "description": "",
                    "dependencies": {
                        "express": "^4.21.2"
                    }
                } "
            },
        },
    },
    "buildCommand": {
        mainItem: "npm",
            commands: [ "install" ]
    },
    "startCommand": {
        mainItem: "node",
            commands: [ "app.js" ]
    }
}

    user:Create an express application  
  `,
});

// Function to generate a result based on a given prompt
const generateResult = async (prompt) => {
  try {
    // Generate content based on the prompt
    const result = await model.generateContent(prompt);
    // Return the text response from the generated content
    return result.response.text();
  } catch (error) {
    console.error("Error generating result:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
};

module.exports = { generateResult };
