const request = require('supertest');
const app = require('./server');

describe('Campus Cloud API Tests', () => {
  
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body.status).toBe('OK');
      expect(response.body.environment).toBeDefined();
    });
  });

  describe('Authentication', () => {
    it('should require ID token for login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('ID token is required');
    });
  });

  describe('Admin Routes', () => {
    it('should require authentication for admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/students')
        .expect(401);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Authorization header with Bearer token is required');
    });
  });

  describe('Student Routes', () => {
    it('should require authentication for student routes', async () => {
      const response = await request(app)
        .get('/api/student/profile/test@example.com')
        .expect(401);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Authorization header with Bearer token is required');
    });
  });

  describe('Faculty Routes', () => {
    it('should require authentication for faculty routes', async () => {
      const response = await request(app)
        .get('/api/teacher/profile/test@example.com')
        .expect(401);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Authorization header with Bearer token is required');
    });
  });

  describe('Announcement Routes', () => {
    it('should require authentication for announcement routes', async () => {
      const response = await request(app)
        .get('/api/announcements')
        .expect(401);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Authorization header with Bearer token is required');
    });
  });

  describe('Calendar Routes', () => {
    it('should require authentication for calendar routes', async () => {
      const response = await request(app)
        .get('/api/calendar')
        .expect(401);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Authorization header with Bearer token is required');
    });
  });

  describe('Attendance Routes', () => {
    it('should require authentication for attendance routes', async () => {
      const response = await request(app)
        .get('/api/attendance/faculty/test@example.com/subjects')
        .expect(401);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Authorization header with Bearer token is required');
    });
  });

  describe('Subject Enrollment Routes', () => {
    it('should require authentication for subject enrollment routes', async () => {
      const response = await request(app)
        .get('/api/subject-enrollment')
        .expect(401);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Authorization header with Bearer token is required');
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);
      
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Route not found');
    });
  });
});

// Export for use in other test files
module.exports = app;
