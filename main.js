window.addEventListener('load', function () {
    init();
});

const handlePositionError = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
};

const getPointsOfInterest = async (map, boundingBox) => {
    const response = await fetch('./data.json');
    const data = await response.json();

    boundingBox.extend(map.getCenter());

    const beerColors = ['#F5DEB3', '#F4A460', '#8B4513', '#CD853F', '#DAA520', '#FFD700', '#F0E68C', '#EEE8AA', '#BDB76B', '#9ACD32'];

    const timeOuts = [];

    data.pois.forEach((poi, index) => {
        const marker = new mapboxgl.Marker({
            color: beerColors[index],
        })
            .setLngLat([poi.coords.longitude, poi.coords.latitude])
            // .setPopup(new mapboxgl.Popup().setHTML(`<strong>${poi.name}</strong>`))
            .addTo(map);

        timeOuts.push(
            setTimeout(() => {
                console.log('fitting bounds', index);
                boundingBox.extend(marker.getLngLat());
                // map.fitBounds(boundingBox, { padding: 50 });
                map.flyTo({
                    center: marker.getLngLat(),
                    zoom: 15,
                    speed: 0.5,
                    curve: 1,
                });
            }, 2000 + 2000 * index)
        );
    });

    timeOuts.push(
        setTimeout(() => {
            map.fitBounds(boundingBox, { padding: 50 });
            timeOuts.forEach((timeOut) => {
                clearTimeout(timeOut);
            });
        }, 2000 + 2000 * data.pois.length)
    );

    /*
    const bounds = markers.reduce((bounds, marker) => {
        return bounds.extend(marker.getLngLat());
    }, new mapboxgl.LngLatBounds());
    */
};

const init = () => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibHRkbiIsImEiOiJjbGoybWhydXIwZDRwM2RvMGZjZ2dwaWR2In0.vvl3SlGi0BD1DVcs2qYwqQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
    });

    const setCurrentPosition = (position) => {
        map.setCenter([position.coords.longitude, position.coords.latitude]);
        map.setZoom(15);

        const marker = new mapboxgl.Marker({
            color: '#a9ffa9',
            draggable: true,
        })
            .setLngLat([position.coords.longitude, position.coords.latitude])
            .addTo(map);

        marker.on('dragend', () => {
            const lngLat = marker.getLngLat();
            console.log(lngLat);
        });
    };

    map.on('load', async () => {
        const boundingBox = new mapboxgl.LngLatBounds();

        navigator.geolocation.getCurrentPosition(setCurrentPosition, handlePositionError);
        await getPointsOfInterest(map, boundingBox);
    });
};
