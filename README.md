# CampusCloud – University Campus Management System

**Live Demo:** [Explore the app](https://mayank-singh-rawat.netlify.app/)

⚠️ **Note:** The backend is deployed on **Render** and the database on **Railway**. Due to cold starts, the app may take a moment to load. For a smoother experience, check out this **[video walkthrough](https://www.youtube.com/watch?v=pYJvBpXoFwQ)** instead.

---

##  Overview

CampusCloud is a **full-stack university campus management system** built using **Spring Boot** for the backend and **React** for the frontend. The platform enables streamlined management of campus operations.

---

##  Features

- User registration/login with role-based access (Admin, Student, Staff)
- Management of campus entities: Courses, Departments, Students, Faculties
- CRUD operations via RESTful APIs
- Intuitive and responsive React-based UI
- Robust database integration
- Efficient state and form handling on the frontend
- Modular, scalable project architecture

---

##  Tech Stack

| Layer     | Technology                                      |
|-----------|--------------------------------------------------|
| Frontend  | React  |
| Backend   | Spring Boot, Spring Data JPA, RESTful APIs       |
| Database  | MySQL (via Railway deployment)      |
| Deployment| Render (backend), Railway (database), Netlify (frontend) |

---

##  How to Run Locally

### Prerequisites
- Java 21+
- npm
- Maven
- MySQL (if running backend locally)

### Backend Setup

git clone https://github.com/RawatSinghMayank/CampusCloud.git
cd CampusCloud/CampusCloudUniversityCampusSystem
# Adjust path if needed based on your structure

### Frontend Setup
npm install
npm run dev
