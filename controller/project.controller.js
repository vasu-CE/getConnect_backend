// const { projectService } = require('../services/project.service');
const projectService = require('../services/project.service.js');

const { validationResult } = require('express-validator'); // Corrected this line to use CommonJS

const createProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name } = req.body;
        const userId = req.id;  // Assuming the user is attached to the request object by your authentication middleware
        const newProject = await projectService.createProject({ name, userId });
        res.status(201).json(newProject);
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};

const getAllProject = async (req,res) => {
    try{
        const userId = req.id;
        const allUserProject = await projectService.getAllProjectByUserId({userId});
        // console.log(allUserProject);
        return res.status(200).json({
            projects : allUserProject,
            success : true
        })
    }catch(err){
        return res.status(400).json({
            message: err.message,
            success : false
        })
    }
}

const addUserToProject = async (req,res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { projectId, users } = req.body
        
        const userId = req.id;

        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId
        })

        return res.status(200).json({
            project,
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}

const getProjectById = async (req,res) => {
    const {projectId} = req.params;
    try{
        const project = await projectService.getProjectById({projectId});

        return res.status(200).json({
            project,
        })
    }catch(err){
        return res.status(400).json({
            message: err.message,
            success : false
        })
    }
}

const deleteProject = async (req,res) => {
    const {projectId} = req.params;
    try{
        await projectService.deleteProject({projectId});
        return res.json({
            success : true
        })
    }catch(err){
        return res.status(400).json({
            message: err.message,
            success : false
        })
    }
}

const updateFileTree = async (req, res) => {
    const errors = validationResult(req);
    // console.log("form update");
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, fileTree } = req.body;

        const project = await projectService.updateFileTree({
            projectId,
            fileTree
        })

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }

}

module.exports = {
    createProject,
    getAllProject,
    addUserToProject,
    getProjectById,
    updateFileTree,
    deleteProject
};
