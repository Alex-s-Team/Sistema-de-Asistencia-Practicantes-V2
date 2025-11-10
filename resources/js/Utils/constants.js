export const API_URL = '/api';

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  INTERN: 'intern',
};

export const ATTENDANCE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const JUSTIFICATION_TYPES = {
  ABSENCE: 'absence',
  DELAY: 'delay',
  EARLY_EXIT: 'early_exit',
};

export const OFFICE_LOCATION = {
  latitude: -12.0464,
  longitude: -77.0428,
  radius: 100, // metros
};

export const QR_REFRESH_INTERVAL = 30000; // 30 segundos
