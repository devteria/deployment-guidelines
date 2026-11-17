## Prometheus & Grafana

Monitoring stack for the Devteria deployment, consisting of Prometheus for metrics collection and Grafana for visualization.

### Project structure

```
.
├── docker-compose.yml
├── grafana
│   └── datasource.yml
├── prometheus
│   └── prometheus.yml
├── .env
└── README.md
```

### Architecture

This compose file defines two services:

- **Prometheus** (`prom/prometheus:v3.16.0`) — scrapes and stores metrics time-series data
- **Grafana** (`grafana/grafana:13.2-slim`) — visualizes metrics from Prometheus

Both services share the `devteria-network` network, which is also used by the infrastructure (`deployment/infra/`) and application services (`deployment/services/`) compose files. This allows Prometheus to reach services like `identity-service` by container name.

### Prerequisites

Before deploying, make sure the following ports are available on the host:

| Service      | Host Port | Container Port |
|--------------|-----------|----------------|
| Prometheus   | 9090      | 9090           |
| Grafana      | 3500      | 3000           |

> **Note:** Grafana is mapped to host port `3500` (instead of the default `3000`) to avoid conflict with the `web-app` service, which uses host port `3000`.

### Configuration

Create a `.env` file in this directory with the following variables:

```
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=<your-secure-password>
```

#### Prometheus scrape targets

Prometheus is configured to scrape the following targets:

| Job Name                | Target                      | Metrics Path                   |
|-------------------------|-----------------------------|--------------------------------|
| Prometheus (self)       | `localhost:9090`            | `/metrics`                     |
| Identity Service        | `identity-service:8080`     | `/id/actuator/prometheus`      |

To add more scrape targets (e.g., web-app, MySQL, Nginx), edit `prometheus/prometheus.yml`.

#### Grafana datasource

Grafana is auto-provisioned with Prometheus as the default datasource via `grafana/datasource.yml`. No manual datasource configuration is needed.

### Deploy with Docker Compose

```bash
$ docker compose up -d
```

### Expected result

Listing containers should show two containers running with the correct port mapping:

```bash
$ docker ps
CONTAINER ID   IMAGE                          COMMAND                  CREATED        STATUS       PORTS                    NAMES
...            prom/prometheus:v3.16.0        "/bin/prometheus --c…"   …              Up …         0.0.0.0:9090->9090/tcp   prometheus
...            grafana/grafana:13.2-slim      "/run.sh"                …              Up …         0.0.0.0:3500->3000/tcp   grafana
```

### Access the dashboards

- **Grafana**: Navigate to `http://localhost:3500` and log in with the credentials from your `.env` file. Prometheus is pre-configured as the default datasource.
- **Prometheus**: Navigate to `http://localhost:9090` to access the Prometheus web interface directly.

### Multi-compose deployment

This observability stack is designed to run alongside the other deployment compose files. All three share the `devteria-network` network:

1. **Infrastructure** (`deployment/infra/`) — Nginx, MySQL
2. **Services** (`deployment/services/`) — Web App, Identity Service
3. **Observability** (`deployment/observability/`) — Prometheus, Grafana

Deploy them in order so that Prometheus can discover and scrape the application services.

### Cleanup

Stop and remove the containers. Add `-v` to remove volumes and erase all stored data:

```bash
$ docker compose down -v
```
