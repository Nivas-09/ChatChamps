const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    session_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    }, // Unique session ID
    chatbot_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Chatbot", 
        required: true 
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "sign_up", 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    sender: { 
        type: String, 
        enum: ["user", "bot"], 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("Message", MessageSchema);
