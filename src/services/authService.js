// src/services/authService.js
import API from "../api/axios";

// REGISTER USER
export const registerUser = async (userData) => {
  try {
    const response = await API.post("/auth/register", userData);
    const data = response.data;

    // Store token on successful registration
    if (data.token) {
      sessionStorage.setItem("token", data.token);
      localStorage.setItem("token", data.token);
    }

    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

// LOGIN USER
export const loginUser = async (userData) => {
  try {
    const response = await API.post("/auth/login", userData);
    const data = response.data;

    // Store token in storage for the interceptor to use on subsequent requests
    if (data.token) {
      sessionStorage.setItem("token", data.token);
      localStorage.setItem("token", data.token);
    }

    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

// GET USER PROFILE
export const getUserProfile = async () => {
  try {
    // Relative URL and Authorization header are handled automatically by the API client
    const response = await API.get("/auth/profile");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch profile");
  }
};

// UPDATE USER PROFILE
export const updateProfile = async (profileData) => {
  try {
    const response = await API.put("/auth/update-profile", profileData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update profile");
  }
};

// LOGOUT USER
export const logoutUser = () => {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
};