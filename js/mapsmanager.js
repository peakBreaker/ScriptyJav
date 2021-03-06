var polygon = null;
var drawingManager;
var directionsService;
var directionsDisplay;
var searchBox;
// callback function so the google maps libs can load before we access them
var initMap = function () {
    // Init directionsService from google maps api
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});

    // Enable autocomplete on the searchbox
    // Create a searchbox in order to execute a places search
    searchBox = new google.maps.places.SearchBox(
        document.getElementById('places-search'));
    // Bias the searchbox to within the bounds of the map.
    searchBox.setBounds(map.getBounds());

    // And drawingmanager
    drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON
      ]
    }
  });

  drawingManager.addListener('overlaycomplete', function(event) {
    // If editable polygon is added later, it must first clear the old one here
    // Switching the drawing mode to the HAND (i.e., no longer drawing).
    drawingManager.setDrawingMode(null);
    // Creating a new editable polygon from the overlay.
    polygon = event.overlay;
    polygon.setEditable(false);
    // Searching within the polygon.
    searchWithinPolygon(polygon, drawingManager.searchLocs);
    // Make sure the search is re-done if the poly is changed.
    polygon.getPath().addListener('set_at', searchWithinPolygon);
    polygon.getPath().addListener('insert_at', searchWithinPolygon);
  });
};

// polygon <-> markers --- Iterate over markers
function searchWithinPolygon(polygon, locations) {
  for (var i = 0; i < locations.length; i++) {
    var position = new google.maps.LatLng(locations[i].lat, locations[i].lng);
    if (google.maps.geometry.poly.containsLocation(position, polygon)) {
      locations[i].inPolygon(true);
    } else {
      locations[i].inPolygon(false);
    }
  }
}

function calculateAndDisplayRoute(viewmodel) {
  var origin = viewmodel.selectedStart();
  // console.log(origin);
  var dest = origin;
  var waypts = [];
  viewmodel.filteredLocations().forEach(function(loc){
    waypts.push({
        location: new google.maps.LatLng(loc.lat, loc.lng),
        stopover: true
      });
  });

  // This is where we get the route
  directionsService.route({
    // First we specify the parameters for our api request
    origin: origin,
    destination: dest,
    waypoints: waypts,
    optimizeWaypoints: true,
    travelMode: 'DRIVING'
  }, function(response, status) {
    if (status === 'OK') {
      // And display the results
      // console.log(response);
      directionsDisplay.setDirections(response);
      var route = response.routes[0];
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}
