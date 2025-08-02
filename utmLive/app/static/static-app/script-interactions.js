// geolocate allows user to detect their current location
var geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
});
map.addControl(geolocate);

// determine if the user is within Ontario. If now then their location is not tracked
function geoFindMe() {
    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        if (isInOntario({lat: latitude, lng: longitude})) {
            geolocate.trigger();
        } else {
            alert("You are outside Ontario, your location can't be tracked.");
        }
    }   
    navigator.geolocation.getCurrentPosition(success);
}
document.getElementById("my-location-button").addEventListener("click", geoFindMe);

// toggle between different time settings
function switchTime() {
    const lightPresetOrder = ["dawn", "day", "dusk", "night", "auto (Mississauga)"]
    const colorPairs = {
        "dawn": "#000",
        "day": "#000",
        "dusk": "#fff",
        "night": "#fff",
        "auto (Mississauga)": "#fff"
    }

    const newIndex = (lightPresetOrder.indexOf(currentLightPreset) + 1) % lightPresetOrder.length
    const newLight = lightPresetOrder[newIndex]

    changeLightPreset(newLight, colorPairs[newLight])
}
document.getElementById("time-button").addEventListener("click", switchTime);

// toggle between different weather settings
function switchSnowRain() {
    const snowRainPresetOrder = ["none", "snow", "rain", "snow + rain", "auto (Mississauga)"]

    const newIndex = (snowRainPresetOrder.indexOf(currentSnowRainPreset) + 1) % snowRainPresetOrder.length
    const newSnowRain = snowRainPresetOrder[newIndex]

    changeSnowRainPreset(newSnowRain);
}
document.getElementById("weather-button").addEventListener("click", switchSnowRain);

async function drawRoute(coordinates1, coordinates2) {
    route = await checkRoute(coordinates1, coordinates2)

    const routeGeoJSON = {
        type: 'Feature',
        geometry: route
    };

    if (map.getSource("route")) {
        map.getSource("route").setData(routeGeoJSON);
    } 
    else {
        map.addSource("route", {
            type: "geojson",
            data: routeGeoJSON
        });
        map.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            layout: {
                "line-join": "round",
                "line-cap": "round"
            },
            paint: {
                "line-color": "#39FF14",
                "line-width": 4,
                "line-emissive-strength": 1
            },
        });
    }

}

async function startRoute(feature) {
    currentStartPoint = feature.geometry.coordinates;
    currentStartLocation = feature.properties.name
    await hideCard();
    showRouteCard()
}

function waitForFeatureClick() {
    return new Promise((resolve, reject) => {
        // temporary handler that only triggers once
        const handler = async ({ feature }) => {
            if (!isSelecting) return;
            map.removeInteraction("temp-select");
            resolve(feature);
        };
        // wait for the buildings layer to be clicked
        map.addInteraction("temp-select", {
            type: "click",
            target: { layerId: MAIN_LAYER },
            handler
        });
    });
}

async function selectLocation(choice) {
    isSelecting = true;
    hideCard();
    // hide information card and allows user to select a location 
    if (choice == "start") {
        try {
            const startFeature = await waitForFeatureClick();
            isSelecting = false;
            currentStartPoint = startFeature.geometry.coordinates;
            currentStartLocation = startFeature.properties.name;
            showRouteCard();
        } catch (error) {
            console.error("Feature selection canceled or failed", error);
        }
    }
    else {
        try {
            const stopFeature = await waitForFeatureClick();
            isSelecting = false;
            currentStopPoint = stopFeature.geometry.coordinates;
            currentStopLocation = stopFeature.properties.name;
            showRouteCard();
        } catch (error) {
            console.error("Feature selection canceled or failed", error);
        }
    }
}
