import { format } from 'date-fns';
import { 
  ATTENDANCE_STATUS, 
  SESSION_STATUS, 
  ATTENDANCE_METHOD,
  DATE_FORMATS,
  ERROR_MESSAGES 
} from './constants';

export const formatDate = (date, formatType = 'FULL') => {
  if (!date) return '';
  try {
    return format(new Date(date), DATE_FORMATS[formatType] || formatType);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

export const getTimeAgo = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date, 'DATE_ONLY');
};

export const getStatusColor = (status, type = 'attendance') => {
  const colorMaps = {
    attendance: {
      [ATTENDANCE_STATUS.PRESENT]: 'success',
      [ATTENDANCE_STATUS.LATE]: 'warning', 
      [ATTENDANCE_STATUS.ABSENT]: 'error',
      [ATTENDANCE_STATUS.EXCUSED]: 'info'
    },
    session: {
      [SESSION_STATUS.SCHEDULED]: 'info',
      [SESSION_STATUS.ACTIVE]: 'success',
      [SESSION_STATUS.CLOSED]: 'default',
      [SESSION_STATUS.CANCELLED]: 'error'
    }
  };
  
  return colorMaps[type]?.[status] || 'default';
};

export const getMethodIcon = (method) => {
  const iconMap = {
    [ATTENDANCE_METHOD.QR]: 'QrCode',
    [ATTENDANCE_METHOD.FACE]: 'Camera',
    [ATTENDANCE_METHOD.MANUAL]: 'Edit',
    [ATTENDANCE_METHOD.UPLOAD]: 'Upload'
  };
  
  return iconMap[method] || 'User';
};

