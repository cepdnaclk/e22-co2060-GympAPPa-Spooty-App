/**
 * Default profile picture - Generic user icon
 * Using Flaticon's my-profile icon style
 */
export const DEFAULT_PROFILE_PICTURE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 150 150%22%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%2344a194;%7D.cls-2%7Bfill:%23fff;%7D%3C/style%3E%3C/defs%3E%3Ccircle class=%22cls-1%22 cx=%2275%22 cy=%2275%22 r=%2275%22/%3E%3Ccircle class=%22cls-2%22 cx=%2275%22 cy=%2245%22 r=%2225%22/%3E%3Cpath class=%22cls-2%22 d=%22M50,90c0-14,11-25,25-25s25,11,25,25v10H50Z%22/%3E%3C/svg%3E';

/**
 * Extract faculty and batch from user ID
 * User ID format: AYYXXX where A is faculty code, YY is batch, XXX is serial
 */
export const extractFacultyAndBatch = (userId) => {
  const userIdLower = userId.toLowerCase();
  
  let faculty = '';
  let batch = '';
  let remainingId = '';

  // Check for multi-letter faculty codes first
  if (userIdLower.startsWith('ahs')) {
    faculty = 'Allied Health Sciences';
    remainingId = userIdLower.substring(3);
  } else if (userIdLower.startsWith('mg')) {
    faculty = 'Management';
    remainingId = userIdLower.substring(2);
  } else if (userIdLower.startsWith('ag')) {
    faculty = 'Agriculture';
    remainingId = userIdLower.substring(2);
  } else if (userIdLower.startsWith('vs')) {
    faculty = 'Veterinary & Animal Science';
    remainingId = userIdLower.substring(2);
  } else if (userIdLower.startsWith('a')) {
    faculty = 'Arts';
    remainingId = userIdLower.substring(1);
  } else if (userIdLower.startsWith('m')) {
    faculty = 'Medicine';
    remainingId = userIdLower.substring(1);
  } else if (userIdLower.startsWith('e')) {
    faculty = 'Engineering';
    remainingId = userIdLower.substring(1);
  } else if (userIdLower.startsWith('s')) {
    faculty = 'Science';
    remainingId = userIdLower.substring(1);
  } else if (userIdLower.startsWith('d')) {
    faculty = 'Dental';
    remainingId = userIdLower.substring(1);
  }

  // Extract batch (first 2 digits)
  if (remainingId.length >= 2) {
    batch = '20' + remainingId.substring(0, 2);
  }

  return {
    faculty: `Faculty of ${faculty}`,
    batch: batch || 'N/A'
  };
};

export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.pdn\.ac\.lk$/;
  return emailRegex.test(email);
};

export const extractUserIdFromEmail = (email) => {
  const [userId] = email.split('@');
  return userId.toLowerCase();
};

export const getRoleDisplayName = (role) => {
  const roleNames = {
    'student': 'Student',
    'games-captain': 'Games Captain',
    'admin': 'Administrator',
    'counter-staff': 'Sports Counter Staff',
    'psu': 'PSU',
    'faculty-cordinator': 'Faculty Coordinator',
    'coach': 'Coach',
    'private-coach': 'Private Coach',
    'academic-staff': 'Academic Staff'
  };
  return roleNames[role] || role;
};
