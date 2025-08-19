const axios = require("axios");

const GEMINI_API_URL = "https://api.gemini.com/v1/chat"; // Adjust this as needed
const API_KEY = process.env.GEMINI_API_KEY; // Make sure your .env file has GEMINI_API_KEY

async function getGeminiResponse(message) {
    try {
        const response = await axios.post(
            GEMINI_API_URL,
            { message },
            { headers: { Authorization: `Bearer ${API_KEY}` } }
        );
        return response.data;
    } catch (error) {
        console.error("Error in Gemini API:", error.message);
        return { error: "Failed to fetch response from Gemini." };
    }
}

module.exports = { getGeminiResponse };
