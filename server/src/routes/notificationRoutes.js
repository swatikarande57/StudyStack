import express from 'express';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', notificationController.getNotifications);
router.post('/', notificationController.createNotification);
router.patch('/:id/read', notificationController.markRead);

export default router;
