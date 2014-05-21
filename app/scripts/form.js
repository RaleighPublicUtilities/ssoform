function getCurrentDate(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  return mm + '/' + dd + '/'+  yyyy;

}

function getAddress(){
  var queryBox = document.getElementById('leaflet-control-geosearch-qry');
  if (queryBox.value === null){
    return 'Add Address...';
  }
  else{
    return queryBox.value;
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
  post:{'geometry': {},'attributes' :{}},
  fieldlengths: {},
  indata: [],
  formframe: $('<div id="popup"><div id="frame" class="btn-group"></div><div class="container-fluid"><h3 id="Ftext" class="text-primary">Add New Record</h3><br><div class="row"><div class="col-md-4"><form id="updater" class="cmxform" role="form" method="post"></div><div class="col-md-4"><div id="updater1"></div></div><div class="col-md-4"><div id="updater2"></div></div></form></div></div></div>'),
  DataObj: function(){ for ( var each in init.post.attributes){
    init.post.attributes[each] = $(init.post.attributes[each]).val();
    }
    var htmlLatLng = $('#coords').text();
    var latlngarray = htmlLatLng.split(',');
    init.post.geometry.x = latlngarray[0];
    init.post.geometry.y = latlngarray[1];
        
  },
  reproject: function(x,y){

    $.ajax({
    url: init.projecturl,
    type: 'POST',
    dataType: 'json',
    data: {f: 'json',
      inSR: 4326,
      outSR: 2264,
      geometries: JSON.stringify({'geometryType' : 'esriGeometryPoint', 'geometries' :[{'x': x, 'y': y}]})
    
    },
    success: function (response){
      console.log(response);
      init.post.geometry.x = response.geometries[0].x;
      init.post.geometry.y = response.geometries[0].y;
    }
    });

  },
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  
  url: function(){
      var url = init.fieldsurl;

        $.getJSON(url , function( data ) {
          console.log(data);
          

            var formControls = {
              'FACILITYID' : '<div id="FACILITYIDdiv" class="form-group"><label for="FACILITYID">FACILITYID</label><input id="FACILITYID" type="text" maxlength="50" class="form-control" placeholder=""></div>',
              'SSO_DATE': '<div id="SSO_DATEdiv" class="form-group"><label for="SSO_DATE">SSO DATE<i class="text-danger"> (Required)</i></label><input type="date" class="form-control" id="SSO_DATE" value="' + getCurrentDate() + '"></div>',
              'ADDRESS': '<div id="ADDRESSdiv" class="form-group"><label for="ADDRESS">ADDRESS</label><input id="ADDRESS" type="text" maxlength="50" class="form-control" placeholder="'+getAddress()+'"></div>',
              'PRIMARY_CAUSE': '<div id="PRIMARY_CAUSEdiv" class="form-group"><label for="PRIMARY_CAUSE">PRIMARY CAUSE</label><br><select id="PRIMARY_CAUSE" ></select></div>',
              'SECONDARY_CAUSE': '<div id="SECONDARY_CAUSEdiv" class="form-group"><label for="SECONDARY_CAUSE">SECONDARY CAUSE</label><br><select id="SECONDARY_CAUSE" ></select></div>',
              'CAUSE_RATING': '<div id="CAUSE_RATINGdiv" class="form-group"><label for="CAUSE_RATING">CAUSE RATING</label><br><select id="CAUSE_RATING" ><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div>',
              'NOTES': '<div id="NOTESdiv" class="form-group"><label for="NOTES">NOTES</label><textarea class="form-control" rows="3"></textarea></div>',
              'DURATION' : '<div id="DURATIONdiv" class="form-group"><label for="DURATION">DURATION</label><input id="DURATION" type="text" maxlength="24" class="form-control" placeholder=""></div>',
              'CITY' : '<div id="CITYdiv" class="form-group"><label for="CITY">CITY</label><input id="CITY" type="text" maxlength="25" class="form-control" placeholder=""></div>',
              'TRIBUTARY' : '<div id="TRIBUTARYdiv" class="form-group"><label for="TRIBUTARY">TRIBUTARY</label><input id="TRIBUTARY" type="text" maxlength="41" class="form-control" placeholder=""></div>',
              'BASIN' : '<div id="BASINdiv" class="form-group"><label for="BASIN">BASIN</label><input id="BASIN" type="text" maxlength="25" class="form-control" placeholder=""></div>',
              'EST_GALLON': '<div id="EST_GALLONdiv" class="form-group"><label for="EST_GALLON">ESTIMATED GALLONS</label><input type="number" id="EST_GALLON" class="form-control" value="0"></div>',
              'GAL2CREEK': '<div id="GAL2CREEKdiv" class="form-group"><label for="GAL2CREEK">GALLONS TO CREEK</label><input type="number" id="GAL2CREEK" class="form-control" value="0"></div>',
              'FISH_KILL': '<div id="FISH_KILLdiv" class="form-group"><label for="FISH_KILL">FISH KILL</label><br><select id="FISH_KILL" ><option value="NO">NO</option><option value="YES">YES</option></select></div>',
              'PIPEMATERI' : '<div id="PIPEMATERIdiv" class="form-group"><label for="PIPEMATERI ">PIPE MATERIAL</label><input id="PIPEMATERI" type="text" maxlength="30" class="form-control" placeholder=""></div>',
              'PIPE_DIAM': '<div id="PIPE_DIAMdiv" class="form-group"><label for="PIPE_DIAM">PIPE DIAMETER</label><input id="PIPE_DIAM" type="number" class="form-control" placeholder=""></div>',
              'STREETBOOK' : '<div id="STREETBOOKdiv" class="form-group"><label for="STREETBOOK">STREETBOOK</label><input id="STREETBOOK" type="text" maxlength="10" class="form-control" placeholder=""></div>',
              'LASTCLEANDATE': '<div id="LASTCLEANDATEdiv" class="form-group"><label for="LASTCLEANDATE">LAST CLEAN DATE<i class="text-danger"> (Required)</i></label><input type="date" class="form-control" id="LASTCLEANDATE" value="' + getCurrentDate() + '"></div>',
              'TIME_CALLED': '<div id="TIME_CALLEDdiv" class="form-group"><label for="TIME_CALLED">TIME CALLED<i class="text-danger"> (Required)</i></label><input type="time" class="form-control" id="TIME_CALLED" value="" placeholder="12:00 AM"></div>',
              'TIME_ARRIVED': '<div id="TIME_ARRIVEDdiv" class="form-group"><label for="TIME_ARRIVED">TIME ARRIVED<i class="text-danger"> (Required)</i></label><input type="time" class="form-control" id="TIME_ARRIVED" value="" placeholder="12:00 AM"></div>',
              'TIME_STOPPED': '<div id="TIME_STOPPEDdiv" class="form-group"><label for="TIME_STOPPED">TIME STOPPED<i class="text-danger"> (Required)</i></label><input type="time" class="form-control" id="TIME_STOPPED" value="" placeholder="12:00 AM"></div>',
              
            };

             for (var each in formControls){
              if (init.start < 7){
                
                
            $('#updater', init.formframe).append(formControls[each]);
                
            }
            else if (init.start > 6 && init.start < 14)  {
              $('#updater1', init.formframe).append(formControls[each]);
            }
            else {
              $('#updater2', init.formframe).append(formControls[each]);
            }
init.start+=1;
init.count+=1;
            }
            

          for(var each in data.fields){
            var field = data.fields[each].name;
            var fieldType = data.fields[each].type;
            var fieldlen = data.fields[each].length;
            var alias = data.fields[each].alias;
            //Create Post Template
            if (field !== 'OBJECTID' || field !== 'ID' || field !== 'X_EASTING' || field !== 'Y_NORTHING' || field !== 'CAUSE_CATEG'){
              init.post.attributes[field] = '#' + field;
              init.fieldlengths[field] = fieldlen;
            }

           if (field === 'PRIMARY_CAUSE' || field === 'SECONDARY_CAUSE'){
                  for (var i in data.fields[each].domain.codedValues){
                    var code = data.fields[each].domain.codedValues[i].code;
                    $('#' + field, init.formframe).append('<option value="'+code+'">'+code+'</option>');
                  }
                }
            
    }//End of For Loop


        //Adds the submit button
        $('#updater2', init.formframe).append('<button id="update" type="submit" class="btn btn-primary btn-lg" onclick="init.submitForm();">Submit</button>');
        $('#updater', init.formframe).append('<p id="coords"></p>');

         var str = init.formframe.prop('innerHTML');
          
          init.innerpopup = str;
         // alert(init.innerpopup)

      });
 

    }, //End of url()
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
submitForm: function(){

  
  
      // $("#updater").validate();
      // $("#updater1").validate();
      // $("#updater2").validate();
  

  init.indata = [];
  init.DataObj();
  init.indata.push(init.post);
  
  init.indata[0].attributes.CAUSE_RATING = parseInt(init.indata[0].attributes.CAUSE_RATING);
  init.indata[0].attributes.EST_GALLON = parseInt(init.indata[0].attributes.EST_GALLON);
  init.indata[0].attributes.PIPE_DIAM = parseInt(init.indata[0].attributes.PIPE_DIAM);
  
  init.indata[0].attributes.GAL2CREEK = parseInt(init.indata[0].attributes.GAL2CREEK);
  init.indata[0].attributes.CAUSE_RATING = parseInt(init.indata[0].attributes.CAUSE_RATING);

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
      bootbox.alert('<h1 class="text-danger">FAILURE</h1><h3>The Record <strong class="text-danger">WAS NOT ADDED!!!</strong></h3><h4 class="text-warning">Code: '+ response.error.code +', ' + response.error.details[0] + '</h4><p>Please check to make sure all fields are filled out correctly</p><p class="text-muted">If the problem persists please call 919-996-2369</p><a id="try" class="btn btn-warning btn-lg" onclick="location.reload(true);">Try Again</a>');
        $('#updater').remove();
        $('#updater1').remove();
        $('#updater2').remove();
        $('#Ftext').remove();
        $('#frame').append('<a id="try" class="btn btn-warning btn-lg" onclick="location.reload(true);">Try Again</a>');

     }
     else if (response.addResults[0].success == true){
      init.deleteID = response.addResults[0].objectId;
      
      bootbox.alert('Object ' + init.deleteID + ' was Created<br><strong class="text-success">ADD COMPLETED</strong><p class="text-muted">Click Add New Record <strong class="text-warning">BEFORE</strong> entering new data</p>');
      $('#updater').remove();
      $('#updater1').remove();
      $('#updater2').remove();
      $('#Ftext').remove();
      popupOptions.minWidth = 200;
      $('#frame').append('<a id="new" class="btn btn-success btn-lg" href="../ssoform/index.html">Add New Record</a>');
      $('#frame').append('<button id="delete" type="button" class="btn btn-danger btn-lg">Delete Last Record</button>');

  $('#delete').click(function(){
   $.ajax({
    url: init.deleteurl,
    type: 'POST',
    dataType: 'json',
    data: {f: 'json',
      objectIds: init.deleteID
    },
    success: function (response){
      console.log(response);
      $('#delete').remove();

      bootbox.alert('Object ' + init.deleteID +' Removed...<br><strong class="text-success">DELETE SUCCESSFUL</strong>');
    },
    error: function (error){
      console.log(error);
      bootbox.alert('<h1 class="text-danger">FAILURE</h1><h3>The Record WAS <strong class="text-danger">NOT Deleted!!!</strong></h3><p>If you still wish to delete the added feature please make changes via Microsoft Access</p><p class="text-muted">Future updates will allow you to make further changes in the browser...Sorry for the inconvience</p>');
    }
        
      }); //End of Post Delete
   //Reload Page
   setTimeout(function(){
    location.reload(true);
  }, 3000);
    
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




