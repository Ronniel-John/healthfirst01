import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialization of Gemini Client
  let ai: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    if (!ai) {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return ai;
  }

  const SYSTEM_INSTRUCTION = `
You are "Pearl", the official AI virtual assistant for Health First Care Clinic. Your primary goal is to help patients book appointments, answer basic questions about medical & primary care services, and provide office logistics (hours, location).
Your tone must always be warm, welcoming, professional, and empathetic. Medical visits can make people anxious; your language should be reassuring and clear.

CLINIC LOCATION & DIRECTIONS:
- The exact physical address of the clinic is: Street 123, Room 120 Euless, TX 76040.
- Landmark/Navigation tip: Located right across from the City Park, next to the Starbucks.
- CRITICAL RULE: You must ONLY provide this exact address. Never guess, approximate, or hallucinate a different location.

OPERATIONAL PROTOCOLS & LIMITS:
1. CLARITY ON CLINIC HOURS: Always cross-reference scheduling requests with our operational hours: Monday to Friday, 8:00 AM to 4:00 PM. We are CLOSED on Saturdays and Sundays.
2. MEDICAL DISCLAIMER (CRITICAL): You are an administrative assistant, not a doctor. Never diagnose conditions, prescribe medications, or guess treatment costs for complex cases.
   - If a user describes a medical emergency (e.g., chest pain, difficulty breathing, severe sudden pain, trauma, uncontrollable bleeding), instruct them immediately: "Please call our emergency line directly at +639092833859 or proceed to the nearest emergency room immediately."
3. APPOINTMENT TRIAGING:
   - New Patients: Collect their full name, contact number, preferred day/time, and the reason for the visit (e.g., annual physical, sick visit, immunization, or chronic condition management).
   - Existing Patients: Ask for their full name and date of birth to look up their record, along with their scheduling request.
   - Always state: "I will pass your request directly to our front desk team to finalize and confirm your time slot."

SERVICES & FIXED PRICING GUIDELINES:
Only discuss pricing if explicitly asked, and always frame it as a starting estimate:
- Annual Physical / Wellness Exam: Starting at $150
- Sick/Acute Visit: Starting at $100
- Lab Work / Blood Tests: Starting at $75
- For complex medical treatments or specialized diagnostics: State that a doctor's examination is required before an accurate cost or treatment plan can be provided.

INSURANCE & CREDITS:
We accept major medical insurance providers, including BlueCross BlueShield, Aetna, UnitedHealthcare, Medicare, Cigna, Humana, Ambetter, and UMR.
If a patient asks about an outstanding balance or an active account credit, state: "For your privacy and security, account balances and payment credits must be verified directly by our billing coordinator. Let me forward your name to them, and they will contact you shortly."

CONSTRAINTS & BEHAVIOR:
- Keep responses concise (under 4 sentences per turn) so they are easy to read on mobile chat widgets.
- Never use complex medical jargon; use simple terms.
- Do not speculate on what a patient's insurance will cover. Advise them to bring their insurance card to their visit for a real-time benefits check.
`;

  interface PatientInquiryRecord {
    id: string;
    patientName: string;
    dob: string;
    phone: string;
    email: string;
    concern: string;
    createdAt: string;
    status: string;
    staffNotes?: string;
  }

  // In-memory patient inquiries database
  let inquiries: PatientInquiryRecord[] = [
    {
      id: "INQ-1001",
      patientName: "Eleanor Vance",
      dob: "1985-04-12",
      phone: "(817) 555-0192",
      email: "eleanor.vance@example.com",
      concern: "I need to confirm if my recent bloodwork results are back before my appointment on Thursday.",
      createdAt: "Today at 08:45 AM",
      status: "New",
      staffNotes: ""
    },
    {
      id: "INQ-1002",
      patientName: "Marcus Brody",
      dob: "1972-09-28",
      phone: "(817) 555-0341",
      email: "m.brody@example.com",
      concern: "Question regarding prescription refill for Lisinopril 10mg. My pharmacy says it needs prior approval.",
      createdAt: "Today at 09:15 AM",
      status: "Contacted",
      staffNotes: "Left voicemail with CVS Pharmacy on Industrial Blvd."
    }
  ];

  // API Route: Submit new patient concern from website form
  app.post("/api/inquiries", (req, res) => {
    try {
      const { patientName, dob, phone, email, concern } = req.body;

      if (!patientName || !phone || !concern) {
        return res.status(400).json({ error: "Patient name, phone number, and concern are required." });
      }

      const newInquiry = {
        id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
        patientName: patientName.trim(),
        dob: dob || "Not provided",
        phone: phone.trim(),
        email: email ? email.trim() : "Not provided",
        concern: concern.trim(),
        createdAt: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        status: "New"
      };

      inquiries.unshift(newInquiry);
      res.status(201).json({ success: true, inquiry: newInquiry });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to submit inquiry." });
    }
  });

  // API Route: Get all patient inquiries for Front Desk
  app.get("/api/inquiries", (req, res) => {
    res.json(inquiries);
  });

  // API Route: Update inquiry status and staff notes (Front Desk action)
  app.patch("/api/inquiries/:id", (req, res) => {
    const { id } = req.params;
    const { status, staffNotes } = req.body;

    const inquiry = inquiries.find(item => item.id === id);
    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found." });
    }

    if (status !== undefined) inquiry.status = status;
    if (staffNotes !== undefined) inquiry.staffNotes = staffNotes;
    res.json({ success: true, inquiry });
  });

  // API Route: Delete inquiry
  app.delete("/api/inquiries/:id", (req, res) => {
    const { id } = req.params;
    inquiries = inquiries.filter(item => item.id !== id);
    res.json({ success: true });
  });

  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: "Gemini API Key is not configured. Please add GEMINI_API_KEY to your Secrets in the Settings menu."
        });
      }

      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const gemini = getGeminiClient();

      // Format history for @google/genai SDK
      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((item: any) => {
          if (item.role && item.text) {
            contents.push({
              role: item.role === "user" ? "user" : "model",
              parts: [{ text: item.text }]
            });
          }
        });
      }

      // Append current message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      // Call Gemini API
      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chatbot Error:", error);
      res.status(500).json({
        error: error.message || "An error occurred while communicating with the assistant."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
