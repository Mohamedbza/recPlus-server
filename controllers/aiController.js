// controllers/aiController.js
const asyncHandler = require('express-async-handler');
const OpenAI = require('openai');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to extract clean instruction from user prompt
const extractUserIntention = (prompt) => {
  // Remove meta phrases and extract the core instruction
  let cleanPrompt = prompt
    .replace(/Regarding:\s*/gi, '')
    .replace(/Additional context:\s*/gi, '')
    .replace(/From AI Assistant query:\s*/gi, '')
    .replace(/write an email (for|to)\s*/gi, '')
    .replace(/draft an email (for|to)\s*/gi, '')
    .replace(/generate an email (for|to)\s*/gi, '')
    .replace(/genere un email (pour|qui)\s*/gi, '')
    .replace(/tell (him|her|them) that\s*/gi, '')
    .replace(/inform (him|her|them) that\s*/gi, '')
    .replace(/let (him|her|them) know that\s*/gi, '')
    .replace(/and tell (him|her|them)\s*/gi, '')
    .replace(/- Additional context:\s*/gi, '')
    .trim();

  // Further clean up redundant phrases
  cleanPrompt = cleanPrompt
    .replace(/^(and\s+|,\s*)/gi, '')
    .replace(/\s+-\s+/g, ' ')
    .trim();

  return cleanPrompt;
};

// Helper function to determine email intent and tone
const analyzeEmailIntent = (instruction) => {
  const lowerInstruction = instruction.toLowerCase();
  
  // Dismissal/termination
  if (lowerInstruction.includes('viré') || lowerInstruction.includes('licencié') || 
      lowerInstruction.includes('dismissed') || lowerInstruction.includes('fired') || 
      lowerInstruction.includes('terminated') || lowerInstruction.includes('let go')) {
    return {
      intent: 'dismissal',
      tone: 'professional, respectful, clear',
      context: 'employment termination'
    };
  }

  // Meeting/interview
  if (lowerInstruction.includes('meeting') || lowerInstruction.includes('rendez-vous') ||
      lowerInstruction.includes('interview') || lowerInstruction.includes('entretien')) {
    return {
      intent: 'meeting_invitation',
      tone: 'professional, friendly',
      context: 'meeting coordination'
    };
  }

  // Job offer/acceptance
  if (lowerInstruction.includes('offer') || lowerInstruction.includes('offre') ||
      lowerInstruction.includes('accept') || lowerInstruction.includes('hired') ||
      lowerInstruction.includes('embauché')) {
    return {
      intent: 'job_offer',
      tone: 'enthusiastic, professional, welcoming',
      context: 'job offer extension'
    };
  }

  // Rejection
  if (lowerInstruction.includes('reject') || lowerInstruction.includes('refus') ||
      lowerInstruction.includes('not selected') || lowerInstruction.includes('declined')) {
    return {
      intent: 'rejection',
      tone: 'respectful, encouraging, professional',
      context: 'application rejection'
    };
  }

  // Follow-up
  if (lowerInstruction.includes('follow up') || lowerInstruction.includes('suivi') ||
      lowerInstruction.includes('update') || lowerInstruction.includes('status')) {
    return {
      intent: 'follow_up',
      tone: 'professional, informative',
      context: 'application status update'
    };
  }

  // Default general inquiry
  return {
    intent: 'general',
    tone: 'professional, helpful',
    context: 'general communication'
  };
};



