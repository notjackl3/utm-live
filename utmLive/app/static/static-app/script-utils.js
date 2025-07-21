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

function addToFav(code) {
    // add location with code to favourites
}