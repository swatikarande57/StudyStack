import * as goalService from '../services/goalService.js';

export async function getGoals(req, res) {
  try {
    const goals = await goalService.listGoals(req.query.studentId);
    res.json({ goals, unlockThreshold: goalService.getUnlockThreshold() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createGoal(req, res) {
  try {
    const goal = await goalService.createGoal(req.body);
    res.status(201).json({ goal });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateGoalProgress(req, res) {
  try {
    const goal = await goalService.updateGoalProgress(req.params.id, Number(req.body.completionPercentage ?? 0));
    res.json({ goal });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
