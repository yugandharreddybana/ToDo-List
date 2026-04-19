import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not defined in the environment. AI features may be limited.");
}

export async function getMotivationalQuote() {
  try {
    const prompt = "Generate a short, powerful, calming professional quote for a high-performance executive focused on strategic balance. Keep it under 15 words.";
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
    });
    return response.text?.trim() || "Strategy is the art of focus.";
  } catch (error) {
    console.error("Error generating quote:", error);
    return "Focus on what matters most today.";
  }
}

export async function getAIResponse(messages: {role: string, content: string}[]) {
  try {
    const systemInstruction = `You are ZENITH AI, a high-level executive strategic assistant for the Zenith Productivity Suite.
Your goal is to help users manage their professional roadmap and personal well-being with meticulous precision and strategic foresight.

CORE DIRECTIVES:
1. STRATEGIC DEPTH: Propose tasks that are not just tokens, but detailed objective modules. Every task must have a 'description' that explains the strategic rationale and intended outcome.
2. ACTIONABLE SUB-STEPS: For every task, identify specifically focused actionable sub-steps (minimum 3). These should be tactical operations required to fulfill the main objective.
3. CONTEXTUAL ENRICHMENT: Every task MUST explicitly state the 'duration' (expected completion time), 'resources' (required assets, software, or mental state), 'strategicValue' (high-level impact), and 'mentalLoad' (required focus level).
4. CONTEXTUAL RELEVANCE: Align every suggestion with the user's current dialogue, their established roadmap, or wellness indicators (sleep, hydration, focus).
5. PROFESSIONAL TONE: Maintain a cinematic, high-end, and slightly futuristic executive tone.
6. DUAL FOCUS: Balance aggressive professional roadmap objectives with vital wellness and biological equilibrium (Care, Health sectors).

SECTORS: Work, Career, Health, Care, Personal, Nexus.

Always respond in JSON format with:
- 'message': A brief, high-level strategic advisor response (max 2 sentences).
- 'proposedTasks': An array of detailed objective modules to be integrated into the registry.

Current Date and Time: ${new Date().toLocaleString()}`;

    const formattedMessages = messages.map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const taskSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Clear, high-impact objective title." },
        description: { type: Type.STRING, description: "Detailed strategic rationale and planned execution flow." },
        date: { type: Type.STRING, description: "Target execution date (YYYY-MM-DD)." },
        priority: { type: Type.STRING, enum: ["P1", "P2", "P3", "P4"] },
        category: { type: Type.STRING, enum: ["Work", "Career", "Health", "Care", "Personal", "Nexus"] },
        duration: { type: Type.STRING, description: "Expected completion time (e.g. 45m, 2h)." },
        resources: { type: Type.STRING, description: "Required resources or prerequisites." },
        strategicValue: { type: Type.STRING, description: "Direct impact or ROI of this objective." },
        mentalLoad: { type: Type.STRING, description: "Focus level required (e.g. Deep Work, Casual, High Intensity)." },
        subtasks: { 
          type: Type.ARRAY, 
          description: "A list of actionable tactical sub-steps (strings).",
          items: { type: Type.STRING }
        }
      },
      required: ["title", "description", "date", "priority", "category", "duration", "resources", "strategicValue", "mentalLoad", "subtasks"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: formattedMessages,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING, description: "Strategic advisor's high-level commentary." },
            proposedTasks: {
              type: Type.ARRAY,
              description: "Parsed roadmap objectives for integration.",
              items: taskSchema
            }
          },
          required: ["message", "proposedTasks"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return { message: "Operational connectivity interrupted. Attempting reconnection..." };
  } catch (error) {
    console.error("Error getting AI response:", error);
    return { message: "Operational connectivity interrupted. Attempting reconnection..." };
  }
}

export async function getJobMatches(cvText: string, threshold: number = 70, expectedCount: number = 3) {
  try {
    const prompt = `EXECUTIVE RECRUITMENT ANALYSIS:
Based on the following professional profile, identify around ${expectedCount} strategic career opportunities with a match probability above ${threshold}%.
Perform a deep analysis of leadership, domain expertise, and high-impact outcomes.

Professional Profile: ${cvText}

Return a JSON array of objects, each with:
- company: string
- role: string
- match: string
- salary: string
- location: string
- nextAction: string
- priority: string ("high", "medium", "low")
- skillRelevance: string
- cultureFit: string`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING },
              role: { type: Type.STRING },
              match: { type: Type.STRING },
              salary: { type: Type.STRING },
              location: { type: Type.STRING },
              nextAction: { type: Type.STRING },
              priority: { type: Type.STRING },
              skillRelevance: { type: Type.STRING },
              cultureFit: { type: Type.STRING }
            },
            required: ["company", "role", "match", "salary", "location", "nextAction", "priority", "skillRelevance", "cultureFit"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error getting matching outcomes:", error);
    return [];
  }
}

