import express from 'express';
import * as progressController from '../controllers/progressController.js';

const router = express.Router();

router.get('/student', progressController.getStudentProgress);
router.get('/teacher-insights', progressController.getTeacherInsights);
router.post('/assign-practice', progressController.assignPracticeToWeakStudents);

export default router;
