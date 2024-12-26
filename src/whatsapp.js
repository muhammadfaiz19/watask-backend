const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Koneksi MongoDB
const mongoUri = process.env.MONGO_URI;
const clientMongo = new MongoClient(mongoUri);

clientMongo.connect().then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Membuat kelas MongoAuth untuk menyimpan session ke MongoDB
class MongoAuth extends LocalAuth {
    constructor() {
        super();
        this.db = clientMongo.db('whatsapp_sessions');
        this.collection = this.db.collection('sessions');
    }

    async saveSession(session) {
        await this.collection.updateOne(
            { _id: 'whatsapp_session' },
            { $set: { session: session } },
            { upsert: true }
        );
    }

    async loadSession() {
        const sessionDoc = await this.collection.findOne({ _id: 'whatsapp_session' });
        return sessionDoc ? sessionDoc.session : null;
    }

    async deleteSession() {
        await this.collection.deleteOne({ _id: 'whatsapp_session' });
    }
}

// Membuat client WhatsApp menggunakan MongoAuth untuk session
const client = new Client({
    authStrategy: new MongoAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--remote-debugging-port=9222',
        ]
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
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
