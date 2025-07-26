const SNOW_CODES = [600, 601, 602, 611, 612, 613, 620, 621, 622];
const RAIN_CODES = [500, 501, 502, 503, 504, 520, 521, 522, 531];
const SNOW_RAIN_CODES = [511, 615, 616];
let currentLightPreset = null;
let currentSnowRain = null;

const card = document.getElementById("properties");
async function showCard(feature) {
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
    const locationFile = `${feature.properties.code}.jpg`.toLowerCase();
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
function setLightPreset(timing, textColor) {
    map.setConfigProperty('basemap', 'lightPreset', timing);
    map.setPaintProperty(MAIN_LAYER, 'text-color', textColor);
}

function changeLightPreset(inputTiming, inputTextColor) {
    if (inputTiming == "auto (Mississauga)") {
        const timeZone = 'America/Toronto';
        const date = new Date();
        const formatter = new Intl.DateTimeFormat('en-CA', {timeZone: timeZone, hour: 'numeric', hour12: false});        
        const currentHour = formatter.format(date);
    
        switch (true) {
            case (currentHour >= 5 && currentHour <= 6):
                setLightPreset("dawn", "#000");
                break;
            case (currentHour >= 7 && currentHour <= 17):
                setLightPreset("day", "#000");
                break;
            case (currentHour >= 18 && currentHour <= 19):
                setLightPreset("dusk", "#fff");
                break;
            default:
                setLightPreset("night", "#fff");
        }
    }
    else {
        setLightPreset(inputTiming, inputTextColor);
    }
    currentLightPreset = inputTiming;
    document.getElementById("time-button").innerHTML = `Timing: ${inputTiming}`
}

function setSnowPreset(den, int, cen, dir, opa, size, vig) {
    map.setSnow({
        density: den,
        intensity: int, "center-thinning": cen,
        direction: dir,
        opacity: opa,
        color: "#fff",
        'flake-size': size,
        vignette: vig,
    });
}

function setRainPreset(den, int, opa, vig, dir, size, dis, cen) {
    map.setRain({
        density: den,
        intensity: int,
        color: "#a8baed",
        opacity: opa,
        vignette: vig, 'vignette-color': '#464646',
        direction: dir,
        'droplet-size': size,
        'distortion-strength': dis,
        'center-thinning': cen 
    });
}

function setSnowRainPreset(condition) {
    if (condition == "snow") {
        setSnowPreset(zoomBasedReveal(0.85), 1, 0.1, [0, 0], 1, 0.71, zoomBasedReveal(0.3))
        setRainPreset(0, 0, 0, 0, [0, 0], [0, 0], 0, 0);
    }
    else if (condition == "rain") {
        setSnowPreset(0, 0, 0, [0, 0], 0, 0, 0, false)
        setRainPreset(zoomBasedReveal(0.5), 1, 0.7, zoomBasedReveal(1.0), [0, 80], [2.6, 18.2], 0.7, 0);
    }
    else if (condition == "snow + rain") {
        setSnowPreset(zoomBasedReveal(0.85), 1, 0.1, [0, 0], 1, 0.71, zoomBasedReveal(0.3))
        setRainPreset(zoomBasedReveal(0.5), 1, 0.7, zoomBasedReveal(1.0), [0, 80], [2.6, 18.2], 0.7, 0);
    }
    else {
        setSnowPreset(0, 0, 0, [0, 0], 0, 0, 0);
        setRainPreset(0, 0, 0, 0, [0, 0], [0, 0], 0, 0);
    }
}

async function changeSnowRainPreset(inputSnowRain) {
    if (inputSnowRain == "auto (Mississauga)") {
        const weatherId = await checkWeather();
        console.log('Weather ID:', weatherId);
        if (SNOW_CODES.includes(weatherId)) {
            setSnowRainPreset("snow");
        } else if (RAIN_CODES.includes(weatherId)) {
            setSnowRainPreset("rain");
        } else if (SNOW_RAIN_CODES.includes(weatherId)) {
            setSnowRainPreset("snow + rain");
        } else {
            setSnowRainPreset("none");
        }
    }
    else {
        setSnowRainPreset(inputSnowRain);
    }
    currentSnowRain = inputSnowRain;
    document.getElementById("weather-button").innerHTML = `Weather: ${inputSnowRain}`
}

const map = new mapboxgl.Map({
    style: 'mapbox://styles/mapbox/standard?optimize=true',
    center: [-79.661979, 43.548187],
    zoom: 16.5,
    minZoom: 14.5,
    maxZoom: 18,
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
                            'match', ['get', 'type'],
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

            changeLightPreset("auto (Mississauga)", "#fff");
            changeSnowRainPreset("auto (Mississauga)");
        }
    );

    if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512
        });
    }

    map.setTerrain({ "source": "mapbox-dem", "exaggeration": 7 });

    map.addInteraction("click", {
        type: "click",
        target: { layerId: MAIN_LAYER },
        handler: async ({ feature }) => {
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
