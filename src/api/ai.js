import { API_URL } from "./apiHelpers";

export default async function getAIResponse(userMessage, userId, sessionId) {
  // Check if browser is online
  if (!navigator.onLine) {
    throw new Error("Network error. Please check your internet connection.");
  }

  try {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userMessage, userId, sessionId }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    //Converting response to js object
    const data = await response.json();

    // Check if reply exists
    if (!data.reply) {
      throw new Error("No response received from AI");
    }

    return data.reply;
  } catch (error) {
    console.error("API Error:", error);

    // Check if request was aborted (timeout)
    if (error.name === "AbortError") {
      throw new Error(
        "Request timeout. Please check your connection and try again.",
      );
    }

    // Check if it's a network error
    if (
      error.name === "TypeError" ||
      error.message.includes("Failed to fetch")
    ) {
      throw new Error("Network error. Please check your internet connection.");
    }

    // Re-throw the error so App.jsx can catch it
    throw error;
  }
}
