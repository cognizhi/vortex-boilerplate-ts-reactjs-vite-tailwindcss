# Dockerfile

# Step 1: Use Bun base image (bun is this project's runner — see AGENT.md)
FROM oven/bun:1 AS build

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package.json and bun.lock
COPY package.json bun.lock ./

# Step 4: Install dependencies. --ignore-scripts: better-sqlite3's install
# script (prebuild-install → node-gyp fallback) fails under bun in this bare
# image, and the build stage never loads the native binding anyway (tsc + vite
# bundle only) — runtime installs happen outside this image with the prebuilt.
RUN bun install --ignore-scripts

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the application
RUN bun run build

# Step 7: Use a lightweight web server for the production build
FROM nginx:alpine AS production

# Step 8: Copy built files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to access the app
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
