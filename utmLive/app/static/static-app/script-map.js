const card = document.getElementById("properties");
function showCard(feature) {
    card.innerHTML = "";
    const container = document.createElement("div");
    container.className = "map-overlay-inner";

    const closeButton = document.createElement("button");
    closeButton.classList.add("base-button", "close-button");
    closeButton.innerHTML = "close";
    closeButton.addEventListener("click", hideCard);

    const favButton = document.createElement("button");
    favButton.classList.add("base-button", "fav-button");
    favButton.innerHTML = "add to favourites";
    favButton.addEventListener("click", () => {
        addToFav(feature.properties.code);
    });

    const buttonWrapper = document.createElement("div");
    buttonWrapper.style.display = "flex";
    buttonWrapper.style.justifyContent = "end";
    buttonWrapper.appendChild(favButton)
    buttonWrapper.appendChild(closeButton)
    container.appendChild(buttonWrapper);

    const locationName = document.createElement("h1");
    locationName.textContent = feature.properties.name;
    locationName.className = "location-name";
    container.appendChild(locationName);

    var locationFile = "";
    const list = document.createElement("ul");

    function createFeature(key, value) {
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

    createFeature("name", feature.properties.name)
    createFeature("tags", feature.properties.tags)
    locationFile = `${feature.properties.code}.jpg`.toLowerCase(); 
    container.appendChild(list);
    card.appendChild(container);

    const locationImage = document.createElement("img");
    locationImage.src = getImagePath(`outside-${locationFile}`);
    locationImage.className = "location-image";
    locationImage.onload = () => {
        card.appendChild(locationImage);
    };

    const locationImage2 = document.createElement("img");
    locationImage2.src = getImagePath(`inside-${locationFile}`);
    locationImage2.className = "location-image";
    locationImage2.onload = () => {
        card.appendChild(locationImage2);
    };

    card.style.display = "block";
};
function hideCard() {
    card.style.display = "none";
    map.resize();
}

const map = new mapboxgl.Map({
    style: 'mapbox://styles/mapbox/standard',
    center: [-79.661979, 43.548187],
    zoom: 16.5,
    minZoom: 14.5,
    maxZoom: 19,
    pitch: 55,
    bearing: 20,
    container: "map",
    antialias: true,
    config: {
        basemap: {
          showPointOfInterestLabels: false, 
        },
    },
});

let currentLightPreset = null;

map.on("style.load", async () => {
    let selectedFeature = null;

    if (!map.getSource("locations-source")) {
        map.addSource("locations-source", {
            type: "vector",
            url: "mapbox://notjackl3.cmcvdx7l205vy1ppgk03k5ks9-9m35t"
        });
    }

    await map.loadImage(
        '/static/static-app/assets/location.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('location-icon', image, { sdf: true });
            
            if (!map.getLayer(MAIN_LAYER)) {
                map.addLayer({
                    id: MAIN_LAYER,
                    type: 'symbol',
                    source: 'locations-source',
                    'source-layer': 'test',
                    minzoom: 14,   
                    maxzoom: 22, 
                    layout: {
                        'icon-image': 'location-icon',
                        'icon-size': ['interpolate', ['linear'], ['zoom'], 14, 0.01, 19, 0.2],
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true,

                        'text-field': ['get', 'name'],      
                        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                        'text-anchor': 'center',
                        'text-offset': ['interpolate', ['linear'], ['zoom'], 14, ['literal', [0, 2]], 19, ['literal', [0, 5]] ],
                        'text-size': ['interpolate', ['linear'], ['zoom'], 14, 10, 19, 14],
                        'text-allow-overlap': true,
                        'text-ignore-placement': true
                    },
                    paint: {
                        'icon-color': [
                            'match',
                            ['get', 'type'],
                            'academic building', '#e74c3c',  
                            'campus building', '#27ae60',    
                            'student building', '#2980b9',   
                            '#888888'                        
                        ],
                        'icon-opacity': 1,
                        'icon-occlusion-opacity': 1,    
                        'icon-emissive-strength': 1,    
                                                
                        'text-opacity': ['interpolate', ['linear'], ['zoom'], 14.5, 0, 16.5, 1],
                        'text-occlusion-opacity': 1,
                    }
                });
            }

            let currentTime = new Date();
            let currentHour = currentTime.getHours();
        
            switch (true) {
                case (currentHour >= 5 && currentHour <= 6):
                    map.setConfigProperty('basemap', 'lightPreset', 'dawn');
                    currentLightPreset = "dawn";
                    map.setPaintProperty(MAIN_LAYER, 'text-color', '#fff');
                    break;
                case (currentHour >= 7 && currentHour <= 17):
                    map.setConfigProperty('basemap', 'lightPreset', 'day');
                    currentLightPreset = "day";
                    map.setPaintProperty(MAIN_LAYER, 'text-color', '#000');
                    break;
                case (currentHour >= 18 && currentHour <= 19):
                    map.setConfigProperty('basemap', 'lightPreset', 'dusk');
                    currentLightPreset = "dusk";
                    map.setPaintProperty(MAIN_LAYER, 'text-color', '#000');
                    break;
                default:
                    map.setConfigProperty('basemap', 'lightPreset', 'night');
                    currentLightPreset = "night";
                    map.setPaintProperty(MAIN_LAYER, 'text-color', '#fff');
            }
        }
    );

    if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512
        });
    }

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
document.querySelector("#my-location-button").addEventListener("click", geoFindMe);

function switchTime() {
    console.log()
    if (currentLightPreset == "dawn") {
        map.setConfigProperty('basemap', 'lightPreset', 'day');
        currentLightPreset = "day";
        map.setPaintProperty(MAIN_LAYER, 'text-color', '#000');
    }
    else if (currentLightPreset == "day") {
        map.setConfigProperty('basemap', 'lightPreset', 'dusk');
        currentLightPreset = "dusk";
        map.setPaintProperty(MAIN_LAYER, 'text-color', '#fff');
    }
    else if (currentLightPreset == "dusk") {
        map.setConfigProperty('basemap', 'lightPreset', 'night');
        currentLightPreset = "night";
        map.setPaintProperty(MAIN_LAYER, 'text-color', '#fff');
    }
    else {
        map.setConfigProperty('basemap', 'lightPreset', 'dawn');
        currentLightPreset = "dawn";
        map.setPaintProperty(MAIN_LAYER, 'text-color', '#000');
    }
}
document.querySelector("#time-button").addEventListener("click", switchTime);