const cron = require('node-cron');
const Task = require('../models/Task');
const { client } = require('../whatsapp');

cron.schedule("*/5 * * * *", async () => {
  console.log("Checking for tasks to send...");

  const now = new Date();

  // Mengambil tugas yang belum pernah dikirim atau perlu dikirim ulang
  const tasks = await Task.find({
    deadlineDate: { $gte: now }, // Hanya tugas yang belum lewat deadline
    sent: { $ne: true }, // Tugas yang belum dikirim
  }).populate("users");

  for (const task of tasks) {
    // Menghitung selisih waktu
    const deadline = new Date(task.deadlineDate);
    const [hour, minute] = task.deadlineTime.split(':');
    deadline.setHours(hour, minute, 0);

    const timeUntilDeadline = deadline - now; // Selisih waktu dalam milidetik
    const daysUntilDeadline = Math.floor(timeUntilDeadline / (1000 * 60 * 60 * 24)); // Menghitung hari sampai deadline

    // Tentukan pesan berdasarkan selisih waktu
    let message = `Halo, tugas baru nih! 🎉\n\n🔹 *Tugas:* ${task.name}\n📝 *Deskripsi:* ${task.description}\n⏰ *Tanggal Deadline:* ${new Date(task.deadlineDate).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })}, Pukul ${task.deadlineTime}\n`;

    if (daysUntilDeadline === 3) {
      message += '🚨 Tugas ini harus diselesaikan dalam 3 hari! \n';
    } else if (daysUntilDeadline === 1) {
      message += '🚨 *Urgent:* Deadline tinggal 1 hari lagi! \n';
    }

    for (const user of task.users) {
      try {
        await client.sendMessage(
          `${user.phoneNumber}@c.us`,
          message
        );
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }

    // Tandai task sebagai sudah dikirim
    task.sent = true;
    await task.save();
  }
});
