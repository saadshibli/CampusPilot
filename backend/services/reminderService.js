import Reminder from '../models/Reminder.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Calculate notification time based on reminder date and notification time
const calculateNotificationTime = (reminderDate, notificationTime) => {
  const date = new Date(reminderDate);
  
  switch (notificationTime) {
    case '15min':
      return new Date(date.getTime() - 15 * 60 * 1000);
    case '30min':
      return new Date(date.getTime() - 30 * 60 * 1000);
    case '1hour':
      return new Date(date.getTime() - 60 * 60 * 1000);
    case '1day':
      return new Date(date.getTime() - 24 * 60 * 60 * 1000);
    case '1week':
      return new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
    default:
      return date;
  }
};

// Send email notification
const sendEmailNotification = async (user, reminder) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Reminder: ${reminder.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">📅 Campus Copilot Reminder</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">${reminder.title}</h3>
            ${reminder.description ? `<p style="color: #666;">${reminder.description}</p>` : ''}
            <div style="margin: 15px 0;">
              <strong>Date:</strong> ${new Date(reminder.date).toLocaleDateString()}<br>
              ${reminder.time ? `<strong>Time:</strong> ${reminder.time}<br>` : ''}
              <strong>Priority:</strong> <span style="color: ${getPriorityColor(reminder.priority)};">${reminder.priority}</span><br>
              <strong>Category:</strong> ${reminder.category}
            </div>
            ${reminder.location ? `<p><strong>Location:</strong> ${reminder.location}</p>` : ''}
            ${reminder.notes ? `<p><strong>Notes:</strong> ${reminder.notes}</p>` : ''}
          </div>
          <p style="color: #666; font-size: 14px;">
            This is an automated reminder from Campus Copilot - Your Personal College Assistant.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email notification sent to ${user.email} for reminder: ${reminder.title}`);
    
    return true;
  } catch (error) {
    console.error('Email notification error:', error);
    return false;
  }
};

// Get priority color for email styling
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'urgent': return '#dc3545';
    case 'high': return '#fd7e14';
    case 'medium': return '#ffc107';
    case 'low': return '#28a745';
    default: return '#6c757d';
  }
};

// Process reminders and send notifications
export const sendReminders = async () => {
  try {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Find reminders that need notifications sent
    const reminders = await Reminder.find({
      isActive: true,
      isCompleted: false,
      'notifications.sent': false
    }).populate('user');

    for (const reminder of reminders) {
      for (const notification of reminder.notifications) {
        if (notification.sent) continue;

        const notificationTime = calculateNotificationTime(reminder.date, notification.time);
        
        // Check if it's time to send this notification
        if (notificationTime >= now && notificationTime <= fiveMinutesFromNow) {
          let sent = false;

          // Send notification based on type
          switch (notification.type) {
            case 'email':
              if (reminder.user.preferences?.notifications?.email) {
                sent = await sendEmailNotification(reminder.user, reminder);
              }
              break;
            case 'push':
              // Push notification logic would go here
              // For now, just mark as sent
              sent = true;
              break;
            case 'sms':
              // SMS notification logic would go here
              // For now, just mark as sent
              sent = true;
              break;
            case 'in-app':
              // In-app notification logic would go here
              // For now, just mark as sent
              sent = true;
              break;
          }

          if (sent) {
            notification.sent = true;
            notification.sentAt = new Date();
            await reminder.save();
          }
        }
      }
    }

    console.log(`Processed ${reminders.length} reminders for notifications`);
  } catch (error) {
    console.error('Reminder service error:', error);
  }
};

// Send immediate notification for urgent reminders
export const sendUrgentNotification = async (reminderId) => {
  try {
    const reminder = await Reminder.findById(reminderId).populate('user');
    
    if (!reminder || reminder.isCompleted) {
      return false;
    }

    // Send immediate email notification
    if (reminder.user.preferences?.notifications?.email) {
      await sendEmailNotification(reminder.user, reminder);
    }

    return true;
  } catch (error) {
    console.error('Urgent notification error:', error);
    return false;
  }
};

// Create reminder from deadline
export const createDeadlineReminder = async (deadlineId, userId) => {
  try {
    const Deadline = (await import('../models/Deadline.js')).default;
    const deadline = await Deadline.findById(deadlineId);
    
    if (!deadline) {
      throw new Error('Deadline not found');
    }

    // Create reminder 1 day before deadline
    const reminderDate = new Date(deadline.dueDate);
    reminderDate.setDate(reminderDate.getDate() - 1);

    const reminder = new Reminder({
      user: userId,
      title: `Deadline: ${deadline.title}`,
      description: deadline.description,
      type: 'deadline',
      relatedItem: {
        type: 'deadline',
        id: deadlineId
      },
      date: reminderDate,
      priority: deadline.priority,
      category: 'academic',
      notifications: [
        { type: 'email', time: '1day', sent: false },
        { type: 'in-app', time: '1hour', sent: false }
      ]
    });

    await reminder.save();
    return reminder;
  } catch (error) {
    console.error('Create deadline reminder error:', error);
    throw error;
  }
};

// Create reminder from event
export const createEventReminder = async (eventId, userId) => {
  try {
    const Event = (await import('../models/Event.js')).default;
    const event = await Event.findById(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Create reminder 1 hour before event
    const reminderDate = new Date(event.date.start);
    reminderDate.setHours(reminderDate.getHours() - 1);

    const reminder = new Reminder({
      user: userId,
      title: `Event: ${event.title}`,
      description: event.description,
      type: 'event',
      relatedItem: {
        type: 'event',
        id: eventId
      },
      date: reminderDate,
      priority: event.priority,
      category: 'social',
      location: event.location.venue,
      notifications: [
        { type: 'email', time: '1hour', sent: false },
        { type: 'in-app', time: '30min', sent: false }
      ]
    });

    await reminder.save();
    return reminder;
  } catch (error) {
    console.error('Create event reminder error:', error);
    throw error;
  }
}; 