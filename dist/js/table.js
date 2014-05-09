
//Spinner Options
function mapTable(){
var opts = {
  lines: 13, // The number of lines to draw
  length: 10, // The length of each line
  width: 10, // The line thickness
  radius: 20, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#6C8CD5', // #rgb or #rrggbb or array of colors
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '100%', // Top position relative to parent
  left: '50%' // Left position relative to parent
};

//Target for loading spinner
var target = document.getElementById('spin');

var tb = {
  items: [],
  start: 0,
  spinner: new Spinner(opts),
  url: function(count){
      var url = "http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/DataCollection/MapServer/0/query?where=OBJECTID+>+"+ count +"&outFields=*&f=pjson&geometry=true&inSR=4326&outSR=4326";
        $.getJSON(url , function( data ) {
          tb.spinner.spin(target);

          console.log(data)
          for(each in data.features){
            var ssoDate = data.features[each].attributes.SSO_DATE;
            var addrs = data.features[each].attributes.ADDRESS;
            var duration = data.features[each].attributes.DURATION;
            var fishKill = data.features[each].attributes.FISH_KILL;
            var estGallon = data.features[each].attributes.EST_GALLON;
            var primCause = data.features[each].attributes.PRIMARY_CAUSE;
            var trib = data.features[each].attributes.TRIBUTARY;
            var streetBook = data.features[each].attributes.STREETBOOK;
            var gal2ck = data.features[each].attributes.GAL2CREEK;
            var basin = data.features[each].attributes.BASIN;
            var causeRating = data.features[each].attributes.CAUSE_RATING;
            var secCause = data.features[each].attributes.SECONDARY_CAUSE;
            var timeCalled = data.features[each].attributes.TIME_CALLED;
            var timeArrive = data.features[each].attributes.TIME_ARRIVED;
            var timeStop = data.features[each].attributes.TIME_STOPPED;
            var x = data.features[each].geometry.x;
            var y = data.features[each].geometry.y;
            



            
            //Converts the date field from miliseconds to mm/dd/yyyy format
            var date = new Date(ssoDate);
            var d = date.getUTCDate();
            var m = date.getUTCMonth() + 1;
            var yyyy = date.getUTCFullYear();
            var formatedDate = m + '/' + d + '/' + yyyy;
            if (formatedDate == '1/1/1970'){
              formatedDate = null;
            }
 
            tb.items.push([formatedDate,addrs,duration,fishKill,estGallon,primCause,secCause,trib,streetBook,'<button id="zoomSSO" type="button" class="btn btn-primary btn-sm" onclick="zoomToFeature('+ x + ',' + y + ');">Zoom</button>', gal2ck,basin,causeRating,timeCalled,timeArrive,timeStop]);
          
          }
            //Recalls data if the response exceeds the max freatures returned
            if (data.features.length == 1000 ){
                tb.start = tb.start + 1000
                tb.url(tb.start);
            }
            //Runs after all data has been loading to the array, and creates table
            else {
              console.log('Data Finished Loading')
              createTable(tb.items)
              tb.spinner.stop();
            }

        });
        
      }
}

tb.url(tb.start);



function createTable(info){

  
  var datatable = L.control({position: 'bottomright'});
  datatable.onAdd = function (map) {
    var table = L.DomUtil.create('div', 'info table');
      table.innerHTML = '<div id="tableborder" class="container"><div class="col-md-12"><button type="button" class="btn btn-danger btn-sm" style="margin-left: 1000px; margin-bottom: -50px;" onclick="removeTable();">Close</button><table id="datatable" class="table table-hover"></table></div></div>'
    
    return table;
  }
 //Checks if element already exisits if it returns false the element will be created
  if ($('#tableborder').length == true){
    return;
  }
  else{
  datatable.addTo(map)
  $( "#tableborder" ).draggable(); //.resizable()
//Switches map element dragging off and on  
$("#tableborder").hover(function(){
      map.dragging.disable();
    },
    function(){
      map.dragging.enable(); 
    });
}
  //Allows the table to be sorted by clicking on headings
  jQuery.fn.dataTableExt.oSort['string-case-asc']  = function(x,y) {
    return ((x < y) ? -1 : ((x > y) ?  1 : 0));
  };
 
  jQuery.fn.dataTableExt.oSort['string-case-desc'] = function(x,y) {
    return ((x < y) ?  1 : ((x > y) ? -1 : 0));
  };
  //Initiates the data table
  $(document).ready(function() {
    $('#datatable').dataTable({
              "sPaginationType": "bootstrap",
              "aaData": info,
              "bProcessing":true,
              "bDeferRender": true,
              "bRetrieve": true,
              "iDisplayLength": 10,
              "aLengthMenu": [5, 10, 15, 20],
              "aaSorting": [ [0,'asc'], [1,'asc'] ],
              "aoColumns": [
            { "sTitle": "SSO Date" },
            { "sTitle": "Address"},
            { "sTitle": "Duration" },
            { "sTitle": "Fish Kill" },     
            { "sTitle": "Est Gallon", "sClass": "center" },
            { "sTitle": "Primary Cause", "sClass": "center" },
            { "sTitle": "Secondary Cause", "sClass": "center"},
            { "sTitle": "Tributary", "sClass": "center"},
            { "sTitle": "Street Book", "sClass": "center"},
            { "sTitle": "Zoom To", "sClass": "center"}

          ]
    });
  });
}




}