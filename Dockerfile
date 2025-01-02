FROM node:18-alpine

# Install dependencies untuk Chromium dan Puppeteer
RUN apk update && apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    fontconfig \
    && rm -rf /var/cache/apk/*

# Tentukan path ke executable Chrome
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"

WORKDIR /usr/src/app

# Salin package.json dan install dependensi
COPY package*.json ./
RUN npm install --omit=dev

# Salin semua file aplikasi
COPY . .

# Set environment variable
ENV NODE_ENV=production

# Expose port aplikasi
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]
