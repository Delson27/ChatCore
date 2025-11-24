# ChatCore - Your Personal AI Assistant

ChatCore is a smart chatbot application that lets you have conversations with AI, just like ChatGPT. Save your chat history, create multiple conversations, and access them anytime!

## What Can You Do?

- **Chat with AI** - Ask questions and get intelligent responses
- **Save Conversations** - All your chats are automatically saved
- **Multiple Chats** - Create different conversations for different topics
- **Browse History** - View your previous conversations anytime
- **Delete Chats** - Remove conversations you don't need anymore
- **Works Everywhere** - Use on your computer, tablet, or phone
- **Secure & Private** - Your account is protected with a password

## Quick Start Guide

**You'll need:**

- Node.js installed on your computer
- A Google Gemini API key (free from Google AI Studio)
- A MongoDB account (free at MongoDB Atlas)

**Steps:**

1. **Download the project**

   ```bash
   git clone <repository-url>
   cd ai_chatbot
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd backend
   npm install
   cd ..
   ```

3. **Setup environment**

   - Copy `backend/.env.example` to `backend/.env`
   - Fill in your API keys and database connection

4. **Start the app**

   Open two terminal windows:

   **Terminal 1:**

   ```bash
   cd backend
   node server.js
   ```

   **Terminal 2:**

   ```bash
   npm start
   ```

5. **Open your browser**
   - Go to `http://localhost:3001`
   - Create an account and start chatting!

## 📖 How to Use

1. **Sign Up**

   - Click "Sign Up" button
   - Enter your email, username, and a strong password
   - Click "Create Account"

2. **Login**

   - Enter your email and password
   - Click "Login"

3. **Start Chatting**

   - Type your question or message in the text box at the bottom
   - Press Enter or click the Send button
   - Wait for the AI to respond (you'll see a typing animation)

4. **View Previous Chats**

   - Look at the sidebar on the left (desktop) or click the menu icon (mobile)
   - Click on any previous conversation to open it
   - Your chats are automatically saved!

5. **Start a New Conversation**

   - Click the "+ New Chat" button in the sidebar
   - Start fresh with a new topic

6. **Delete a Chat**
   - Hover over a chat in the sidebar
   - Click the trash icon 🗑️
   - Confirm deletion

## Tech-Stack

- React - For the user interface
- Node.js & Express - For the server
- MongoDB - For storing your data
- Google Gemini AI - For intelligent responses
