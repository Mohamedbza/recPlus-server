# 🚀 Postman Quick Start Guide - RecruitmentPlus CRM API

## ⚡ 5-Minute Setup

### Step 1: Start Your Server (1 minute)
```bash
# Navigate to server directory
cd recPlus-server

# Install dependencies (if not done already)
npm install

# Seed the database with test data
npm run seed

# Start the server
npm start
```
✅ **Verify**: Server should be running on `http://localhost:3000`

### Step 2: Import into Postman (2 minutes)

#### Option A: Import Files (Recommended)
1. Open Postman
2. Click **"Import"** button (top left)
3. Import these files from `recPlus-server/` folder:
   - `RecruitmentPlus_Local.postman_environment.json`
   - `POSTMAN_TESTING_GUIDE.md` (for reference)

#### Option B: Manual Setup
1. **Create Environment**:
   - Name: `RecruitmentPlus Local`
   - Variables:
     - `baseUrl`: `http://localhost:3000`
     - `apiUrl`: `{{baseUrl}}/api`

2. **Create Collection**:
   - Name: `RecruitmentPlus CRM API`
   - Description: `API testing for RecruitmentPlus CRM`

### Step 3: Run Quick Tests (2 minutes)

#### Test 1: Get All Users
- **Method**: `GET`
- **URL**: `{{apiUrl}}/users`
- **Expected**: 200 status, array of 8 users

#### Test 2: Get Montreal Users
- **Method**: `GET`
- **URL**: `{{apiUrl}}/users/region/montreal`
- **Expected**: 200 status, 3 Montreal users

#### Test 3: Get All Companies
- **Method**: `GET`
- **URL**: `{{apiUrl}}/companies`
- **Expected**: 200 status, array of 6 companies

#### Test 4: Get All Skills
- **Method**: `GET`
- **URL**: `{{apiUrl}}/skills`
- **Expected**: 200 status, array of 24 skills

#### Test 5: Get Frontend Skills
- **Method**: `GET`
- **URL**: `{{apiUrl}}/skills?category=Frontend`
- **Expected**: 200 status, 5 Frontend skills

---

## 🎯 Essential Test Requests

### Copy-Paste Ready Requests

#### 1. Users by Region
```
GET {{apiUrl}}/users/region/montreal
GET {{apiUrl}}/users/region/dubai
GET {{apiUrl}}/users/region/turkey
```

#### 2. Company Filtering
```
GET {{apiUrl}}/companies?industry=Technology
GET {{apiUrl}}/companies?isVerified=true
```

#### 3. Job Filtering
```
GET {{apiUrl}}/jobs?isRemote=true
GET {{apiUrl}}/jobs?isFeatured=true
GET {{apiUrl}}/jobs?status=active
```

#### 4. Skills by Category
```
GET {{apiUrl}}/skills?category=Frontend
GET {{apiUrl}}/skills?category=Backend
GET {{apiUrl}}/skills?category=Database
GET {{apiUrl}}/skills?category=DevOps
GET {{apiUrl}}/skills?category=Design
```

#### 5. Application Status
```
GET {{apiUrl}}/applications?status=applied
GET {{apiUrl}}/applications?status=interview
GET {{apiUrl}}/applications?status=offer
GET {{apiUrl}}/applications?status=hired
```

---

## 🧪 Test Validation Scripts

### Add to Postman Tests Tab

#### Basic Status Check
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is array", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.be.an('array');
});
```

#### Regional User Validation
```javascript
pm.test("All users are from correct region", function () {
    const responseJson = pm.response.json();
    const expectedRegion = pm.request.url.path[3]; // Gets region from URL
    responseJson.forEach(user => {
        pm.expect(user.region).to.eql(expectedRegion);
    });
});
```

#### Skills Category Validation
```javascript
pm.test("All skills match category", function () {
    const responseJson = pm.response.json();
    const urlParams = new URLSearchParams(pm.request.url.query.toString());
    const expectedCategory = urlParams.get('category');
    
    responseJson.forEach(skill => {
        pm.expect(skill.category).to.eql(expectedCategory);
    });
});
```

---

## 📊 Expected Test Results

### Seed Data Summary
- **Skills**: 24 total (5 Frontend, 5 Backend, 4 Database, 5 DevOps, 5 Design)
- **Companies**: 6 total (3 verified, 3 unverified)
- **Users**: 8 total (3 Montreal, 3 Dubai, 2 Turkey)
- **Candidates**: 8 total (various statuses)
- **Jobs**: 6 total (2 remote, 3 featured, 5 active)
- **Applications**: 6 total (various statuses)

### Regional Distribution
- **Montreal**: John Manager, Lisa Coordinator, Marie Supervisor
- **Dubai**: Sarah Recruiter, Ahmed Administrator, David Observer
- **Turkey**: Mike Interviewer, Mehmet Consultant

### Skills by Category
- **Frontend**: React, Vue.js, Angular, HTML5, CSS3
- **Backend**: Node.js, Python, Java, C#, PHP
- **Database**: MongoDB, MySQL, PostgreSQL, Redis
- **DevOps**: Docker, Kubernetes, AWS, Azure, Jenkins
- **Design**: Figma, Photoshop, Sketch, Adobe XD, InVision

---

## ❌ Common Issues & Solutions

### Issue 1: Server Not Running
**Error**: Connection refused or timeout
**Solution**: 
```bash
cd recPlus-server
npm start
```

### Issue 2: Empty Database
**Error**: Empty arrays returned
**Solution**:
```bash
npm run seed
```

### Issue 3: Environment Not Selected
**Error**: Variables not resolving ({{apiUrl}} showing as text)
**Solution**: Select "RecruitmentPlus Local" environment in Postman dropdown

### Issue 4: CORS Errors
**Error**: CORS policy blocks request
**Solution**: CORS has been removed from this backend. If you need CORS, you'll need to configure it in your frontend or proxy.

### Issue 5: Invalid ObjectId
**Error**: Cast to ObjectId failed
**Solution**: Use valid MongoDB ObjectIds from GET requests

---

## 🎯 Success Criteria

### ✅ All Tests Should Pass When:
- Server returns 200 status for all GET requests
- Regional filtering returns correct users
- Skills filtering returns correct categories
- Companies have all required fields
- Jobs have proper company relationships
- Applications link valid entities

### 📈 Performance Expectations
- **GET requests**: < 500ms response time
- **POST requests**: < 1000ms response time
- **Database queries**: No timeouts
- **Concurrent requests**: Handle 10+ simultaneous users

---

## 🚀 Next Steps

### After Quick Tests Pass:
1. **Run Full Test Suite**: Use the complete checklist in `POSTMAN_TEST_CHECKLIST.md`
2. **Test CRUD Operations**: Create, update, and delete records
3. **Error Handling**: Test invalid data and endpoints
4. **Performance Testing**: Test with larger datasets
5. **Security Testing**: Validate authentication and authorization

### Before Frontend Integration:
- [ ] All 48 endpoints tested and working
- [ ] Regional functionality verified
- [ ] Data relationships validated
- [ ] Error handling confirmed
- [ ] Performance acceptable

---

**🎉 Your API is ready for frontend integration when all quick tests pass!**

---

## 📞 Support

If you encounter issues:
1. Check the `POSTMAN_TESTING_GUIDE.md` for detailed instructions
2. Review the `POSTMAN_TEST_CHECKLIST.md` for comprehensive testing
3. Verify your server logs for any backend errors
4. Ensure MongoDB is running and connected

**Happy Testing! 🧪✨** 