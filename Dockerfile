# Use the official Node runtime as the base image
FROM node:22-alpine

# Enable corepack
RUN corepack enable

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and yarn.lock files first (for caching dependencies)
COPY package.json yarn.lock ./

# Ensure we use `node_modules` instead of Yarn PnP
RUN yarn config set nodeLinker node-modules

# Install dependencies
RUN yarn install --immutable

# Copy the rest of the application code
COPY . .

# Generate Prisma Client **after** copying the schema
RUN yarn prisma generate

# Build the application
RUN yarn build

# Expose the port that the application will run on
EXPOSE 5001

# Start the application
CMD ["yarn", "start"]