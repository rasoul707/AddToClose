# Stage 1: Build the project
FROM node:18 AS builder

WORKDIR /add-to-class

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .




# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /add-to-class

# Copy package.json and package-lock.json from the builder stage
COPY --from=builder /add-to-class/package.json /add-to-class/package-lock.json ./

# Install only production dependencies
RUN npm install --production

# Copy the build from the first stage
COPY --from=builder /add-to-class .

# Start the application
CMD ["npm", "start"]
