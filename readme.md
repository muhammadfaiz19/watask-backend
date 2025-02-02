# Watask Backend

Backend untuk aplikasi Task Management Watask V2. Backend ini menyediakan API untuk manajemen tugas, termasuk pengingat WhatsApp, dan terhubung ke database MongoDB.

## Fitur

*   **API Tugas**: Endpoint untuk manajemen tugas (CRUD - Create, Read, Update, Delete).
*   **Integrasi WhatsApp**: Kirim notifikasi pengingat ke WhatsApp.
*   **Database**: Koneksi ke MongoDB untuk penyimpanan data.
*   **Autentikasi**: Registrasi dan Login user dengan JWT (JSON Web Token).
*   **Manajemen User**: CRUD User, Update Profile, Update Password.

## Teknologi yang Digunakan

*   **Node.js**: [https://nodejs.org/](https://nodejs.org/)
*   **Express.js**: [https://expressjs.com/](https://expressjs.com/)
*   **MongoDB**: [https://www.mongodb.com/](https://www.mongodb.com/)
*   **Library ORM/ODM**: [Mongoose](https://mongoosejs.com/) atau library lainnya yang Anda gunakan untuk berinteraksi dengan MongoDB.
*   **Integrasi WhatsApp**: [whatsapp-web.js](https://www.npmjs.com/package/whatsapp-web.js)

## Cara Menjalankan

1.  Clone repositori ini:

    ```bash
    git clone https://github.com/muhammadfaiz19/watask-backend.git
    ```

2.  Pindah ke direktori project:

    ```bash
    cd watask-backend
    ```

3.  Install dependencies:

    ```bash
    npm install
    ```

4.  Buat file `.env` di root direktori project dan tambahkan variabel lingkungan yang diperlukan:

    ```
    MONGODB_URI=your_mongodb_uri
    PORT=your_port (misalnya 3001)
    JWT_SECRET=your_jwt_secret (misalnya, sebuah string acak)
    ```

5.  Jalankan server:

    ```bash
    npm run dev
    ```

Server akan berjalan di *port* yang Anda tentukan.

## Konfigurasi

*   **MongoDB**: Pastikan Anda telah menginstal dan menjalankan MongoDB. Ganti `your_mongodb_uri` di file `.env` dengan URI koneksi ke database MongoDB Anda.
*   **JWT Secret:** Ganti `your_jwt_secret` dengan string acak dan aman yang akan digunakan untuk menandatangani token JWT.

## Repositori Frontend

[watask-frontend](https://github.com/muhammadfaiz19/watask-v2)