export const SPORTS = ['Badminton', 'Table Tennis', 'Tennis', 'Chess', 'Carrom', 'Squash'];

export const normalizeSport = (sport = '') => String(sport).trim();

export const isRequestExpired = (date, startTime, now = new Date()) => {
  if (!date || !startTime) return false;
  const [year, month, day] = String(date).split('-').map(Number);
  const [hours, minutes] = String(startTime).split(':').map(Number);
  const requestDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  return requestDate.getTime() < now.getTime();
};

export const isBookingTimeAllowed = (startTime = '') => {
  if (!startTime) return false;
  const [hours, minutes] = String(startTime).split(':').map(Number);
  const minutesSinceMidnight = hours * 60 + minutes;
  return minutesSinceMidnight >= 8 * 60 && minutesSinceMidnight <= 20 * 60;
};
