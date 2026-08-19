// src/services/authService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Helper function to safely pull token from either storage
const getAuthToken = () => {
  return sessionStorage.getItem("token") || localStorage.getItem("token");
};

// REGISTER USER
export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

// LOGIN USER
export const loginUser = async (userData) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  
  // Storing token safely (Choose one primary storage or allow both)
  if (data.token) {
    sessionStorage.setItem("token", data.token);
    localStorage.setItem("token", data.token);
  }

  return data;
};

// GET USER PROFILE
export const getUserProfile = async () => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No authorization token found");
  }

  // Updated to full backend URL instead of relative path
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// UPDATE USER PROFILE
export const updateProfile = async (profileData) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No authorization token found");
  }

  const response = await fetch(`${API_URL}/update-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data;
};