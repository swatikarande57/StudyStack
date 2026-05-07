import { apiClient } from './apiClient';

export async function fetchTasks({ userId, role }) {
  const query = new URLSearchParams({ userId, role });
  const payload = await apiClient.get(`/tasks?${query.toString()}`);
  return payload.tasks ?? [];
}

export async function createTask(task) {
  const payload = await apiClient.post('/tasks', task);
  return payload.task;
}

export async function updateTask(id, changes) {
  const payload = await apiClient.patch(`/tasks/${id}`, changes);
  return payload.task;
}

export async function fetchGoals(studentId) {
  const payload = await apiClient.get(`/goals?studentId=${studentId}`);
  return payload;
}

export async function createGoal(goal) {
  const payload = await apiClient.post('/goals', goal);
  return payload.goal;
}

export async function updateGoalProgress(id, completionPercentage) {
  const payload = await apiClient.patch(`/goals/${id}/progress`, { completionPercentage });
  return payload.goal;
}

export async function fetchStudentProgress(studentId) {
  return apiClient.get(`/progress/student?studentId=${studentId}`);
}

export async function fetchTeacherInsights(teacherId) {
  return apiClient.get(`/progress/teacher-insights?teacherId=${teacherId}`);
}

export async function assignPracticeTasks(teacherId) {
  return apiClient.post('/progress/assign-practice', { teacherId });
}

export async function fetchNotifications(userId) {
  const payload = await apiClient.get(`/notifications?userId=${userId}`);
  return payload.notifications ?? [];
}

export async function markNotificationRead(id) {
  const payload = await apiClient.patch(`/notifications/${id}/read`, {});
  return payload.notification;
}

export async function sendReminder(userId, message, sendEmail = true) {
  const payload = await apiClient.post('/notifications', {
    user_id: userId,
    message,
    type: 'warning',
    send_email: sendEmail
  });
  return payload.notification;
}

export async function askMentor(messages) {
  const payload = await apiClient.post('/ai/mentor', { messages });
  return payload.message;
}

export async function getWeaknessInsights(studentId, teacherId) {
  return apiClient.post('/ai/weakness-detection', { studentId, teacherId });
}

export async function requestPasswordReset(email) {
  return apiClient.post('/auth/forgot-password', {
    email,
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

export async function resetPassword(accessToken, refreshToken, password) {
  return apiClient.post('/auth/reset-password', { accessToken, refreshToken, password });
}
