// //API key AIzaSyDv5RCfRsksmep6lfnxBb-VaCyqFfGaNmw

//Only load this script after the html is parsed
//once the content is loaded inject the google map into the head. same as a <script src=""> but other pages that do not contain a map(an if checking for element of Map) wont get all this extra API stuff forced onto them to load
document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelectorAll('#map').length > 0) {
    const js_file = document.createElement('script');
    js_file.type = 'text/javascript';
    js_file.src = 'https://maps.googleapis.com/maps/api/js?callback=initMap&key=AIzaSyDv5RCfRsksmep6lfnxBb-VaCyqFfGaNmw&language=en';
    document.getElementsByTagName('head')[0].appendChild(js_file);
  }
});

//contact google maps API for the js_file src. callback = initMap() is defined below. by default google maps loads in english



let map; //global map
//latlng for GP so that when the map is loaded it is centered on GP
const grantsPass = {
  lat: 42.434113,
  lng: -123.333166
};

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: grantsPass,
    zoom: 8
  });
  const markerA = new google.maps.Marker({
    position: grantsPass,
    map: map,
    animation: google.maps.Animation.DROP,
    label: "A"
  });
}
