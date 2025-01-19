# Gunakan image node sebagai base image
FROM node:18-alpine

# Install dependensi yang dibutuhkan oleh Puppeteer untuk menjalankan Chromium
RUN apk update && apk add --no-cache \
    bash \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Set working directory dalam container
WORKDIR /src/app

# Copy file package.json dan package-lock.json untuk instalasi dependencies
COPY package*.json ./ 

# Install dependencies
RUN npm install

# Copy seluruh source code ke container
COPY . .

# Set environment variable untuk menunjukkan lokasi Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Ekspose port yang akan digunakan oleh aplikasi
EXPOSE 4000

# Perintah untuk menjalankan aplikasi
CMD ["node", "src/app.js"]