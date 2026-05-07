import express from 'express';
import * as goalController from '../controllers/goalController.js';

const router = express.Router();

router.get('/', goalController.getGoals);
router.post('/', goalController.createGoal);
router.patch('/:id/progress', goalController.updateGoalProgress);

export default router;
