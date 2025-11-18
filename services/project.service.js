const projectModel = require('../model/projectModel');
const mongoose = require('mongoose');
const createProject = async ({name , userId}) => {
    if(!name){
        throw new Error('Project name is required');
    }
    if(!userId){
        throw new Error('User ID is required');
    }
    let project;
    try {
        project = await projectModel.create({
            name,
            users: [ userId ]
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Project name already exists');
        }
        throw error;
    }


    return project;
}

const getAllProjectByUserId = async ({userId}) => {
    if(!userId){
        throw new Error('User ID is required');
    };
    const allUserProject = await projectModel
                            .find({users : userId})
                            .populate('users')

    return allUserProject;
}

const addUsersToProject = async ({ projectId, users, userId }) => {

    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!users) {
        throw new Error("users are required")
    }

    if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error("Invalid userId(s) in users array")
    }

    if (!userId) {
        throw new Error("userId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId")
    }


    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    })

    console.log(project)

    if (!project) {
        throw new Error("User not belong to this project")
    }

    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, {
        new: true
    })

    return updatedProject
}

const getProjectById = async ({projectId}) => {
    if(!projectId){
        throw new Error("projectId is required")
    };

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("Invalid projectId")
    };

    const project = await projectModel.findOne({
        _id : projectId
    }).populate('users');

    return project;
}

const deleteProject = async ({projectId}) => {
    if(!projectId){
        throw new Error("projectId is required")
    };

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("Invalid projectId")
    };
    const deleted = await projectModel.findByIdAndDelete(projectId);
    if (!deleted) {
      throw new Error("Project not found or already deleted");
    }

    return;
}

const updateFileTree = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!fileTree) {
        throw new Error("fileTree is required")
    }

    const project = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new: true
    })

    return project;
}

module.exports = {
    createProject,
    getAllProjectByUserId,
    addUsersToProject,
    getProjectById,
    updateFileTree,
    deleteProject
}