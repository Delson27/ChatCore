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
  process.env.REACT_APP_API_URL ||
  (window.location.hostname.includes("vercel.app")
    ? "https://chatcore-backend-qs4d.onrender.com/api"
    : "http://localhost:5000/api");

// Log the API URL being used (for debugging)
console.log("API URL:", API_URL);
