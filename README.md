# Social Media App with Firebase Integration

A modern social media application built with React, Redux Toolkit, and Firebase, featuring role-based access control and real-time updates.

## Live Demo

Visit the live application at: https://liss-79329.web.app

## Features

- **Authentication**
  - Email/Password authentication
  - Protected routes
  - Password reset functionality

- **Role-Based Access Control (RBAC)**
  - Three user roles: ADMIN, MODERATOR, USER
  - Permission-based UI elements
  - Role-based route protection

- **Real-time Features**
  - Live chat and messaging
  - Real-time notifications
  - Live updates for group activities

- **Group Management**
  - Create and join groups
  - Post updates and discussions
  - Member management

- **Event Management**
  - Create and manage events
  - RSVP functionality
  - Event reminders

## Tech Stack

- **Frontend**
  - React
  - Redux Toolkit for state management
  - Material-UI for UI components
  - Socket.IO for real-time features

- **Backend**
  - Firebase Authentication
  - Cloud Firestore
  - Firebase Storage
  - Firebase Hosting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd windsurf-project
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the client directory with your Firebase configuration:
   ```
   REACT_APP_API_KEY=your_firebase_api_key
   REACT_APP_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_PROJECT_ID=your_firebase_project_id
   REACT_APP_STORAGE_BUCKET=your_firebase_storage_bucket
   REACT_APP_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   REACT_APP_APP_ID=your_firebase_app_id
   ```

4. Start the development server:
   ```bash
   npm start
   ```

### Deployment

1. Build the application:
   ```bash
   cd client
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   npx firebase-tools deploy
   ```

## Project Structure

```
windsurf-project/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/
│       ├── components/    # Reusable components
│       ├── contexts/      # React contexts
│       ├── pages/         # Page components
│       ├── services/      # API and utility services
│       └── store/         # Redux store and slices
├── firebase/              # Firebase configuration
│   ├── firestore.rules    # Firestore security rules
│   └── storage.rules      # Storage security rules
└── README.md             # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
