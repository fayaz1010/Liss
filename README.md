# Social List App

A comprehensive social media application that allows users to create groups and manage hierarchical lists with advanced features.

## Features

- User Authentication
- Group Management
- Hierarchical List Management
- Task Assignment
- Progress Tracking
- File Attachments
- Group Wall
- Calendar View
- Timeline View
- Real-time Chat
- Countdown Timer
- Interactive Dashboards

## Tech Stack

- Backend: Node.js with Express
- Frontend: React
- Database: MongoDB
- Real-time Communication: Socket.io
- Authentication: JWT
- File Storage: Local/AWS S3

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── client/                 # Frontend React application
├── server/                 # Backend Node.js application
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── utils/            # Utility functions
├── uploads/               # File uploads directory
└── package.json          # Project dependencies
```
