FROM node:18-alpine

# Install dependencies untuk menjalankan Chrome
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

# Copy package.json dan package-lock.json
COPY package*.json ./
RUN npm install

# Copy semua file aplikasi ke dalam container
COPY . .

# Set environment variable untuk menjalankan aplikasi
ENV NODE_ENV=production
ENV MONGO_URI=${MONGO_URI}

# Start aplikasi
CMD ["npm", "start"]
