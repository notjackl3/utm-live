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

// check if a location is inside Ontario
function isInOntario(center) {
    return (
        center.lng >= -139.05 &&
        center.lng <= -114.0667 &&
        center.lat >= 49.0 &&
        center.lat <= 60.0
    );
}


function getImagePath(name) {
    return `${BASE_ASSETS_URL}${name}`;
}


async function refreshAccessToken() {
    currentRefreshToken = localStorage.getItem("refresh_token");
    // try to retrieve a new access token when the old one expires
    const response = await fetch("/api/token/refresh/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            refresh: currentRefreshToken
        }),
    })
    if (response.ok) {
        const data = await response.json()
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        return data.access
    }
    else {
        window.location.href = "/login";
        return null;
    }
}


async function addToFav(code) {
    accessToken = localStorage.getItem("access_token")
    if (accessToken) {
        console.log(accessToken)
        const response = await fetch("/main/preferences/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
                "Authorization": `'Bearer ${accessToken}` // for authentication purposes
            },
            credentials: "include",
            body: JSON.stringify({
                code: code
            }),
        })
        if (!response.ok) throw new Error("Failed to save preference.");
        data = await response.json()
        console.log("Preference saved", data);
    }
    else {
        refreshAccessToken();
    }
}


function zoomBasedReveal(value) {
    return ['interpolate', ['linear'], ['zoom'], 11, 0.0, 13, value];
};


async function checkWeather() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Mississauga&appid=${OPENWEATHER_TOKEN}&units=metric`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.weather[0].id;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}