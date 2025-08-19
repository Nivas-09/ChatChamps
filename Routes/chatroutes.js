const express = require("express");
const router = express.Router();
const Chatbot = require("../models/chatbot");
const authMiddleware = require("../Middleware/authmiddleware");


router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { 
      user_id, bot_name, expected_age, gender, nationality, hobbies, occupation, 
      personal_traits, goals, preferred_communication_style, interests, passion, 
      past_story, childhood_favorites, all_favorites, strengths, weaknesses, 
      stress_factors, traumas, motivation, inspiration, bot_password, 
      bot_purpose, bot_domain 
    } = req.body;

    // Validate required fields
    if (!user_id || !bot_name || !expected_age || !gender || !nationality || 
        !occupation || !preferred_communication_style || !passion || !past_story || 
        !motivation || !inspiration || !bot_password || !bot_purpose || !bot_domain) {
      return res.status(400).json({ success: false, error: "All required fields must be filled." });
    }

    // Ensure only one bot purpose and one bot domain are selected
    if (Array.isArray(bot_purpose) && bot_purpose.length !== 1) {
      return res.status(400).json({ success: false, error: "Only one bot purpose must be selected." });
    }

    if (Array.isArray(bot_domain) && bot_domain.length !== 1) {
      return res.status(400).json({ success: false, error: "Only one bot domain must be selected." });
    }

    // Create chatbot
    const chatbot = new Chatbot({
      user_id, bot_name, expected_age, gender, nationality, hobbies, occupation, 
      personal_traits, goals, preferred_communication_style, interests, passion, 
      past_story, childhood_favorites, all_favorites, strengths, weaknesses, 
      stress_factors, traumas, motivation, inspiration, bot_password, 
      bot_purpose,bot_domain
    });

    await chatbot.save();
    res.status(201).json({ success: true, message: "Chatbot created successfully!", chatbot });
  } catch (error) {
    console.error("❌ Chatbot creation error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// 🔵 Get All Chatbots for a User
router.get("/user/:user_id", authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.params;
    const chatbots = await Chatbot.find({ user_id });

    if (chatbots.length === 0) {
      return res.status(404).json({ success: false, error: "No chatbots found for this user." });
    }

    res.json({ success: true, chatbots });
  } catch (error) {
    console.error("❌ Fetch error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// 🟠 Update a Chatbot
router.put("/update/:chatbot_id", authMiddleware, async (req, res) => {
  try {
    const { chatbot_id } = req.params;
    const updatedData = req.body;

    // Ensure updated bot_purpose and bot_domain are still a single value
    if (updatedData.bot_purpose && Array.isArray(updatedData.bot_purpose) && updatedData.bot_purpose.length !== 1) {
      return res.status(400).json({ success: false, error: "Only one bot purpose must be selected." });
    }

    if (updatedData.bot_domain && Array.isArray(updatedData.bot_domain) && updatedData.bot_domain.length !== 1) {
      return res.status(400).json({ success: false, error: "Only one bot domain must be selected." });
    }

    if (updatedData.bot_purpose) updatedData.bot_purpose = updatedData.bot_purpose; // Convert array to string
    if (updatedData.bot_domain) updatedData.bot_domain = updatedData.bot_domain; // Convert array to string

    const chatbot = await Chatbot.findByIdAndUpdate(chatbot_id, updatedData, { new: true });

    if (!chatbot) {
      return res.status(404).json({ success: false, error: "Chatbot not found." });
    }

    res.json({ success: true, message: "Chatbot updated successfully!", chatbot });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});


router.delete("/delete/:chatbot_id", authMiddleware, async (req, res) => {
  try {
    const { chatbot_id } = req.params;
    const chatbot = await Chatbot.findByIdAndDelete(chatbot_id);

    if (!chatbot) {
      return res.status(404).json({ success: false, error: "Chatbot not found." });
    }

    res.json({ success: true, message: "Chatbot deleted successfully!" });
  } catch (error) {
    console.error("❌ Deletion error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;