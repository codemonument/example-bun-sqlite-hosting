FROM oven/bun:1.3-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "src/index.ts"]