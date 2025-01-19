FROM node:18-alpine as builder

WORKDIR /src/app

COPY package*.json ./
RUN npm install --only=production --cache-dir=/cache

COPY . .

FROM node:18-alpine

WORKDIR /app

# Copy only the necessary files from the previous stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]