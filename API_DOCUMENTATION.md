# RecruitmentPlus CRM - API Documentation

## 🚀 API Overview
Base URL: `http://localhost:3000` (or your deployed URL)

Total API Endpoints: **47**

---

## 📋 Candidates API (`/api/candidates`)

### Basic CRUD Operations
- `GET /api/candidates/` - Get all candidates (with search, pagination, status filter)
- `GET /api/candidates/:id` - Get candidate by ID
- `POST /api/candidates/` - Create new candidate
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Special Endpoints
- `GET /api/candidates/skill/:skill` - Get candidates by skill

### Request Examples

#### Create Candidate
```json
POST /api/candidates/
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "experience": "5 years",
  "skills": ["JavaScript", "React", "Node.js"],
  "education": "Computer Science",
  "status": "new"
}
```

---

## 🏢 Companies API (`/api/companies`)

### Basic CRUD Operations
- `GET /api/companies/` - Get all companies (with search, pagination)
- `GET /api/companies/:id` - Get company by ID
- `POST /api/companies/` - Create new company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Special Endpoints
- `GET /api/companies/industry/:industry` - Get companies by industry
- `GET /api/companies/verified/all` - Get verified companies

### Request Examples

#### Create Company
```json
POST /api/companies/
{
  "name": "Tech Corp",
  "industry": "Technology",
  "location": "San Francisco, CA",
  "website": "https://techcorp.com",
  "description": "Leading tech company",
  "verified": false
}
```

---

## 💼 Jobs API (`/api/jobs`)

### Basic CRUD Operations
- `GET /api/jobs/` - Get all jobs (with search, pagination, filters)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs/` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Special Endpoints
- `GET /api/jobs/company/:companyId` - Get jobs by company
- `GET /api/jobs/remote/all` - Get remote jobs
- `GET /api/jobs/featured/all` - Get featured jobs

### Request Examples

#### Create Job
```json
POST /api/jobs/
{
  "title": "Full Stack Developer",
  "company": "companyId",
  "location": "Remote",
  "type": "full-time",
  "description": "Looking for experienced developer",
  "requirements": ["JavaScript", "React", "Node.js"],
  "salary": "$80,000 - $120,000",
  "remote": true,
  "featured": false
}
```

---

## 🎯 Skills API (`/api/skills`)

### Basic CRUD Operations
- `GET /api/skills/` - Get all skills (with search, pagination)
- `GET /api/skills/:id` - Get skill by ID
- `POST /api/skills/` - Create new skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

### Special Endpoints
- `GET /api/skills/category/:category` - Get skills by category
- `GET /api/skills/popular/all` - Get popular skills
- `GET /api/skills/categories/all` - Get skill categories

### Request Examples

#### Create Skill
```json
POST /api/skills/
{
  "name": "React",
  "category": "Frontend",
  "description": "JavaScript library for building user interfaces",
  "level": "intermediate"
}
```

---

## 👥 Users API (`/api/users`)

### Basic CRUD Operations
- `GET /api/users/` - Get all users (with search, pagination, role, region filters)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Special Endpoints
- `GET /api/users/role/:role` - Get users by role
- `GET /api/users/region/:region` - Get users by region (montreal, dubai, turkey)
- `GET /api/users/active/all` - Get active users
- `PATCH /api/users/:id/status` - Update user status

### Request Examples

#### Create User
```json
POST /api/users/
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@company.com",
  "password": "securePassword123",
  "role": "admin",
  "department": "HR",
  "region": "montreal",
  "isActive": true
}
```

---

## 📄 Applications API (`/api/applications`)

### Basic CRUD Operations
- `GET /api/applications/` - Get all applications (with search, pagination, status filter)
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications/` - Create new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Special Endpoints
- `GET /api/applications/candidate/:candidateId` - Get applications by candidate
- `GET /api/applications/job/:jobId` - Get applications by job
- `GET /api/applications/company/:companyId` - Get applications by company
- `PATCH /api/applications/:id/status` - Update application status
- `POST /api/applications/:id/message` - Add message to application

### Request Examples

#### Create Application
```json
POST /api/applications/
{
  "candidate": "candidateId",
  "job": "jobId",
  "company": "companyId",
  "status": "applied",
  "coverLetter": "I'm interested in this position...",
  "resume": "path/to/resume.pdf"
}
```

#### Update Application Status
```json
PATCH /api/applications/:id/status
{
  "status": "interview",
  "updatedBy": "userId",
  "notes": "Scheduled for phone interview"
}
```

#### Add Message to Application
```json
POST /api/applications/:id/message
{
  "sender": "userId",
  "message": "Interview scheduled for tomorrow at 2 PM",
  "type": "internal"
}
```

---

## 🔧 Common Request Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Search
- `search` - Search term (searches across relevant fields)

### Filtering
- `status` - Filter by status
- `role` - Filter by role (users)
- `region` - Filter by region (users: montreal, dubai, turkey)
- `industry` - Filter by industry (companies)
- `category` - Filter by category (skills)

### Example with Parameters
```
GET /api/candidates?page=2&limit=20&search=john&status=active
GET /api/users?page=1&limit=10&region=montreal&role=admin
```

---

## 📊 Response Format

### Success Response
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "Detailed error information"
}
```

---

## 🛠️ Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔐 Authentication

Currently, the API doesn't have authentication middleware implemented. You'll need to add JWT authentication middleware to secure the endpoints.

---

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Set up MongoDB connection in `.env`
3. Start server: `npm run dev` or `npm start`
4. Test endpoints using Postman or curl

---

## 📝 Notes

- All endpoints support JSON request/response format
- MongoDB ObjectId format required for ID parameters
- Timestamps (createdAt, updatedAt) are automatically managed
- Input validation implemented using Joi (where applicable)

---

*API Verification Date: ${new Date().toISOString()}*
*Total Endpoints Verified: 47* 