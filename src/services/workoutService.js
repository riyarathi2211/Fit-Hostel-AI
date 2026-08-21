// src/services/workoutService.js
import API from "../api/axios";

export const searchExercisesAdvanced = async (filters) => {
  try {
    const payload = {
      name: filters.name,
      muscleGroup: filters.muscleGroup,
      type: filters.type,
      difficulty: filters.difficulty
    };

    // Relative endpoint and token attachment are handled automatically by the API interceptor
    const response = await API.post("/workout/search", payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to process search filters."
    );
  }
};