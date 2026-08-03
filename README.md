# 🎓 AI-Powered Learning Management System (LMS)

> A production-inspired, event-driven Learning Management System built with **Node.js microservices**, **RabbitMQ**, **Docker**, **React**, and **LangGraph AI**. Designed to demonstrate scalable backend architecture, asynchronous communication, and AI-powered learning assistance.

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED)
![RabbitMQ](https://img.shields.io/badge/Event-RabbitMQ-FF6600)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1)
![LangGraph](https://img.shields.io/badge/AI-LangGraph-purple)
![License](https://img.shields.io/badge/License-MIT-green)

---

# 📖 Overview

Traditional Learning Management Systems (LMS) are often built as monolithic applications, making them difficult to scale, maintain, and extend as the user base grows.

This project demonstrates how an LMS can be designed using a **Microservice Architecture**, where each business capability runs independently and communicates asynchronously through **RabbitMQ**.

The platform also integrates **LangGraph-powered AI**, enabling contextual question answering, intelligent course assistance, and learning analytics.

---

# ✨ Features

## 🔐 Authentication

- JWT Authentication
- Refresh Tokens
- Role-Based Access Control
- Public JWKS Endpoint
- Secure Password Hashing

---

## 📚 Course Management

- Create Courses
- Manage Modules
- Upload Lessons
- Quiz Management
- Student Progress Tracking

---

## 🤖 AI Learning Assistant

- LangGraph Workflow
- Context-Aware Q&A
- SQL Agent
- Course Analytics
- Learning Recommendations

---

## ⚡ Event-Driven Architecture

RabbitMQ enables asynchronous communication between services.

Example events:

- User Registered
- Course Purchased
- Enrollment Completed
- Quiz Submitted
- Password Reset Requested

This architecture prevents tight coupling between services and improves scalability.

---

## 📧 Notification System

- Welcome Emails
- Email Verification
- Password Reset
- Retry Mechanism
- Worker Threads
- Background Jobs

---

# 🏗️ System Architecture

```text
                        Internet
                           │
                    React + Vite
                           │
                     API Gateway
                           │
        ┌──────────┬─────────────┬──────────────┐
        │          │             │              │
   Auth Service Course Service Enrollment Notification
        │          │             │              │
        └──────────┴─────────────┴──────────────┘
                     │
                  RabbitMQ
                     │
              Event Processing
                     │
                PostgreSQL DB
```

---

# 🚀 Tech Stack

## Backend

- Node.js
- Express.js
- PostgreSQL
- RabbitMQ
- JWT
- Docker

### Frontend

- React
- Vite
- Axios
- React Router

### AI

- LangGraph
- OpenAI / Gemini
- SQL Agent
- Planner Workflow

### DevOps

- Docker
- Docker Compose
- Render
- Neon PostgreSQL
- Upstash Redis
- CloudAMQP
- GitHub Actions

---

# 📂 Project Structure

```text
LMS/
│
├── api-gateway/
│
├── auth-service/
│
├── course-service/
│
├── enrollment-service/
│
├── notification-service/
│
├── frontend/
│
├── docker-compose.yml
│
└── README.md
```

---

# 🔄 Event Flow

## Student Enrollment

```text
Student

↓

API Gateway

↓

Enrollment Service

↓

Save Enrollment

↓

Publish Event

↓

RabbitMQ

↓

Notification Service

↓

Send Welcome Email
```

---

# 🔐 Security

- JWT Authentication
- bcrypt Password Hashing
- Role-Based Authorization
- Protected APIs
- API Gateway Validation
- Environment Variables
- Secure HTTP Headers

---

# 📈 Scalability

Each service can be scaled independently.

Examples:

- Heavy login traffic → Scale Auth Service
- High course traffic → Scale Course Service
- Massive email sending → Scale Notification Workers

RabbitMQ ensures background processing does not block user requests.

---

# 📌 Future Improvements

- Kubernetes Deployment
- Prometheus Monitoring
- Grafana Dashboards
- Distributed Tracing (Jaeger)
- Payment Service
- Recommendation Engine
- WebSocket Notifications
- API Versioning
- Elasticsearch Search
- CDN Integration

---


# 📜 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.