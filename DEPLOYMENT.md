# LMS Docker Deployment Guide

This guide explains how to run the LMS platform using Docker for local development and how to deploy it to Render.

## 🚀 Local Development

The project is configured with `docker-compose` to run the Client, Server, and a local MongoDB instance.

### Prerequisites
- Docker & Docker Compose installed

### Steps
1. **Configure Environment Variables**:
   Ensure `server/.env` exists. For local Docker use, `MONGO_URI` is automatically set to `mongodb://mongo:27017/lms_db` in `docker-compose.yml`. You can override this if needed.
   
   *Note*: The `client` uses `VITE_API_BASE_URL` which is set to `http://localhost:5000` during the build in `docker-compose.yml`.

2. **Run the Application**:
   ```bash
   docker compose up --build
   ```

3. **Access the App**:
   - **Frontend**: [http://localhost](http://localhost) (mapped to port 80)
   - **Backend**: [http://localhost:5000](http://localhost:5000)
   - **MongoDB**: `mongodb://localhost:27017`

---

## ☁️ Deployment on Render

Render supports deploying Docker containers directly or building from a Dockerfile.

### Option 1: Deploy as Separate Services (Recommended)

Since the Client and Server have different scaling needs, deploy them as separate Render "Web Services".

#### 1. Backend Service (Server)
* **Create a Web Service** connected to your repo.
* **Root Directory**: `server`
* **Runtime**: `Docker`
* **Region**: Choose one close to you (e.g., Singapore, Frankfurt).
* **Environment Variables**:
    * `PORT`: `5000` (Render listens on this port by default inside the container)
    * `MONGO_URI`: Your production MongoDB connection string (e.g., MongoDB Atlas)
    * `NODE_ENV`: `production`
    * `CORS_ORIGINS`: Add your frontend URL (e.g., `https://my-lms-client.onrender.com`)
    * Add other secrets (`JWT_SECRET`, `CLOUDINARY_*`, etc.)

#### 2. Frontend Service (Client)
* **Create a Web Service** connected to your repo.
* **Root Directory**: `client`
* **Runtime**: `Docker`
* **Environment Variables**:
    * `VITE_API_BASE_URL`: The URL of your deployed Backend Service (e.g., `https://my-lms-server.onrender.com`).
      * **IMPORTANT**: Render builds Docker images. You must specify this build ARG or ENV var *during* the build. On Render, "Environment Variables" are available at build time for Docker runtimes.

### Option 2: Render Blueprints (Infrastructure as Code)

You can create a `render.yaml` in the root to automate this.

```yaml
services:
  - type: web
    name: lms-server
    runtime: docker
    rootDir: server
    envVars:
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        sync: false

  - type: web
    name: lms-client
    runtime: docker
    rootDir: client
    envVars:
      - key: VITE_API_BASE_URL
        fromService:
          type: web
          name: lms-server
          property: url
```

## 🛡️ Best Practices & Security

1. **Multi-Stage Builds**:
   - The client Dockerfile uses a multi-stage build. The `node` image builds the app, and the lightweight `nginx` image serves it. This reduces the image size significantly (~20MB vs ~1GB).

2. **Non-Root User**:
   - The server Dockerfile runs as the `node` user instead of `root`. This prevents potential security exploits from gaining root access to the container.

3. **Environment Variables**:
   - Never commit `.env` files. Access secrets via `process.env`.
   - On the frontend, `VITE_*` variables are embedded into the HTML/JS at **build time**. They are visible to anyone. **Do not** put secrets (like API keys) in frontend variables.

4. **Nginx Configuration**:
   - The included `nginx.conf` handles SPA routing (`try_files`) so refreshing a page on a non-root route works.
   - It also enables Gzip compression for faster load times.

5. **Dockerignore**:
   - Correctly ignoring `node_modules` and logs prevents bloat and faster build context transfer.

## ⚠️ Common Mistakes

* **Frontend hitting `localhost` in specific containers**:
  - In production, the browser (client) is on the user's machine, not inside the Render network. `VITE_API_BASE_URL` MUST be the public URL of your backend, not `localhost` or `http://server:5000`.
  
* **CORS Errors**:
  - Ensure the Backend's `CORS_ORIGINS` env var includes the Frontend's public URL without trailing slashes.

* **Database Connection**:
  - For local dev, `docker-compose` uses the internal hostname `mongo`.
  - For production, use the full connection string given by Atlas/provider.
