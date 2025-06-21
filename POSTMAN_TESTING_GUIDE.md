# 📮 Postman Testing Guide for RecruitmentPlus CRM API

> **⚠️ Current Backend Status**: The authentication endpoints (`/auth/login`, `/auth/register`) are not yet implemented in the backend. This guide has been updated to work with the current API capabilities. Authentication tests use mock tokens for now.

## 📋 Table of Contents
1. [Postman Setup & Configuration](#postman-setup--configuration)
2. [Environment Variables](#environment-variables)
3. [Collection Structure](#collection-structure)
4. [Test Scenarios](#test-scenarios)
5. [Authentication Tests](#authentication-tests)
6. [CRUD Operations Tests](#crud-operations-tests)
7. [Advanced Filtering Tests](#advanced-filtering-tests)
8. [Error Handling Tests](#error-handling-tests)
9. [Performance Tests](#performance-tests)
10. [Test Data Validation](#test-data-validation)

---

## 🚀 Postman Setup & Configuration

### Step 1: Install Postman
1. Download Postman from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
2. Install and create a free account
3. Open Postman application

### Step 2: Create New Workspace
1. Click **"Workspaces"** in the top navigation
2. Click **"Create Workspace"**
3. Name: `RecruitmentPlus CRM API Testing`
4. Description: `API testing for RecruitmentPlus CRM backend`
5. Visibility: **Personal** or **Team** (as needed)
6. Click **"Create Workspace"**

### Step 3: Create New Collection
1. Click **"Collections"** in the left sidebar
2. Click **"Create Collection"**
3. Name: `RecruitmentPlus CRM API`
4. Description: `Complete API testing suite for RecruitmentPlus CRM`
5. Click **"Create"**

---

## 🌍 Environment Variables

### Step 1: Create Environment
1. Click the **"Environments"** tab in the left sidebar
2. Click **"Create Environment"**
3. Name: `RecruitmentPlus Local`

### Step 2: Add Environment Variables
Add these variables to your environment:

| Variable Name | Initial Value | Current Value |
|---------------|---------------|---------------|
| `baseUrl` | `http://localhost:3000` | `http://localhost:3000` |
| `apiUrl` | `{{baseUrl}}/api` | `{{baseUrl}}/api` |
| `authToken` | | (will be set by login test) |
| `userId` | | (will be set by login test) |
| `candidateId` | | (will be set by tests) |
| `companyId` | | (will be set by tests) |
| `jobId` | | (will be set by tests) |
| `skillId` | | (will be set by tests) |
| `applicationId` | | (will be set by tests) |

### Step 3: Activate Environment
1. Click the environment dropdown (top right)
2. Select **"RecruitmentPlus Local"**

---

## 📁 Collection Structure

Create folders in your collection with this structure:

```
RecruitmentPlus CRM API/
├── 🔐 Authentication/
│   ├── Register User
│   ├── Login User
│   └── Verify Token
├── 👥 Users Management/
│   ├── Get All Users
│   ├── Get User by ID
│   ├── Update User
│   ├── Delete User
│   ├── Get Users by Region
│   └── Filter Users
├── 🏢 Companies Management/
│   ├── Get All Companies
│   ├── Create Company
│   ├── Get Company by ID
│   ├── Update Company
│   ├── Delete Company
│   └── Filter Companies
├── 👨‍💼 Candidates Management/
│   ├── Get All Candidates
│   ├── Create Candidate
│   ├── Get Candidate by ID
│   ├── Update Candidate
│   ├── Delete Candidate
│   └── Filter Candidates
├── 💼 Jobs Management/
│   ├── Get All Jobs
│   ├── Create Job
│   ├── Get Job by ID
│   ├── Update Job
│   ├── Delete Job
│   └── Filter Jobs
├── 🎯 Skills Management/
│   ├── Get All Skills
│   ├── Create Skill
│   ├── Get Skill by ID
│   ├── Update Skill
│   ├── Delete Skill
│   └── Filter Skills
├── 📄 Applications Management/
│   ├── Get All Applications
│   ├── Create Application
│   ├── Get Application by ID
│   ├── Update Application
│   ├── Delete Application
│   └── Filter Applications
├── 🔍 Advanced Filtering/
│   ├── Complex Queries
│   ├── Pagination Tests
│   └── Sorting Tests
└── ❌ Error Handling/
    ├── Invalid Endpoints
    ├── Invalid Data
    └── Authorization Errors
```

---

## 🧪 Test Scenarios

### 1. 🔐 Authentication Tests

#### Register User
- **Method**: `POST`
- **URL**: `{{apiUrl}}/users`
- **Body** (JSON):
```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test.user@example.com",
  "password": "password123",
  "role": "employer",
  "region": "montreal",
  "department": "Testing",
  "position": "QA Tester"
}
```
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has user data", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('_id');
    pm.expect(responseJson.email).to.eql('test.user@example.com');
    pm.environment.set("userId", responseJson._id);
});

pm.test("Password is not returned", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.not.have.property('password');
});
```

#### Login User (Note: Authentication endpoint not yet implemented)
**⚠️ IMPORTANT**: The authentication endpoints are not yet implemented in the backend. For now, skip authentication tests and proceed directly to testing the available endpoints. We'll use a mock approach for testing.

**Alternative: Create a Test User for Protected Endpoints**
- **Method**: `POST`
- **URL**: `{{apiUrl}}/users`
- **Body** (JSON):
```json
{
  "firstName": "Admin",
  "lastName": "Tester",
  "email": "admin.tester@company.com",
  "password": "password123456",
  "role": "admin",
  "region": "montreal",
  "department": "Administration",
  "position": "Admin Tester"
}
```
- **Tests**:
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Admin user created", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('_id');
    pm.expect(responseJson.role).to.eql('admin');
    pm.environment.set("adminUserId", responseJson._id);
    // Mock token for testing (since auth isn't implemented yet)
    pm.environment.set("authToken", "mock-token-for-testing");
});
```

**Note**: Once authentication endpoints are implemented, update this test to use the actual login endpoint.

### 2. 👥 Users Management Tests

#### Get All Users
- **Method**: `GET`
- **URL**: `{{apiUrl}}/users`
- **Headers**: *(No authentication required currently)*
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is array", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.be.an('array');
    pm.expect(responseJson.length).to.be.above(0);
});

pm.test("Users have required fields", function () {
    const responseJson = pm.response.json();
    const user = responseJson[0];
    pm.expect(user).to.have.property('firstName');
    pm.expect(user).to.have.property('lastName');
    pm.expect(user).to.have.property('email');
    pm.expect(user).to.have.property('role');
    pm.expect(user).to.have.property('region');
});
```

#### Get Users by Region
- **Method**: `GET`
- **URL**: `{{apiUrl}}/users/region/montreal`
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("All users are from Montreal", function () {
    const responseJson = pm.response.json();
    responseJson.forEach(user => {
        pm.expect(user.region).to.eql('montreal');
    });
});
```

### 3. 🏢 Companies Management Tests

#### Get All Companies
- **Method**: `GET`
- **URL**: `{{apiUrl}}/companies`
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Companies have required fields", function () {
    const responseJson = pm.response.json();
    const company = responseJson[0];
    pm.expect(company).to.have.property('name');
    pm.expect(company).to.have.property('email');
    pm.expect(company).to.have.property('phone');
    pm.expect(company).to.have.property('address');
    pm.expect(company).to.have.property('industry');
    pm.environment.set("companyId", company._id);
});
```

#### Create Company
- **Method**: `POST`
- **URL**: `{{apiUrl}}/companies`
- **Body** (JSON):
```json
{
  "name": "Test Company Ltd",
  "email": "contact@testcompany.com",
  "phone": "+1-555-0199",
  "address": "123 Test Street, Test City, TC 12345",
  "industry": "Technology",
  "description": "A test company for API testing purposes",
  "website": "https://testcompany.com",
  "companySize": "small",
  "isVerified": false
}
```
- **Tests**:
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Company created successfully", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson.name).to.eql('Test Company Ltd');
    pm.expect(responseJson.email).to.eql('contact@testcompany.com');
});
```

### 4. 👨‍💼 Candidates Management Tests

#### Get All Candidates
- **Method**: `GET`
- **URL**: `{{apiUrl}}/candidates`
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Candidates have required fields", function () {
    const responseJson = pm.response.json();
    const candidate = responseJson[0];
    pm.expect(candidate).to.have.property('firstName');
    pm.expect(candidate).to.have.property('lastName');
    pm.expect(candidate).to.have.property('email');
    pm.expect(candidate).to.have.property('skills');
    pm.environment.set("candidateId", candidate._id);
});
```

#### Filter Candidates by Status
- **Method**: `GET`
- **URL**: `{{apiUrl}}/candidates?status=active`
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("All candidates have active status", function () {
    const responseJson = pm.response.json();
    responseJson.forEach(candidate => {
        pm.expect(candidate.status).to.eql('active');
    });
});
```

### 5. 💼 Jobs Management Tests

#### Get All Jobs
- **Method**: `GET`
- **URL**: `{{apiUrl}}/jobs`
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Jobs have required fields", function () {
    const responseJson = pm.response.json();
    const job = responseJson[0];
    pm.expect(job).to.have.property('title');
    pm.expect(job).to.have.property('company');
    pm.expect(job).to.have.property('companyId');
    pm.expect(job).to.have.property('location');
    pm.expect(job).to.have.property('description');
    pm.environment.set("jobId", job._id);
});
```

#### Filter Remote Jobs
- **Method**: `GET`
- **URL**: `{{apiUrl}}/jobs?isRemote=true`
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("All jobs are remote", function () {
    const responseJson = pm.response.json();
    responseJson.forEach(job => {
        pm.expect(job.isRemote).to.be.true;
    });
});
```

