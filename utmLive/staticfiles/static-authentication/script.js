function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
          cookie = cookie.trim();
          if (cookie.startsWith(name + "=")) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
      }
  }
  return cookieValue;
}


function showErrorMessage(message) {
    errorMessage = document.getElementById("error-message");
    errorMessage.innerHTML = message;
    errorMessage.style.display = "block";
}


async function LOGIN(email_input, password_input) {
  try {
      const response = await fetch("/login-user/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          credentials: "include",
          body: JSON.stringify({
              email: email_input,
              password: password_input
          }),
      })
      if (!response.ok) throw new Error("Failed to login.");
      data = await response.json()
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      console.log("Access token:", data.access);
      console.log("Refresh token:", data.refresh);
      window.location.href = "/main";
  } catch (error) {
      console.error("Error:", error);
      showErrorMessage("Login details are incorrect.");
  }
}


async function SIGNUP(email_input, password_input) {
  try {
      const response = await fetch("/api/user/", {
          method: "POST",
          headers: {
          "Content-Type": "application/json",
          // "X-CSRFToken": getCookie("csrftoken"),
          },
          credentials: "include",
          body: JSON.stringify({
              email: email_input,
              password: password_input
          }),
      })
      if (!response.ok) throw new Error("Failed to signup.");
      data = await response.json()
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      console.log("Access token:", data.access);
      console.log("Refresh token:", data.refresh);
      window.location.href = "/main";
  } catch (error) {
      showErrorMessage("Email is not valid or it already existed.");
  }
}


