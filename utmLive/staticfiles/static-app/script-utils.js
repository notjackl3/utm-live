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


function updateMapFavChange() {
    map.setLayoutProperty(MAIN_LAYER, 'icon-image', [
        'case',
        ['in', ['get', 'code'], ['literal', codeIds]], 'location-fav-icon',
        'location-icon'
    ]);

    map.setPaintProperty(MAIN_LAYER, 'icon-color', [
        'case',
        ['in', ['get', 'code'], ['literal', codeIds]], '#f1c40f',
        ['match', ['get', 'type'],
            'academic building', '#e74c3c',
            'campus building', '#27ae60',
            'student building', '#2980b9',
            '#888888'
        ]
    ]);
}


function updateButtonUI(code) {
    const buttonWrapper = document.querySelector(`[data-code="${code}"]`);
    if (!buttonWrapper) return;

    buttonWrapper.innerHTML = "";

    if (codeIds.includes(code)) {
        const removeFavButton = document.createElement("button");
        removeFavButton.classList.add("base-button", "fav-button");
        removeFavButton.innerHTML = "remove from favourites";
        removeFavButton.addEventListener("click", () => {
            removeFromFav(code);
        });
        buttonWrapper.appendChild(removeFavButton);
    } else {
        const favButton = document.createElement("button");
        favButton.classList.add("base-button", "fav-button");
        favButton.innerHTML = "add to favourites";
        favButton.addEventListener("click", () => {
            addToFav(code);
        });
        buttonWrapper.appendChild(favButton);
    }

    const closeButton = document.createElement("button");
    closeButton.classList.add("base-button", "close-button");
    closeButton.innerHTML = "close";
    closeButton.addEventListener("click", hideCard);
    buttonWrapper.appendChild(closeButton)

    updateMapFavChange()
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
        const response = await fetch("/main/preferences/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
                "Authorization": `'Bearer ${accessToken}'` // for authentication purposes
            },
            credentials: "include",
            body: JSON.stringify({
                code: code
            }),
        })
        if (!response.ok) throw new Error("Failed to save preference.");
        data = await response.json()
        console.log("Preference saved", data);
        codeIds.push(code);
        updateButtonUI(code);
    }
    else {
        refreshAccessToken();
    }
}


async function removeFromFav(code) {
    accessToken = localStorage.getItem("access_token")
    if (accessToken) {
        const response = await fetch("/main/preferences/", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
                "Authorization": `'Bearer ${accessToken}'` // for authentication purposes
            },
            credentials: "include",
            body: JSON.stringify({
                code: code
            }),
        })
        if (!response.ok) throw new Error("Failed to delete preference.");
        // remove the deleted code from the list
        codeIds = codeIds.filter(id => id !== code);
        updateButtonUI(code);
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


async function checkRoute(coordinates1, coordinates2) {
    try {
        // Wait for the style to be loaded (if it isn’t already)
        if (!map.isStyleLoaded()) {
            await new Promise(resolve => {
                map.once('style.load', resolve);
            });
        }

        const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates1};${coordinates2}?geometries=geojson&access_token=${MAPBOX_TOKEN}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const route = data.routes[0].geometry;
        return route
    } catch (error) {
        console.error("Error fetching route data:", error);
        return null;
    }
}