// @desc    Generate email using AI
// @route   POST /api/ai/generate-email
// @access  Private
const generateEmail = asyncHandler(async (req, res) => {
  try {
    const { type, data, prompt } = req.body;

    // Validate required fields
    if (!type || !data || !prompt) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, data, and prompt are required'
      });
    }

    // Check if OpenAI is available
    const hasValidOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10;

    let generatedEmail;

    if (hasValidOpenAIKey) {
      try {
        let systemPrompt = "";
        let userPrompt = "";

        // Extract and analyze user intention for all cases
        const cleanInstruction = extractUserIntention(prompt);
        const emailIntent = analyzeEmailIntent(cleanInstruction);

        if (type === 'chat') {
          // For chat queries, create a conversational AI response
          systemPrompt = `You are an intelligent AI recruitment assistant. Respond naturally and helpfully to user queries about recruitment, HR, and business communications. Be professional, concise, and actionable.`;
          userPrompt = cleanInstruction;

        } else if (type === 'candidate_email' || type === 'candidate') {
          // Accept both raw candidate object and context object
          const candidateName = data.firstName && data.lastName
            ? `${data.firstName} ${data.lastName}`
            : data.candidate_name || 'Candidate';

          const candidatePosition = data.experience || data.position || data.candidate_position || 'the position';
          const candidateSkills = Array.isArray(data.skills)
            ? data.skills.join(', ')
            : data.skills || 'various technical skills';
          const candidateEducation = data.education || 'relevant educational background';

          // Build dynamic, intent-specific prompt for OpenAI
          systemPrompt = `You are a professional HR specialist writing an email to a job candidate. Your emails must be naturally human, empathetic, and professionally appropriate. Always write complete emails with proper greetings, body, and sign-offs.`;

          // Create context-aware prompt based on detected intent
          let contextualPrompt = '';
          switch (emailIntent.intent) {
            case 'dismissal':
              contextualPrompt = `Write a professional, respectful email to ${candidateName} (${candidatePosition}) explaining their employment termination. Use a compassionate but clear tone. Include appropriate next steps and appreciation for their contributions.`;
              break;
            case 'job_offer':
              contextualPrompt = `Write an enthusiastic job offer email to ${candidateName} for the ${candidatePosition} position. Express excitement about their qualifications (${candidateSkills}) and outline next steps for joining the team.`;
              break;
            case 'meeting_invitation':
              contextualPrompt = `Write a professional meeting invitation email to ${candidateName} regarding their ${candidatePosition} application. Include proposed timing and agenda details from the request.`;
              break;
            case 'rejection':
              contextualPrompt = `Write a respectful rejection email to ${candidateName} for the ${candidatePosition} position. Be encouraging and leave the door open for future opportunities.`;
              break;
            case 'follow_up':
              contextualPrompt = `Write a professional follow-up email to ${candidateName} regarding their ${candidatePosition} application status. Provide helpful updates and timeline expectations.`;
              break;
            default:
              contextualPrompt = `Write a professional email to ${candidateName} (${candidatePosition}) addressing their request: "${cleanInstruction}". Be natural, helpful, and appropriate to the context.`;
          }

          userPrompt = `${contextualPrompt}

Additional Context:
- Candidate: ${candidateName}
- Position: ${candidatePosition}  
- Skills: ${candidateSkills}
- Education: ${candidateEducation}
- Specific Request: ${cleanInstruction}

Write the complete email content only. No explanations or meta-text.`;

        } else if (type === 'company_email' || type === 'company') {
          // Accept both raw company object and context object
          const companyName = data.name || data.company_name || 'the company';
          const industry = data.industry || 'the industry';
          const contactPerson = data.contactPerson || data.contact_person || 'the team';

          systemPrompt = `You are a professional business development representative writing business emails. Create natural, engaging emails that build relationships and drive business objectives.`;

          userPrompt = `Write a professional business email to ${contactPerson} at ${companyName} addressing this request: "${cleanInstruction}"

Context:
- Company: ${companyName}
- Industry: ${industry}
- Contact: ${contactPerson}
- Purpose: ${cleanInstruction}

Write the complete email content only. No explanations or meta-text.`;
        }

        // Use GPT-4o for better quality and speed
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 800,
          temperature: 0.7
        });

        generatedEmail = completion.choices[0].message.content.trim();
        generatedEmail += '\n\n<!-- Generated by GPT-4o -->';

      } catch (openaiError) {
        // Try GPT-3.5-turbo as fallback
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            max_tokens: 600,
            temperature: 0.7
          });

          generatedEmail = completion.choices[0].message.content.trim();
          generatedEmail += '\n\n<!-- Generated by GPT-3.5-turbo -->';

        } catch (fallbackError) {
          generatedEmail = null; // Force minimal fallback
        }
      }
    }

    // Minimal fallback only for critical errors
    if (!generatedEmail) {
      if (type === 'chat') {
        generatedEmail = `I apologize, but I'm currently unable to process your request due to a temporary service issue. Please try again in a moment, or contact support if the problem persists.`;
      } else {
        const candidateName = data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : data.candidate_name || data.name || 'the recipient';
        generatedEmail = `Dear ${candidateName},

I apologize, but I'm currently unable to generate the requested email due to a temporary service issue. Please try again in a moment.

Best regards,
[Your Name]`;
      }
    }

    if (!generatedEmail) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate email content'
      });
    }

    // Determine the actual source based on markers and clean the email
    let actualSource = 'fallback';
    if (generatedEmail.includes('<!-- Generated by GPT-4o -->')) {
      actualSource = 'gpt-4o';
      generatedEmail = generatedEmail.replace('\n\n<!-- Generated by GPT-4o -->', '');
    } else if (generatedEmail.includes('<!-- Generated by GPT-3.5-turbo -->')) {
      actualSource = 'gpt-3.5-turbo';
      generatedEmail = generatedEmail.replace('\n\n<!-- Generated by GPT-3.5-turbo -->', '');
    }


    
    const responseData = {
      success: true,
      data: {
        email: generatedEmail,
        type: type,
        generatedAt: new Date().toISOString(),
        source: actualSource
      }
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Error generating email:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while generating email',
      error: error.message
    });
  }
});