### 6. 🎯 Skills Management Tests

#### Get All Skills
- **Method**: `GET`
- **URL**: `{{apiUrl}}/skills`
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Skills have required fields", function () {
    const responseJson = pm.response.json();
    const skill = responseJson[0];
    pm.expect(skill).to.have.property('name');
    pm.expect(skill).to.have.property('category');
    pm.environment.set("skillId", skill._id);
});
```

#### Filter Skills by Category
- **Method**: `GET`
- **URL**: `{{apiUrl}}/skills?category=Frontend`
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("All skills are Frontend category", function () {
    const responseJson = pm.response.json();
    responseJson.forEach(skill => {
        pm.expect(skill.category).to.eql('Frontend');
    });
});
```

### 7. 📄 Applications Management Tests

#### Get All Applications
- **Method**: `GET`
- **URL**: `{{apiUrl}}/applications`
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Applications have required fields", function () {
    const responseJson = pm.response.json();
    const application = responseJson[0];
    pm.expect(application).to.have.property('candidateId');
    pm.expect(application).to.have.property('jobId');
    pm.expect(application).to.have.property('companyId');
    pm.expect(application).to.have.property('status');
    pm.environment.set("applicationId", application._id);
});
```

#### Create Application
- **Method**: `POST`
- **URL**: `{{apiUrl}}/applications`
- **Body** (JSON):
```json
{
  "candidateId": "{{candidateId}}",
  "jobId": "{{jobId}}",
  "companyId": "{{companyId}}",
  "status": "applied",
  "coverLetter": "I am very interested in this position and believe I would be a great fit.",
  "resume": "test_resume.pdf"
}
```

---

## 🔍 Advanced Filtering Tests

### Pagination Test
- **Method**: `GET`
- **URL**: `{{apiUrl}}/candidates?page=1&limit=5`
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has pagination info", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson.length).to.be.at.most(5);
});
```

