const API_URL = "http://localhost:5000/api/auth";

// REGISTER USER
export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
};

// LOGIN USER
export const loginUser = async (userData) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
}; 
// GET USER PROFILE
export const getUserProfile = async () => {

  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
};

// ... (your existing login/register code)

export const updateProfile = async (profileData) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/update-profile`, {
    method: "PUT", // Use PUT for updates
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Crucial for the 'protect' middleware
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data; // This returns the updated user object
};