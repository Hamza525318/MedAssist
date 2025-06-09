// chatController.js

// UPDATED: Destructure GenerativeModel instead of GoogleGenAI for clarity
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Patient = require('../models/Patient');
const LabReport = require('../models/LabReport');
const functionSchemas = require('../utils/functionSchema');
const ChatHistory = require('../models/chatHistory');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');

// Initialize GoogleGenAI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// UPDATED: Define the model configuration once
const model = genAI.getGenerativeModel({
  model: 'models/gemini-2.0-flash-exp', // Use a stable, recent model
  // UPDATED: Function definitions are passed in the `tools` property
  tools: functionSchemas.length > 0 ? [{ functionDeclarations: functionSchemas }] : undefined,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/reports';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('report');

// Function to extract text from different file types
const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    switch (ext) {
      case '.pdf':
        const pdfData = await fs.readFile(filePath);
        const pdfResult = await pdf(pdfData);
        return pdfResult.text;
        
      case '.jpg':
      case '.jpeg':
      case '.png':
        const imageResult = await Tesseract.recognize(filePath);
        return imageResult.data.text;
        
      case '.docx':
        // Add docx parsing logic here
        throw new Error('DOCX parsing not implemented yet');
        
      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    throw new Error(`Error extracting text: ${error.message}`);
  }
};

// Function to analyze report content
const analyzeReportContent = async (content, patientContext = null, chatMessage = '') => {
  try {
    
    let prompt = `You are a medical report analysis assistant. Please analyze the following medical report and provide insights based on the user's request.

User's Request: ${chatMessage || 'Please analyze this report and provide key findings.'}

Report Content:
${content}`;

    if (patientContext) {
      prompt += `\n\nPatient Context:
- Name: ${patientContext.name}
- Age: ${patientContext.age}
- Gender: ${patientContext.gender}
- Medical History: ${patientContext.medicalHistory || 'None'}
- Recent Reports: ${patientContext.recentReports?.map(r => `${r.type} (${new Date(r.date).toLocaleDateString()})`).join(', ') || 'None'}

Please consider the patient's medical history and previous reports while analyzing this new report.`;
    }
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    throw new Error(`Error analyzing report: ${error.message}`);
  }
};

// Handle report upload and analysis
const uploadReportForAI = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    try {
      const { patientId, chatMessage, chatId } = req.body;
      let patientContext = null;
      let chatHistoryDoc;

      console.log("PATIENT ID AND CHAT MESSAGE", req.body);

      // Check if chatId exists and find the chat history
      if (chatId) {
        chatHistoryDoc = await ChatHistory.findById(chatId);
        if (!chatHistoryDoc) {
          return res.status(404).json({
            success: false,
            message: 'Chat history not found'
          });
        }
      }

      // Get patient context if patientId is provided
      if (patientId) {
        const patient = await Patient.findOne({ patientId: Number(patientId) })
          .populate('labReports')
          .lean();
        if (patient) {
          patientContext = {
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            medicalHistory: patient.medicalHistory,
            recentReports: patient.labReports?.map(r => ({
              type: r.reportType,
              date: r.uploadedAt
            }))
          };
        }
      }

      // Extract text from the uploaded file
      const reportContent = await extractTextFromFile(req.file.path);
      console.log("REPORT CONTENT", reportContent);
      
      // Analyze the report content with chat message and patient context
      const analysis = await analyzeReportContent(reportContent, patientContext, chatMessage);

      // Add the new messages to the chat history
      chatHistoryDoc.messages.push(
        {
          role: 'user',
          content: chatMessage,
        },
        {
          role: 'assistant',
          content: analysis
        }
      );

      chatHistoryDoc.lastUpdatedAt = new Date();
      await chatHistoryDoc.save();

      // Clean up the uploaded file
      await fs.unlink(req.file.path);

      res.json({
        success: true,
        data: {
          analysis,
          patientContext: patientContext ? 'Available' : 'Not provided',
          chatId: chatHistoryDoc._id
        }
      });

    } catch (error) {
      // Clean up the file if it exists
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
};

/**
 * Handles function calls from Gemini by executing the corresponding local function.
 */
const handleFunctionCall = async (functionCall) => {
  const { name, args } = functionCall;
  console.log(`Handling function call: ${name}`, args);

  try {
    switch (name) {
      case 'getPatientDetails':
        // Ensure args are passed correctly
        return await handleGetPatientDetails(args);
      case 'buildQuery':
        return await handleBuildQuery(args);
      case 'summarizeReports':
        return await handleSummarizeReports(args);
      case 'getDoctorKnowledge':
        return handleGetDoctorKnowledge(args);
      default:
        // Return an error object that can be passed back to the model
        return { error: `Unknown function: ${name}` };
    }
  } catch (error) {
    console.error(`Error in handleFunctionCall (${name}):`, error);
    // Return a structured error for the model to understand
    return { error: error.message };
  }
};


// --- Function Handlers (Mostly unchanged, but good to review) ---

const handleGetPatientDetails = async ({ patientId }) => {
  if (!patientId) throw new Error('patientId is required for getPatientDetails');
  const patient = await Patient.findOne({patientId: Number(patientId)}).populate('labReports').populate('history.addedBy', 'name email').lean();
  console.log("PATIENT INFO",patient);
  if (!patient) throw new Error('Patient not found');
  return { patient };
};

const handleBuildQuery = async ({ filters }) => {
  if (!filters) throw new Error('filters are required for buildQuery');
  const { field, value, limit = 10, sortBy, sortOrder = 'desc' } = filters;
  const query = {};
  if (field && value) {
    // Use a regex for flexible, case-insensitive searching
    query[field] = { $regex: value, $options: 'i' };
  }
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  }
  const results = await Patient.find(query).sort(sort).limit(limit).populate('labReports').populate('history.addedBy', 'name email').lean();
  return { results };
};

