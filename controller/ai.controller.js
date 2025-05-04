const aiServices = require('../services/ai.service');

const getResult = async (req,res) => {
    try{
        const {prompt} = req.query;
        const result = await aiServices.generateResult(prompt);
        res.send(result);
    }catch(err){
        res.status(500).send({
            message : err.message,
            success : false
        })
    }
}

module.exports = {getResult}