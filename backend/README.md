# Campus Copilot Backend API

A comprehensive REST API for the Campus Copilot application - Your Personal College Assistant.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access
- **Class Management**: Course schedules, enrollment, and materials
- **Event Management**: College events, club activities, and registrations
- **Notice System**: College announcements with targeted audience
- **Deadline Tracking**: Assignment deadlines, exams, and project due dates
- **Reminder System**: Personalized reminders with email notifications
- **Real-time Notifications**: Scheduled reminders and urgent notifications

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **nodemailer** - Email notifications
- **node-cron** - Scheduled tasks
- **express-validator** - Input validation

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/change-password` - Change password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dashboard` - Get dashboard data
- `GET /api/users/stats` - Get user statistics

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `GET /api/classes/enrolled/me` - Get user's enrolled classes
- `GET /api/classes/schedule/:day` - Get schedule for specific day
- `GET /api/classes/schedule/weekly` - Get weekly schedule
- `POST /api/classes/:id/enroll` - Enroll in class
- `DELETE /api/classes/:id/enroll` - Unenroll from class
- `GET /api/classes/:id/materials` - Get class materials

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events/:id/register` - Register for event
- `DELETE /api/events/:id/register` - Unregister from event
- `GET /api/events/registered/me` - Get user's registered events
- `GET /api/events/upcoming` - Get upcoming events

### Notices
- `GET /api/notices` - Get all notices
- `GET /api/notices/:id` - Get notice by ID
- `POST /api/notices/:id/read` - Mark notice as read
- `POST /api/notices/:id/acknowledge` - Acknowledge notice
- `GET /api/notices/unread/count` - Get unread count
- `GET /api/notices/pinned` - Get pinned notices
- `GET /api/notices/urgent` - Get urgent notices

### Deadlines
- `GET /api/deadlines` - Get all deadlines
- `GET /api/deadlines/:id` - Get deadline by ID
- `GET /api/deadlines/upcoming` - Get upcoming deadlines
- `GET /api/deadlines/overdue` - Get overdue deadlines
- `GET /api/deadlines/today` - Get today's deadlines
- `GET /api/deadlines/urgent` - Get urgent deadlines
- `POST /api/deadlines/:id/complete` - Mark deadline as completed
- `GET /api/deadlines/stats` - Get deadline statistics

### Reminders
- `GET /api/reminders` - Get all reminders
- `GET /api/reminders/:id` - Get reminder by ID
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/:id` - Update reminder
- `POST /api/reminders/:id/complete` - Mark reminder as completed
- `DELETE /api/reminders/:id` - Delete reminder
- `GET /api/reminders/upcoming` - Get upcoming reminders
- `GET /api/reminders/overdue` - Get overdue reminders
- `GET /api/reminders/stats` - Get reminder statistics

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campusPilotApp/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in your `.env` file

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/campus-copilot

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Database Schema

### User
- Basic info (name, email, student ID)
- Academic details (department, year, semester)
- Preferences (notifications, theme, timezone)
- Club memberships

### Class
- Course information (name, code, credits)
- Instructor details
- Schedule (days, times, rooms)
- Materials and assignments
- Student enrollment

### Event
- Event details (title, description, type)
- Date and location
- Organizer information
- Registration system
- Capacity and attendance

### Notice
- Announcement content
- Target audience (departments, years, specific users)
- Priority and type
- Read/acknowledgment tracking

### Deadline
- Assignment/exam details
- Due dates and submission info
- Class association
- Status tracking

### Reminder
- Personalized reminders
- Notification settings
- Related items (deadlines, events)
- Completion tracking

## Scheduled Tasks

The API includes scheduled tasks for:
- **Reminder Processing**: Hourly check for due reminders
- **Email Notifications**: Automated email sending
- **Status Updates**: Automatic deadline status updates

## Error Handling

The API includes comprehensive error handling:
- Input validation using express-validator
- JWT token validation
- Database error handling
- Custom error messages

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Rate limiting (can be added)

## API Documentation

The API follows RESTful conventions and returns JSON responses. All endpoints require authentication except for:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/health`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 