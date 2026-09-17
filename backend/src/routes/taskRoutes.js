const express = require('express');
const controller = require('../controllers/taskController');
const { validateCreate, validateUpdate, validateId } = require('../middleware/validateTask');

const router = express.Router();

router.get('/', controller.listTasks);
router.post('/', validateCreate, controller.createTask);
router.get('/:id', validateId, controller.getTask);
router.put('/:id', validateId, validateUpdate, controller.updateTask);
router.delete('/:id', validateId, controller.deleteTask);

module.exports = router;
