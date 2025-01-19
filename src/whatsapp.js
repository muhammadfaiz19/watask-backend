const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Koneksi MongoDB
const mongoUri = process.env.MONGO_URI;
const clientMongo = new MongoClient(mongoUri);

clientMongo.connect()
  .then(() => console.log('[MongoDB] Connected to database'))
  .catch(err => {
    console.error('[MongoDB] Connection error:', err.message);
    process.exit(1);
  });

// MongoAuth untuk menyimpan sesi ke MongoDB
class MongoAuth extends LocalAuth {
  constructor() {
    super();
    this.db = clientMongo.db('whatsapp_sessions');
    this.collection = this.db.collection('sessions');
  }

  async saveSession(session) {
    await this.collection.updateOne(
      { _id: 'whatsapp_session' },
      { $set: { session } },
      { upsert: true }
    );
  }

  async loadSession() {
    const sessionDoc = await this.collection.findOne({ _id: 'whatsapp_session' });
    return sessionDoc ? sessionDoc.session : null;
  }
}

// Membuat client WhatsApp
const client = new Client({
  authStrategy: new MongoAuth(),
  puppeteer: {
    headless: process.env.ENVIRONMENT === 'production', // Tentukan mode headless sesuai dengan kebutuhan
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  },
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('[WhatsApp] QR Code received, please scan');
});

client.on('ready', () => {
  console.log('[WhatsApp] Client is ready!');
});

client.on('auth_failure', msg => {
  console.error('[WhatsApp] Authentication failure:', msg);
});

client.initialize();

module.exports = { client };
