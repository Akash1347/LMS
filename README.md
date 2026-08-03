# 🎓 AI-Powered Learning Management System (LMS) Microservices

> A highly scalable, event-driven, and AI-integrated Learning Management System designed to handle high concurrency and deliver a personalized educational experience.

[![Microservices](https://img.shields.io/badge/Architecture-Microservices-blue.svg)](#) 
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED.svg)](#)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-Event_Driven-FF6600.svg)](#)
[![LangGraph](https://img.shields.io/badge/AI-LangGraph-8A2BE2.svg)](#)

## 💡 The Problem & The Solution
Traditional LMS platforms often suffer from tight coupling, making them hard to scale during peak enrollment periods. Furthermore, they lack intelligent, on-demand assistance for students. 

**This project solves that by:**
1. Decoupling core business logic into independently deployable microservices (Auth, Course, Enrollment, Notifications).
2. Utilizing an asynchronous, event-driven architecture to prevent system bottlenecks during high-traffic events like course registrations.
3. Integrating a LangGraph-powered AI backend to provide dynamic course analytics and contextual student assistance.

## 🛠️ Tech Stack & System Architecture

### **Core Infrastructure & Communication**
*   **API Gateway:** Serves as the robust single entry point, handling routing, rate limiting, and centralized JWT authorization.
*   **Message Broker (RabbitMQ):** Facilitates resilient, asynchronous communication between services (e.g., the enrollment service triggering the notification service)[cite: 1].
*   **Containerization:** Fully dockerized services managed via `docker-compose.yml` for reliable, consistent deployments across environments[cite: 1].

### **Microservices (Node.js / Express)**
*   **Auth Service:** Manages user authentication, secure JWT generation, and exposes JSON Web Key Sets (JWKS) for distributed verification[cite: 1].
*   **Course Service:** The core engine managing modules, lessons, and quizzes[cite: 1]. Features advanced AI capabilities via LangGraph (including `sql_executor`, `planner`, and `general_qa` nodes)[cite: 1].
*   **Enrollment Service:** Handles course registrations and tracks user progress, publishing events to RabbitMQ upon successful enrollment[cite: 1].
*   **Notification Service:** A resilient background job processing service featuring worker threads and retry mechanisms for sending critical email templates (welcome, verification, password resets)[cite: 1].

### **Frontend (React.js / Vite)**
*   **Framework:** Built with React and Vite for lightning-fast HMR and optimized production builds[cite: 1].
*   **UI/UX:** Modern, accessible UI utilizing custom components (Avatar, Popover, Sonner, Spinners) and responsive CSS design[cite: 1].
*   **State & Routing:** Features protected routes, custom API hooks, and centralized user stores for a seamless single-page application experience[cite: 1].

## 🧪 Testing & Reliability
Startups move fast, which makes reliable code critical. This system incorporates testing to ensure stability across deployments:
*   **Course Service Tests:** Includes dedicated unit and integration tests (e.g., `test_router.js`, `test_sql_validator.js`, `test_workflow.js`) to validate critical business logic and AI workflow execution[cite: 1].
*   **Fault Tolerance:** The Notification Service employs asynchronous background jobs with built-in retry mechanisms (`retry.js`) to guarantee email delivery even during partial system outages[cite: 1].

## ✨ Key Product Features
*   🤖 **AI-Enhanced Learning:** An integrated `CourseAIChat` interface powered by a custom LangGraph state machine, allowing dynamic, context-aware student interactions[cite: 1].
*   🔐 **Zero-Trust Security:** Centralized API Gateway handling proxy routing and rate limiting, backed by strict authentication middleware across all internal services[cite: 1].
*   📊 **Interactive Quizzes & Analytics:** Instructor tools for quiz creation (`InstructorQuizCreationForm.jsx`) paired with live student analytics and leaderboards (`QuizLeaderboardPage.jsx`, `QuizStatisticsPage.jsx`)[cite: 1].
*   👨‍🏫 **Multi-Tenant Portals:** Distinct dashboards and workflows for instructors (course creation/management) and students (course consumption/progress tracking)[cite: 1].

## 📂 Project Structure

```text
LMS/
├── api-gateway/            # Centralized API routing, rate limiting, auth middleware[cite: 1]
├── auth-service/           # User authentication, JWT issuance, public JWKS[cite: 1]
├── course-service/         # Modules, lessons, quizzes, LangGraph AI integration, and tests[cite: 1]
├── enrollment-service/     # Handles enrollments and RabbitMQ event pipelines[cite: 1]
├── notification-service/   # Email templates, background retry jobs, and mail workers[cite: 1]
├── frontend/               # React + Vite application[cite: 1]
│   ├── src/pages/          # Auth, Course, Payment, and User dashboards[cite: 1]
│   ├── src/ui/             # Reusable UI components & AIChat interface[cite: 1]
│   └── src/Store/          # Global state management[cite: 1]
└── docker-compose.yml      # Orchestrates all microservices[cite: 1]