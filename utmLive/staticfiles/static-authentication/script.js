document.getElementById("login-form").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.target;
    if ((form.username.value === "johndoe") && (form.password.value === "secret")) {
      location.href = "main.html";
    } else {
      alert("Invalid user name and/or password!");
    }
  });