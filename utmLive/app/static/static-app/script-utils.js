const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

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
    // get the refresh token to retrieve a new access token when the old one expires
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
        // if the refresh token is valid, then replace the current access token with a new one
        const data = await response.json()
        localStorage.setItem("access_token", data.access);
        // only replace the current refresh token if there is something in returned, because refresh tokens are long-lived and they are usually returned as null, so you dont want to set refresh token to null
        if (data.refresh) {
            localStorage.setItem("refresh_token", data.refresh);
        }
    }
    else {
        // in case the refresh token is invalid, we try reauthenticate the user, then get their access and refresh token through the authentication endpoint
        const response = await fetch("/api/user/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        })
        if (response.ok) {
            // if the user is reauthenticate successfully, then we reset the access token and refresh token
            const data = await response.json();
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);
        } else {
            // if the session expired, thus we cant reauthenticate the user then they have to log in again
            alert("Session expired. Please log in again.");
            window.location.href = "/login/";
        }
    }
}

async function refreshAccessTokenAndRetry(callback) {
    await refreshAccessToken();
    // after resetting the access token using the refresh token, call the callback function again
    return await callback();
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


async function sendSuggestion() {
    accessToken = localStorage.getItem("access_token");
    console.log("sending suggestion")
    const name = document.getElementById("location-suggestion-name").value;
    const response = await fetch("/main/suggestions/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        credentials: "include",
        body: JSON.stringify({
            name: name,
            longitude: suggestedCoordinates[0],
            latitude: suggestedCoordinates[1]
        }),
    });
    if (response.status === 401) {
        // in case that the user is not authorized, we need to refresh our access token and retry the function
        return await refreshAccessTokenAndRetry(sendSuggestion);
    }
    if (!response.ok) {
        throw new Error("Failed to suggest location.");
    }
}


function addSuggestedLocation(name, longitude, latitude) {
    const newFeature = {
        type: "Feature",
        geometry: { type: "Point", coordinates: [longitude, latitude] },
        properties: { name: name, type: 'suggestion' },
        id: crypto.randomUUID()
      };

    userSuggestedFeatures.push(newFeature);
    console.log(userSuggestedFeatures)

    map.getSource('suggestions-source').setData({
        type: "FeatureCollection",
        features: userSuggestedFeatures,
    });
}


async function addNewPointLayer(source, colour) {

    await map.loadImage('/static/static-app/assets/location.png', (error, image) => {
        if (error) throw error;
        if (!map.hasImage('suggested-location-icon')) {
            map.addImage('suggested-location-icon', image, { sdf: true });
        }
    });

    if (!map.getLayer(`${source}-layer`)) {
        map.addLayer({
            id: `${source}-layer`,
            type: 'symbol',
            source: source,
            minzoom: 14,
            maxzoom: 22,
            layout: {
                'icon-image': 'suggested-location-icon',
                'icon-size': ['interpolate', ['linear'], ['zoom'], 14, 0.01, 19, 0.2],
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
                'text-field': ['get', 'name'],
                'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                'text-anchor': 'center',
                'text-offset': ['interpolate', ['linear'], ['zoom'], 14, [0, 2], 19, [0, 5]],
                'text-size': ['interpolate', ['linear'], ['zoom'], 14, 10, 19, 14],
                'text-allow-overlap': true,
                'text-ignore-placement': true
            },
            paint: {
                'icon-color': colour,
                'icon-opacity': 1,
                'icon-occlusion-opacity': 1,
                'icon-emissive-strength': 1,
                "text-color": colour,
                'text-opacity': ['interpolate', ['linear'], ['zoom'], 14.5, 0, 16.5, 1],
                'text-occlusion-opacity': 1
            }
        });
    }

    map.addInteraction("click-suggestion", {
        type: "click",
        target: { layerId: `${source}-layer` },
        handler: async ({ feature }) => {
            if (!isSelecting) {
                await showCard(feature);
                map.resize();
                map.flyTo({
                    center: feature.geometry.coordinates
                });
            }
        }
    });
}