export const extractFacultyAndBatch = (userId) => {
  const userIdLower = String(userId || '').toLowerCase();
  let faculty = '';
  let batch = '';
  let remainingId = '';

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

  if (remainingId.length >= 2) {
    batch = `20${remainingId.substring(0, 2)}`;
  }

  return {
    faculty: faculty ? `Faculty of ${faculty}` : 'N/A',
    batch: batch || 'N/A',
  };
};

export const validateUniversityEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.pdn\.ac\.lk$/;
  return emailRegex.test(email);
};

export const extractUserIdFromEmail = (email) => {
  return String(email || '').split('@')[0].toLowerCase();
};