const handleSummarizeReports = async ({ patientId, reportType, limit = 1 }) => {
  if (!patientId || !reportType) throw new Error('patientId and reportType are required for summarizeReports');
  const reports = await LabReport.find({
    patient: patientId,
    reportType: { $regex: reportType, $options: 'i' },
  }).sort({ uploadedAt: -1 }).limit(limit).lean();
  if (reports.length === 0) throw new Error(`No recent '${reportType}' reports found for this patient.`);
  return { reports };
};

const handleGetDoctorKnowledge = ({ query }) => {
  // This function still acts as a signal. The AI will use the result to know it should answer from its general knowledge.
  return { message: `Acknowledge this and the use your general medical knowledge to provide information about: ${query}` };
};


/**
 * Main chat endpoint handler
 */
const chat = async (req, res) => {
  const { chatMessage, chatId, patientId, fileId } = req.body;
  const doctorId = req.user.id;

  console.log("CHAT REQUEST BODY", patientId);

  if (!chatMessage) {
    return res.status(400).json({ success: false, message: 'Chat message is required' });
  }
  if (!doctorId) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Doctor ID not found.' });
  }

  try {
    let chatHistoryDoc;
    let history = [];

    // --- 1. Load or Create Chat History ---
    if (chatId) {
      chatHistoryDoc = await ChatHistory.findById(chatId);
      if (!chatHistoryDoc) {
        return res.status(404).json({ success: false, message: 'Chat history not found' });
      }
    } else {
      chatHistoryDoc = new ChatHistory({
        name: chatMessage.substring(0, 20),
        doctorId: doctorId,
        patientId: patientId || null,
        messages: [],
      });
    }

    // --- 2. Map existing chat history ---
    history = chatHistoryDoc.messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .slice(-10)
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

    // --- 3. Add Patient Context (if a patient is linked) ---
    const currentPatientId = patientId || chatHistoryDoc.patientId;
    if (currentPatientId) {
      const patientData = await Patient.findById(currentPatientId).populate('labReports').lean();
      if (patientData) {
        const recentReports = patientData.labReports?.map(r => `${r.reportType} (${new Date(r.uploadedAt).toLocaleDateString()})`).join(', ') || 'None';
        const patientContext = `Patient Information:
- Name: ${patientData.name}
- Age: ${patientData.age}
- Gender: ${patientData.gender}
- Medical History: ${patientData.medicalHistory || 'None'}
- Available Reports: ${recentReports}

Please use this patient information to provide relevant medical advice and answers.`;
        
        history.unshift({ role: 'user', parts: [{ text: patientContext }] });
        console.log("PATIENT CONTEXT",patientContext);
      }
    }

    // --- 4. Start Chat and Send Message to Gemini ---
    const chatSession = model.startChat({ history });
    const result = await chatSession.sendMessage(chatMessage);
    const response = result.response;

    // Save user's message
    chatHistoryDoc.messages.push({ role: 'user', content: chatMessage });

    let finalResponseText = '';
    const firstPart = response.candidates?.[0]?.content?.parts?.[0];

    // --- 5. Handle Function Calling ---
    if (firstPart && firstPart.functionCall) {
      const functionCall = firstPart.functionCall;
      const functionResult = await handleFunctionCall(functionCall);
      console.log("FUNCTION RESULT",functionResult);
      
      // Send the result back to the model
      const secondResult = await chatSession.sendMessage([
        { functionResponse: { name: functionCall.name, response: functionResult } }
      ]);

      console.log("SECOND RESULT",secondResult);
      
      finalResponseText = secondResult.response.candidates[0].content.parts[0].text;
    } else if (firstPart && firstPart.text) {
      finalResponseText = firstPart.text;
    } else {
      finalResponseText = "I'm sorry, I couldn't process that request. Please try again.";
    }

    // --- 6. Save Final AI Response and Send to Client ---
    chatHistoryDoc.messages.push({ role: 'assistant', content: finalResponseText });
    chatHistoryDoc.lastUpdatedAt = new Date();
    await chatHistoryDoc.save();

    res.json({
      success: true,
      data: {
        role: 'assistant',
        content: finalResponseText,
        chatId: chatHistoryDoc._id,
      },
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during chat processing',
    });
  }
};

module.exports = {
  chat,
  uploadReportForAI
};