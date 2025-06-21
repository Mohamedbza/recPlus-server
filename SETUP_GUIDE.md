# 🚀 Quick Setup Guide - MongoDB & API Testing

## Step 1: Environment Setup

1. **Create .env file:**
   ```bash
   cp env-template.txt .env
   ```

2. **Configure MongoDB URI in .env:**
   
   **Option A: Local MongoDB**
   ```env
   MONGODB_URI=mongodb://localhost:27017/recruitmentplus-crm
   PORT=3000
   NODE_ENV=development
   ```
   
   **Option B: MongoDB Atlas (Cloud)**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recruitmentplus-crm
   PORT=3000
   NODE_ENV=development
   ```

## Step 2: Seed Database with Test Data

```bash
# Run the seeder to populate database with test data
npm run seed
```

**This will create:**
- ✅ 24 Skills (Frontend, Backend, Database, DevOps, Design)
- ✅ 6 Companies (Tech companies with different industries)
- ✅ 8 Users (Admin, Recruiter, Interviewer, Coordinator, Viewer across Montreal, Dubai, Turkey)
- ✅ 8 Candidates (Various skill levels and statuses)
- ✅ 6 Jobs (Different types, companies, and statuses)
- ✅ 6 Applications (Different stages of the hiring process)

## Step 3: Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# OR Production mode
npm start
```

## Step 4: Test the APIs

### 🔍 Basic Endpoints:
```bash
# Health Check
GET http://localhost:3000/

# Get all candidates
GET http://localhost:3000/api/candidates

# Get all companies
GET http://localhost:3000/api/companies

# Get all jobs
GET http://localhost:3000/api/jobs

# Get all skills
GET http://localhost:3000/api/skills

# Get all users
GET http://localhost:3000/api/users

# Get all applications
GET http://localhost:3000/api/applications
```

### 🔍 Test with Filters:
```bash
# Active candidates only
GET http://localhost:3000/api/candidates?status=active

# Remote jobs only
GET http://localhost:3000/api/jobs?remote=true

# Applications in interview stage
GET http://localhost:3000/api/applications?status=interview

# Frontend skills only
GET http://localhost:3000/api/skills?category=Frontend

# Verified companies only
GET http://localhost:3000/api/companies/verified/all

# Users by role
GET http://localhost:3000/api/users/role/recruiter

# Users by region
GET http://localhost:3000/api/users/region/montreal
GET http://localhost:3000/api/users/region/dubai
GET http://localhost:3000/api/users/region/turkey

# Filter users by region (query parameter)
GET http://localhost:3000/api/users?region=montreal
```

### 🔍 Test Pagination:
```bash
# Page 1, 5 items per page
GET http://localhost:3000/api/candidates?page=1&limit=5

# Page 2, 3 items per page
GET http://localhost:3000/api/jobs?page=2&limit=3
```

### 🔍 Test Search:
```bash
# Search candidates by name
GET http://localhost:3000/api/candidates?search=alice

# Search companies by name
GET http://localhost:3000/api/companies?search=tech

# Search skills by name
GET http://localhost:3000/api/skills?search=react
```

## 🧪 Sample Test Data

### Login Credentials (Users by Region):

**Montreal Region:**
- **Admin:** john.manager@company.com / password123
- **Coordinator:** lisa.coordinator@company.com / password123
- **Supervisor:** marie.supervisor@company.com / password123

**Dubai Region:**
- **Recruiter:** sarah.recruiter@company.com / password123
- **Administrator:** ahmed.admin@company.com / password123
- **Observer:** david.observer@company.com / password123

**Turkey Region:**
- **Interviewer:** mike.interviewer@company.com / password123
- **Consultant:** mehmet.consultant@company.com / password123

### Sample Candidates:
- Alice Johnson (React, JavaScript, Node.js) - Active
- Bob Smith (Python, Java, MongoDB) - Interview
- Carol Davis (React, Vue.js, TypeScript) - New
- David Wilson (Docker, Kubernetes, AWS) - Offer

### Sample Companies:
- TechCorp Solutions (Technology) - Verified
- InnovateLabs (Software Development) - Verified
- DataDrive Inc (Data Analytics) - Not Verified

### Sample Jobs:
- Senior Full Stack Developer @ TechCorp ($120k-$150k)
- Frontend Developer @ InnovateLabs (Remote, $80k-$110k)
- DevOps Engineer @ DataDrive ($100k-$130k)

## 🔧 API Testing Tools

**Recommended tools:**
- **Postman** - GUI interface for API testing
- **curl** - Command line tool
- **Thunder Client** - VS Code extension
- **Insomnia** - API client

### Sample curl commands:
```bash
# Get all candidates
curl -X GET http://localhost:3000/api/candidates

# Create new candidate
curl -X POST http://localhost:3000/api/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-1234",
    "skills": ["JavaScript", "React"],
    "status": "new"
  }'

# Get specific candidate
curl -X GET http://localhost:3000/api/candidates/CANDIDATE_ID
```

## 🎉 Ready to Code!

Your backend is now fully set up with:
- ✅ MongoDB connected
- ✅ Test data seeded
- ✅ All 47 API endpoints working
- ✅ Ready for frontend integration

**Happy coding! 🚀** 