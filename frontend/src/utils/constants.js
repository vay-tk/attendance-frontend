export const USER_ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  ADMIN: 'admin'
};

export const SESSION_STATUS = {
  SCHEDULED: 'SCHEDULED',
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  LATE: 'LATE',
  ABSENT: 'ABSENT',
  EXCUSED: 'EXCUSED'
};

export const ATTENDANCE_METHOD = {
  QR: 'QR',
  FACE: 'FACE',
  MANUAL: 'MANUAL',
  UPLOAD: 'UPLOAD'
};

export const SESSION_MODE = {
  QR: 'QR',
  FACE: 'FACE',
  HYBRID: 'HYBRID',
  MANUAL: 'MANUAL'
};

export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics and Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Chemistry'
];

export const ACADEMIC_YEARS = [
  '2024-2025',
  '2025-2026',
  '2026-2027',
  '2027-2028'
];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday', 
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 20 * 1024 * 1024, // 20MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png']
};

export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  COURSES: '/courses',
  SESSIONS: '/sessions',
  ATTENDANCE: '/attendance',
  ADMIN: '/admin'
};

export const SOCKET_EVENTS = {
  SESSION_STARTED: 'sessionStarted',
  SESSION_CLOSED: 'sessionClosed',
  ATTENDANCE_MARKED: 'attendanceMarked',
  QR_TOKEN_REFRESHED: 'qrTokenRefreshed',
  COURSE_ENROLLED: 'courseEnrolled',
  COURSE_UNENROLLED: 'courseUnenrolled',
  SESSION_CREATED: 'sessionCreated',
  SESSION_CANCELLED: 'sessionCancelled'
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_FILE: 'Invalid file format. Please upload a JPEG or PNG image.',
  FILE_TOO_LARGE: 'File size too large. Maximum size is 20MB.',
  CAMERA_ERROR: 'Unable to access camera. Please check permissions.',
  FACE_NOT_DETECTED: 'No face detected in the image. Please try again.',
  MULTIPLE_FACES: 'Multiple faces detected. Please ensure only one face is visible.',
  LOW_QUALITY: 'Image quality too low. Please provide a clearer image.',
  ALREADY_MARKED: 'Attendance already marked for this session.',
  SESSION_NOT_ACTIVE: 'Session is not currently active.',
  GEOFENCE_VIOLATION: 'You are not within the required location for this session.',
  QR_EXPIRED: 'QR code has expired. Please ask faculty to refresh.',
  FACE_MISMATCH: 'Face verification failed. Please try again or contact faculty.'
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  ATTENDANCE_MARKED: 'Attendance marked successfully',
  SESSION_STARTED: 'Session started successfully',
  SESSION_CLOSED: 'Session closed successfully',
  COURSE_CREATED: 'Course created successfully',
  FACE_ENROLLED: 'Face enrollment completed successfully',
  EMAIL_SENT: 'Email sent successfully'
};

export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_INDIAN: /^[6-9]\d{9}$/,
  COURSE_CODE: /^[A-Z]{2}\d{3}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  ACADEMIC_YEAR: /^\d{4}-\d{4}$/,
  TIME_FORMAT: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
};

export const THEME = {
  COLORS: {
    PRIMARY: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8'
    },
    SUCCESS: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a'
    },
    WARNING: {
      50: '#fefce8',
      500: '#eab308',
      600: '#ca8a04'
    },
    ERROR: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626'
    }
  },
  SPACING: {
    BASE: 8,
    COMPONENT_GAP: 24,
    SECTION_GAP: 48
  },
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280
  }
};

export const CHART_COLORS = [
  '#3B82F6', // Primary blue
  '#10B981', // Success green
  '#F59E0B', // Warning yellow
  '#EF4444', // Error red
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#84CC16'  // Lime
];

export const DATE_FORMATS = {
  FULL: 'MMMM dd, yyyy HH:mm',
  DATE_ONLY: 'MMM dd, yyyy',
  TIME_ONLY: 'HH:mm',
  ISO_DATE: 'yyyy-MM-dd',
  ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
};

export const PAGINATION_LIMITS = {
  DEFAULT: 20,
  SMALL: 10,
  LARGE: 50,
  MAX: 100
};

export const CACHE_KEYS = {
  USER_PROFILE: 'user-profile',
  STUDENT_COURSES: 'student-courses',
  FACULTY_COURSES: 'faculty-courses',
  UPCOMING_SESSIONS: 'upcoming-sessions',
  ACTIVE_SESSIONS: 'active-sessions',
  ATTENDANCE_HISTORY: 'attendance-history',
  ADMIN_STATS: 'admin-dashboard-stats',
  SYSTEM_ANALYTICS: 'system-analytics'
};