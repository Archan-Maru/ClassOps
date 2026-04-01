import axios from "axios";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Send a chat message to Groq AI and get a response
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous conversation messages
 * @returns {Promise<string>} - The AI's response
 */
export async function chatWithAI(userMessage, conversationHistory = []) {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  // Build messages array with conversation history
  const messages = [
    {
      role: "system",
      content: `You are ClassOps - an advanced AI educational tutor designed to help students learn effectively. You have expertise in:

📚 **Core Capabilities:**
1. Document Analysis & Summarization: Extract key concepts from PDFs, textbooks, and lecture notes
2. Topic Explanation: Break down complex subjects into easy-to-understand explanations with examples
3. Quiz Generation: Create engaging multiple-choice, short-answer, and essay questions
4. Study Guide Creation: Help organize notes and create comprehensive study guides
5. Problem Solving: Walk through solutions step-by-step with clear reasoning

🎯 **Your Teaching Style:**
- Use clear, academic language appropriate for students
- Provide real-world examples and analogies to explain concepts
- Break complex ideas into manageable chunks
- Encourage critical thinking and deep understanding
- Use formatting (bullet points, numbering) for clarity
- Include relevant diagrams/ASCII art when helpful

📋 **When Summarizing:**
- Extract main ideas and key concepts only
- Provide 3-5 key takeaways
- Include important dates, numbers, or formulas
- Note any important connections between concepts

❓ **When Creating Quizzes:**
- Ask 3-5 questions (unless specified otherwise)
- Mix difficulty levels (easy, medium, hard)
- Provide clear answer key with explanations
- Include at least one question per main concept

💡 **General Rules:**
- Be encouraging and supportive
- Adapt explanations based on student level
- Ask clarifying questions if needed
- Never dismiss any question as "too easy"
- Keep responses focused and concise
- Format your response for readability

Always respond in a friendly, professional manner. You're here to help students succeed!`,
    },
    ...conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    {
      role: "user",
      content: userMessage,
    },
  ];

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-versatile", // Fast and powerful Groq model (currently active)
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiReply = response.data.choices[0]?.message?.content;
    if (!aiReply) {
      throw new Error("No response from AI");
    }

    return aiReply;
  } catch (error) {
    console.error("Groq API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message || "Failed to get AI response"
    );
  }
}

/**
 * Generate quiz questions from a topic
 * @param {string} topic - The topic to generate quiz for
 * @param {number} questionCount - Number of questions to generate
 * @returns {Promise<string>} - Generated quiz
 */
export async function generateQuiz(topic, questionCount = 5) {
  const prompt = `Generate ${questionCount} multiple-choice quiz questions about "${topic}". 
For each question, provide:
1. The question
2. Four options (A, B, C, D)
3. The correct answer

Format it clearly and make the questions progressively harder.`;

  return chatWithAI(prompt);
}

/**
 * Summarize a document
 * @param {string} documentContent - The document content to summarize
 * @param {number} maxLength - Maximum length of summary (words)
 * @returns {Promise<string>} - Summary of the document
 */
export async function summarizeDocument(documentContent, maxLength = 200) {
  const prompt = `Please summarize the following document in approximately ${maxLength} words. Focus on key points and main ideas:

${documentContent}`;

  return chatWithAI(prompt);
}

/**
 * Explain a topic
 * @param {string} topic - The topic to explain
 * @param {string} level - The explanation level (beginner, intermediate, advanced)
 * @returns {Promise<string>} - Explanation of the topic
 */
export async function explainTopic(topic, level = "intermediate") {
  const prompt = `Explain the concept of "${topic}" at a ${level} level. Use examples if helpful. Keep it clear and concise.`;

  return chatWithAI(prompt);
}