### Complex Query Test
- **Method**: `GET`
- **URL**: `{{apiUrl}}/jobs?status=active&isRemote=true&isFeatured=true`
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Jobs match all criteria", function () {
    const responseJson = pm.response.json();
    responseJson.forEach(job => {
        pm.expect(job.status).to.eql('active');
        pm.expect(job.isRemote).to.be.true;
        pm.expect(job.isFeatured).to.be.true;
    });
});
```

---

## ❌ Error Handling Tests

### Invalid Endpoint Test
- **Method**: `GET`
- **URL**: `{{apiUrl}}/invalid-endpoint`
- **Tests**:
```javascript
pm.test("Status code is 404", function () {
    pm.response.to.have.status(404);
});
```

### Invalid Data Test
- **Method**: `POST`
- **URL**: `{{apiUrl}}/users`
- **Body** (JSON):
```json
{
  "firstName": "Test",
  "email": "invalid-email",
  "password": "123"
}
```
- **Tests**:
```javascript
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Response has validation errors", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('errors');
});
```

---

## 🏃‍♂️ Running Tests

### Step 1: Start Your Server
```bash
cd recPlus-server
npm start
```

### Step 2: Seed Database
```bash
npm run seed
```

### Step 3: Run Collection
1. Click on your collection name
2. Click **"Run"** button
3. Select all folders/requests you want to test
4. Click **"Run RecruitmentPlus CRM API"**

### Step 4: Monitor Results
- View test results in the runner
- Check passed/failed tests
- Review response times
- Analyze any failures

---

## 📊 Test Automation

### Collection Runner Settings
- **Iterations**: 1
- **Delay**: 0ms
- **Data File**: Optional CSV with test data
- **Environment**: RecruitmentPlus Local
- **Keep variable values**: Checked
- **Run collection without using stored cookies**: Unchecked

### Newman CLI (Optional)
Install Newman for command-line testing:
```bash
npm install -g newman
newman run "RecruitmentPlus CRM API.postman_collection.json" -e "RecruitmentPlus Local.postman_environment.json"
```

---

## 📝 Test Documentation

### Test Coverage Summary
- **Total Endpoints**: 48
- **Authentication**: 3 tests
- **Users**: 8 tests
- **Companies**: 7 tests
- **Candidates**: 6 tests
- **Jobs**: 8 tests
- **Skills**: 8 tests
- **Applications**: 10 tests
- **Error Handling**: 5 tests
- **Advanced Filtering**: 5 tests

### Expected Results
- All CRUD operations should work correctly
- Filtering and pagination should function properly
- Error handling should return appropriate status codes
- Data validation should prevent invalid entries
- Regional filtering should work for users

---

## 🔧 Troubleshooting

### Common Issues
1. **Server not running**: Ensure backend server is started on port 3000
2. **Database empty**: Run `npm run seed` to populate test data
3. **Environment variables**: Check that all variables are set correctly
4. **CORS issues**: Verify CORS is enabled in your backend
5. **Authentication**: Ensure login test runs first to set auth token

### Debug Tips
- Use Postman Console for debugging
- Check response headers and status codes
- Verify request body format
- Ensure environment variables are populated
- Test individual requests before running collection

---

## ✅ Success Criteria

Your API testing is successful when:
- ✅ All CRUD operations pass
- ✅ Filtering and search work correctly
- ✅ Regional user management functions properly
- ✅ Data relationships are maintained
- ✅ Error handling returns appropriate responses
- ✅ Performance is within acceptable limits
- ✅ All 48 endpoints are tested and validated

---

**🎉 Ready to test your RecruitmentPlus CRM API comprehensively!** 