# Build stage
FROM node:20.6-alpine AS build

ENV TZ="Asia/Ho_Chi_Minh"

WORKDIR /app

COPY package*.json .npmrc ./

# Add authentication for GitHub packages
ARG NODE_AUTH_TOKEN
RUN if [ -n "$NODE_AUTH_TOKEN" ]; then \
    echo "//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}" >> .npmrc \
    echo "@shindo-coding:registry=https://npm.pkg.github.com/" > .npmrc && \
  else \
    echo "NODE_AUTH_TOKEN is not set"; \
    exit 1; \
  fi

RUN npm ci

COPY . .

# Install the Nest CLI globally
RUN npm install -g @nestjs/cli

RUN npm run build

# Clean up sensitive data
RUN rm -f .npmrc

# Production stage
FROM node:20.6-alpine

ENV NODE_ENV=production
ENV EXPOSE_PORT=80
ENV TZ="Asia/Ho_Chi_Minh"

# Add authentication for GitHub packages
ARG NODE_AUTH_TOKEN
ENV NODE_AUTH_TOKEN=$NODE_AUTH_TOKEN

WORKDIR /app

RUN apk add --no-cache tzdata
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN cp /usr/share/zoneinfo/$TZ /etc/localtime
RUN echo $TZ > /etc/timezone

# Create .npmrc with authentication
RUN echo "@shindo-coding:registry=https://npm.pkg.github.com/" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}" >> .npmrc

COPY --from=build /app/package*.json ./
RUN npm ci --only=production && \
    rm -f .npmrc

# Create logs directory and set permissions
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app/logs

COPY --chown=nodejs:nodejs --from=build /app/node_modules/.prisma/client  ./node_modules/.prisma/client
# COPY --chown=nodejs:nodejs --from=build /app/prisma /app/prisma
COPY --chown=nodejs:nodejs --from=build /app/dist ./dist

USER nodejs

EXPOSE 80
CMD ["node", "dist/main.js"]
