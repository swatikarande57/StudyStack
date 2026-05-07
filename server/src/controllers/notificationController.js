import * as notificationService from '../services/notificationService.js';

export async function getNotifications(req, res) {
  try {
    const notifications = await notificationService.listNotifications(req.query.userId);
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createNotification(req, res) {
  try {
    const notification = await notificationService.createNotification(req.body);
    res.status(201).json({ notification });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function markRead(req, res) {
  try {
    const notification = await notificationService.markNotificationRead(req.params.id);
    res.json({ notification });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
