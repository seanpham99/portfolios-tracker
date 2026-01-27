# Data Pipeline Architecture

**Part:** `services/data-pipeline`
**Type:** ETL / Batch Processing
**Generated:** 2026-01-27

## Technology Stack

| Category           | Technology          | Justification                          |
| :----------------- | :------------------ | :------------------------------------- |
| **Orchestrator**   | Apache Airflow 2.10 | DAG-based scheduling and monitoring    |
| **Runtime**        | Python 3.12         | Standard for data engineering          |
| **Dependency Mgr** | `uv`                | Fast, modern Python package management |
| **Integration**    | Requests / HttpHook | API triggering                         |

## Architecture Pattern

**External Scheduler / Trigger**
The pipeline acts as a sophisticated cron. It does NOT contain business logic.

- **Role**: Trigger batch operations exposed by the API.
- **Pattern**: Fire-and-Forget (mostly), or Wait-for-Completion depending on task.

## Key DAGs

### `portfolio_daily_snapshot`

- **Schedule**: `@daily` (00:00 UTC).
- **Task**: Calls `POST /portfolios/snapshots/batch` on the API service.
- **Security**: Authenticates using `DATA_PIPELINE_API_KEY`.
- **Purpose**: Creates historical record of all user portfolios for performance analytics.

## Data Flow

1. **Trigger**: Airflow scheduler wakes up.
2. **Execute**: DAG sends HTTP request to NestJS API.
3. **Process**: NestJS API iterates portfolios and saves snapshots to Database/ClickHouse.
4. **Monitor**: Airflow tracks success/failure and sends alerts.

## Deployment

- **Container**: Dockerized Airflow (Scheduler + Webserver).
- **Network**: Internal Docker network access to `api` container.
