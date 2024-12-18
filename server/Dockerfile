FROM node:18-alpine

WORKDIR /app

# Add OpenSSL and required dependencies
RUN apk add --no-cache openssl openssl-dev \
    && apk add --no-cache libc6-compat

# Copy package files first for better caching
COPY package*.json ./

# Copy Prisma files
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Create a script to run migrations and start the app
RUN echo "#!/bin/sh\nnpx prisma migrate deploy\nnpx prisma db seed\nnpm run dev" > /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]