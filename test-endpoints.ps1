# 🧪 API Endpoint Testing Script
# Tests all RecruitmentPlus CRM API endpoints

Write-Host "🚀 TESTING ALL API ENDPOINTS" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$baseUrl = "http://localhost:3000/api"

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Description,
        [hashtable]$Body = $null
    )
    
    Write-Host "`n📍 $Description" -ForegroundColor Yellow
    Write-Host "   $Method $Url" -ForegroundColor Cyan
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 3
            $params.Body = $jsonBody
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        
        # Show response preview
        $content = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($content) {
            if ($content -is [array] -and $content.Count -gt 0) {
                Write-Host "   📊 Found $($content.Count) items" -ForegroundColor Blue
            } elseif ($content._id) {
                Write-Host "   🆔 Created/Found item with ID: $($content._id)" -ForegroundColor Blue
            }
        }
        
        return $response
    }
    catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test 1: GET All Users
Test-Endpoint "GET" "$baseUrl/users" "Get All Users"

# Test 2: POST Create User
$newUser = @{
    firstName = "Terminal"
    lastName = "Tester"
    email = "terminal.tester@test.com"
    password = "password123"
    role = "employer"
    region = "montreal"
    department = "Testing"
    position = "API Tester"
}
$userResponse = Test-Endpoint "POST" "$baseUrl/users" "Create New User" $newUser

# Test 3: GET Users by Region
Test-Endpoint "GET" "$baseUrl/users/region/montreal" "Get Users by Region (Montreal)"
Test-Endpoint "GET" "$baseUrl/users/region/dubai" "Get Users by Region (Dubai)"
Test-Endpoint "GET" "$baseUrl/users/region/turkey" "Get Users by Region (Turkey)"

# Test 4: GET All Companies
Test-Endpoint "GET" "$baseUrl/companies" "Get All Companies"

# Test 5: POST Create Company
$newCompany = @{
    name = "Terminal Test Corp"
    email = "contact@terminaltest.com"
    phone = "+1-555-TEST"
    address = "123 Terminal Street, Test City"
    industry = "Technology"
    description = "Test company created via terminal"
    website = "https://terminaltest.com"
    companySize = "small"
    isVerified = $false
}
$companyResponse = Test-Endpoint "POST" "$baseUrl/companies" "Create New Company" $newCompany

# Test 6: GET All Candidates
Test-Endpoint "GET" "$baseUrl/candidates" "Get All Candidates"

# Test 7: Filter Candidates by Status
Test-Endpoint "GET" "$baseUrl/candidates?status=active" "Filter Candidates (Active)"

# Test 8: POST Create Candidate
$newCandidate = @{
    firstName = "Terminal"
    lastName = "Candidate"
    email = "terminal.candidate@test.com"
    phone = "+1-555-CAND"
    location = "Test City"
    experience = "3 years"
    skills = @("JavaScript", "Node.js", "Testing")
    status = "active"
    salaryExpectation = 75000
}
Test-Endpoint "POST" "$baseUrl/candidates" "Create New Candidate" $newCandidate

# Test 9: GET All Jobs
Test-Endpoint "GET" "$baseUrl/jobs" "Get All Jobs"

# Test 10: Filter Remote Jobs
Test-Endpoint "GET" "$baseUrl/jobs?isRemote=true" "Filter Remote Jobs"

# Test 11: GET All Skills
Test-Endpoint "GET" "$baseUrl/skills" "Get All Skills"

# Test 12: Filter Skills by Category
Test-Endpoint "GET" "$baseUrl/skills?category=Frontend" "Filter Skills (Frontend)"

# Test 13: POST Create Skill
$newSkill = @{
    name = "Terminal Testing"
    category = "Testing"
    description = "API testing via terminal"
}
Test-Endpoint "POST" "$baseUrl/skills" "Create New Skill" $newSkill

# Test 14: GET All Applications
Test-Endpoint "GET" "$baseUrl/applications" "Get All Applications"

# Test 15: Filter Applications by Status
Test-Endpoint "GET" "$baseUrl/applications?status=interview" "Filter Applications (Interview)"

Write-Host "`n🎉 API TESTING COMPLETE!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Check the results above to verify all endpoints are working correctly." -ForegroundColor Blue 