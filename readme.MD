# Deployment Guidelines with Docker Compose

A production-ready deployment guideline and orchestration template for microservices architecture using Docker Compose.

---

## 📌 Introduction

This repository originates from **[Devteria Channel](https://www.youtube.com/@DevteriaChannel)** as part of the microservices deployment guideline series. It demonstrates best practices for organizing, securing, and deploying multi-tier applications (frontend, backend, and infrastructure) using Docker and Docker Compose.

📺 **Video Tutorial**: [Watch on YouTube](https://www.youtube.com/playlist?list=PLV2Y-_qz0j4U)

---

## 📑 Architecture Overview

The system is separated into two deployment tiers connected via a shared Docker network (`devteria-network`):

```
                       ┌────────────────────────┐
                       │  Client / Web Browser  │
                       └───────────┬────────────┘
                                   │
                                   ▼ (Port 3000)
                     ┌────────────────────────────┐
                     │     web-app (Next.js)      │
                     └─────────────┬──────────────┘
                                   │
                                   ▼ (Port 8080)
                     ┌────────────────────────────┐
                     │ identity-service (Spring)  │
                     └─────────────┬──────────────┘
                                   │
                                   ▼ (Port 3306)
                     ┌────────────────────────────┐
                     │       MySQL 8.4 LTS        │
                     │      (Database Tier)       │
                     └────────────────────────────┘
                                   │
            [Shared Docker Network: devteria-network]
```

1. **Infrastructure Tier (`deployment/infra`)**:
   - **MySQL 8.4 (LTS)**: Primary relational database with volume persistence (`mysql` named volume) and custom configuration (`my.cnf`).
   - **Shared Network**: `devteria-network` (bridge).
2. **Services Tier (`deployment/services`)**:
   - **identity-service**: Spring Boot (Java 25) authentication and authorization microservice running on port **8080**.
   - **web-app**: Next.js (Node.js 24) standalone production frontend running on port **3000**.

---

## 📁 Repository Structure

```
.
├── deployment/
│   ├── infra/                       # Infrastructure compose configuration
│   │   ├── .env                     # MySQL database credentials
│   │   ├── docker-compose.yml       # Infrastructure orchestration (MySQL 8.4)
│   │   └── mysql/
│   │       └── my.cnf               # MySQL configuration (tuning, UTF-8, binlog)
│   └── services/                    # Application services compose configuration
│       ├── .env                     # App runtime environment variables
│       └── docker-compose.yml       # Web app & microservices orchestration
├── identity-service/                # Spring Boot microservice source & Dockerfile
└── web-app/                         # Next.js frontend source & Dockerfile
```

---

## ⚙️ Prerequisites

1. **Docker Engine & Docker Compose Plugin** (v2.20+ recommended)
2. **Ports Available**:
   - `3000` — Web App (Frontend)
   - `8080` — Identity Service (Backend API)
   - `3306` — MySQL Database

### Installing Docker on Ubuntu (Quick Setup)

```bash
# Setup Docker repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

---

## 🚀 Deployment Steps

### Step 1: Create the Shared Docker Network

Both compose stacks communicate over a shared external bridge network. Create it once:

```bash
docker network create devteria-network
```

---

### Step 2: Deploy Infrastructure (Database Tier)

1. Navigate to the infrastructure directory:
   ```bash
   cd deployment/infra
   ```

2. Review and configure environment variables in `.env`:
   ```env
   # MySQL Config
   MYSQL_ROOT_PASSWORD=your_secure_root_password
   MYSQL_DATABASE=identity_service
   MYSQL_USER=devteria
   MYSQL_PASSWORD=your_secure_password
   ```

3. Start the infrastructure services:
   ```bash
   docker compose up -d
   ```

4. Verify container health:
   ```bash
   docker compose ps
   docker compose logs -f mysql
   ```

---

### Step 3: Deploy Application Services

1. Navigate to the services directory:
   ```bash
   cd ../services
   ```

2. Configure environment variables in `.env`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://<YOUR_SERVER_IP_OR_DOMAIN>:8080
   DBMS_CONNECTION=jdbc:mysql://mysql:3306/identity_service
   DBMS_USERNAME=devteria
   DBMS_PASSWORD=your_secure_password
   ```

3. Launch application services:
   ```bash
   docker compose up -d
   ```

4. Verify services are running:
   ```bash
   docker compose ps
   docker compose logs -f
   ```

---

## 🛠️ Building Application Images

If you are modifying code and building your own images:

### Identity Service (Spring Boot 4 / Java 25)

```bash
cd identity-service

# Build multi-stage Docker image
docker build -t your-registry/identity-service:latest .

# Push to Docker registry
docker push your-registry/identity-service:latest
```

### Web Application (Next.js / Node 24)

```bash
cd web-app

# Build standalone Next.js Docker image
docker build -t your-registry/web-app:latest .

# Push to Docker registry
docker push your-registry/web-app:latest
```

---

## 📊 Maintenance & Common Commands

| Task | Command |
| :--- | :--- |
| **Check container status** | `docker compose ps` |
| **View real-time logs** | `docker compose logs -f [service_name]` |
| **Restart a service** | `docker compose restart [service_name]` |
| **Pull latest images** | `docker compose pull && docker compose up -d` |
| **Stop stack (keep data)** | `docker compose down` |
| **Stop stack (destroy volumes)** | `docker compose down -v` |
| **Inspect MySQL inside container** | `docker compose exec mysql mysql -u devteria -p` |

---

## 🔒 Security Best Practices

1. **Environment Secrets**: Never commit production passwords or API secrets directly to Git repositories. Copy `.env` templates on the server.
2. **Database Ports**: In production, consider removing `ports: - "3306:3306"` from `deployment/infra/docker-compose.yml` if external access is not required, as microservices connect internally over `devteria-network`.
3. **Volume Backups**: Regularly backup the Docker named volume:
   ```bash
   docker run --rm -v infra_mysql:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup_$(date +%F).tar.gz /data
   ```
