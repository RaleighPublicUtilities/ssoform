function getCurrentDate(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  return mm + '/' + dd + '/'+  yyyy;

}

function getAddress(){
  var queryBox = document.getElementById('leaflet-control-geosearch-qry')
  if (queryBox.value == null){
    return 'Add Address...'
  }
  else{
    return queryBox.value
  }
}



  var init = {
  items: [],
  start: 0,
  count: 0,
  deleteID: 0,
  innerpopup: '',
  fieldsurl: 'http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/DataCollection/FeatureServer/0?f=pjson',
  updateurl: 'http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/DataCollection/FeatureServer/0/addFeatures',
  deleteurl: 'http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/DataCollection/FeatureServer/0/deleteFeatures',
  projecturl: 'http://gis.raleighnc.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer/project',
  post:{"geometry": {},"attributes" :{}},
  fieldlengths: {},
  indata: [],
  formframe: $('<div id="popup"><div id="frame" class="btn-group"></div><div class="container-fluid"><h3 id="Ftext" class="text-primary">Add New Record</h3><br><div class="row"><div class="col-md-4"><form id="updater" class="cmxform" role="form" method="post" action=""></div><div class="col-md-4"><div id="updater1"></div></div><div class="col-md-4"><div id="updater2"></div></div></form></div></div></div>'),
  DataObj: function(){ for (each in init.post.attributes){
    init.post.attributes[each] = $(init.post.attributes[each]).val();
    } 
    var htmlLatLng = $('#coords').text()
    var latlngarray = htmlLatLng.split(',')
    init.post.geometry['x'] = latlngarray[0]
    init.post.geometry['y'] = latlngarray[1]    
        
  },
  reproject: function(x,y){

    $.ajax({
    url: init.projecturl,
    type: 'POST',
    dataType: 'json',
    data: {f: 'json',
      inSR: 4326,
      outSR: 2264,
      geometries: JSON.stringify({"geometryType" : "esriGeometryPoint", "geometries" :[{"x": x, "y": y}]})
    
    },
    success: function (response){
      console.log(response);
      init.post.geometry.x = response.geometries[0].x
      init.post.geometry.y = response.geometries[0].y
    }
    });

  },
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  
  url: function(){
      var url = init.fieldsurl;

        $.getJSON(url , function( data ) {
          console.log(data)
          for(each in data.fields){
            var field = data.fields[each].name;
            var fieldType = data.fields[each].type;
            var fieldlen = data.fields[each].length;
            var alias = data.fields[each].alias;

            var formControls = {
              "FACILITYID" : '<div id="'+field+'div" class="form-group"><label for="' + field +'">'+alias+'</label><input id="'+ field +'" type="text" maxlength="'+ fieldlen +'" class="form-control" placeholder=""></div>',
              "esriFieldTypeString" : '<div id="'+field+'div" class="form-group"><label for="' + field +'">'+alias+'</label><input id="'+ field +'" type="text" maxlength="'+ fieldlen +'" class="form-control" placeholder=""></div>',
              "esriFieldTypeSmallInteger": '<div id="'+field+'div" class="form-group"><label for="' + field +'">'+alias+'</label><input id="'+ field +'" type="number" maxlength="'+ fieldlen +'" class="form-control" placeholder=""></div>',
              "esriFieldTypeDouble": '<div id="'+field+ 'div" class="form-group"><label for="'+ field +'">'+ alias +'</label><input type="number" id="' + field + '" maxlength="'+ fieldlen +'" class="form-control" placeholder="..."></div>',
              "esriFieldTypeDate": '<div id="'+field+'div" class="form-group"><label for="'+ field + '">'+ alias +'<i class="text-danger"> (Required)</i></label><input type="datetime" class="form-control" id="'+ field +'" value="' + getCurrentDate() + '"></div>',
              "NOTES": '<div id="'+field+'div" class="form-group"><label for="'+ field + '">'+ alias +'</label><textarea class="form-control" rows="3"></textarea></div>',
              "ADDRESS": '<div id="'+field+'div" class="form-group"><label for="' + field +'">'+alias+'</label><input id="'+ field +'" type="text" maxlength="'+ fieldlen +'" class="form-control" placeholder="'+getAddress()+'"></div>',
              "esriFieldTypeInteger": '<div id="'+field+'div" class="form-group"><label for="' + field +'">'+alias+'</label><input id="'+ field +'" type="number" class="form-control" placeholder=""></div>',
              "FISH_KILL": '<div id="'+field+'div" class="form-group"><label for="' + field +'">'+alias+'</label><br><select id="'+ field +'" ><option value="NO">NO</option><option value="YES">YES</option></select></div>',
              "CAUSE": '<div id="'+field+'div" class="form-group"><label for="' + field +'">'+alias+'</label><br><select id="'+ field +'" ></select></div>',
              "TIME": '<div id="'+field+'div" class="form-group"><label for="'+ field + '">'+ alias +'<i class="text-danger"> (Required)</i></label><input type="time" class="form-control" id="'+ field +'" value="" placeholder="12:00 AM"></div>',
              "CAUSE_RATING": '<div id="'+field+'div" class="form-group"><label for="' + field +'">'+alias+'</label><br><select id="'+ field +'" ><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div>',
            }
            

            //Create Post Template
            if (field != 'OBJECTID' || field != 'ID' || field != 'X_EASTING' || field != 'Y_NORTHING'){
              init.post.attributes[field] = '#' + field
              init.fieldlengths[field] = fieldlen
            }
          
            function layout(column){
              if (field == "CAUSE_RATING"){
                $(column, init.formframe).append(formControls.CAUSE_RATING)
              }
              else if (fieldType == "esriFieldTypeSmallInteger" && field != 'HRS' && field != 'DAYS'){
                $(column, init.formframe).append(formControls.esriFieldTypeSmallInteger)
              }
              else if (field == "FACILITYID"){
                $(column, init.formframe).append(formControls.FACILITYID)
              }
              else if (field == "NOTES"){
                $(column, init.formframe).append(formControls.NOTES)
              }
              else if (field == "PRIMARY_CAUSE" || field == "SECONDARY_CAUSE"){
                //Creates drop down list for cause categories
                $(column, init.formframe).append(formControls.CAUSE)
                for (i in data.fields[each].domain.codedValues){
                  var code = data.fields[each].domain.codedValues[i].code
                    $("#" + field, init.formframe).append('<option value="'+code+'">'+code+'</option>') 
                }
              }
              else if (field == "ADDRESS"){
                $(column, init.formframe).append(formControls.ADDRESS)
              }
               else if (field == "TIME_CALLED" || field == "TIME_ARRIVED" || field == "TIME_STOPPED" ){
                $(column, init.formframe).append(formControls.TIME)
              }
              else if (field == "FISH_KILL"){
                $(column, init.formframe).append(formControls.FISH_KILL)
              }
              else if (fieldType == "esriFieldTypeDate"){
                $(column, init.formframe).append(formControls.esriFieldTypeDate)
              }
              else if (fieldType == "esriFieldTypeString" && field != "LINK"){
                $(column, init.formframe).append(formControls.esriFieldTypeString)
              }
              else if (fieldType == "esriFieldTypeDouble" && field != "X_EASTING" && field != "Y_NORTHING"){
                $(column, init.formframe).append(formControls.esriFieldTypeDouble)
              }
               else if (fieldType == "esriFieldTypeInteger" ){
                $(column, init.formframe).append(formControls.esriFieldTypeInteger)
              }

              init.start+=1;
              init.count+=1;
            }

         
            if (init.start < 12){
                layout("#updater")
            }
            else if (init.start > 11 && init.start < 20)  {
              layout("#updater1")
            }
            else {
              layout('#updater2')
            }
    
            
    }//End of For Loop


        //Adds the submit button
        $("#updater2", init.formframe).append('<button id="update" type="submit" class="btn btn-primary btn-lg" onclick="init.submitForm();">Submit</button>')
        $("#updater", init.formframe).append('<p id="coords"></p>')
         var str = init.formframe.prop('innerHTML');
          
          init.innerpopup = str;
         // alert(init.innerpopup)

      });
 

    }, //End of url()
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
submitForm: function(){

  
  
      $("#updater").validate();
      $("#updater1").validate();
      $("#updater2").validate();
  

  init.indata = [];
  init.DataObj();
  init.indata.push(init.post);
  init.indata[0].attributes.DAYS = parseInt(init.indata[0].attributes.DAYS)
  init.indata[0].attributes.CAUSE_RATING = parseInt(init.indata[0].attributes.CAUSE_RATING)
  init.indata[0].attributes.YEAR_ = parseInt(init.indata[0].attributes.YEAR_)
  init.indata[0].attributes.EST_GALLON = parseInt(init.indata[0].attributes.EST_GALLON)
  init.indata[0].attributes.PIPE_DIAM = parseInt(init.indata[0].attributes.PIPE_DIAM)
  init.indata[0].attributes.HRS = parseInt(init.indata[0].attributes.HRS)
  init.indata[0].attributes.GAL2CREEK = parseInt(init.indata[0].attributes.GAL2CREEK)
  init.indata[0].attributes.CAUSE_RATING = parseInt(init.indata[0].attributes.CAUSE_RATING)

  init.reproject(init.post.geometry.x, init.post.geometry.y);
  setTimeout(function(){$(function(){

  
  $.ajax({
    url: init.updateurl,
    type: 'POST',
    dataType: 'json',
    data: {f: 'json',
      features: JSON.stringify(init.indata),
      gdbVersion: 'SDE.DEFAULT',
    },
    success: function (response){
      console.log(response);
     if (response.error){
      bootbox.alert('<h1 class="text-danger">FAILURE</h1><h3>The Record <strong class="text-danger">WAS NOT ADDED!!!</strong></h3><h4 class="text-warning">Code: '+ response.error.code +', ' + response.error.details[0] + '</h4><p>Please check to make sure all fields are filled out correctly</p><p class="text-muted">If the problem persists please call 919-996-2369</p>');
        $("#updater").remove();
        $("#updater1").remove();
        $("#updater2").remove();
        $("#Ftext").remove();
        $("#frame").append('<a id="try" class="btn btn-warning btn-lg" onclick="location.reload(true);">Try Again</a>')

     } 
     else if (response.addResults[0].success == true){
      init.deleteID = response.addResults[0].objectId
      
      bootbox.alert('Object ' + init.deleteID + ' was Created<br><strong class="text-success">ADD COMPLETED</strong><p class="text-muted">Click Add New Record <strong class="text-warning">BEFORE</strong> entering new data</p>');
      $("#updater").remove();
      $("#updater1").remove();
      $("#updater2").remove();
      $("#Ftext").remove();
      popupOptions.minWidth = 800;
      $("#frame").append('<a id="new" class="btn btn-success btn-lg" href="../ssoform/index.html">Add New Record</a>')
      $("#frame").append('<button id="delete" type="button" class="btn btn-danger btn-lg">Delete Last Record</button>')

  $("#delete").click(function(){
   $.ajax({
    url: init.deleteurl,
    type: 'POST',
    dataType: 'json',
    data: {f: 'json',
      objectIds: init.deleteID
    },
    success: function (response){
      console.log(response);
      $("#delete").remove();

      bootbox.alert('Object ' + init.deleteID +' Removed...<br><strong class="text-success">DELETE SUCCESSFUL</strong>');
    },
    error: function (error){
      console.log(error)
      bootbox.alert('<h1 class="text-danger">FAILURE</h1><h3>The Record WAS <strong class="text-danger">NOT Deleted!!!</strong></h3><p>If you still wish to delete the added feature please make changes via Microsoft Access</p><p class="text-muted">Future updates will allow you to make further changes in the browser...Sorry for the inconvience</p>');
    }
        
      }); //End of Post Delete
   //Reload Page
   setTimeout(function(){location.reload(true)}, 3000);
    
    }); //End of Delete
      }

     
    },
    
      

    

  });//End of Post update
});
}, 1500);  
  





}//End of submitForm()

}//End of init


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
init.url();