// Helper function to extract text from uploaded file
const extractTextFromFile = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (fileExtension === '.pdf') {
      // Handle PDF files
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (fileExtension === '.txt' || fileExtension === '.md') {
      // Handle text files
      const dataBuffer = fs.readFileSync(file.path);
      return dataBuffer.toString('utf8');
    } else if (fileExtension === '.docx') {
      // Handle DOCX files
      const dataBuffer = fs.readFileSync(file.path);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      return result.value;
    } else {
      throw new Error(`Unsupported file type: ${fileExtension}. Please upload PDF, DOCX, TXT, or MD files.`);
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
};

// @desc    Analyze CV using AI (supports both text and file uploads)
// @route   POST /api/ai/analyze-cv
// @access  Private
const analyzeCv = asyncHandler(async (req, res) => {
  try {
    let cvText = req.body.cvText;
    
    // If no text in body, check for uploaded file
    if (!cvText && req.file) {
      console.log('Processing uploaded file:', req.file.originalname);
      cvText = await extractTextFromFile(req.file);
      
      // Clean up uploaded file
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    if (!cvText) {
      return res.status(400).json({
        success: false,
        message: 'CV text is required. Please provide cvText in request body or upload a file.'
      });
    }

    console.log('Analyzing CV with fallback logic (OpenAI disabled due to invalid key)');

    // Basic CV text analysis (fallback when OpenAI is not available)
    const cvTextLower = cvText.toLowerCase();
    
    // Extract basic information from CV text
    const skills = [];
    const education = [];
    const experience = [];
    
    // Comprehensive skill extraction (look for common skill keywords)
    const skillKeywords = [
      // Programming Languages
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala',
      'typescript', 'dart', 'r', 'matlab', 'perl', 'bash', 'powershell',
      
      // Web Technologies
      'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
      'asp.net', 'laravel', 'symfony', 'jquery', 'bootstrap', 'tailwind', 'sass', 'less',
      
      // Databases
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite',
      'dynamodb', 'cassandra', 'neo4j', 'firebase',
      
      // Cloud & DevOps
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'git',
      'terraform', 'ansible', 'puppet', 'chef', 'nginx', 'apache',
      
      // Data Science & AI
      'machine learning', 'ai', 'artificial intelligence', 'data science', 'analytics',
      'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn',
      'jupyter', 'spark', 'hadoop', 'kafka',
      
      // Mobile Development
      'react native', 'flutter', 'xamarin', 'ionic', 'cordova', 'android', 'ios',
      
      // Other Technologies
      'agile', 'scrum', 'kanban', 'jira', 'confluence', 'slack', 'microsoft office',
      'photoshop', 'illustrator', 'figma', 'sketch', 'blender', 'unity', 'unreal engine',
      'salesforce', 'hubspot', 'zapier', 'airtable'
    ];
    
    skillKeywords.forEach(skill => {
      // Check for exact match or common variations
      const skillVariations = [
        skill,
        skill.replace('.', ''),
        skill.replace('-', ' '),
        skill.replace(' ', ''),
        skill.toUpperCase(),
        skill.charAt(0).toUpperCase() + skill.slice(1)
      ];
      
      const found = skillVariations.some(variation => 
        cvTextLower.includes(variation.toLowerCase())
      );
      
      if (found) {
        // Use the most common form of the skill
        const displaySkill = skill.includes('.') ? skill.toUpperCase() : 
                           skill.charAt(0).toUpperCase() + skill.slice(1);
        
        // Avoid duplicates
        if (!skills.includes(displaySkill)) {
          skills.push(displaySkill);
        }
      }
    });
    
    // Simple education extraction
    const educationKeywords = ['university', 'college', 'bachelor', 'master', 'phd', 'degree', 'school'];
    const lines = cvText.split('\n');
    let inEducationSection = false;
    
    lines.forEach((line, index) => {
      const lineLower = line.toLowerCase();
      if (educationKeywords.some(keyword => lineLower.includes(keyword))) {
        inEducationSection = true;
        
        // Try to extract degree and institution from the line
        const degreeMatch = line.match(/(bachelor|master|phd|degree|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?)/i);
        const institutionMatch = line.match(/(university|college|institute|school)/i);
        
        // Look for years in the line or nearby lines
        const yearMatch = line.match(/(20\d{2})/);
        const nextLine = lines[index + 1] || '';
        const nextYearMatch = nextLine.match(/(20\d{2})/);
        
        if (degreeMatch || institutionMatch) {
          const degree = degreeMatch ? degreeMatch[0].toUpperCase() : 'Degree';
          const institution = line.trim().length > 0 ? line.trim() : 'Institution';
          const year = yearMatch ? yearMatch[0] : (nextYearMatch ? nextYearMatch[0] : '2024');
          
          // Avoid duplicates
          const existing = education.find(edu => 
            edu.institution.toLowerCase().includes(institution.toLowerCase()) ||
            edu.degree.toLowerCase().includes(degree.toLowerCase())
          );
          
          if (!existing) {
            education.push({
              degree: degree,
              institution: institution,
              field: 'Field of Study',
              start_year: (parseInt(year) - 4).toString(),
              end_year: year
            });
          }
        }
      }
    });
    
    // Simple experience extraction
    const experienceKeywords = ['experience', 'work', 'job', 'position', 'role', 'employment'];
    const jobTitles = [
      'developer', 'engineer', 'manager', 'analyst', 'designer', 'consultant',
      'specialist', 'coordinator', 'assistant', 'director', 'lead', 'architect',
      'programmer', 'administrator', 'supervisor', 'coordinator'
    ];
    
    lines.forEach((line, index) => {
      const lineLower = line.toLowerCase();
      
      // Check if this line contains job-related keywords
      const hasJobKeywords = experienceKeywords.some(keyword => lineLower.includes(keyword)) ||
                           jobTitles.some(title => lineLower.includes(title));
      
      if (hasJobKeywords) {
        // Try to extract job title and company
        const titleMatch = line.match(new RegExp(`(${jobTitles.join('|')})`, 'i'));
        const companyMatch = line.match(/(inc|corp|company|ltd|llc|tech|systems|solutions|group)/i);
        
        // Look for dates/years
        const yearMatch = line.match(/(20\d{2})/);
        const nextLine = lines[index + 1] || '';
        const nextYearMatch = nextLine.match(/(20\d{2})/);
        
        if (titleMatch || companyMatch || line.trim().length > 10) {
          const title = titleMatch ? titleMatch[0].charAt(0).toUpperCase() + titleMatch[0].slice(1) : 'Position';
          const company = line.trim().length > 0 ? line.trim() : 'Company';
          const year = yearMatch ? yearMatch[0] : (nextYearMatch ? nextYearMatch[0] : '2024');
          
          // Avoid duplicates
          const existing = experience.find(exp => 
            exp.company.toLowerCase().includes(company.toLowerCase()) ||
            exp.title.toLowerCase().includes(title.toLowerCase())
          );
          
          if (!existing) {
            experience.push({
              title: title,
              company: company,
              duration: '2 years',
              start_date: `${parseInt(year) - 2}-01`,
              end_date: `${year}-12`,
              current: false,
              responsibilities: ['Responsibility 1', 'Responsibility 2']
            });
          }
        }
      }
    });
    
    // Calculate estimated experience years
    const experienceYears = Math.max(0, experience.length * 2);
    
    // Generate a more professional summary based on extracted information
    let summary = '';
    if (skills.length > 0) {
      summary += `Professional with expertise in ${skills.slice(0, 3).join(', ')}`;
      if (skills.length > 3) {
        summary += ` and ${skills.length - 3} other technologies`;
      }
    } else {
      summary += 'Professional candidate';
    }
    
    if (experience.length > 0) {
      summary += ` with ${experienceYears} years of experience`;
    }
    
    if (education.length > 0) {
      const highestDegree = education.find(edu => 
        edu.degree.toLowerCase().includes('phd') || 
        edu.degree.toLowerCase().includes('master') || 
        edu.degree.toLowerCase().includes('bachelor')
      );
      if (highestDegree) {
        summary += `, holding a ${highestDegree.degree} degree`;
      }
    }
    
    summary += '. Skilled in problem-solving and team collaboration.';
    
    // Fallback CV analysis
    const analysisData = {
      summary: summary,
      total_experience_years: experienceYears,
      skills: skills.length > 0 ? skills : ['Skills extracted from CV text would appear here'],
      education: education.length > 0 ? education : [
        {
          degree: 'Sample Degree',
          institution: 'Sample University',
          field: 'Computer Science',
          start_year: '2018',
          end_year: '2022'
        }
      ],
      experience: experience.length > 0 ? experience : [
        {
          title: 'Sample Position',
          company: 'Sample Company',
          duration: '2 years',
          start_date: '2022-01',
          end_date: '2024-01',
          current: false,
          responsibilities: ['Sample responsibility 1', 'Sample responsibility 2']
        }
      ],
      source: 'fallback'
    };

    // Create file info if file was uploaded
    const fileInfo = req.file ? {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : null;


    
    res.status(200).json({
      success: true,
      data: {
        cv_analysis: analysisData,
        job_matches: [],
        file_info: fileInfo
      }
    });

  } catch (error) {
    console.error('Error analyzing CV:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    

    
    res.status(500).json({
      success: false,
      message: 'Internal server error while analyzing CV',
      error: error.message
    });
  }
});
 // 🧠 Helper - Génère les prompts système et utilisateur
const buildJobDescriptionPrompts = (position, company, industry, skills) => {
  const system = `You are an expert HR professional specializing in creating detailed, modern job descriptions. 
Create a comprehensive job description that includes all key sections and maintains professional standards.`;

  const user = `Create a detailed job description for a ${position} position at ${company} in the ${industry} industry.
${skills.length > 0 ? `\nRequired skills include: ${skills.join(', ')}` : ''}

Include these sections:
1. Company Overview
2. Role Summary
3. Key Responsibilities
4. Required Qualifications
5. Required Skills
6. Preferred Qualifications (if applicable)
7. Benefits
8. Location & Work Environment
9. Application Process

Format each section with clear headings and use bullet points for lists.`;

  return { system, user };
};

// 🔁 Helper - Fallback GPT-4 => GPT-3.5
const generateJobDescriptionText = async (systemPrompt, userPrompt) => {
  try {
    const gpt4 = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });
    return gpt4.choices[0].message.content.trim();
  } catch (gpt4Error) {
    console.warn('GPT-4 failed, switching to GPT-3.5:', gpt4Error.message);
    try {
      const gpt3 = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 800,
        temperature: 0.7,
      });
      return gpt3.choices[0].message.content.trim();
    } catch (gpt3Error) {
      console.error('GPT-3.5 failed as well:', gpt3Error.message);
      return null;
    }
  }
};

