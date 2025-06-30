// controllers/aiController.js
const asyncHandler = require('express-async-handler');
const OpenAI = require('openai');

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
          const candidateName = data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : 'Candidate';
          const candidatePosition = data.experience || data.position || 'the position';
          const candidateSkills = data.skills ? data.skills.join(', ') : 'various technical skills';
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
          const companyName = data.name || 'the company';
          const contactPerson = data.contactPerson || data.contact_person || 'the team';
          
          systemPrompt = `You are a professional business development representative writing business emails. Create natural, engaging emails that build relationships and drive business objectives.`;
          
          userPrompt = `Write a professional business email to ${contactPerson} at ${companyName} addressing this request: "${cleanInstruction}"

Context:
- Company: ${companyName}
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
        const candidateName = data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : 'the recipient';
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

// @desc    Analyze CV using AI
// @route   POST /api/ai/analyze-cv
// @access  Private
const analyzeCv = asyncHandler(async (req, res) => {
  try {
    const { cvText } = req.body;

    if (!cvText) {
      return res.status(400).json({
        success: false,
        message: 'CV text is required'
      });
    }

    console.log('Analyzing CV with fallback logic (OpenAI disabled due to invalid key)');

    // Fallback CV analysis
    const analysisData = {
      summary: 'CV analysis completed using fallback logic. For detailed AI-powered analysis, please configure a valid OpenAI API key.',
      totalExperienceYears: 0,
      skills: ['Skills extracted from CV text would appear here'],
      education: ['Education details would be parsed here'],
      experience: ['Work experience would be analyzed here'],
      source: 'fallback'
    };

    res.status(200).json({
      success: true,
      data: analysisData
    });

  } catch (error) {
    console.error('Error analyzing CV:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while analyzing CV',
      error: error.message
    });
  }
});
const generateJobDescription = asyncHandler(async (req, res) => {
  try {
    const { position, company_name = 'Generic Company', industry = 'General', required_skills = [] } = req.body;

    if (!position) {
      return res.status(400).json({
        success: false,
        message: 'Position is required'
      });
    }

    // Check if OpenAI is available
    const hasValidOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10;

    let jobDescription;
    
    if (hasValidOpenAIKey) {
      try {
        const systemPrompt = `You are an expert HR professional specializing in creating detailed, modern job descriptions. 
Create a comprehensive job description that includes all key sections and maintains professional standards.`;

        const userPrompt = `Create a detailed job description for a ${position} position${company_name ? ` at ${company_name}` : ''}${industry ? ` in the ${industry} industry` : ''}.
${required_skills.length > 0 ? `\nRequired skills include: ${required_skills.join(', ')}` : ''}

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

        // Try GPT-4 first
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 1000,
          temperature: 0.7
        });

        jobDescription = completion.choices[0].message.content.trim();
        
      } catch (openaiError) {
        // Fallback to GPT-3.5-turbo
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            max_tokens: 800,
            temperature: 0.7
          });

          jobDescription = completion.choices[0].message.content.trim();
          
        } catch (fallbackError) {
          console.error('OpenAI fallback failed:', fallbackError);
          jobDescription = null;
        }
      }
    }

    // Minimal fallback for when AI generation fails
    if (!jobDescription) {
      jobDescription = `Position: ${position}

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
• [Additional benefits would be listed here]

Location & Work Environment:
[Location and work environment details would be provided here]

How to Apply:
Please submit your application through our careers portal.`;
    }

    // Parse the generated content into structured sections
    const sections = jobDescription.split('\n\n');
    const structuredResponse = {
      title: position,
      company_overview: sections.find(s => s.toLowerCase().includes('company overview'))?.replace(/^.*?overview:?\s*/i, '') || '',
      role_summary: sections.find(s => s.toLowerCase().includes('role summary'))?.replace(/^.*?summary:?\s*/i, '') || '',
      key_responsibilities: sections.find(s => s.toLowerCase().includes('responsibilities'))
        ?.split('\n')
        .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
        .map(line => line.replace(/^[•-]\s*/, '')) || [],
      required_qualifications: sections.find(s => s.toLowerCase().includes('qualifications'))
        ?.split('\n')
        .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
        .map(line => line.replace(/^[•-]\s*/, '')) || [],
      required_skills: required_skills.length > 0 ? required_skills :
        sections.find(s => s.toLowerCase().includes('skills'))
          ?.split('\n')
          .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
          .map(line => line.replace(/^[•-]\s*/, '')) || [],
      benefits: sections.find(s => s.toLowerCase().includes('benefits'))
        ?.split('\n')
        .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
        .map(line => line.replace(/^[•-]\s*/, '')) || [],
      location_environment: sections.find(s => s.toLowerCase().includes('location'))?.replace(/^.*?environment:?\s*/i, '') || '',
      application_process: sections.find(s => s.toLowerCase().includes('apply'))?.replace(/^.*?apply:?\s*/i, '') || '',
      full_text: jobDescription,
      generation_method: hasValidOpenAIKey ? 'gpt' : 'fallback'
    };

    res.status(200).json({
      success: true,
      data: structuredResponse
    });

  } catch (error) {
    console.error('Error generating job description:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while generating job description',
      error: error.message
    });
  }
});

module.exports = {
  generateEmail,
  analyzeCv,
  generateJobDescription
};
