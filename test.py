import json

def delete_geojson_properties(geojson_path, properties_to_delete):
    with open(geojson_path, 'r') as f:
        geojson_data = json.load(f)

    if geojson_data['type'] == 'FeatureCollection':
        for feature in geojson_data['features']:
            if 'properties' in feature:
                for prop in properties_to_delete:
                    if prop in feature['properties']:
                        del feature['properties'][prop]
    elif geojson_data['type'] == 'Feature':
        if 'properties' in geojson_data:
            for prop in properties_to_delete:
                if prop in geojson_data['properties']:
                    del geojson_data['properties'][prop]

    with open(geojson_path, 'w') as f:
        json.dump(geojson_data, f, indent=2)

delete_geojson_properties("utm-models.geojson", ['ZArea', 'FtType'])
