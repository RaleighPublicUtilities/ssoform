//Main map and Basemaps
    //var map = L.map('map').setView([35.843768,-78.6450559], 11);
    var map = L.map('map').setView([35.843768,-78.6450559], 11);
                          //map.maxZoom(24);
                          // map.minZoom(11);

    var hash = new L.Hash(map);
    //var streets =  L.esri.basemapLayer("Streets").addTo(map);
    var Orthos2013 = L.esri.basemapLayer("Imagery");

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
            if (formatedDate == '1/1/1970'){
              formatedDate = null;
            }
            return formatedDate;
          }


function popup (feature, layer) {

    layer.bindPopup("<h4>Sanitary System Overflow</h4>" + "<h5>Date: <small>" + conDate(feature.properties.SSO_DATE) + "</small><h5>Address: <small>" + feature.properties.ADDRESS + "</small></h5><h5>Duration: <small>" + feature.properties.DURATION +  "</small></h5><h5>Fish Kill: <small>" + feature.properties.FISH_KILL + "</small></h5><h5>Estimated Gallons: <small>" + feature.properties.EST_GALLON + "</small></h5><h5>Primary Cause: <small>" + feature.properties.PRIMARY_CAUSE + "</small></h5><h5>Secondary Cause: <small>" + feature.properties.SECONDARY_CAUSE + "</small><h5>Rating: <small>" + feature.properties.CAUSE_RATING + "</small><h5>Tributary: <small>" + feature.properties.TRIBUTARY  + "</small></h5><h5>Basin: <small>" + feature.properties.BASIN + "</small>" )
  }

//Marker for SSO data
  function markerToLayer (feature, latlng){
     var ssoIcon = L.icon({
    iconUrl: '../ssoform/dist/img/sso-icon.png',
    iconRetinaUrl: '../ssoform/dist/img/sso-icon.png',
    shadowUrl: '../ssoform/dist/img/marker-shadow.png' 
});
  return L.marker(latlng, {
      icon: ssoIcon
    });
  //   return L.circleMarker(latlng, {
  //   fillColor: '#63B355',
  //   radius: 4,
  //   color: '#63B355',
  //   weight: 1,
  //   fillOpacity: 1
  // });
}

var popupOptions = { minWidth: 800, maxWidth: 3000, maxHeight: 500,  keepInView: true}


function findMidpoint (A, B){
  var x = ((A[0] + B[0])/2);
  var y = ((A[1] + B[1])/2);
  $("#coords", init.formframe).text(x + ", " + y)
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
  $("#coords", init.formframe).text(x + ", " + y)
  var str = init.formframe.prop('innerHTML');
  init.innerpopup = str;
  
  var popup = L.popup(popupOptions)
        .setContent(init.innerpopup);


        
  newSSO.bindPopup(popup); 
  popup.update()
  newSSO.openPopup();
});


//Gets the Lat Lng for the new SSO to be posted
function getSSOLatLng(feature){
  if (feature.geometry.coordinates[0].length > 1){
          findMidpoint(feature.geometry.coordinates[0], feature.geometry.coordinates[1])
        }
        else{
          $("#coords", init.formframe).text(feature.geometry.coordinates[0] + ", " + feature.geometry.coordinates[1]) 
        }
   }




function form(feature, layer){
  
  $("#ADDRESS", init.formframe).attr('value', getAddress());
  $("#BASIN", init.formframe).attr('value', feature.properties.BASIN);
  $("#PIPE_DIAM", init.formframe).attr('value', feature.properties.DIAMETER);
  $("#PIPEMATERI", init.formframe).attr('value', feature.properties.MATERIAL);
  $("#LASTCLEANDATE", init.formframe).attr('value', getCurrentDate());
  $("#SSO_DATE", init.formframe).attr('value', getCurrentDate());
  $("#FACILITYID", init.formframe).attr('value', feature.properties.FACILITYID);
  $("#CITY", init.formframe).attr('value', feature.properties.JURISDICTION);
  
  getSSOLatLng(feature)

  var str = init.formframe.prop('innerHTML');
  init.innerpopup = str;



  var popup = L.popup(popupOptions)
        .setContent(init.innerpopup);
        
  init.post.geometry['x'] = $('#coords').text()

 
        
  layer.bindPopup(popup); 
  popup.update();
  

  


}



