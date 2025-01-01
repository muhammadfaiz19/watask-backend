const cron = require('node-cron');
const Task = require('../models/Task'); // Import model Task
const { client } = require('../whatsapp'); // Import client WhatsApp

// Menjadwalkan pengiriman pesan setiap 5 menit
cron.schedule("*/5 * * * *", async () => {
  console.log("Checking for tasks to send...");

  // Pastikan client WhatsApp sudah terhubung sebelum mencoba mengirim pesan
  if (!client || !client.pupPage || !client.pupPage.isConnected()) {
    console.log("WhatsApp client is not connected yet.");
    return;
  }

  const now = new Date();
  const tasks = await Task.find({
    deadlineDate: { $gte: now },
    sent: { $ne: true },
  }).populate("users");

  // Iterasi melalui semua task yang perlu dikirim
  for (const task of tasks) {
    const deadline = new Date(task.deadlineDate);
    const [hour, minute] = task.deadlineTime.split(':');
    deadline.setHours(hour, minute, 0);
    const timeUntilDeadline = deadline - now;
    const daysUntilDeadline = Math.floor(timeUntilDeadline / (1000 * 60 * 60 * 24));

    let message = `Halo, tugas baru nih! \n\n🔹 *Tugas:* ${task.name}\n📝 *Deskripsi:* ${task.description}\n⏰ *Tanggal Deadline:* ${new Date(task.deadlineDate).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })}, Pukul ${task.deadlineTime}\n`;

    // Menambahkan pesan khusus berdasarkan waktu deadline
    if (daysUntilDeadline === 3) {
      message += '🚨 Tugas ini harus diselesaikan dalam 3 hari! \n';
    } else if (daysUntilDeadline === 1) {
      message += '🚨 *Urgent:* Deadline tinggal 1 hari lagi! \n';
    }

    // Mengirim pesan ke semua pengguna terkait task ini
    for (const user of task.users) {
      try {
        console.log(`Sending message to: ${user.phoneNumber}@c.us`);
        await client.sendMessage(`${user.phoneNumber}@c.us`, message);
        console.log(`Message sent to ${user.phoneNumber}`);
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }

    // Tandai task sebagai telah terkirim dan simpan
    task.sent = true;
    await task.save();
  }
});
