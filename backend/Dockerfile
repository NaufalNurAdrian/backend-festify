FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY dist ./dist
COPY src/templates ./dist/templates
COPY public ./dist/public

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]