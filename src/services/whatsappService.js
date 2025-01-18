const cron = require('node-cron');
const Task = require('../models/Task');
const { client } = require('../whatsapp');
const { 
  generateTaskCreatedMessage, 
  generateTaskUpdateMessage, 
  generateReminderMessage 
} = require('../utils/messageTemplates');

// Menjadwalkan pengiriman pesan setiap 5 menit
cron.schedule("*/5 * * * *", async () => {
  console.log("Scheduler is initialized.");
  console.log("Running reminder task scheduler...");

  // Validasi apakah client WhatsApp terhubung
  if (!client || !client.pupPage || !client.pupPage.isConnected()) {
    console.error("WhatsApp client is not connected yet.");
    return;
  }

  const now = new Date();
  console.log("Current time:", now);

  try {
    // Ambil semua task yang belum dikirim
    const tasks = await Task.find({
      $and: [
        { sent: { $ne: true } },
        { deadlineDate: { $gte: now.toISOString().split('T')[0] } },
      ],
    }).populate("users");

    console.log("Fetched tasks:", tasks.map(task => ({
      id: task._id,
      deadlineDate: task.deadlineDate,
      deadlineTime: task.deadlineTime,
      sent: task.sent,
    })));

    for (const task of tasks) {
      try {
        // Validasi dan hitung deadline
        const deadline = new Date(task.deadlineDate);
        const [hour, minute] = task.deadlineTime.split(':');
        if (isNaN(hour) || isNaN(minute)) {
          console.error(`Invalid deadlineTime format for task ${task._id}:`, task.deadlineTime);
          continue;
        }
        deadline.setHours(hour, minute, 0);

        const timeUntilDeadline = deadline - now;
        const daysUntilDeadline = Math.floor(timeUntilDeadline / (1000 * 60 * 60 * 24));

        console.log({
          taskId: task._id,
          deadlineDate: task.deadlineDate,
          deadlineTime: task.deadlineTime,
          calculatedDeadline: deadline,
          now,
          timeUntilDeadline,
          daysUntilDeadline,
        });

        // Kirimkan pesan jika berada dalam range H-0 sampai H-3
        if (daysUntilDeadline <= 3 && daysUntilDeadline >= 0) {
          console.log(`Preparing to send reminder for task ${task._id}`);

          // Kirim pesan ke setiap pengguna terkait task ini
          for (const user of task.users) {
            try {
              const message = generateReminderMessage(user, task, daysUntilDeadline);
              console.log(`Sending message to: ${user.phoneNumber}@c.us`);
              await client.sendMessage(`${user.phoneNumber}@c.us`, message);
              console.log(`Message sent to ${user.phoneNumber}`);
            } catch (err) {
              console.error(`Failed to send message to ${user.phoneNumber}:`, err);
            }
          }

          // Tandai task sebagai telah terkirim
          task.sent = true;
          await task.save();
          console.log(`Task ${task._id} marked as sent.`);
        } else {
          console.log(`Task ${task._id} is not within the reminder range.`);
        }
      } catch (err) {
        console.error(`Error processing task ${task._id}:`, err);
      }
    }
  } catch (err) {
    console.error("Error fetching tasks:", err);
  }

  console.log("Reminder task scheduler finished.");
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
    console.log(`Sending ${action} notification to: ${user.phoneNumber}@c.us`);
    await client.sendMessage(`${user.phoneNumber}@c.us`, message);
    console.log(`${action.charAt(0).toUpperCase() + action.slice(1)} notification sent to ${user.phoneNumber}`);
  } catch (err) {
    console.error("Failed to send task notification:", err);
    throw err;
  }
};

module.exports = { sendTaskNotification };
