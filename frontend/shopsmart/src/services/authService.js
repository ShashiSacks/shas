const API_URL = "http://localhost:8000/api/auth";

async function authRequest(endpoint, data) {
  let response;

  try {
    response = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error(
      "Unable to connect to ShopSmart. Make sure the backend is running."
    );
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Authentication failed.");
  }

  return result;
}

export function signupUser(userData) {
  return authRequest("signup", userData);
}

export function loginUser(credentials) {
  return authRequest("login", credentials);
}