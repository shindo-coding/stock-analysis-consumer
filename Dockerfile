# Build stage
FROM node:20.6-alpine AS build

ENV TZ="Asia/Ho_Chi_Minh"

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

# Install the Nest CLI globally
RUN npm install -g @nestjs/cli
RUN npx prisma generate

RUN npm run build

# Production stage
FROM node:20.6-alpine

ENV NODE_ENV=production
ENV EXPOSE_PORT=80
ENV TZ="Asia/Ho_Chi_Minh"

WORKDIR /app

RUN apk add --no-cache tzdata \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001 \
    && cp /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone

COPY --from=build /app/package*.json ./
RUN npm ci --only=production

COPY --chown=nodejs:nodejs --from=build /app/node_modules/.prisma/client  ./node_modules/.prisma/client
COPY --chown=nodejs:nodejs --from=build /app/prisma /app/prisma
COPY --chown=nodejs:nodejs --from=build /app/dist ./dist

USER nodejs

EXPOSE 80
CMD ["node", "dist/main.js"]
