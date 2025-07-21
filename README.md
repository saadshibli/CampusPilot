# 🎓 Campus Copilot - Your Personal College Assistant

A comprehensive full-stack application designed to help students manage their academic life efficiently. Built for the VibeCode India 2025 hackathon.

## 🚀 Features

### Core Functionality
- **📚 Class Management**: Course schedules, enrollment, and materials
- **📅 Event Management**: College events, club activities, and registrations
- **📢 Notice System**: College announcements with targeted audience
- **⏰ Deadline Tracking**: Assignment deadlines, exams, and project due dates
- **🔔 Reminder System**: Personalized reminders with email notifications
- **👤 User Profiles**: Student profiles with academic information
- **📊 Dashboard**: Overview of all activities and statistics

### Advanced Features
- **🔐 Authentication**: Secure JWT-based authentication
- **📧 Email Notifications**: Automated reminder emails
- **📱 Responsive Design**: Works on desktop, tablet, and mobile
- **🎨 Modern UI**: Beautiful interface with Tailwind CSS
- **⚡ Real-time Updates**: Live data synchronization
- **🔍 Search Functionality**: Find classes, events, and notices quickly

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **nodemailer** - Email notifications
- **node-cron** - Scheduled tasks
- **express-validator** - Input validation

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Date-fns** - Date utilities

## 📁 Project Structure

```
campusPilotApp/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── services/        # Business logic
│   ├── server.js        # Main server file
│   └── package.json     # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── stores/      # State management
│   │   ├── services/    # API services
│   │   └── App.jsx      # Main app component
│   └── package.json     # Frontend dependencies
└── README.md           # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/campus-copilot
   JWT_SECRET=your-super-secret-jwt-key
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### User Endpoints
- `GET /api/users/dashboard` - Get dashboard data
- `GET /api/users/stats` - Get user statistics
- `PUT /api/users/profile` - Update user profile

### Class Endpoints
- `GET /api/classes` - Get all classes
- `GET /api/classes/enrolled/me` - Get user's enrolled classes
- `POST /api/classes/:id/enroll` - Enroll in class
- `GET /api/classes/schedule/weekly` - Get weekly schedule

### Event Endpoints
- `GET /api/events` - Get all events
- `POST /api/events/:id/register` - Register for event
- `GET /api/events/upcoming` - Get upcoming events

### Notice Endpoints
- `GET /api/notices` - Get all notices
- `POST /api/notices/:id/read` - Mark notice as read
- `GET /api/notices/unread/count` - Get unread count

### Deadline Endpoints
- `GET /api/deadlines` - Get all deadlines
- `GET /api/deadlines/upcoming` - Get upcoming deadlines
- `POST /api/deadlines/:id/complete` - Mark deadline as completed

### Reminder Endpoints
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/:id` - Update reminder

## 🎨 UI Components

The application uses a consistent design system with:

- **Color Palette**: Primary blue, success green, warning orange, danger red
- **Typography**: Inter font family
- **Components**: Cards, buttons, forms, badges, and more
- **Responsive**: Mobile-first design approach
- **Animations**: Smooth transitions and loading states

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation with express-validator
- **CORS Configuration**: Cross-origin resource sharing
- **Rate Limiting**: Protection against abuse (can be added)

## 📧 Email Notifications

The system includes automated email notifications for:
- Reminder notifications
- Event registrations
- Important deadlines
- System announcements

## 🗄️ Database Schema

### User Model
- Basic info (name, email, student ID)
- Academic details (department, year, semester)
- Preferences (notifications, theme, timezone)
- Club memberships

### Class Model
- Course information (name, code, credits)
- Instructor details
- Schedule (days, times, rooms)
- Materials and assignments
- Student enrollment

### Event Model
- Event details (title, description, type)
- Date and location
- Organizer information
- Registration system
- Capacity and attendance

### Notice Model
- Announcement content
- Target audience (departments, years, specific users)
- Priority and type
- Read/acknowledgment tracking

### Deadline Model
- Assignment/exam details
- Due dates and submission info
- Class association
- Status tracking

### Reminder Model
- Personalized reminders
- Notification settings
- Related items (deadlines, events)
- Completion tracking

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables
2. Configure MongoDB connection
3. Set up email service credentials
4. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables for API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **VibeCode India 2025** for organizing the hackathon
- **React** and **Node.js** communities for excellent documentation
- **Tailwind CSS** for the beautiful design system
- **Lucide** for the amazing icon set

## 📞 Support

For support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for students by students** 