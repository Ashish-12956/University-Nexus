# Campus Cloud Backend - Node.js

This is the Node.js/Express.js backend for the Campus Cloud University Management System, converted from the original Java Spring Boot application.

## Features

- **Authentication**: Firebase-based authentication system
- **User Management**: Admin, Faculty, and Student user roles
- **Student Management**: Complete student profile and enrollment management
- **Faculty Management**: Faculty profile and subject assignment
- **Attendance System**: Mark and track student attendance
- **Subject Enrollment**: Manage subject enrollments and student assignments
- **Announcements**: System-wide announcement management
- **Calendar**: Academic calendar file management
- **File Uploads**: Support for profile images and document uploads

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: Firebase Admin SDK
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js 18.0.0 or higher
- MySQL 8.0 or higher
- Firebase project with service account

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   - Database connection details
   - Firebase service account credentials
   - JWT secret key
   - Other configuration options

4. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE university;
   ```

5. **Initialize Database**
   ```bash
   # Initialize database tables
   node scripts/init-db.js
   
   # Seed with sample data (optional)
   node scripts/seed-data.js
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login with Firebase token
- `GET /api/auth/verify` - Verify Firebase token
- `POST /api/auth/check-access` - Check user access permissions

### Admin Routes
- `POST /api/admin/upload-student-details` - Bulk upload students from CSV
- `POST /api/admin/upload-student` - Upload individual student
- `POST /api/admin/upload-faculty` - Upload faculty details
- `GET /api/admin/student/:rollNo` - Get student by roll number
- `PUT /api/admin/student/:rollNo` - Update student
- `DELETE /api/admin/student/:rollNo` - Delete student
- `GET /api/admin/faculty/:email` - Get faculty by email
- `PUT /api/admin/faculty/:email` - Update faculty
- `DELETE /api/admin/faculty/:email` - Delete faculty

### Student Routes
- `GET /api/student/profile/:email` - Get student profile
- `GET /api/student/subjects/:email` - Get student's subjects
- `GET /api/student/attendance-summary/:email` - Get attendance summary
- `GET /api/student/attendance/:email/:subjectId` - Get subject attendance
- `POST /api/student/upload-image` - Upload profile image
- `GET /api/student/profile-image/:email` - Get profile image

### Faculty Routes
- `GET /api/teacher/profile/:email` - Get faculty profile
- `GET /api/teacher/subjects/:email` - Get faculty's subjects
- `GET /api/teacher/students/:email` - Get faculty's students
- `GET /api/teacher/attendance/:email` - Get attendance records
- `GET /api/teacher/attendance-stats/:email` - Get attendance statistics
- `PUT /api/teacher/profile/:email` - Update faculty profile

### Attendance Routes
- `POST /api/attendance/bulk` - Mark bulk attendance
- `GET /api/attendance/subject/:subjectId/date/:date` - Get attendance by subject and date
- `GET /api/attendance/faculty/:email/subjects` - Get faculty subjects
- `GET /api/attendance/subject/:id/students` - Get subject with students
- `GET /api/attendance/stats/subject/:subjectId` - Get attendance statistics

### Announcement Routes
- `POST /api/announcements` - Create announcement (Admin)
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/paginated` - Get paginated announcements
- `GET /api/announcements/current` - Get latest announcement
- `GET /api/announcements/:id` - Get announcement by ID
- `PUT /api/announcements/:id` - Update announcement (Admin)
- `DELETE /api/announcements/:id` - Delete announcement (Admin)

### Calendar Routes
- `POST /api/calendar/upload` - Upload calendar file (Admin)
- `GET /api/calendar` - Get all calendars
- `GET /api/calendar/latest` - Get latest calendar
- `GET /api/calendar/:id` - Get calendar by ID
- `GET /api/calendar/:id/download` - Download calendar file
- `PUT /api/calendar/:id` - Update calendar (Admin)
- `DELETE /api/calendar/:id` - Delete calendar (Admin)

### Subject Enrollment Routes
- `POST /api/subject-enrollment/create-all` - Create enrollment for all students
- `POST /api/subject-enrollment/create-specific` - Create enrollment for specific students
- `GET /api/subject-enrollment` - Get all enrollments
- `GET /api/subject-enrollment/:id` - Get enrollment by ID
- `GET /api/subject-enrollment/faculty/:email` - Get enrollments by faculty
- `GET /api/subject-enrollment/student/:email` - Get enrollments by student

## Database Schema

The application uses the following main entities:

- **Users**: Firebase-authenticated users with roles
- **Students**: Student profiles and academic information
- **Faculty**: Faculty profiles and department information
- **Admin**: Administrative user profiles
- **SubjectEnrollment**: Subject information and faculty assignments
- **Attendance**: Student attendance records
- **Announcements**: System announcements
- **Calendar**: Academic calendar files

## Security Features

- Firebase token-based authentication
- Role-based access control
- Rate limiting to prevent abuse
- CORS configuration
- Helmet for security headers
- Input validation and sanitization

## File Upload

The system supports file uploads for:
- Student profile images (2MB limit)
- CSV files for bulk student upload (5MB limit)
- Calendar files (10MB limit)

Uploaded files are stored in the `uploads/` directory.

## Error Handling

The API includes comprehensive error handling with:
- HTTP status codes
- Descriptive error messages
- Logging for debugging
- Graceful error responses

## Development

### Project Structure
```
backend/
├── config/          # Database and Firebase configuration
├── models/          # Sequelize models
├── routes/          # Express routes
├── services/        # Business logic services
├── scripts/         # Database initialization and seeding
├── uploads/         # File upload directory
├── server.js        # Main application file
└── package.json     # Dependencies and scripts
```

### Adding New Features

1. Create model in `models/` directory
2. Add service logic in `services/` directory
3. Create routes in `routes/` directory
4. Update `server.js` to include new routes
5. Add database associations in `models/index.js`

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

### Environment Variables
Ensure all required environment variables are set in production:

- Database connection details
- Firebase service account credentials
- JWT secret key
- CORS configuration
- File upload limits

### Production Considerations
- Use a process manager like PM2
- Set up reverse proxy with Nginx
- Configure SSL certificates
- Set up database backups
- Monitor application logs
- Use environment-specific configurations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.
