const map = new mapboxgl.Map({
    style: "mapbox://styles/notjackl3/cmcvhl1fn00oi01sb8fzl25md?optimize=true",
    center: [-79.661979, 43.548187],
    zoom: 16.5,
    minZoom: 14.5,
    maxZoom: 19,
    pitch: 55,
    bearing: 20,
    container: "map",
    antialias: true,
});

const card = document.getElementById("properties");
function showCard(feature) {
    card.innerHTML = "";
    const container = document.createElement("div");
    container.className = "map-overlay-inner";

    const closeButton = document.createElement("button");
    closeButton.className = "close-button";
    closeButton.innerHTML = "close";
    closeButton.addEventListener("click", hideCard);

    const closeButtonWrapper = document.createElement("div");
    closeButtonWrapper.style.display = "flex";
    closeButtonWrapper.style.justifyContent = "end";
    closeButtonWrapper.appendChild(closeButton)

    container.appendChild(closeButtonWrapper);

    const locationName = document.createElement("h1");
    locationName.textContent = feature.properties.name;
    locationName.className = "location-name";
    container.appendChild(locationName);

    const list = document.createElement("ul");
    for (const [key, value] of Object.entries(feature.properties)) {            
        if (key != "name") {
            const locationKey = document.createElement("p");
            locationKey.className = "location-key";
            locationKey.innerHTML = `<b>${key}</b>`;
            
            const locationValue = document.createElement("p");
            locationValue.className = "location-value";
            locationValue.innerText = value;
            
            const locationInfo = document.createElement("div");
            locationInfo.className = "location-info";
            locationInfo.appendChild(locationKey);
            locationInfo.appendChild(locationValue);
            container.appendChild(locationInfo);
        }
    }
    container.appendChild(list);
    card.appendChild(container);

    const locationImage = document.createElement("img");
    locationImage.src = getImagePath('outside-dv.jpeg');
    locationImage.className = "location-image";
    card.appendChild(locationImage);

    const locationImage2 = document.createElement("img");
    locationImage2.src = getImagePath('inside-dv.jpeg');
    locationImage2.className = "location-image";
    card.appendChild(locationImage2);

    card.style.display = "block";
};
function hideCard() {
    card.style.display = "none";
    map.resize();
}

map.on("style.load", () => {
    let selectedFeature = null;

    map.addSource("mapbox-dem", {
        "type": "raster-dem",
        "url": "mapbox://mapbox.mapbox-terrain-dem-v1",
        "tileSize": 512,
    });

    map.setLayoutProperty(MAIN_LAYER, "visibility", "visible");
    map.setLayoutProperty(MAIN_LAYER, "icon-allow-overlap", true);
    map.setLayoutProperty(MAIN_LAYER, "text-allow-overlap", true);
    map.setPaintProperty(MAIN_LAYER, "icon-occlusion-opacity", 1);
    map.setPaintProperty(MAIN_LAYER, "text-occlusion-opacity", 1);

    map.setTerrain({ "source": "mapbox-dem", "exaggeration": 1.5 });

    map.addInteraction("click", {
        type: "click",
        target: { layerId: MAIN_LAYER },
        handler: async ({ feature }) => {
            if (selectedFeature) {
                map.setFeatureState(selectedFeature, { selected: false });
            }
            selectedFeature = feature;
            map.setFeatureState(feature, { selected: true });
            await showCard(feature);
            map.resize();
            map.flyTo({
                center: feature.geometry.coordinates
            });
        }
    });

    map.on("mouseenter", MAIN_LAYER, () => {
        map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", MAIN_LAYER, () => {
        map.getCanvas().style.cursor = "";
    });
});

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

document.querySelector("#my-location").addEventListener("click", geoFindMe);
