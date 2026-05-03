import API_BASE_URL from "../config/api";

export const getPendingRequests = async (regNo) => {
  const encodedRegNo = encodeURIComponent(regNo);

  const response = await fetch(`${API_BASE_URL}/requests/${encodedRegNo}`);

  if (!response.ok) {
    throw new Error("Failed to fetch requests");
  }

  return response.json();
};