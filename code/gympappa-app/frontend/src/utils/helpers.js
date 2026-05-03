export const DEFAULT_PROFILE_PICTURE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 150 150%22%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%2344a194;%7D.cls-2%7Bfill:%23fff;%7D%3C/style%3E%3C/defs%3E%3Ccircle class=%22cls-1%22 cx=%2275%22 cy=%2275%22 r=%2275%22/%3E%3Ccircle class=%22cls-2%22 cx=%2275%22 cy=%2245%22 r=%2225%22/%3E%3Cpath class=%22cls-2%22 d=%22M50,90c0-14,11-25,25-25s25,11,25,25v10H50Z%22/%3E%3C/svg%3E';

export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.pdn\.ac\.lk$/;
  return emailRegex.test(email);
};

export const getRoleDisplayName = (role) => {
  const roleNames = {
    student: 'Student',
    'games-captain': 'Games Captain',
    admin: 'Administrator',
    'counter-staff': 'Sports Counter Staff',
    psu: 'PSU',
    'faculty-cordinator': 'Faculty Coordinator',
    coach: 'Coach',
    'private-coach': 'Private Coach',
    'academic-staff': 'Academic Staff',
  };
  return roleNames[role] || role || 'User';
};
