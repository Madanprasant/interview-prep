# Interview Prep App

A comprehensive MERN stack application designed to help users prepare for technical interviews through practice questions, progress tracking, and learning resources.

## Features

- **Practice Questions**: Interactive question practice with immediate feedback
- **Progress Tracking**: Monitor your learning progress with detailed analytics
- **Dashboard**: Personalized dashboard with statistics and recent activity
- **Resources**: Curated collection of learning materials and interview tips
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Modern, mobile-friendly interface

## Tech Stack

### Frontend (Client)
- **React 18** - Modern React with hooks and functional components
- **React Router** - Client-side routing
- **CSS Modules** - Scoped styling for components
- **Axios** - HTTP client for API calls

### Backend (Server)
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security middleware
- **morgan** - HTTP request logger

## Project Structure

```
interview-prep-app/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Header.js
│   │   │   ├── Home.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Practice.js
│   │   │   └── Resources.js
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
├── server/                # Express backend
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── questions.js
│   │   ├── practice.js
│   │   └── progress.js
│   ├── server.js
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd interview-prep-app
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The server will start on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd client
   npm start
   ```
   The React app will start on `http://localhost:3000`

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Questions
- `GET /api/questions` - Get all questions (with filters)
- `GET /api/questions/:id` - Get specific question
- `GET /api/questions/random/one` - Get random question
- `GET /api/questions/categories/list` - Get all categories
- `GET /api/questions/difficulties/list` - Get all difficulties

### Practice Sessions
- `POST /api/practice/start` - Start new practice session
- `POST /api/practice/:sessionId/answer` - Submit answer
- `GET /api/practice/:sessionId` - Get session details
- `GET /api/practice/user/:userId/history` - Get user history

### Progress Tracking
- `GET /api/progress/:userId` - Get user progress
- `PUT /api/progress/:userId` - Update progress
- `GET /api/progress/:userId/achievements` - Get achievements
- `GET /api/progress/:userId/analytics` - Get analytics

## Features in Detail

### Practice Questions
- Interactive question interface with show/hide answers
- Progress tracking with visual progress bar
- Category and difficulty filtering
- Feedback system for answer accuracy

### Dashboard
- Overview of learning statistics
- Recent activity tracking
- Quick action buttons
- Upcoming tasks and goals

### Resources
- Curated collection of learning materials
- Category-based filtering
- Rating system for resources
- Interview tips and study schedules

### User Progress
- Comprehensive progress tracking
- Achievement system with badges
- Learning analytics and insights
- Goal setting and tracking

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] MongoDB integration for persistent data storage
- [ ] Real-time notifications
- [ ] Video interview practice
- [ ] Collaborative study groups
- [ ] Advanced analytics and insights
- [ ] Mobile app development
- [ ] AI-powered question recommendations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository or contact the development team. 