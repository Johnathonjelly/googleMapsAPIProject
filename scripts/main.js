//Author: Johnathon Southworth
//Class: CS233js Jeff Miller
//Lab: 3 -- Traveling Brad
//Goal: Let user plot points on a "map", calculate shortest route, show avatar of user taking that route

const milesTD = document.querySelector('.miles');
let markers = []; //array to hold info about markers added to map


//Only load this script after the html is parsed
//once the content is loaded inject the google map into the head. same as a <script src=""> but other pages that do not contain a map(and if checking for element of Map) wont get all this extra API stuff forced onto them to load
document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelectorAll('#map').length > 0) {
    const js_file = document.createElement('script');
    js_file.type = 'text/javascript';
    js_file.src = 'https://maps.googleapis.com/maps/api/js?callback=initMap&key=AIzaSyDv5RCfRsksmep6lfnxBb-VaCyqFfGaNmw&&libraries=geometry&language=en';
    document.getElementsByTagName('head')[0].appendChild(js_file);
  }
});



initMap = () => {

  let map; //map
  let polyLine; //"draw" line on map
  let polyOptions; //options for polyline 

  //latlng for GP so that when the map is loaded it is centered on GP
  const directionsService = new google.maps.DirectionsService(); //google maps direction service AP
  const renderOps = {
    draggable: true,
    suppressInfoWindows: true,
    suppressMarkers: true,
    preserveViewport: true
  }; //direction renderer options

  const directionsDisplay = new google.maps.DirectionsRenderer(renderOps); //render directions API

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
  let createDistanceT = () => {
    //remove table first then update//
    ///------------------///
    Element.prototype.remove = function () {
      this.parentElement.removeChild(this);
    }
    NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
      for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] && this[i].parentElement) {
          this[i].parentElement.removeChild(this[i]);
        }
      }
    }
    let tableRemove = document.getElementsByTagName('table')[1];
    if (tableRemove) {
      tableRemove.remove();
    } else {
      console.log('No table to be removed');
    }

    ///-----------------///
    //-----table making
    const table = document.createElement('table');
    const tHead = document.createElement('thead');
    const tr = document.createElement('tr');
    document.body.appendChild(table);
    table.appendChild(tHead);
    tr.appendChild(document.createElement('th')).appendChild(document.createTextNode('Marker Index'));
    tr.appendChild(document.createElement('th')).appendChild(document.createTextNode('Latitude'));
    tr.appendChild(document.createElement('th')).appendChild(document.createTextNode('Longitude'));
    tHead.appendChild(tr);
    for (let i = 0; i < markers.length; i += 1) {
      table.appendChild(document.createElement('tr')).appendChild(document.createElement('td')).appendChild(document.createTextNode(`Marker: ${i}`));
      table.childNodes[`${i + 1}`].appendChild(document.createElement('td')).appendChild(document.createTextNode(`${markers[i].position.lat()}`));
      table.childNodes[`${i + 1}`].appendChild(document.createElement('td')).appendChild(document.createTextNode(`${markers[i].position.lng()}`));
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
    let meters = google.maps.geometry.spherical.computeLength(polyLine.getPath());
    let length = meters * 0.00062137;
    milesTD.innerHTML = length.toFixed(2);
    for (let i = 0; i < markers.length; i += 1) {
      console.log(`Lat: ${markers[i].position.lat()} 
      Lng: ${markers[i].position.lng()}`);
    }
    createDistanceT();

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
  }
}