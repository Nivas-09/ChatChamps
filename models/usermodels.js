const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[cC][oO][mM]$/ // Must end with .com
    },
    password: { 
      type: String, 
      required: true, 
      minlength: 8 // At least 8 characters
    },
    created_at: { type: Date, default: Date.now }
  },
  { collection: "Sign_up" } // 👈 Placed correctly outside the field definitions
);

module.exports = mongoose.model("User", userSchema);
