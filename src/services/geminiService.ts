import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getMotivationalQuote() {
  try {
    const prompt = "Generate a short, powerful, futuristic motivational quote for someone using their 'Personal OS'. Keep it under 15 words.";
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "The future belongs to those who build it.";
  } catch (error) {
    console.error("Error generating quote:", error);
    return "The future belongs to those who build it.";
  }
}

export async function getAIResponse(messages: {role: string, content: string}[]) {
  try {
    const systemInstruction = `You are NEXUS AI, a productivity assistant.
The user wants to create tasks or projects.
If the user's request is vague, ask clarifying questions before creating tasks.
CRITICAL INSTRUCTION: If the user requests a large or complex task (e.g., "build a portfolio website", "plan a trip", "write a research paper"), you MUST automatically break it down into smaller, actionable steps. You can do this by generating a single task with multiple 'subtasks', or by proposing multiple distinct tasks if they span different categories or dates.
REFINEMENT: The user may ask to refine, break down, or modify previously proposed tasks (which will be provided in the conversation history as [CONTEXT: ...]). If they do, respond with the updated list of tasks in the 'proposedTasks' field.
Once you have enough information, propose a list of tasks (and subtasks) to achieve their goal.
Always respond in JSON format with a 'message' field (your response to the user) and an optional 'proposedTasks' array if you are proposing tasks to be created.
Current Date and Time: ${new Date().toLocaleString()}`;

    const formattedMessages = messages.map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedMessages,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING, description: "Your conversational response to the user." },
            proposedTasks: {
              type: Type.ARRAY,
              description: "Array of tasks to propose to the user. Only include this if you have enough info to create the tasks.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  date: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  category: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  subtasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "date", "priority", "category"]
              }
            }
          },
          required: ["message"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return { message: "I'm having trouble connecting to my core systems. Please try again later." };
  } catch (error) {
    console.error("Error getting AI response:", error);
    return { message: "I'm having trouble connecting to my core systems. Please try again later." };
  }
}

export async function getJobMatches(cvText: string) {
  try {
    const prompt = `Based on the following CV/Skills, suggest 3-5 realistic job openings in Ireland that are the best match.
CV/Skills: ${cvText}

Return a JSON array of objects, each with:
- company: string
- role: string
- match: string (e.g., "95%")
- salary: string (e.g., "€70k - €90k")
- location: string (e.g., "Dublin, Ireland" or "Remote, Ireland")
- nextAction: string (e.g., "Apply on LinkedIn")
- priority: string ("high", "medium", "low")`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
              priority: { type: Type.STRING }
            },
            required: ["company", "role", "match", "salary", "location", "nextAction", "priority"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error getting job matches:", error);
    return [];
  }
}

export async function getOptimalApplicationTimes(company: string, role: string) {
  try {
    const prompt = `Based on historical data and market trends for the tech industry, suggest the optimal time to apply and follow up for a ${role} position at ${company}.
Return a JSON object with:
- applyTime: string (e.g., "Tuesday, 10:00 AM")
- followUpTime: string (e.g., "Next Thursday, 2:00 PM")
- reasoning: string (brief explanation)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
    console.error("Error getting optimal times:", error);
    return null;
  }
}
