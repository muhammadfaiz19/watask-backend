const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth()  // Menyimpan sesi agar tidak perlu memindai QR Code setiap kali
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });  // Menampilkan QR code
  console.log('QR Code received, scan the QR code');
});

client.on('ready', () => {
  console.log('WhatsApp Client is ready!');
});

client.on('auth_failure', () => {
  console.log('Authentication failed, please try again.');
});

client.initialize();

module.exports = { client };
