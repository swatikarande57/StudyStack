import * as taskService from '../services/taskService.js';

export async function getTasks(req, res) {
  try {
    const tasks = await taskService.listTasks({
      userId: req.query.userId,
      role: req.query.role ?? 'student',
    });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createTask(req, res) {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json({ task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateTask(req, res) {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.json({ task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteTask(req, res) {
  try {
    const result = await taskService.removeTask(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
