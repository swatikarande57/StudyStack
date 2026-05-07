import * as progressService from '../services/progressService.js';
import * as taskService from '../services/taskService.js';
import * as notificationService from '../services/notificationService.js';

export async function getStudentProgress(req, res) {
  try {
    const progress = await progressService.getStudentProgress(req.query.studentId);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getTeacherInsights(req, res) {
  try {
    const insights = await progressService.getTeacherInsights(req.query.teacherId);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function assignPracticeToWeakStudents(req, res) {
  try {
    const { teacherId } = req.body;
    const insights = await progressService.getTeacherInsights(teacherId);
    const createdTasks = [];

    for (const student of insights.atRiskStudents) {
      const task = await taskService.createTask({
        title: 'Special Practice Task',
        description: 'Focused revision plan generated for improvement.',
        deadline: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
        assigned_by: teacherId,
        assigned_to: student.studentId,
        status: 'pending',
        subject: insights.mostIgnoredSubject || 'General',
      });
      createdTasks.push(task);

      await notificationService.createNotification({
        user_id: student.studentId,
        type: 'warning',
        message: 'You have received a special practice task based on your recent performance.',
      });
    }

    res.json({ assigned: createdTasks.length, tasks: createdTasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
