const generateTaskCreatedMessage = (user, task) => {
  return `*Halo, ${user.name}! Tugas baru telah dibuat!* 🎉\n\n` +  
    `📚 *Tugas Matakuliah:* ${task.name}\n` +
    `📝 *Deskripsi:* ${task.description}\n` +
    `⏰ *Deadline:* ${new Date(task.deadlineDate).toLocaleString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })}, Pukul ${task.deadlineTime}\n` +
    `🚀 *Jangan lupa menyelesaikan tugas ini tepat waktu!* 💪`;
};

const generateTaskUpdateMessage = (user, task) => {
  return `*Halo, ${user.name}! Tugas telah diperbarui!* ✨\n\n` +
    `📚 *Tugas:* ${task.name}\n` +
    `📝 *Deskripsi Baru:* ${task.description}\n` +
    `⏰ *Deadline Baru:* ${new Date(task.deadlineDate).toLocaleString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })}, Pukul ${task.deadlineTime}\n` +
    `🚀 *Tetap semangat menyelesaikan tugas ini!* 💪`;
};

const generateReminderMessage = (user, task, daysUntilDeadline) => {
  let message;

  if (daysUntilDeadline === 3) {
    message = `⚠️ *Halo, ${user.name}! Tugasmu hampir jatuh tempo, H-3! ⚠️*\n\n` +
      `📚 *Tugas:* ${task.name}\n` +
      `📝 *Deskripsi:* ${task.description}\n` +
      `⏰ *Deadline:* ${new Date(task.deadlineDate).toLocaleString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })}, Pukul ${task.deadlineTime}\n` +
      `🚨 *Prioritas:* Waktunya hampir habis! ⚠️\n\n` +
      `⏳ *Yuk, pastikan tugas ini selesai tepat waktu!* 🌟`;
  } else if (daysUntilDeadline === 1) {
    message = `⏰ *Halo, ${user.name}! H-1! Tugas tinggal 1 hari lagi! ⏳*\n\n` +
      `📚 *Tugas:* ${task.name}\n` +
      `📝 *Deskripsi:* ${task.description}\n` +
      `⏰ *Deadline:* ${new Date(task.deadlineDate).toLocaleString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })}, Pukul ${task.deadlineTime}\n` +
      `🚨 *Prioritas:* Tinggal 1 hari lagi! ⏰\n\n` +
      `⏳ *Jangan sampai terlewat! Selesaikan tugasmu dengan baik!* 💪`;
  }

  return message;
};

module.exports = {
  generateTaskCreatedMessage,
  generateTaskUpdateMessage,
  generateReminderMessage,
};
