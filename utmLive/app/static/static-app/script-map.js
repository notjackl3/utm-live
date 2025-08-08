const SNOW_CODES = [600, 601, 602, 611, 612, 613, 620, 621, 622];
const RAIN_CODES = [500, 501, 502, 503, 504, 520, 521, 522, 531];
const SNOW_RAIN_CODES = [511, 615, 616];
let currentLightPreset = null;
let currentSnowRainPreset = null;
let currentStartPoint = null;
let currentStopPoint = null;
let currentStartLocation = null;
let currentStopLocation = null;
let isSelecting = false;
const card = document.getElementById("properties");


// show popup cards of campus locations and their properties
function showCard(feature) {
    const OPHCoordinates = [-79.66589793562889, 43.54872793439594];
    const KNCoordinates = [-79.6631433069706, 43.548295871123116];

    // drawRoute(locationCoordinates, OPHCoordinates)
    // drawRoute(OPHCoordinates, KNCoordinates);

    card.innerHTML = "";
    const container = document.createElement("div");
    container.className = "map-overlay-inner";

    const buttonWrapper = document.createElement("div");
    buttonWrapper.classList.add("button-wrapper");
    buttonWrapper.setAttribute("data-code", feature.properties.code);

    const directionButton = document.createElement("button");
    directionButton.classList.add("base-button");
    directionButton.innerHTML = "get direction";
    directionButton.addEventListener("click", () => {
        startRoute(feature)
    });
    buttonWrapper.appendChild(directionButton)

    if (authenticated) {
        if (codeIds.includes(feature.properties.code)) {
            const removeFavButton = document.createElement("button");
            removeFavButton.classList.add("base-button", "fav-button");
            removeFavButton.innerHTML = "remove from favourites";
            removeFavButton.addEventListener("click", () => {
                removeFromFav(feature.properties.code);
            });
            buttonWrapper.appendChild(removeFavButton);
        }
        else {
            const favButton = document.createElement("button");
            favButton.classList.add("base-button", "fav-button");
            favButton.innerHTML = "add to favourites";
            favButton.addEventListener("click", () => {
                addToFav(feature.properties.code);
            });
            buttonWrapper.appendChild(favButton);
        }
    }

    const closeButton = document.createElement("button");
    closeButton.classList.add("base-button", "close-button");
    closeButton.innerHTML = "close";
    closeButton.addEventListener("click", hideCard);
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

function showRouteCard() {    
    card.innerHTML = "";
    const container = document.createElement("div");
    container.className = "map-overlay-inner";

    const buttonWrapper = document.createElement("div");
    buttonWrapper.classList.add("button-wrapper");

    const addLocationButton = document.createElement("button");
    addLocationButton.classList.add("base-button", "close-button");
    addLocationButton.innerHTML = "add stop";
    addLocationButton.addEventListener("click", hideCard);
    buttonWrapper.appendChild(addLocationButton)

    const closeButton = document.createElement("button");
    closeButton.classList.add("base-button", "close-button");
    closeButton.innerHTML = "close";
    closeButton.addEventListener("click", hideCard);
    buttonWrapper.appendChild(closeButton)

    const routingWrapper = document.createElement("div");
    routingWrapper.style.display = "flex";
    routingWrapper.style.flexDirection = "column";
    routingWrapper.style.justifyContent = "end";
    routingWrapper.setAttribute("data-start", currentStartPoint);
    routingWrapper.setAttribute("data-stop", currentStopPoint);

    const startLabel = document.createElement("h3");
    startLabel.textContent = "Start from";
    startLabel.style.color = "var(--main-color)"
    startLabel.style.marginTop = "3px";
    routingWrapper.appendChild(startLabel);

    const location1Wrapper = document.createElement("div");
    location1Wrapper.style.display = "flex";
    location1Wrapper.classList.add("location-info")
    location1Wrapper.style.marginBottom = "15px"

    const location1Field = document.createElement("input");
    location1Field.type = "text";
    location1Field.placeholder = "Enter your starting point";
    location1Field.value= currentStartLocation;
    location1Field.classList.add("base-field");
    location1Wrapper.appendChild(location1Field)

    const location1Button = document.createElement("button");
    location1Button.classList.add("base-button", "location-select-button");
    location1Button.style.maxHeight = "40px";
    location1Button.innerHTML = "select";
    location1Wrapper.appendChild(location1Button)
    location1Button.addEventListener("click", () => {
        selectLocation("start");
    });
    routingWrapper.appendChild(location1Wrapper)

    const stopLabel = document.createElement("h3");
    stopLabel.textContent = "Stop at";
    stopLabel.style.color = "var(--main-color)"
    stopLabel.style.marginTop = "3px";
    routingWrapper.appendChild(stopLabel);

    const location2Wrapper = document.createElement("div");
    location2Wrapper.style.display = "flex";
    location2Wrapper.classList.add("location-info")
    location2Wrapper.style.marginBottom = "15px"

    const location2Field = document.createElement("input");
    location2Field.type = "text";
    location2Field.placeholder = "Enter your stopping point";
    location2Field.value= currentStopLocation;
    location2Field.classList.add("base-field");
    location2Wrapper.appendChild(location2Field)

    const location2Button = document.createElement("button");
    location2Button.classList.add("base-button", "location-select-button");
    location2Button.style.maxHeight = "40px";
    location2Button.innerHTML = "select";
    location2Button.addEventListener("click", () => {
        selectLocation("stop");
    });
    location2Wrapper.appendChild(location2Button)

    routingWrapper.appendChild(location2Wrapper)

    container.appendChild(buttonWrapper);
    container.appendChild(routingWrapper);
    card.appendChild(container);
    card.style.display = "block";
    map.resize();

    drawRoute(currentStartPoint, currentStopPoint);
}

// set the map lighting
function setLightPreset(timing, textColor) {
    map.setConfigProperty('basemap', 'lightPreset', timing);
    map.setPaintProperty(MAIN_LAYER, 'text-color', textColor);
}
// set the snow level
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
// set the rain level
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
// set the weather condition (snow and rain)
function setSnowRainPreset(inputCondition) {
    if (inputCondition == "snow") {
        setSnowPreset(zoomBasedReveal(0.85), 1, 0.1, [0, 0], 1, 0.71, zoomBasedReveal(0.3))
        setRainPreset(0, 0, 0, 0, [0, 0], [0, 0], 0, 0);
    }
    else if (inputCondition == "rain") {
        setSnowPreset(0, 0, 0, [0, 0], 0, 0, 0, false)
        setRainPreset(zoomBasedReveal(0.5), 1, 0.7, zoomBasedReveal(1.0), [0, 80], [2.6, 18.2], 0.7, 0);
    }
    else if (inputCondition == "snow + rain") {
        setSnowPreset(zoomBasedReveal(0.85), 1, 0.1, [0, 0], 1, 0.71, zoomBasedReveal(0.3))
        setRainPreset(zoomBasedReveal(0.5), 1, 0.7, zoomBasedReveal(1.0), [0, 80], [2.6, 18.2], 0.7, 0);
    }
    else {
        setSnowPreset(0, 0, 0, [0, 0], 0, 0, 0);
        setRainPreset(0, 0, 0, 0, [0, 0], [0, 0], 0, 0);
    }
}

// logic to change the lighting
function changeLightPreset(inputTiming, inputTextColor) {
    if (inputTiming == "auto (Mississauga)") {
        // detect and update timing based on the current time of Missisauga
        const timeZone = 'America/Toronto';
        const date = new Date();
        const formatter = new Intl.DateTimeFormat('en-CA', {timeZone: timeZone, hour: 'numeric', hour12: false});        
        const currentHour = formatter.format(date);
        // change lighting based on the hour of the day
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
    currentLightPreset = inputTiming; // update the current lighting setting
    document.getElementById("time-button").innerHTML = `Timing: ${inputTiming}` // update button
}
// logic to change the weather (snow and rain)
async function changeSnowRainPreset(inputSnowRain) {
    if (inputSnowRain == "auto (Mississauga)") {
        // check for the current weather of Mississauga
        const weatherId = await checkWeather(); // return the weather code
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
    currentSnowRainPreset = inputSnowRain; //  update the current weather setting
    document.getElementById("weather-button").innerHTML = `Weather: ${inputSnowRain}` // update button
}

// initiate a new map
const map = new mapboxgl.Map({
    // this style will have 3d buildings by default
    style: 'mapbox://styles/mapbox/standard?optimize=true',
    // style: 'mapbox://styles/mapbox/streets-v12',
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
// wait for the map to load before adding sources and layers
map.on("style.load", async () => {
    if (!map.getSource("locations-source")) {
        map.addSource("locations-source", {
            // type: "vector",
            // url: "mapbox://notjackl3.cmcvdx7l205vy1ppgk03k5ks9-1urvz", this will reflect changes on mapbox, currently we use the local geojson data
            type: "geojson",
            data: GEOJSON_DATA_URL,
        });
    }

    map.addSource('utm-buildings', {
        type: 'vector',
        url: 'mapbox://notjackl3.cmdu5rhkkcs091npcf42yg8so-7ubzj'
        // type: "geojson",
        // data: GEOJSON_BUILDINGS_DATA_URL,
    });

    // add 3d buildings using geojson file above
    // map.addLayer({
    //     'id': 'utm-buildings-layer',
    //     'type': 'fill-extrusion',
    //     'source': 'utm-buildings',
    //     // 'source-layer': "utm",
    //     'paint': {
    //         'fill-extrusion-color': '#fff', 
    //         'fill-extrusion-height': ['get', 'height'], 
    //         // 'fill-extrusion-base': ['get', 'base_height_property'],
    //         'fill-extrusion-opacity': 0.8
    //     }
    // });

    await map.loadImage('/static/static-app/assets/location-fav.png', (error, image) => {
        if (error) throw error;
        map.addImage('location-fav-icon', image, { sdf: true });
    });

    await map.loadImage('/static/static-app/assets/location.png', // load up custom icon images
        (error, image) => {
            if (error) throw error;
            map.addImage('location-icon', image, { sdf: true }); // sdf to allow changing colors
            
            if (!map.getLayer(MAIN_LAYER)) {
                map.addLayer({
                    id: MAIN_LAYER,
                    type: 'symbol',
                    source: 'locations-source',
                    // 'source-layer': 'utm-buildings', this is only used for vector tilesets
                    minzoom: 14,   
                    maxzoom: 22, 
                    layout: {
                        'icon-image': [
                            'case',
                            ['in', ['get', 'code'], ['literal', codeIds]], 'location-fav-icon',
                            'location-icon'
                        ],
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
                        'case',
                        ['in', ['get', 'code'], ['literal', codeIds]], '#f1c40f',
                        ['match', ['get', 'type'],
                            'academic building', '#e74c3c',
                            'campus building', '#27ae60',
                            'student building', '#2980b9',
                            '#888888'
                        ]
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

    map.setTerrain({ "source": "mapbox-dem", "exaggeration": 2 });

    map.addInteraction("click", {
        type: "click",
        target: { layerId: MAIN_LAYER },
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

    map.on("mouseenter", MAIN_LAYER, () => {
        map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", MAIN_LAYER, () => {
        map.getCanvas().style.cursor = "";
    });
});
