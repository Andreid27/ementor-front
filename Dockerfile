# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install project dependencies
RUN yarn install

# Copy the rest of the application code to the container
COPY . .
COPY ./.env ./.env
COPY package*.json ./

# Build your React application (you may need to adjust this based on your project setup)
RUN yarn build

# Expose the port that the application will run on (adjust as needed)
EXPOSE 3000

# Start your React application
CMD ["yarn", "start"]
