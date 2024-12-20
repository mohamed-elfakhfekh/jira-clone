FROM node:18-alpine

WORKDIR /app

# Install dependencies required for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]