//Main Map setup
//Main map and Basemaps


var map = L.map('map').setView([35.843768,-78.6450559], 11);
var hash = new L.Hash(map);
var Orthos2013 = L.esri.basemapLayer('Imagery');

//Marker for geocoder
var myIcon = L.icon({
  iconUrl: '../app/images/marker-icon-red.png',
  iconRetinaUrl: '../app/images/marker-icon-red.png',
  shadowUrl: '../app/images/marker-shadow.png'
});

//Initiate Geocoder
var GeoCoder = new L.Control.GeoSearch({
  provider: new L.GeoSearch.Provider.Google(),
  position: 'topcenter',
  showMarker: true
  }).addTo(map);

//Convert Date to Human readable
function conDate(feature){
  var date = new Date(feature);
  var d = date.getUTCDate();
  var m = date.getUTCMonth() + 1;
  var y = date.getUTCFullYear();
  var formatedDate = m + '/' + d + '/' + y;
  if (formatedDate === '1/1/1970'){
    formatedDate = null;
  }
    return formatedDate;
  }

//Popup for SSO feature class
function popup (feature, layer) {
  layer.bindPopup('<h4>Sanitary System Overflow</h4><h5>Date: <small>' + conDate(feature.properties.SSO_DATE) + '</small><h5>Address: <small>' + feature.properties.ADDRESS + '</small></h5><h5>Duration: <small>' + feature.properties.DURATION +  '</small></h5><h5>Fish Kill: <small>' + feature.properties.FISH_KILL + '</small></h5><h5>Estimated Gallons: <small>' + feature.properties.EST_GALLON + '</small></h5><h5>Primary Cause: <small>' + feature.properties.PRIMARY_CAUSE + '</small></h5><h5>Secondary Cause: <small>' + feature.properties.SECONDARY_CAUSE + '</small><h5>Rating: <small>' + feature.properties.CAUSE_RATING + '</small><h5>Tributary: <small>' + feature.properties.TRIBUTARY  + '</small></h5><h5>Basin: <small>' + feature.properties.BASIN + '</small>' );
}

//Marker for SSO data
function markerToLayer (feature, latlng){
  var ssoIcon = L.icon({
    iconUrl: '../app/images/sso-icon.png',
    iconRetinaUrl: '../app/images/sso-icon.png',
    shadowUrl: '../app/images/marker-shadow.png'
  });
  return L.marker(latlng, {
      icon: ssoIcon
  });
}

//Popup Options for form
var popupOptions = { minWidth: 800, maxWidth: 3000, maxHeight: 500,  keepInView: true};

//Finds midpoint of line segment on click, this is where new SSO will be placed
function findMidpoint (A, B){
  var x = ((A[0] + B[0])/2);
  var y = ((A[1] + B[1])/2);
  $('#coords', init.formframe).text(x + ', ' + y);
}


//Creates new SSO with double click
map.on('dblclick', function(e){
  var newSSO = L.circleMarker(e.latlng, {
      fillColor: '#FF0000',
      radius: 4,
      color: '#63B355',
      weight: 1,
      fillOpacity: 1
    }).addTo(map);
  var x = e.latlng.lng;
  var y = e.latlng.lat;
  $('#coords', init.formframe).text(x + ', ' + y);
  var str = init.formframe.prop('innerHTML');
  init.innerpopup = str;
  //Creates popup
  var popup = L.popup(popupOptions)
        .setContent(init.innerpopup);

  //Binds popup to layer      
  newSSO.bindPopup(popup);
  //popup.update();
  newSSO.openPopup();
});


//Gets the Lat Lng for the new SSO to be posted
function getSSOLatLng(feature){
  if (feature.geometry.coordinates[0].length > 1){
    findMidpoint(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);
  }
  else{
    $('#coords', init.formframe).text(feature.geometry.coordinates[0] + ', ' + feature.geometry.coordinates[1]);
  }
}

