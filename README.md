# Study-Stack: AI-Powered Student Productivity Tracker

Study-Stack is a comprehensive web application designed to help students manage tasks, track study progress, and get intelligent mentorship using AI.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed on your system.
- A Supabase project for database and authentication.
- An OpenAI API key for the AI Mentor.

### 2. Environment Setup

#### Backend (`/server`)
Create a `.env` file in the `server` directory:
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

#### Frontend (`/client`)
Create a `.env` file in the `client` directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Installation & Running

#### Start the Backend
```powershell
cd server
npm install
npm run dev
```

#### Start the Frontend
```powershell
cd client
npm install
npm run dev
```

## 🏗️ Project Structure
- **/client**: React + Vite frontend using Tailwind CSS and Framer Motion.
- **/server**: Node.js + Express backend for AI integration and core logic.

## 👥 User Roles
- **Student**: Access dashboard, track tasks, and chat with the AI Mentor.
- **Teacher**: Assign tasks, monitor class performance, and receive alerts for "at-risk" students.

## 🤖 AI Mentor
The AI Mentor provides personalized study advice and can be accessed via the **AI Mentor** tab in the sidebar.
