var geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
});
map.addControl(geolocate);

function geoFindMe() {
    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        if (isInOntario({lat: latitude, lng: longitude})) {
            geolocate.trigger();
            console.log("User is within Ontario bounds.");
        } else {
            alert("You are outside Ontario. Ontario-specific map data will not be shown.");
        }
    }   
    navigator.geolocation.getCurrentPosition(success);
}
document.querySelector("#my-location-button").addEventListener("click", geoFindMe);

function switchTime() {
    if (currentLightPreset == "dawn") {
        changeLightPreset("day", "#000");
    }
    else if (currentLightPreset == "day") {
        changeLightPreset("dusk", "#fff");
    }
    else if (currentLightPreset == "dusk") {
        changeLightPreset("night", "#fff");
    }
    else if (currentLightPreset == "night") {
        changeLightPreset("auto (Mississauga)", "#fff");
    }
    else {
        changeLightPreset("dawn", "#000");
    }
}
document.querySelector("#time-button").addEventListener("click", switchTime);

function switchSnowRain() {
    if (currentSnowRain == "none") {
        changeSnowRainPreset("snow");
    }
    else if (currentSnowRain == "snow") {
        changeSnowRainPreset("rain");
    }
    else if (currentSnowRain == "rain") {
        changeSnowRainPreset("snow + rain");
    }
    else if (currentSnowRain == "snow + rain") {
        changeSnowRainPreset("auto (Mississauga)");
    }
    else {
        changeSnowRainPreset("none");
    }
}
document.querySelector("#weather-button").addEventListener("click", switchSnowRain);
