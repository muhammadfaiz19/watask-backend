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
        this.db = clientMongo.db('whatsapp_sessions'); // Gunakan database yang diinginkan
        this.collection = this.db.collection('sessions'); // Koleksi untuk menyimpan session
    }

    // Menyimpan session ke MongoDB
    async saveSession(session) {
        await this.collection.updateOne(
            { _id: 'whatsapp_session' }, // Gunakan ID untuk session ini
            { $set: { session: session } }, // Set session baru
            { upsert: true } // Jika tidak ada, buat baru
        );
    }

    // Memuat session dari MongoDB
    async loadSession() {
        const sessionDoc = await this.collection.findOne({ _id: 'whatsapp_session' });
        return sessionDoc ? sessionDoc.session : null; // Mengembalikan session jika ada
    }

    // Menghapus session dari MongoDB
    async deleteSession() {
        await this.collection.deleteOne({ _id: 'whatsapp_session' });
    }
}

// Membuat client WhatsApp menggunakan MongoAuth untuk session
const client = new Client({
    authStrategy: new MongoAuth(), // Menggunakan MongoDB untuk session
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
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
