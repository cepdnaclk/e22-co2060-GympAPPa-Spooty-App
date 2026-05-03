/**
 * Extract faculty and batch from user ID
 * User ID format: AYYXXX where A is faculty code, YY is batch, XXX is serial
 * 
 * Faculty codes:
 * A - Arts
 * AHS - Allied Health Sciences
 * M - Medicine
 * E - Engineering
 * S - Science
 * MG - Management
 * AG - Agriculture
 * VS - Veterinary & Animal Science
 * D - Dental
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

export const validateUniversityEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.pdn\.ac\.lk$/;
  return emailRegex.test(email);
};

export const extractUserIdFromEmail = (email) => {
  const [userId] = email.split('@');
  return userId.toLowerCase();
};