// 🧾 Helper - Parsing du texte généré
const parseGeneratedJobDescription = (text, requiredSkills, position) => {
  const sections = text.split('\n\n');

  const extractList = (keyword) =>
    sections.find(s => s.toLowerCase().includes(keyword))?.split('\n')
      .filter(line => /^[-•]/.test(line.trim()))
      .map(line => line.replace(/^[-•]\s*/, '')) || [];

  const extractText = (keyword) =>
    sections.find(s => s.toLowerCase().includes(keyword))?.replace(/^.*?:?\s*/i, '') || '';

  return {
    title: position,
    company_overview: extractText('company overview'),
    role_summary: extractText('role summary'),
    key_responsibilities: extractList('responsibilities'),
    required_qualifications: extractList('required qualifications'),
    required_skills: requiredSkills.length > 0 ? requiredSkills : extractList('required skills'),
    benefits: extractList('benefits'),
    location_environment: extractText('location'),
    application_process: extractText('application process'),
    full_text: text,
    generation_method: 'gpt'
  };
};

// ✅ Controller: Generate Job Description
const generateJobDescription = asyncHandler(async (req, res) => {
  const {
    position,
    company_name = 'Generic Company',
    industry = 'General',
    required_skills = [],
  } = req.body;

  if (!position) {
    return res.status(400).json({
      success: false,
      message: 'Position is required',
    });
  }

  const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10;
  let generatedText = null;

  if (hasOpenAI) {
    const { system, user } = buildJobDescriptionPrompts(position, company_name, industry, required_skills);
    generatedText = await generateJobDescriptionText(system, user);
  }

  // ⛑️ Fallback manuel
  if (!generatedText) {
    generatedText = `Position: ${position}

Company Overview:
[Company overview would be generated here]

Role Summary:
We are seeking an experienced ${position} to join our team.

Key Responsibilities:
• [Key responsibilities would be listed here]
• [Additional responsibilities]

Required Qualifications:
• [Required qualifications would be listed here]
${required_skills.length > 0 ? `\nRequired Skills:\n${required_skills.map(skill => `• ${skill}`).join('\n')}` : ''}

Benefits:
• Competitive salary
• Professional development opportunities

Location & Work Environment:
[Location and work environment details would be provided here]

Application Process:
Please submit your application through our careers portal.`;
  }

  const parsed = parseGeneratedJobDescription(generatedText, required_skills, position);



  res.status(200).json({
    success: true,
    data: parsed
  });
});

