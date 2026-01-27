# Project Overview

**Project:** Portfolios Tracker
**Generated:** 2026-01-27

## Executive Summary

Portfolios Tracker is a comprehensive fintech application designed for tracking investment portfolios across multiple asset classes (Stocks, Crypto, Commodities) and markets (US, Vietnam, Global). It features professional-grade analytics, real-time data integration, and a "calm" user experience that handles market volatility gracefully.

## Architecture Classification

- **Type:** Monorepo (Turborepo)
- **Architecture Pattern:** Modern Full-Stack (Next.js + NestJS) with specialized Data Pipeline
- **Primary Languages:** TypeScript, Python

## Technology Stack Summary

| Component          | Technology                       | Role                                    |
| :----------------- | :------------------------------- | :-------------------------------------- |
| **Frontend**       | Next.js 16, React 19, Tailwind 4 | User Interface, Server-Side Rendering   |
| **Backend**        | NestJS 11, Supabase JS           | Business Logic, API Gateway             |
| **Database**       | PostgreSQL (Supabase)            | Transactional Data, Auth                |
| **Analytics**      | ClickHouse                       | High-volume historical data & analytics |
| **Caching**        | Upstash Redis                    | Hot cache for market data               |
| **Data Pipeline**  | Apache Airflow, Python (`uv`)    | Batch processing, scheduled snapshots   |
| **Infrastructure** | Docker, Turborepo                | Containerization, Build System          |

## Repository Structure

The project is organized as a monorepo containing:

- **apps/web**: The consumer-facing web application.
- **services/api**: The core backend API service.
- **services/data-pipeline**: The ETL and batch processing service.
- **packages/**: Shared libraries (`ui`, `shared-types`, configs).

## Key Documentation

- [Source Tree Analysis](./source-tree-analysis.md)
- [Web Architecture](./architecture-web.md) _(To be generated)_
- [API Architecture](./architecture-api.md) _(To be generated)_
- [Data Pipeline Architecture](./architecture-data-pipeline.md) _(To be generated)_
- [Integration Architecture](./integration-architecture.md) _(To be generated)_
