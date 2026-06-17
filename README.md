# fab-data-service

A full-stack portfolio project designed to showcase advanced concepts in production-grade **observability**, **performance tuning**, and **developer experience (DX)** within a simulated semiconductor fab environment.

Frontend example view:

<img width="700" alt="螢幕擷取畫面 2026-06-16 232405" src="https://github.com/user-attachments/assets/761ffec9-9f8e-440f-94a5-7ee68e4c3d93" />

Jaeger example view:

<img width="700" alt="螢幕擷取畫面 2026-06-16 232346" src="https://github.com/user-attachments/assets/5bbf041e-8d1c-4d22-b1ec-2d00568bef9d" />

Grafana example view:

<img width="700" alt="螢幕擷取畫面 2026-06-16 233221" src="https://github.com/user-attachments/assets/e4fd037f-1ff7-4f43-a3f0-b1f18856aa7f" />
---

## Key Showcases

### Full-Stack Observability
* **Tech Stack**: Fully integrated **Grafana + Prometheus + Loki + Jaeger** ecosystem.
* **Distributed Tracing**: Leverages distributed trace context (traceId/spanId) and client IP filtering to trace specific HTTP requests seamlessly from the gateway down to internal service components.
* **Granular Monitoring**: Captures fine-grained performance metrics and live traces across 5 pre-configured Grafana dashboard panels:
  * **API Request Rate**: Tracks real-time HTTP traffic (`reqps`) breakdown by individual endpoint URI and HTTP method.
  * **API p99 Latency**: Monitors the 99th percentile response time (`seconds`) via histogram quantiles to identify tail latency issues.
  * **JVM Heap Used**: Monitors internal Spring Boot memory allocation (`bytes`) to safeguard heap utilization.
  * **Cache Hit Rate**: Evaluates Redis caching efficiency by calculating the real-time ratio of hits versus misses.
  * **Log Stream (Backend)**: Streams live container logs directly from the backend via Loki for instant error diagnosis and troubleshooting.

### Performance Tuning
* **Frontend Optimization**: Implements DOM virtualization via `@tanstack/react-virtual` to ensure smooth rendering and stable frame rates, preventing performance degradation when handling massive sensor log datasets.
* **Backend Efficiency**:
  * **Pagination** — the metrics endpoint enforces a default page size of 100 rows (hard cap 200) to prevent unbounded data transfers and uncontrolled memory growth.
  * **Redis Caching** — the equipment list is cached with `@Cacheable` (60 s TTL) to avoid redundant DB round-trips for frequently read, rarely changed reference data.
  * **Async Thread Pool** — the heavier aggregation endpoint (`/summary`) runs on a dedicated `@Async` executor (core 4, max 16 threads), freeing Tomcat request threads to serve concurrent requests while the DB query executes.
  * **JPQL Constructor Projections** — all repository queries return lightweight DTOs via constructor expressions rather than full JPA entities, reducing the data volume fetched from PostgreSQL.
* **Database Indexing**: Features a comprehensive comparison between **Indexed vs. Non-Indexed queries** using composite indexes `(equipment_id, recorded_at DESC)` on PostgreSQL to ensure sub-10ms query execution times.

### Developer Experience (DX)
* Integrates `vite-plugin-react-click-to-component`, allowing developers to `Option + Left Click` (or `Alt + Left Click`) any component in the browser to jump directly to its source code in IDEs like VS Code, drastically accelerating UI debugging and onboarding

---

## Architecture Overview

The system is organized into three layers:

**Application Layer**
- **Frontend**: React 18 + TypeScript + Vite, served by Nginx. Features a virtualized sensor log table (up to 200 rows per page without frame drops) and a Recharts temperature line chart. Uses React Query for caching and background refetching.
- **Backend**: Java 21 + Spring Boot 3 REST API. Redis-backed caching with Micrometer instrumentation, async non-blocking summary query via `@Async`, and Flyway-managed schema migrations. Spring Boot Actuator native OTLP exporter sends traces to Jaeger.
- **Database**: PostgreSQL 16 with 500,000 synthetic sensor readings across 20 equipment units. Composite index on `(equipment_id, recorded_at DESC)` enables sub-10ms paginated queries.

