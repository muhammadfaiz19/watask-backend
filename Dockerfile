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

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