export const calculateAttendancePercentage = (present, total) => {
  if (!total || total === 0) return 0;
  return Math.round((present / total) * 100);
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const generateInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

export const isValidImageFile = (file) => {
  if (!file) return false;
  
  const allowedTypes = ['image/jpeg', 'image/png'];
  const maxSize = 20 * 1024 * 1024; // 20MB
  
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const compressImage = (file, maxWidth = 1024, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(resolve, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const downloadCSV = (data, filename) => {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const handleApiError = (error, fallbackMessage = ERROR_MESSAGES.SERVER_ERROR) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || ERROR_MESSAGES.VALIDATION_ERROR;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
      default:
        return data.message || ERROR_MESSAGES.SERVER_ERROR;
    }
  } else if (error.request) {
    // Network error
    return ERROR_MESSAGES.NETWORK_ERROR;
  } else {
    // Other error
    return error.message || fallbackMessage;
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const generateQRDataString = (sessionId, token) => {
  return JSON.stringify({
    sessionId,
    token,
    timestamp: Date.now(),
    version: '1.0'
  });
};

export const parseQRDataString = (qrString) => {
  try {
    const data = JSON.parse(qrString);
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid QR code format'
    };
  }
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

export const isWithinGeofence = (userLat, userLon, centerLat, centerLon, radius) => {
  const distance = calculateDistance(userLat, userLon, centerLat, centerLon);
  return distance <= radius;
};

export const getAttendanceStats = (attendanceRecords) => {
  const stats = {
    total: attendanceRecords.length,
    present: 0,
    late: 0,
    absent: 0,
    excused: 0
  };

  attendanceRecords.forEach(record => {
    switch (record.status) {
      case ATTENDANCE_STATUS.PRESENT:
        stats.present++;
        break;
      case ATTENDANCE_STATUS.LATE:
        stats.late++;
        break;
      case ATTENDANCE_STATUS.ABSENT:
        stats.absent++;
        break;
      case ATTENDANCE_STATUS.EXCUSED:
        stats.excused++;
        break;
    }
  });

  stats.attendancePercentage = calculateAttendancePercentage(
    stats.present + stats.late, 
    stats.total
  );

  return stats;
};

export const groupAttendanceByDate = (attendanceRecords) => {
  const grouped = {};

  attendanceRecords.forEach(record => {
    const date = formatDate(record.markedAt, 'DATE_ONLY');
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(record);
  });

  return grouped;
};

export const generateDashboardStats = (courses, sessions, attendance) => {
  const stats = {
    totalCourses: courses.length,
    totalSessions: sessions.length,
    totalAttendance: attendance.length,
    activeSessions: sessions.filter(s => s.status === SESSION_STATUS.ACTIVE).length,
    upcomingSessions: sessions.filter(s => new Date(s.startAt) > new Date()).length,
    todaysSessions: sessions.filter(s => {
      const sessionDate = new Date(s.date);
      const today = new Date();
      return sessionDate.toDateString() === today.toDateString();
    }).length
  };

  if (attendance.length > 0) {
    const attendanceStats = getAttendanceStats(attendance);
    stats.attendancePercentage = attendanceStats.attendancePercentage;
    stats.presentCount = attendanceStats.present;
    stats.absentCount = attendanceStats.absent;
  }

  return stats;
};

export const formatSessionTime = (startAt, endAt) => {
  const start = formatDate(startAt, 'HH:mm');
  const end = formatDate(endAt, 'HH:mm');
  return `${start} - ${end}`;
};

export const getSessionDateLabel = (date) => {
  const sessionDate = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (sessionDate.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (sessionDate.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return formatDate(date, 'DATE_ONLY');
};

export const sortSessions = (sessions, sortBy = 'startAt', sortOrder = 'asc') => {
  return [...sessions].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'startAt' || sortBy === 'endAt' || sortBy === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });
};

export const filterSessionsByStatus = (sessions, status) => {
  if (!status) return sessions;
  return sessions.filter(session => session.status === status);
};

export const searchInObjects = (objects, searchTerm, fields) => {
  if (!searchTerm) return objects;
  
  const term = searchTerm.toLowerCase();
  return objects.filter(obj =>
    fields.some(field => {
      const value = getNestedValue(obj, field);
      return value && value.toString().toLowerCase().includes(term);
    })
  );
};

export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const value = getNestedValue(item, key);
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
};

export const generateRandomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const formatPercentage = (value, decimals = 0) => {
  return `${Number(value).toFixed(decimals)}%`;
};

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== null && value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  return formData;
};

export const parseError = (error) => {
  if (error.response?.data?.validationErrors) {
    return error.response.data.validationErrors
      .map(err => err.message)
      .join(', ');
  }
  
  return handleApiError(error);
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    
    fieldRules.forEach(rule => {
      if (rule.required && (!value || value.toString().trim() === '')) {
        errors[field] = 'This field is required';
        return;
      }
      
      if (rule.minLength && value && value.length < rule.minLength) {
        errors[field] = `Minimum ${rule.minLength} characters required`;
        return;
      }
      
      if (rule.maxLength && value && value.length > rule.maxLength) {
        errors[field] = `Maximum ${rule.maxLength} characters allowed`;
        return;
      }
      
      if (rule.pattern && value && !rule.pattern.test(value)) {
        errors[field] = rule.message || 'Invalid format';
        return;
      }
      
      if (rule.custom && value) {
        const customResult = rule.custom(value);
        if (customResult !== true) {
          errors[field] = customResult || 'Invalid value';
          return;
        }
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await sleep(delay * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  
  throw lastError;
};

export const memoize = (fn, getKey = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  return (...args) => {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  };
};

export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
};

export const isEmptyObject = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const removeEmptyValues = (obj) => {
  const cleaned = {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = removeEmptyValues(value);
        if (!isEmptyObject(cleanedNested)) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  });
  
  return cleaned;
};

export const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return fallback;
  }
};

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return ERROR_MESSAGES.SERVER_ERROR;
};

export const createUrlWithParams = (baseUrl, params) => {
  const url = new URL(baseUrl);
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.append(key, value.toString());
    }
  });
  
  return url.toString();
};