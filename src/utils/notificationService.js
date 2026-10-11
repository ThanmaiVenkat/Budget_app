import { LocalNotifications } from '@capacitor/local-notifications';
import { billDaysUntil, formatRupees } from './mockData';

/**
 * Checks if notifications are supported and permitted.
 */
export async function getNotificationPermissionStatus() {
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display === 'granted') return 'granted';
    if (perm.display === 'denied') return 'denied';
  } catch {
    // Fallback to browser Notification API
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
  }
  return 'default';
}

/**
 * Requests notification permission from the user.
 */
export async function requestNotificationPermission() {
  try {
    const res = await LocalNotifications.requestPermissions();
    return res.display === 'granted';
  } catch {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      return res === 'granted';
    }
  }
  return false;
}

/**
 * Sends an immediate test/welcome notification.
 */
export async function sendInstantNotification(title, body) {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Math.random() * 100000),
          title,
          body,
          schedule: { at: new Date(Date.now() + 500) }
        }
      ]
    });
    return true;
  } catch {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
      return true;
    }
  }
  return false;
}

/**
 * Schedules reminders for upcoming unpaid bills:
 * - 3 days before due date (at 9:00 AM)
 * - 1 day before due date (at 9:00 AM)
 * - On the due date (at 9:00 AM)
 */
export async function scheduleBillReminders(bills = []) {
  if (!Array.isArray(bills) || bills.length === 0) return;

  const perm = await getNotificationPermissionStatus();
  if (perm !== 'granted') return;

  const notificationsToSchedule = [];
  const now = new Date();

  // Cancel previous pending reminders before rescheduling
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  } catch {
    // Web fallback doesn't have cancel-all, which is fine
  }

  bills.forEach((bill, idx) => {
    if (bill.paid || !bill.dueDate) return;

    const daysLeft = billDaysUntil(bill.dueDate);
    if (daysLeft === null || daysLeft < 0) return;

    const [y, m, d] = bill.dueDate.split('-').map(Number);
    const baseId = (idx + 1) * 10;

    // 3 Days Before Reminder
    const threeDaysBefore = new Date(y, m - 1, d - 3, 9, 0, 0);
    if (threeDaysBefore > now) {
      notificationsToSchedule.push({
        id: baseId + 1,
        title: `🗓️ Bill Reminder: ${bill.title}`,
        body: `${bill.title} (${formatRupees(bill.amount)}) is due in 3 days on ${bill.dueDate}.`,
        schedule: { at: threeDaysBefore }
      });
    }

    // 1 Day Before Reminder
    const oneDayBefore = new Date(y, m - 1, d - 1, 9, 0, 0);
    if (oneDayBefore > now) {
      notificationsToSchedule.push({
        id: baseId + 2,
        title: `⚠️ Due Tomorrow: ${bill.title}`,
        body: `${bill.title} (${formatRupees(bill.amount)}) is due tomorrow! Pay on time to avoid late fees.`,
        schedule: { at: oneDayBefore }
      });
    }

    // Due Date Morning Reminder
    const dueDateMorning = new Date(y, m - 1, d, 9, 0, 0);
    if (dueDateMorning > now) {
      notificationsToSchedule.push({
        id: baseId + 3,
        title: `🚨 Due Today: ${bill.title}`,
        body: `${bill.title} (${formatRupees(bill.amount)}) is due today (${bill.dueDate}).`,
        schedule: { at: dueDateMorning }
      });
    }
  });

  if (notificationsToSchedule.length > 0) {
    try {
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule
      });
    } catch {
      // Ignored if background schedule fails
    }
  }
}