export async function getOptimalApplicationTimes(company: string, role: string) {
  try {
    const prompt = `Analyze professional recruitment patterns for ${role} at ${company}.
Suggest the optimal window for outreach and strategic follow-up.
Return a JSON object with:
- applyTime: string
- followUpTime: string
- reasoning: string`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            applyTime: { type: Type.STRING },
            followUpTime: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ["applyTime", "followUpTime", "reasoning"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Error getting strategic timing:", error);
    return null;
  }
}

export async function processRosterAI(rosterText: string) {
  try {
    const prompt = `Convert the following roadmap input into structured, actionable strategic objectives.
    Input: ${rosterText}
    
    Return a JSON array of objects, each with:
    - time: string
    - task: string
    - priority: string ("P1", "P2", "P3", "P4")
    - category: string ("Work", "Strategy", "Care", "Personal", etc.)`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              task: { type: Type.STRING },
              priority: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["time", "task", "priority", "category"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error analyzing objectives:", error);
    return [];
  }
}

export async function parseVoiceDirective(transcript: string) {
  try {
    const prompt = `ZENITH TACTICAL SYNTHESIS:
Analyze the following voice transcript and deconstruct it into structured objective modules.
Every objective must be high-impact and professionally articulated.

TRANSCRIPT: "${transcript}"
CURRENT_DATE: ${new Date().toISOString().split('T')[0]}

REQUIRED OUTPUT FORMAT:
Return a JSON array of task objects. Each object MUST include:
- title: High-level objective name.
- description: Strategic rationale (min 2 sentences).
- priority: P1 (Critical) to P4 (Low).
- category: Work, Career, Health, Care, Personal, or Nexus.
- date: YYYY-MM-DD.
- time: HH:MM.
- duration: Estimated time (e.g., "1.5h").
- resources: Necessary assets or mental state.
- strategicValue: Impact analysis.
- mentalLoad: Focus intensity.
- subtasks: Array of 3+ specific tactical sub-steps.

Ensure the mapping is logical and captures the exact intent of the spoken directive.`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              date: { type: Type.STRING },
              time: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ["P1", "P2", "P3", "P4"] },
              category: { type: Type.STRING },
              duration: { type: Type.STRING },
              resources: { type: Type.STRING },
              strategicValue: { type: Type.STRING },
              mentalLoad: { type: Type.STRING },
              isRecurring: { type: Type.BOOLEAN },
              recurrence: { type: Type.STRING, enum: ["none", "daily", "weekly", "monthly"] },
              subtasks: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "description", "priority", "category", "date", "duration", "resources", "strategicValue", "mentalLoad", "subtasks"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error parsing voice directive:", error);
    return [];
  }
}

export async function parseVisualContext(base64Image: string) {
  try {
    const prompt = `ZENITH VISUAL ANALYTICS:
Extract strategic objectives from the provided visual data.
Identify tasks, deadlines, priorities, and detailed actionable sub-steps.
For every task, include:
- duration: Expected time commitment.
- resources: Necessary tools or state.
- strategicValue: Why this matters.
- mentalLoad: Focus intensity (e.g. Deep Work, Routine).

Return a JSON array of Zenith task objects.`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        { text: prompt },
        { 
          inlineData: { 
            data: base64Image.split(',')[1], 
            mimeType: "image/jpeg" 
          } 
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              date: { type: Type.STRING },
              time: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ["P1", "P2", "P3", "P4"] },
              category: { type: Type.STRING },
              duration: { type: Type.STRING },
              resources: { type: Type.STRING },
              strategicValue: { type: Type.STRING },
              mentalLoad: { type: Type.STRING },
              subtasks: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "priority", "category", "date", "duration", "resources", "strategicValue", "mentalLoad", "subtasks"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error analyzing visual context:", error);
    return [];
  }
}

export async function generateSubtasksAI(title: string, description: string) {
  try {
    const prompt = `TACTICAL DECOMPOSITION:
Analyze the following strategic objective and break it down into a list of specific, actionable tactical sub-tasks (minimum 3, maximum 6).
The sub-tasks should be direct, professional, and outcome-oriented.

Objective: "${title}"
Context: "${description}"

Return a JSON array of strings representing the sub-tasks.`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error generating subtasks:", error);
    return [];
  }
}