// @desc    Match candidates to a specific job based on skills
// @route   GET /api/ai/match-candidates/:jobId
// @access  Private
const matchCandidatesToJob = asyncHandler(async (req, res) => {
  try {
    const { jobId } = req.params;
    const { limit = 10 } = req.query;

    // Import models
    const Job = require('../models/job');
    const Candidate = require('../models/candidate');

    // Get the job with its skill requirements
    const job = await Job.findById(jobId).populate('skills');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get all active candidates
    const candidates = await Candidate.find({ isActive: true });

    // Calculate match scores for each candidate
    const candidatesWithScores = candidates.map(candidate => {
      let matchScore = 0;
      let matchingSkills = [];

      if (job.skills && job.skills.length > 0 && candidate.skills && candidate.skills.length > 0) {
        const jobSkillNames = job.skills.map(skill => 
          skill.skill_name ? skill.skill_name.toLowerCase() : skill.skill_id.toLowerCase()
        );
        
        const candidateSkillNames = candidate.skills.map(skill => skill.toLowerCase());
        
        matchingSkills = jobSkillNames.filter(jobSkill => 
          candidateSkillNames.some(candidateSkill => 
            candidateSkill.includes(jobSkill) || jobSkill.includes(candidateSkill)
          )
        );
        
        matchScore = Math.round((matchingSkills.length / jobSkillNames.length) * 100);
      }

      return {
        ...candidate.toObject(),
        matchScore,
        matchingSkills
      };
    });

    // Sort by match score (highest first) and limit results
    const sortedCandidates = candidatesWithScores
      .filter(candidate => candidate.matchScore > 0) // Only include candidates with some match
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        job: {
          id: job._id,
          title: job.title,
          company_name: job.company_name,
          skills: job.skills
        },
        candidates: sortedCandidates,
        total: sortedCandidates.length
      }
    });

  } catch (error) {
    console.error('Error matching candidates to job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to match candidates to job',
      error: error.message
    });
  }
});


module.exports = {
  generateEmail,
  analyzeCv,
  generateJobDescription,
  matchCandidatesToJob
};