**Observability Layer**
- **Metrics**: Prometheus scrapes `/actuator/prometheus` every 15s. Custom counters for Redis cache hit/miss rates.
- **Logs**: Promtail collects Docker container logs and ships to Loki. Grafana Logs panel streams live backend logs.
- **Traces**: Spring Boot backend exports OpenTelemetry traces to Jaeger (all-in-one). Every HTTP request produces a distributed trace. Sampling is set to 100% (`probability: 1.0`) for demo completeness; in production, reduce to 10% (`0.1`) or adopt tail-based sampling via an OpenTelemetry Collector to retain only slow/error traces.
- **Dashboards**: Grafana auto-provisioned with Prometheus, Loki, and Jaeger datasources and a pre-built dashboard covering API request rate, p99 latency, JVM heap, and cache hit rate.

**DevOps / IaC Layer**
- **Containerization**: Multi-stage Dockerfiles for both services keep final images lean by separating build-time dependencies from the runtime artifact. The entire stack is orchestrated with Docker Compose.


---

## Quick Start

**Prerequisites**: Docker and Docker Compose installed.

```bash
git clone <repo-url>
cd fab-data-service
docker compose up --build -d
```

The first build downloads base images and compiles the backend (~5 minutes). Subsequent starts are fast.

**Service URLs**

| Service | URL | Credentials |
|---|---|---|
| Application | http://localhost:3000 | — |
| Grafana | http://localhost:3001 | admin / admin |
| Jaeger UI | http://localhost:16686 | — |
| Prometheus | http://localhost:9090 | — |
| Backend API | http://localhost:8080/api/equipment (direct) / http://localhost/api/equipment (via proxy) | — |

---

## Performance Demo Scenarios

### 1. Frontend: Virtualization Toggle

Navigate to http://localhost:3000 and select any equipment from the sidebar. The Sensor Log table defaults to **virtualized mode**, using `@tanstack/react-virtual` to render only the rows visible in the viewport.

Click **"Disable virtualization"** to switch to a plain `<table>` render. With a full 200-row page, scrolling performance degrades noticeably (observe FPS drop in Chrome DevTools → Performance). Re-enable virtualization to see the improvement.

For a more dramatic effect, open DevTools → Performance tab, record while toggling, and compare frame timings.

### 2. Backend: Redis Cache Hit Rate

1. Open Grafana at http://localhost:3001 → **Fab Data Service** dashboard → panel **"Cache Hit Rate"**.
2. Call the equipment list endpoint twice in quick succession:
   ```bash
   curl http://localhost/api/equipment
   curl http://localhost/api/equipment
   ```
3. The first call populates the Redis cache (increments `cache.equipment.miss`). The second call returns from cache (increments `cache.equipment.hit`). Watch the **Cache Hit Rate** panel approach 1.0.

The TTL is 60 seconds; after expiry the cache is invalidated and the next call fetches from PostgreSQL again.

### 3. Database: Indexed vs. Non-Indexed Query

Connect to PostgreSQL:
```bash
docker exec -it fab-postgres psql -U fab -d fabdata
```

**Indexed query** (uses `idx_sensor_log_equipment_time`):
```sql
EXPLAIN ANALYZE
SELECT * FROM sensor_log
WHERE equipment_id = 1
  AND recorded_at BETWEEN NOW() - INTERVAL '7 days' AND NOW()
ORDER BY recorded_at DESC
LIMIT 200;
```
Expected: Index Scan, execution time < 10ms.

**Non-indexed / full-scan equivalent** (simulates `findAllByEquipmentIdNoPaging`):
```sql
EXPLAIN ANALYZE
SELECT * FROM sensor_log
WHERE equipment_id = 1
ORDER BY recorded_at DESC;
```
Expected: Index Scan on all 25,000 rows for this equipment, returning the full set — execution time is significantly higher with no `LIMIT`. This mirrors the intentionally unbounded repository method (`findAllByEquipmentIdNoPaging`) documented in `SensorLogRepository.java` for educational purposes.

---

## Production Path 
> This section is illustrative — only the Helm templates are included in this repo.

In a production deployment:

1. **Ansible** provisions K8s worker nodes (OS hardening, CNI install, kubelet config).
2. **GitLab CI** pipeline builds Docker images on every merge to `main`, tags them with the commit SHA, and pushes to a private registry.
3. **Helm** packages the backend, frontend, HPA, and ConfigMap. The `helm/fab-data/` chart in this repo is designed as the production artifact, but no live cluster or CI/CD pipeline is wired up in this demo.
4. **ArgoCD** watches the Helm chart in Git and automatically syncs the cluster state — any merge that updates `values.yaml` triggers a rolling deployment with no manual intervention.
