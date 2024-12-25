import { addMinutes, addHours, addDays, addWeeks, addMonths, isAfter, isBefore, parseISO } from 'date-fns';
import { store } from '../store';
import { addNotification } from '../store/slices/notificationSlice';
import websocketService from './websocket';

export const REMINDER_TYPES = {
  MINUTES: 'minutes',
  HOURS: 'hours',
  DAYS: 'days',
};

export const RECURRENCE_TYPES = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom',
};

class EventScheduler {
  constructor() {
    this.reminders = new Map();
    this.recurrences = new Map();
  }

  scheduleReminder(event, reminderType, amount) {
    const reminderTime = this.calculateReminderTime(event.startTime, reminderType, amount);
    const now = new Date();

    if (isAfter(reminderTime, now)) {
      const timerId = setTimeout(() => {
        this.triggerReminder(event);
      }, reminderTime.getTime() - now.getTime());

      const reminderId = `${event._id}-${reminderType}-${amount}`;
      this.reminders.set(reminderId, timerId);

      return reminderId;
    }
    return null;
  }

  calculateReminderTime(eventTime, reminderType, amount) {
    const startTime = parseISO(eventTime);
    switch (reminderType) {
      case REMINDER_TYPES.MINUTES:
        return addMinutes(startTime, -amount);
      case REMINDER_TYPES.HOURS:
        return addHours(startTime, -amount);
      case REMINDER_TYPES.DAYS:
        return addDays(startTime, -amount);
      default:
        return startTime;
    }
  }

  triggerReminder(event) {
    const notification = {
      type: 'event_reminder',
      title: 'Event Reminder',
      message: `${event.title} starts in ${event.reminderTime}`,
      data: {
        eventId: event._id,
        groupId: event.groupId,
      },
      createdAt: new Date().toISOString(),
    };

    store.dispatch(addNotification(notification));
    websocketService.socket?.emit('notification', notification);
  }

  cancelReminder(reminderId) {
    const timerId = this.reminders.get(reminderId);
    if (timerId) {
      clearTimeout(timerId);
      this.reminders.delete(reminderId);
    }
  }

  scheduleRecurrence(event) {
    if (!event.recurrence || event.recurrence.type === RECURRENCE_TYPES.NONE) {
      return;
    }

    const recurrenceId = `${event._id}-recurrence`;
    const nextOccurrence = this.calculateNextOccurrence(event);

    if (nextOccurrence) {
      const timerId = setTimeout(() => {
        this.createRecurringEvent(event, nextOccurrence);
      }, nextOccurrence.getTime() - new Date().getTime());

      this.recurrences.set(recurrenceId, timerId);
    }

    return recurrenceId;
  }

  calculateNextOccurrence(event) {
    const lastOccurrence = parseISO(event.startTime);
    const recurrence = event.recurrence;

    switch (recurrence.type) {
      case RECURRENCE_TYPES.DAILY:
        return addDays(lastOccurrence, 1);
      case RECURRENCE_TYPES.WEEKLY:
        return addWeeks(lastOccurrence, 1);
      case RECURRENCE_TYPES.BIWEEKLY:
        return addWeeks(lastOccurrence, 2);
      case RECURRENCE_TYPES.MONTHLY:
        return addMonths(lastOccurrence, 1);
      case RECURRENCE_TYPES.CUSTOM:
        return this.calculateCustomRecurrence(event);
      default:
        return null;
    }
  }

  calculateCustomRecurrence(event) {
    const { interval, unit, daysOfWeek, endDate } = event.recurrence;
    const lastOccurrence = parseISO(event.startTime);

    let nextDate;
    switch (unit) {
      case 'days':
        nextDate = addDays(lastOccurrence, interval);
        break;
      case 'weeks':
        nextDate = addWeeks(lastOccurrence, interval);
        break;
      case 'months':
        nextDate = addMonths(lastOccurrence, interval);
        break;
      default:
        return null;
    }

    if (endDate && isAfter(nextDate, parseISO(endDate))) {
      return null;
    }

    if (daysOfWeek && daysOfWeek.length > 0) {
      while (!daysOfWeek.includes(nextDate.getDay())) {
        nextDate = addDays(nextDate, 1);
        if (endDate && isAfter(nextDate, parseISO(endDate))) {
          return null;
        }
      }
    }

    return nextDate;
  }

  async createRecurringEvent(template, nextOccurrence) {
    const duration = parseISO(template.endTime).getTime() - parseISO(template.startTime).getTime();
    const endTime = new Date(nextOccurrence.getTime() + duration);

    const newEvent = {
      ...template,
      _id: undefined,
      startTime: nextOccurrence.toISOString(),
      endTime: endTime.toISOString(),
      responses: [],
      isRecurring: true,
      parentEventId: template._id,
    };

    try {
      const response = await fetch(`/api/groups/${template.groupId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        throw new Error('Failed to create recurring event');
      }

      const createdEvent = await response.json();
      this.scheduleRecurrence(createdEvent);
    } catch (error) {
      console.error('Error creating recurring event:', error);
    }
  }

  cancelRecurrence(recurrenceId) {
    const timerId = this.recurrences.get(recurrenceId);
    if (timerId) {
      clearTimeout(timerId);
      this.recurrences.delete(recurrenceId);
    }
  }

  scheduleEvent(event) {
    // Schedule reminders
    if (event.reminders) {
      event.reminders.forEach(reminder => {
        this.scheduleReminder(event, reminder.type, reminder.amount);
      });
    }

    // Schedule recurrence
    if (event.recurrence && event.recurrence.type !== RECURRENCE_TYPES.NONE) {
      this.scheduleRecurrence(event);
    }
  }

  cancelEvent(event) {
    // Cancel reminders
    event.reminders?.forEach(reminder => {
      const reminderId = `${event._id}-${reminder.type}-${reminder.amount}`;
      this.cancelReminder(reminderId);
    });

    // Cancel recurrence
    const recurrenceId = `${event._id}-recurrence`;
    this.cancelRecurrence(recurrenceId);
  }
}

export const eventScheduler = new EventScheduler();
export default eventScheduler;
