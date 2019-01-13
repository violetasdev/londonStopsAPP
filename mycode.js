//London Transport System: Bikes Point

$app_key = "99bdf9206cad4ac63ae64fd0720e2fc9";
$app_id = "bc564d5d";

$bike_service_url = "https://api.tfl.gov.uk/BikePoint";
$service_url = "https://api.tfl.gov.uk/line/24/stoppoints";
$JSONProxy = "https://jsonp.afeld.me/?callback=?&url=";


var currentStation;
var stations;
var estaciones;
var currentStationIndex;

//Show all button event: Get the information from the server
$(document).on("click", "#info", function () {
    $.mobile.changePage("#home");
});


$(document).on("click", "#start", function () {
    $.mobile.changePage("#search");
    //Prevent the usual navigation behaviour
    event.preventDefault();
    $.getJSON($service_url + "?app_id=" + $app_id + "&app_key=" + $app_key, function (result) {

        let filtro = {};
        let i = 0;
        for (let c = 0; c < result.length; c++) {
            if (typeof result[c]['indicator'] !== 'undefined') {
                filtro[i] = result[c];
                i++;
            }
        }
        PopulateList(filtro);
    });
});


//Map View button event: change page to map view 
$(document).on("click", "#mview", function () {
    //Prevent the usual navigation behaviour
    $.mobile.changePage("#mapPage");

    event.preventDefault();
    $.getJSON($service_url + "?app_id=" + $app_id + "&app_key=" + $app_key, function (result) {

        let filtro = {};
        let i = 0;
        for (let c = 0; c < result.length; c++) {
            if (typeof result[c]['indicator'] !== 'undefined') {
                filtro[i]=result[c];
                i++;
            }
        }

        estaciones = filtro;
        drawStops(filtro);
    });

});

//Events to Navigate to Details
$(document).on("pagebeforeshow", "#home", function () {
    $(document).on("click", "#to_details", function (e) {
        //Stop more events
        e.preventDefault();
        e.stopImmediatePropagation();
        //Store the current item in the list
        currentStation = stations[e.target.children[0].id];
        //Change to the new page
        $.mobile.changePage("#details");

    });

});

//Event to Populate UI of Details
$(document).on("pagebeforeshow", "#details", function (e, data) {

    if (typeof data.prevPage[0].id !== 'undefined') {
        if (data.prevPage[0].id === "mapPage") {
            currentStation = estaciones[currentStationIndex];
        }
    }

    //Get Icon
    $('#stationIcon').attr('src', 'img/bus-stop-red128.png');
    $('#stationIcon').attr('style', 'display:block;margin:0 auto;');
    //All data for the listings

    $('#stationName').text(currentStation['indicator']+" "+currentStation['commonName']);
    $('#Name').text(currentStation['indicator']+" "+currentStation['commonName']);
    $('#Type').text(currentStation['placeType']);
    $('#Status').text(currentStation['status']);

    for (i = 0; i < currentStation['additionalProperties'].length; i++) {

        switch (currentStation['additionalProperties'][i]['key']) {
            case 'PhoneNo':
                $('#Phone').text(currentStation['additionalProperties'][i]['value']);
                break;

            case 'Address':
                $('#Address').text(currentStation['additionalProperties'][i]['value']);
                break;

            case 'WiFi':
                $('#Wifi').text(currentStation['additionalProperties'][i]['value']);
                break;

            case 'Toilets':
                $('#Toilets').text(currentStation['additionalProperties'][i]['value']);
                break;

            case 'Waiting Room':
                $('#Waiting').text(currentStation['additionalProperties'][i]['value']);
                break;

            case 'Help Points':
                $('#Help').text(currentStation['additionalProperties'][i]['value']);

            case 'Car Park':
                $('#Car').text(currentStation['additionalProperties'][i]['value']);
                break;
        }
    }
});


//Populate the data from service to the UI
function PopulateList(data) {
    stations = data;
    //Remove Previous ones
    $('#stations_list li').remove();
    //Add new stations to the listview
    $.each(stations, function (index, station) {
        $('#stations_list').append('<li><a id="to_details" href="#">' + station['indicator'] + " " + station['commonName'] + '<span id="' + index + '"></span></a></li>');
    });
    //Refresh list
    $('#stations_list').listview('refresh');
}

function drawStops(data) {

    $.each(data, function (index, station) {

        console.log(station);

        let a = station;

        console.log(a);
        if (typeof a['indicator'] === 'undefined') {
            a['indicator'] = '';
        }

        var geojsonFeature = {
            "type": "Feature",
            "properties": {
                "name": index,
                "amenity": "Bus Stop",
                "popupContent": "<a href='#' onclick='sendAway(" + index + ");'>" + a['indicator'] + " " + a['commonName'] + "</a>"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [a['lon'], a['lat']]
            }
        };

        var geojsonMarkerOptions = {
            radius: 10,
            fillColor: "#D20808",
            color: "#D20808",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        L.geoJSON(geojsonFeature, {
            onEachFeature: onEachFeature,
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, geojsonMarkerOptions);
            }
        }).addTo(map);
    });

    setTimeout(function () { map.invalidateSize() }, 100);
}

function sendAway(indexRetrive) {
    currentStationIndex = indexRetrive;
    $.mobile.pageContainer.pagecontainer("change", "#details");
}

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent? Yas, it is defined in the GeoJSON ;)
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }

    layer.on('click', function (e) {
        var latLngs = [e.latlng];
        var markerBounds = L.latLngBounds(latLngs);
        map.fitBounds(markerBounds);
    });
}