const cron = require('node-cron');
const Task = require('../models/Task');
const { client } = require('../whatsapp');
const { 
  generateTaskCreatedMessage, 
  generateTaskUpdateMessage, 
  generateReminderMessage 
} = require('../utils/messageTemplates');

// Menjadwalkan pengiriman pesan setiap 5 menit
cron.schedule("*/1 * * * *", async () => {
  console.log(`[Scheduler] Initializing reminder task scheduler...`);

  // Validasi apakah client WhatsApp terhubung
  if (!client || !client.pupPage || !client.pupPage.isConnected()) {
    console.error(`[Scheduler] WhatsApp client is not connected.`);
    return;
  }

  const now = new Date();
  try {
    const tasks = await Task.find({
      $and: [
        { sent: { $ne: true } },
        { deadlineDate: { $gte: now.toISOString().split('T')[0] } },
      ],
    }).populate("users");

    for (const task of tasks) {
      const deadline = new Date(task.deadlineDate);
      const [hour, minute] = task.deadlineTime.split(':');
      deadline.setHours(hour, minute, 0);

      const timeUntilDeadline = deadline - now;
      const daysUntilDeadline = Math.floor(timeUntilDeadline / (1000 * 60 * 60 * 24));

      if (daysUntilDeadline <= 3 && daysUntilDeadline >= 0) {
        for (const user of task.users) {
          try {
            const message = generateReminderMessage(user, task, daysUntilDeadline);
            await client.sendMessage(`${user.phoneNumber}@c.us`, message);
          } catch (err) {
            console.error(`[Scheduler] Error sending message to ${user.phoneNumber}: ${err.message}`);
          }
        }

        task.sent = true;
        await task.save();
      }
    }
  } catch (err) {
    console.error(`[Scheduler] Error fetching tasks: ${err.message}`);
  }
});

// Fungsi tambahan untuk notifikasi task saat dibuat atau diperbarui
const sendTaskNotification = async (user, task, action) => {
  if (!client || !client.pupPage || !client.pupPage.isConnected()) {
    throw new Error("WhatsApp client is not connected.");
  }

  let message;
  if (action === 'create') {
    message = generateTaskCreatedMessage(user, task);
  } else if (action === 'update') {
    message = generateTaskUpdateMessage(user, task);
  } else {
    throw new Error("Invalid action type. Use 'create' or 'update'.");
  }

  try {
    await client.sendMessage(`${user.phoneNumber}@c.us`, message);
  } catch (err) {
    console.error(`[Notification] Error sending task notification: ${err.message}`);
    throw err;
  }
};

module.exports = { sendTaskNotification };
