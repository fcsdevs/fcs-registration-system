FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine

RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]
