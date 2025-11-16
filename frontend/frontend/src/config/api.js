// API Configuration
// This file centralizes all API endpoint URLs
// Update this file to change the API base URL for all components

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export default API_BASE_URL;

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify',
    CHECK_ACCESS: '/auth/check-access'
  },
  ADMIN: {
    UPLOAD_STUDENT: '/admin/upload-student',
    UPLOAD_STUDENT_DETAILS: '/admin/upload-student-details',
    UPLOAD_FACULTY: '/admin/upload-faculty',
    GET_STUDENT: (rollNo) => `/admin/student/${rollNo}`,
    GET_FACULTY: (email) => `/admin/faculty/${email}`,
    GET_ALL_STUDENTS: '/admin/students',
    GET_ALL_FACULTY: '/admin/faculty'
  },
  STUDENT: {
    PROFILE: (email) => `/student/profile/${email}`,
    SUBJECTS: (email) => `/student/subjects/${email}`,
    ATTENDANCE_SUMMARY: (email) => `/student/attendance-summary/${email}`,
    ATTENDANCE: (email, subjectId) => `/student/attendance/${email}/${subjectId}`
  },
  TEACHER: {
    PROFILE: (email) => `/teacher/profile/${email}`,
    SUBJECTS: (email) => `/teacher/subjects/${email}`,
    STUDENTS: (email) => `/teacher/students/${email}`
  },
  ATTENDANCE: {
    BULK: '/attendance/bulk',
    BY_SUBJECT_DATE: (subjectId, date) => `/attendance/subject/${subjectId}/date/${date}`,
    FACULTY_SUBJECTS: (email) => `/attendance/faculty/${email}/subjects`
  },
  ANNOUNCEMENTS: {
    CREATE: '/announcements',
    GET_ALL: '/announcements',
    GET_PAGINATED: '/announcements/paginated',
    GET_CURRENT: '/announcements/current',
    GET_BY_ID: (id) => `/announcements/${id}`,
    UPDATE: (id) => `/announcements/${id}`,
    DELETE: (id) => `/announcements/${id}`
  },
  CALENDAR: {
    UPLOAD: '/calendar/upload',
    GET_ALL: '/calendar',
    GET_LATEST: '/calendar/latest',
    GET_BY_ID: (id) => `/calendar/${id}`,
    DOWNLOAD: (id) => `/calendar/${id}/download`
  },
  SUBJECT_ENROLLMENT: {
    CREATE_ALL: '/subject-enrollment/create-all',
    CREATE_SPECIFIC: '/subject-enrollment/create-specific',
    GET_ALL: '/subject-enrollment',
    GET_BY_ID: (id) => `/subject-enrollment/${id}`
  }
};

