# Gunakan image node sebagai base image
FROM node:18-alpine

# Install dependensi sistem yang diperlukan untuk Chromium
RUN apk add --no-cache \
  bash \
  curl \
  freetype \
  gdk-pixbuf \
  git \
  glib \
  harfbuzz \
  icu-libs \
  libjpeg-turbo \
  libpng \
  libwebp \
  nss \
  ttf-freefont \
  udev \
  && rm -rf /var/cache/apk/*

# Set working directory dalam container
WORKDIR /src/app

# Copy file package.json dan package-lock.json untuk instalasi dependencies
COPY package*.json ./

# Install dependencies (puppeteer di sini mengunduh Chromium secara otomatis)
RUN npm install

# Copy seluruh source code ke container
COPY . .

# Ekspose port yang akan digunakan oleh aplikasi
EXPOSE 4000

# Perintah untuk menjalankan aplikasi
CMD ["node", "src/app.js"]
