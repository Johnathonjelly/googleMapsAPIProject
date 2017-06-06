//Author: Johnathon Southworth
//Class: CS233js Jeff Miller
//Lab: 3 -- Traveling Brad
//Goal: Let user plot points on a "map", calculate shortest route, show avatar of user taking that route

//remove table stuff 
//https://stackoverflow.com/questions/3387427/remove-element-by-id
Element.prototype.remove = function () {
  this.parentElement.removeChild(this);
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
  for (var i = this.length - 1; i >= 0; i--) {
    if (this[i] && this[i].parentElement) {
      this[i].parentElement.removeChild(this[i]);
    }
  }
};
const milesTD = document.querySelector('.miles');
let markers = []; //array to hold info about markers added to map


//Only load this script after the html is parsed
//once the content is loaded inject the google map into the head. same as a <script src=""> but other pages that do not contain a map(and if checking for element of Map) wont get all this extra API stuff forced onto them to load
document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelectorAll('#map').length > 0) {
    const js_file = document.createElement('script');
    js_file.type = 'text/javascript';
    js_file.src = 'https://maps.googleapis.com/maps/api/js?callback=initMap&key=AIzaSyDv5RCfRsksmep6lfnxBb-VaCyqFfGaNmw&&libraries=geometry';
    document.getElementsByTagName('head')[0].appendChild(js_file);
  }
});



initMap = () => {

  let map; //map
  let polyLine; //"draw" line on map
  let polyOptions; //options for polyline 


  //calculate the distance between two markers -- returns a value in meters
  function calcDistance(fromLat, fromLng, toLat, toLng) {
    return google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(fromLat, fromLng), new google.maps.LatLng(toLat, toLng));
  }


  const directionsService = new google.maps.DirectionsService(); //google maps direction service AP
  const renderOps = {
    draggable: true,
    suppressInfoWindows: true,
    suppressMarkers: true,
    preserveViewport: true
  }; //direction renderer options

  const directionsDisplay = new google.maps.DirectionsRenderer(renderOps); //render directions API

  //latlng for GP so that when the map is loaded it is centered on GP
  const grantsPass = {
    lat: 42.434113,
    lng: -123.333166
  };

  //polyline is line between map markers -- make it an arrow line ->
  let lineSymbol = {
    path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
    scale: 1.5
  };

  //make a function that will create a table labeling the markers position(lat,lng) -- append table to dom and update each time a new marker is placed 
  let createPositionT = () => {
    //remove table first then update//
    ///------------------///
    //remove the position table 
    let removePositionTable = document.getElementsByTagName('table')[1];
    if (removePositionTable) {
      removePositionTable.remove();
    } else {
      console.log('No table to be removed');
    }
    //remove distance table
    let removeDistanceTable = document.getElementsByTagName('table')[2];
    if (removeDistanceTable) {
      removeDistanceTable.remove();
    } else {
      console.log('No table to be removed');
    }

    ///-----------------///
    //-----table making
    const table1 = document.createElement('table');
    const tHead1 = document.createElement('thead');
    const tr1 = document.createElement('tr');
    document.body.appendChild(table1);
    table1.appendChild(tHead1);
    tr1.appendChild(document.createElement('th')).appendChild(document.createTextNode('Marker Index'));
    tr1.appendChild(document.createElement('th')).appendChild(document.createTextNode('Latitude'));
    tr1.appendChild(document.createElement('th')).appendChild(document.createTextNode('Longitude'));
    tHead1.appendChild(tr1);
    for (let i = 0; i < markers.length; i += 1) {
      table1.appendChild(document.createElement('tr')).appendChild(document.createElement('td')).appendChild(document.createTextNode(`Marker: ${i}`));
      table1.childNodes[`${i + 1}`].appendChild(document.createElement('td')).appendChild(document.createTextNode(`${markers[i].position.lat()}`));
      table1.childNodes[`${i + 1}`].appendChild(document.createElement('td')).appendChild(document.createTextNode(`${markers[i].position.lng()}`));
    }


    const table2 = document.createElement('table');
    const tHead2 = document.createElement('thead');
    const tr2 = document.createElement('tr');
    document.body.appendChild(table2);
    table2.appendChild(tHead2);
    tr2.appendChild(document.createElement('th')).appendChild(document.createTextNode('Distance Between'));
    tr2.appendChild(document.createElement('th')).appendChild(document.createTextNode(`Marker: Index`));
    tHead2.appendChild(tr2);
    for (let i = 0; i < markers.length; i += 1) {
      table2.appendChild(document.createElement('tr')).appendChild(document.createElement('td')).appendChild(document.createTextNode(`Marker: ${i}`));
      table2.childNodes[`${i + 1}`].appendChild(document.createElement('td')).appendChild(document.createTextNode(`${calcDistance(markers[i].position.lat(), markers[i].position.lng()) * 0.00062137}`));
      table2.childNodes[`${i + 1}`].appendChild(document.createElement('td')).appendChild(document.createTextNode(`${calcDistance(markers[`${i + 1}`].position.lat(), markers[`${i + 1}`].position.lng()) * 0.00062137}`));
    }
  }




  //set line options 
  polyOptions = {
    strokeColor: '#3f2f2f',
    strokeOpacity: .6,
    strokeWeight: 3,
    geodesic: true,
    icons: [{
      icon: lineSymbol,
      repeat: '100px'
    }],
  };

  map = new google.maps.Map(document.getElementById('map'), {
    center: grantsPass, //on first load of map, center view over GP
    zoom: 8,
    gestureHandling: "cooperative" //enable gestures
  });

  polyLine = new google.maps.Polyline(polyOptions); //init polyline
  polyLine.setMap(map);

  google.maps.event.addListener(map, 'click', function (event) {
    addMarker(event); //add marker on click
  });

  addMarker = (event) => {
    let path = polyLine.getPath();
    path.push(event.latLng);

    let marker = new google.maps.Marker({
      position: event.latLng,
      map: map,
      draggable: true,
    });


    //remove marker when clicked on 
    google.maps.event.addListener(marker, 'click', function () {
      removePoint(marker);
    });

    google.maps.event.addListener(marker, 'dragend', function () {
      for (let i = 0; i < markers.length; i++) {
        if (markers[i] == marker) {
          // when dragging a marker update the polyline correctly
          polyLine.getPath().setAt(i, marker.getPosition());
          break;
        }
      }
    });
    markers.push(marker);
    map.setCenter(event.latLng);
    //get the line length in meters
    const meters = google.maps.geometry.spherical.computeLength(polyLine.getPath());
    //convert line length to miles
    let length = meters * 0.00062137;
    //append miles to html table
    milesTD.innerHTML = length.toFixed(2);
    // for (let i = 0; i < markers.length; i += 1) {
    //   console.log(`Lat: ${markers[i].position.lat()} 
    //   Lng: ${markers[i].position.lng()}`);
    // }
    createPositionT();
  }


  //remove marker
  removePoint = (marker) => {
    for (let i = 0; i < markers.length; i++) {
      if (markers[i] == marker) {
        // delete marker at correct index
        markers[i].setMap(null);
        markers.splice(i, 1);
        // delete the line too
        polyLine.getPath().removeAt(i);
      }
    }
  };
}