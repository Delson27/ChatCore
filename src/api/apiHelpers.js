// Helper function to get authorization headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Base API URL - uses environment variable in production, localhost in development
export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";