function manholeMarker (feature, latlng){
  var manholeIcon = L.icon({
    iconUrl: '../ssoform/dist/img/manhole-icon-green.png',
    iconRetinaUrl: '../ssoform/dist/img/manhole-icon-green.png',
    //shadowUrl: '../ssoform/leaflet-0.7.2/images/marker-shadow.png' ,
    iconAnchor: [12,17]
});
  return L.marker(latlng, {
      icon: manholeIcon
    });
  }


function pipeStyles (color){
var style = {
    "color": color,
    "weight": 5,
    "opacity": 0.65,
    "lineCap": "butt",
    //"marker-mid": 'url("../ssoform/leaflet-0.7.2/images/arrow-icon.png")'
  }
return style
}

//Loading indicator
function loading(layer){
  layer.on('loading', function(){
      map.spin(true);
    });
    layer.on('load', function(){
      map.spin(false);
    })

}

    var sso = L.esri.featureLayer('http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/DataCollection/MapServer/0',
                     {onEachFeature: popup,
                      pointToLayer: markerToLayer
                    });
    loading(sso);
   
    var heat = new L.esri.HeatMapFeatureLayer('http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/DataCollection/MapServer/0', 
                  {
                    radius: 60,
                    blur: 30
    
  });
  loading(heat);

    var gravitymains = L.esri.featureLayer('http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/SewerCollection/MapServer/11',
                     {
                        onEachFeature: form,
                        style: pipeStyles("#8EF13C")
                     // pointToLayer: markerToLayer1 
                     });
    loading(gravitymains);
    var forcemains = L.esri.featureLayer('http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/SewerCollection/MapServer/12',
                     {
                        onEachFeature: form,
                        style: pipeStyles('#A60000')
                     // pointToLayer: markerToLayer1 
                     });
    loading(forcemains);
    var laterals = L.esri.featureLayer('http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/SewerCollection/MapServer/14',
                     {
                        onEachFeature: form,
                        style: pipeStyles('#078600')
                     // pointToLayer: markerToLayer1 
                     });
    loading(laterals);
    var manholes = L.esri.clusteredFeatureLayer('http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/SewerCollection/MapServer/5', 
                  {
                    onEachMarker: form,
                    createMarker: manholeMarker
                  });
    loading(manholes);
    
     var baseLayers = {
    'Terrain': L.mapbox.tileLayer('rpud.i607pg2j').addTo(map),
    'Orthos2013': Orthos2013
    };

    var overlays = {
    "SSO's": sso,
    "Manholes": manholes,
    "Gravity Mains": gravitymains,
    "Force Mains": forcemains,
    "Laterals": laterals,
    "SSO Heat Map": heat
    //"SSO Heat map": heat
};

L.control.layers(baseLayers, overlays).addTo(map);   



//Add Table to map




//Buttons
//Open Table
var ssoTable = L.control({position: 'bottomleft'});
  ssoTable.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = '<button type="button" class="btn btn-primary" onclick="mapTable();">SSO Table</button>'
    return div;
  }
ssoTable.addTo(map);
//Print Map
var printer = L.control({position: 'bottomright'});
  printer.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = '<button type="button" class="btn btn-primary" onclick="window.print();">Print</button>'
    return div;
  }
printer.addTo(map);
function zoomToFeature (x,y){
    map.fitBounds([[y, x]]);
    var selected = L.circle([y, x], 40, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map);

  // selected.on('click', function(){
  //   alert("CRAZY")
  //   selected.remove();
  // });
}
function removeTable(){
  tableborder.remove();
  map.dragging.enable(); 
//$(".info table leaflet-control").remove();
}
  

function printPopup(){
  window.print();
  //$("#popup").show().printElement();
}