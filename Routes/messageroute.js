const express = require("express");
const mongoose = require("mongoose");
const Message = require("../models/messages");
const Chatbot = require("../models/chatbot");
const User = require("../models/usermodels");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const MAX_MEMORY = 50;
const MAX_CHAR_PER_MSG = 150;
const MAX_SUMMARY_LENGTH = 500;

const userMessageCounts = {};
const skipNextBotPrompt = {};

router.post("/send", async (req, res) => {
  let { user_id, chatbot_id, sender, message, timestamp, session_id } = req.body;

  if (!user_id || !chatbot_id || !message || !sender || !timestamp) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const chatbot = await Chatbot.findById(chatbot_id);
    if (!chatbot) return res.status(404).json({ success: false, message: "Chatbot not found" });

    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Validate or generate session_id
    if (!session_id || !mongoose.Types.ObjectId.isValid(session_id)) {
      session_id = new mongoose.Types.ObjectId();
    }

    // Track message counts
    if (!userMessageCounts[user_id]) {
      userMessageCounts[user_id] = 0;
      skipNextBotPrompt[user_id] = false;
    }
    userMessageCounts[user_id] += 1;

    const botPrompt = `You are "${chatbot.bot_name}", a ${chatbot.expected_age}-year-old ${chatbot.gender} from ${chatbot.nationality} working as a ${chatbot.occupation}. Your personal traits include ${chatbot.personal_traits.join(", ")} with hobbies like ${chatbot.hobbies.join(", ")}. Your passion is ${chatbot.passion}, shaped by past experiences including ${chatbot.past_story}. You communicate in a ${chatbot.preferred_communication_style} manner, staying true to your personality. Don't forget, my name is ${user.name}.`;

    const purposePrompt = `Your purpose is: "${chatbot.bot_purpose}" in the domain of "${chatbot.bot_domain}".`;

    let finalUserMessage = message;

    // ✳️ Send both prompts on first message
    if (userMessageCounts[user_id] === 1|| userMessageCounts[user_id] === 0) {
      finalUserMessage = `${botPrompt}\n\n${purposePrompt}\n\n${message}`;
    } else if (userMessageCounts[user_id] % 7 === 0) {
      finalUserMessage = `${purposePrompt}\n\n${message}`;
      if (userMessageCounts[user_id] % 10 === 0) {
        skipNextBotPrompt[user_id] = true;
      }
    } else if (userMessageCounts[user_id] % 10 === 0 || skipNextBotPrompt[user_id]) {
      finalUserMessage = `${botPrompt}\n\n${message}`;
      skipNextBotPrompt[user_id] = false;
    }

    // Save user message
    const userMessage = new Message({
      user_id,
      chatbot_id,
      sender: "user",
      message,
      timestamp,
      session_id,
    });
    await userMessage.save();

    // Fetch last N messages for memory
    const recentMessages = await Message.find({ session_id, chatbot_id })
      .sort({ timestamp: -1 })
      .limit(MAX_MEMORY)
      .lean();

    const trimmedMessages = recentMessages.map((msg) => ({
      sender: msg.sender,
      message: msg.message.length > MAX_CHAR_PER_MSG
        ? msg.message.slice(0, MAX_CHAR_PER_MSG) + "..."
        : msg.message,
    }));

    let conversationText = trimmedMessages.map(msg => `${msg.sender}: ${msg.message}`).reverse().join("\n");

    if (conversationText.length > MAX_SUMMARY_LENGTH) {
      conversationText =
        `Summary of previous conversation: ${conversationText.slice(0, MAX_SUMMARY_LENGTH)}...\n\nRecent messages:\n${conversationText.slice(-MAX_SUMMARY_LENGTH)}`;
    }
    const defaultDomainPrompt = `you are ${chatbot.bot_name} Stay within your domain of ${chatbot.bot_domain} and purpose: ${chatbot.bot_purpose} and dont forget to reply in${chatbot.preferred_communication_style} manner.`;
    const finalUserMessageWithPrompt = `${finalUserMessage}\n\n${defaultDomainPrompt}`;
    
    const prompt = `You are a helpful chatbot.\n\nHere is the conversation so far:\n${conversationText}\n\nUser: ${finalUserMessageWithPrompt}\nBot:`;
    
    const result = await model.generateContent(prompt);
    const botReply = result.response.text() || "Sorry, I couldn't understand that.";

    // Save bot reply
    const botMessage = new Message({
      user_id,
      chatbot_id,
      sender: "bot",
      message: botReply,
      timestamp: new Date(),
      session_id,
    });
    await botMessage.save();

    res.status(201).json({
      success: true,
      userMessage: userMessage.message,
      botMessage: botMessage.message,
      session_id,
    });
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
