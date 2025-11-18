const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const projectController = require('../controller/project.controller');
const isAuthenticate = require('../middleware/isAuthenticate');

// Project CRUD operations
router.post('/create', isAuthenticate,
    body('name').isString().withMessage('Name must be a string'),
    projectController.createProject
);

router.get('/all', isAuthenticate, projectController.getAllProject);

router.get('/:projectId', isAuthenticate, projectController.getProjectById);

router.put('/add-user', isAuthenticate,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be an array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    projectController.addUserToProject
);

router.put('/update-file-tree', isAuthenticate,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('File tree is required'),
    projectController.updateFileTree
);

router.delete('/:projectId', isAuthenticate, projectController.deleteProject);

module.exports = router;
