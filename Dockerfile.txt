FROM node:18-alpine
RUN apk add --no-cache ffmpeg python3 make g++
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["node", "index.js"]