//Sets up for popup
function form(feature, layer){
  //Gets all of the autopopulated values
  $('#ADDRESS', init.formframe).attr('value', getAddress());
  $('#BASIN', init.formframe).attr('value', feature.properties.BASIN);
  $('#PIPE_DIAM', init.formframe).attr('value', feature.properties.DIAMETER);
  $('#PIPEMATERI', init.formframe).attr('value', feature.properties.MATERIAL);
  $('#LASTCLEANDATE', init.formframe).attr('value', getCurrentDate());
  $('#SSO_DATE', init.formframe).attr('value', getCurrentDate());
  $('#FACILITYID', init.formframe).attr('value', feature.properties.FACILITYID);
  $('#CITY', init.formframe).attr('value', feature.properties.JURISDICTION);
  
  getSSOLatLng(feature);
  //Creates updated html string for form
  var str = init.formframe.prop('innerHTML');
  init.innerpopup = str;
  //Creates the popup
  var popup = L.popup(popupOptions)
        .setContent(init.innerpopup);
  //Sends the location of the popup to post object to process it for submit     
  init.post.geometry.x = $('#coords').text();
 
  //Binds popup to layer      
  layer.bindPopup(popup);
  //popup.update();
}

//Sets style for manhole markers
function manholeMarker (feature, latlng){
  var manholeIcon = L.icon({
    iconUrl: '../app/images/manhole-icon-green.png',
    iconRetinaUrl: '../app/images/manhole-icon-green.png',
    iconAnchor: [12,17]
});
  return L.marker(latlng, {
      icon: manholeIcon
    });
  }

//Sets style for line layers
function pipeStyles (color){
  var style = {
    'color': color,
    'weight': 5,
    'opacity': 0.65,
    'lineCap': 'butt',
  };
return style;
}

//Loading indicator
function loading(layer){
  layer.on('loading', function(){
    map.spin(true);
  });
  layer.on('load', function(){
    map.spin(false);
  });
}

//Gets and sets SSO layer
var sso = L.esri.featureLayer('http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/DataCollection/MapServer/0',
              {
                onEachFeature: popup,
                pointToLayer: markerToLayer
              });
loading(sso);

//Gets and sets Heatmap layer
var heat = new L.esri.HeatMapFeatureLayer('http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/DataCollection/MapServer/0',
              {
                radius: 60,
                blur: 30
              });
loading(heat);

//Gets and sets Gravity main layer
var gravitymains = L.esri.featureLayer('http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/SewerCollection/MapServer/4',
              {
                onEachFeature: form,
                style: pipeStyles('#8EF13C')
              });
loading(gravitymains);

//Gets and sets force mains layer
var forcemains = L.esri.featureLayer('http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/SewerCollection/MapServer/5',
              {
                onEachFeature: form,
                style: pipeStyles('#A60000')
              });
loading(forcemains);

//Gets and sets laterals layer
var laterals = L.esri.featureLayer('http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/SewerCollection/MapServer/13',
              {
                onEachFeature: form,
                style: pipeStyles('#078600')
              });
loading(laterals);

//Gets and sets manhole layer
var manholes = L.esri.clusteredFeatureLayer('http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/SewerCollection/MapServer/6',
              {
                onEachMarker: form,
                createMarker: manholeMarker
              });
loading(manholes);
 

//Creates Basemap object for layer control   
var baseLayers = {
    'Terrain': L.mapbox.tileLayer('rpud.i607pg2j').addTo(map),
    'Orthos2013': Orthos2013
};

//Creates overlay object for layer control
var overlays = {
    'SSOs': sso,
    'Manholes': manholes,
    'Gravity Mains': gravitymains,
    'Force Mains': forcemains,
    'Laterals': laterals,
    'SSO Heat Map': heat
};

//Adds layer control to map
L.control.layers(baseLayers, overlays).addTo(map);

//Buttons
//Adds SSO Table button to map
var ssoTable = L.control({position: 'bottomleft'});
  ssoTable.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = '<button type="button" class="btn btn-primary" onclick="mapTable();">SSO Table</button>';
    return div;
  };
ssoTable.addTo(map);

//Adds print control to map
var printer = L.control({position: 'bottomright'});
  printer.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = '<button type="button" class="btn btn-primary" onclick="window.print();">Print</button>';
    return div;
  };
printer.addTo(map);

//Zooms to selected feature on table
function zoomToFeature (x,y){
  map.fitBounds([[y, x]]);
  var selected = L.circle([y, x], 40,
    {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5
    }).addTo(map);
}

//Removes table from map
function removeTable(){
  tableborder.remove();
  map.dragging.enable();
}
  
//Prints map, still very basic could be greatly improved
function printPopup(){
  window.print();
}

