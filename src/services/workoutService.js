// src/services/workoutService.js
const API_URL = "http://localhost:5000/api/workout";

export const searchExercisesAdvanced = async (filters) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      name: filters.name,
      muscleGroup: filters.muscleGroup,
      type: filters.type,
      difficulty: filters.difficulty
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to process search filters.");
  }

  return await response.json();
};