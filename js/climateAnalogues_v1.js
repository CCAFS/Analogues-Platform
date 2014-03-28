/** ==========================================================
 * climateAnalogues_v1.js v1.0.0
 * ==========================================================
 * @name Climate Analogues online
 * @version 1.0
 * @author Ernesto Giron Echeverry
 * @copyright (c) 2013 CCAFS - CIAT, egiron
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */
var map = null;
var mapResults = null;
var steps = null;
var analoguesParams = null;
var mapResultlayerSwitcher = null;
var mapResultmousePosition = null;
var mapResultgraticule = null;
var ghyb_lyr = null;
var gphy_lyr = null;
var gmap_lyr = null;
var esritopo_lyr = esristreet_lyr = null;
var esrigray_lyr = esriterrain_lyr =  null;
var logoCCAFSfullScreen = null;
//OpenLayers.ProxyHost = 'proxy.cgi?url=';
var client;
var gcms = ["CURRENT", "ENSEMBLE", "BCCR_BCM2_0", "CCCMA_CGCM3_1_T47", "CCCMA_CGCM3_1_T63", "CNRM_CM3", "CSIRO_MK3_0", "CSIRO_MK3_5", "GFDL_CM2_0", "GFDL_CM2_1", "GISS_AOM", "GISS_MODEL_EH", "GISS_MODEL_ER", "IAP_FGOALS1_0_G", "INGV_ECHAM4", "INM_CM3_0", "IPSL_CM4", "MIROC3_2_HIRES", "MIROC3_2_MEDRES", "MIUB_ECHO_G", "MPI_ECHAM5", "MRI_CGCM2_3_2A", "NCAR_CCSM3_0", "NCAR_PCM1", "UKMO_HADCM3", "UKMO_HADGEM1"];
var epsg4326 = new OpenLayers.Projection("EPSG:4326");
var epsg3857 = new OpenLayers.Projection('EPSG:3857');
var epsg900913 = new OpenLayers.Projection('EPSG:900913');
var wps = 'http://analogues.ciat.cgiar.org/wps';
var serverResults = 'analogues/outputs/';     /* 2014-08-03 id:01 modification from the direction 'http://analogues.ciat.cgiar.org/outputs/' to local '/analogues/outputs/' */
var capabilities, process, initialExtent, currentClimaticZone;
var layers = [];
var zones = [];
var climateResultsLayers = [];
var siteLyr, climateSimLyr, markers, site;
var tileLayerName = null;
var tiempo = new Date();
var mapRsultsLoaded = false;
var showresults = false;
var runAnalysis = [];
var arrTooltips = [];
var analoguesHistoryRuns = null;
var welcomeModal = null;

var isIE = (navigator.appName === 'msie' || navigator.appName === 'Microsoft Internet Explorer') ? true : false;
if (isIE) alert('Your browser does not support all of the capabilities supply by this web site.\n\nPlease update your browser or use a newest version of Chrome, Safari or Firefox');

require(["dojo/query", "dojo/on", "dojo/parser", "dojo/ready", "esri/main", "esri/map", "dojo/_base/xhr",
		"bootstrap/CarouselItem_ege", "bootstrap/Carousel_ege", "bootstrap/ButtonGroup", "bootstrap/Popover", "bootstrap/Tooltip", "bootstrap/Datepicker", "bootstrap/Modal",
        "dojox/geo/openlayers/Map", "dojox/geo/openlayers/GfxLayer", "dojox/geo/openlayers/GeometryFeature", "dojox/geo/openlayers/WidgetFeature",
        "ccafs/Parameters", "ccafs/analoguesGallery", "ccafs/dijit/mapgallery/mapgallery" ,"dojo/Deferred", "dojox/data/CsvStore", 
        "dijit/dijit", "dijit/form/HorizontalSlider"
        ], function(q, on, parser, ready, esri) {
            parser.parse().then(function(){
               
            });
        ready(init);
});

function init(){
	//Check for cookie to load a splash
	checkSplash();
	// avoid pink tiles
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
    OpenLayers.Util.onImageLoadErrorColor = "transparent";
	//Get country information
	loadZones();
	//Create a blank analogues parameters object
	analoguesParams = new Parameters();
}

/*
 * Validad y Registra los datos del primer paso correspondientes a
 * Coordenadas Lat/Lng y Zona o pais seleccionado.
 */
function stepOne(e){
	var target = dojo.byId('ClimaticZone').value;
	var x = dojo.byId('lng').value;
	var y = dojo.byId('lat').value;
	if (x === "" || y === "" || x === "undefined" || y === "undefined") {
		dojo.byId('errMsg').innerHTML = '<h4 class="alert-heading">Warning in coordinates </h4> \
                            			<p>Please select a point over map or enter x,y coordinates in decimal degrees (dd).</p>';
        dojo.query('#alertMsg').removeClass('alert-error');
		dojo.query('.alertaError')[0].style.visibility = "visible";
		return -1
	}
	if (y >= 90.0 || y <= -60.0) {
		dojo.byId('errMsg').innerHTML = '<h4 class="alert-heading">Error in Latitude value </h4> \
                            			<p>You have to enter a valid value between 90 and -60.</p>';
        dojo.query('#alertMsg').addClass('alert-error');
		dojo.query('.alertaError')[0].style.visibility = "visible";
		return -1
	}
	if (x >= 180.0 || x <= -180.0) {
		dojo.byId('errMsg').innerHTML = '<h4 class="alert-heading">Error in Longitude value </h4> \
                            			<p>You have to enter a valid value between 180 and -180.</p>';
		dojo.query('#alertMsg').addClass('alert-error');
		dojo.query('.alertaError')[0].style.visibility = "visible";
		return -1
	}
	
	dojo.query('.alertaError')[0].style.visibility = "hidden";

	if (e != null) {
		updateParams();
		steps.next();
	}
	
}
/*
 * Validad y Registra los datos del segundo paso correspondientes a
 * Modelos Climaticos Globales y la direccion del analisis.
 */
function stepTwo(e){
	var res = stepOne(null);
	if (res == -1) {
		steps.to(0, true);
		return -1
	}
	var res = changeRefGCM();
	if (res == -1) return -2
	var res = changeTargetGCM();
	if (res == -1) return -2
	//Continue with right params
	dojo.query('.alertaError')[0].style.visibility = "hidden";
	if (e != null) {
		updateParams();
		steps.next();
	}
}

/*
 * Validad y Registra los datos del tercer paso correspondientes a
 * variables climaticas y opciones adicionales de rotation, Crop growing season and Threshold.
 */

function stepThree(e){
	var res = stepTwo(null);
	if (res == -1) { steps.to(0, true); return }
	if (res == -2) { steps.to(1, true); return }

	var res = changeClimaticVars();
   	if (res == -1) return -3
   	var res = changeGrowingSeason();
   	if (res == -1) return -3
   	
	//Continue with right params
	dojo.query('.alertaError')[0].style.visibility = "hidden";
	if (e != null) {
		updateParams();
		steps.next();
	}

	//Ajustar botones
	if (dojo.isFF >= 3.6 || dojo.isChrome >= 6.0 || dojo.isSafari >= 6.0 || dojo.isOpera >= 11.1 || dojo.isIE >= 10.0) {
		dojo.byId('sessionBtns').style.display = 'block';
		if (dojo.byId('tablelyrResults').rows.length <= 0) {
			dojo.byId('saveSessionBtn').style.visibility = 'hidden';
		} else {
			dojo.byId('saveSessionBtn').style.visibility = 'visible';
		}
	}
	
	dojo.byId('step4showMapLargeScreenBtn').style.display = 'none';
	dojo.byId('step4DownloadBtn').style.display = 'none';
	dojo.byId('mapResultsLegend').style.display = 'none';
	//Show ProgressBar
	dojo.byId('divProgressBar').style.display = 'block';

	//Ejecute Analysis
	runAnalogues();
}

//OpenLayers
function loadOpenLyr(){
    initialExtent = new OpenLayers.Bounds(-17728498.589175,-15654303.39,17728498.589175,15654303.39);
    map = new dojox.geo.openlayers.Map("map", {
        baseLayerType : dojox.geo.openlayers.BaseLayerType.GOOGLE,
		maxExtent: initialExtent,
		numZoomLevels:18, 
		maxResolution:156543.0339, 
		units:'m', 
		projection: epsg900913,
		displayProjection: epsg4326
    });
    //Map Controls 
    map.getOLMap().addControl(new OpenLayers.Control.Zoom());
    
    var mousePosition = new OpenLayers.Control.MousePosition({
    	numDigits: 3,
    	displayProjection: epsg4326,
        div: dojo.byId('mouseposition') 
    });
    map.getOLMap().addControl(mousePosition);

    //Add Layer for user points
  	markers = new OpenLayers.Layer.Markers( "Markers" );
  	markers.animationEnabled = true;
  	map.getOLMap().addLayer(markers);

    var params = qs_init();
	if (! (params["lat"] || params["lon"] || params["zoom"])) {
		setMapCenter(new OpenLayers.LonLat(0,0), 1);
	} else {
		setMapCenter(new OpenLayers.LonLat(params["lon"],params["lat"]), params["zoom"]);
		dojo.byId('lng').value = params["lon"];
		dojo.byId('lat').value = params["lat"];
		addSiteSelected();
	}
	//Show the user results in a custom widget 
	if (params["showresults"] == 1 || params["showresults"] == 'yes'){
		dojo.byId('mapgallery').style.display = 'block';
		showresults = true;
		showLastResultsSites();
	}
	
	//registrar evento para agregar pnt
	map.getOLMap().events.register('click', map, handleMapClick);
	map.getOLMap().events.register("moveend", null, displayZoom);
	
	//Start Events to control params inputs
	initEventsParams();
	
	//Reset Params
	resetParams();
	//Init Tooltips for help
	initTooltips();

}

function initEventsParams(){
	//Step 1 Events
	dojo.connect(dojo.byId("lat"), 'onkeypress', addSiteSelected);
	dojo.connect(dojo.byId("lng"), 'onkeypress', addSiteSelected);
	//Step 2 Events
	dojo.forEach(dojo.query('#directionBtns.btn-group > button.btn'), function(b){
	     dojo.connect(b, 'onclick', changeDirection);
	});
	//Step 3 Events
	dojo.forEach(dojo.query('#methodBtns.btn-group > button.btn'), function(b){
	     dojo.connect(b, 'onclick', changeMethod);
	});
	dojo.forEach(dojo.query('#rotationBtns.btn-group > button.btn'), function(b){
	     dojo.connect(b, 'onclick', changeRotation);
	});
	dojo.forEach(dojo.query('#divclimaticvars input'), function(b){
	     dojo.connect(b, 'onchange', changeClimaticVars);
	     //Disable all null inputs
		if (b.type == "checkbox" && b.checked == false) {
			var id = b.id.replace("chk_","");
            dojo.byId(id).setAttribute('disabled','disabled');
        }   
	});
	
}

/*
 * Define los parametros necesarios para el paso 1
 */
function createSteps(){
	//STEP 1
	var content1 = '<div class="carousel-steps"> \
                    <table cellpadding="4" style="width:100%;height:100%;"> \
                        <tr><td style="width:50%;"> \
                        <div style="width:100%; height:400px;margin:1px;border:1px solid #999;background:#f9f9f9;"> \
                            <div id="step1" style="padding-left:15px;padding-right:15px;"> \
	                            <h3>Step 1: Select your location</h3> \
	                            <p style="display:inline;">i) Select a reference site:</p> \
	                            <div id="zoneshelp" style="position:relative;margin-left:10px;margin-bottom:5px;" class="icon-question-sign"></div> \
	                            <div class="alert fade in"> \
                                	Use the tab below to zoom to a country then click a location on the map to get coordinates, or alternatively, enter the latitude and longitude directly \
                                </div> \
                                <select id="ClimaticZone" style="width:150px;display:inline;" title="" onchange="ZoomtoClimaticZone(this.options[this.selectedIndex].value);"> \
	                                <option disabled="disabled" value="none" selected="">Zoom to country</option> \
	                                <option value="global" >Global</option> \
	                                <optgroup label="COUNTRY">';
	                                if (zones.length > 0) {
	    								dojo.forEach(zones,function(entry, i){
	    									content1 += '<option value="'+i+'">'+entry.country+'</option>';
	    								});
	                                }
                                content1 += '</optgroup></select> \
                                <div style="position:relative;width:250px;float:right;top:-10px;"> \
	                                <div class="form-horizontal control-group"> \
										<label class="control-label" for="lat">Latitude:</label> \
										<div class="controls"> \
											<input id="lat" onchange="addSiteSelected();" type="number" step="any" min="-60.0" max="90.0" class="input-small"  value="" placeholder="eg. 33.593"/> \
											<span id="lathelp" class="icon-question-sign"></span> \
										</div> \
									</div> \
									<div class="form-horizontal control-group"> \
										<label class="control-label" for="lng">Longitude:</label> \
										<div class="controls"> \
											<input id="lng" onchange="addSiteSelected();" type="number" step="any" min="-180.0" max="180.0" class="input-small" value="" placeholder="eg. 0.732" /> \
											<span id="lnghelp" class="icon-question-sign"></span> \
										</div> \
									</div>\
								</div>\
								<hr/> \
	                            <p style="display:inline;">ii) Select a search range:</p> \
	                            <div id="searchrangehelp" style="position:relative;margin-left:10px;margin-bottom:10px;margin-right:25px;" class="icon-question-sign"></div> \
	                            <select id="SearchRange" onchange="checkClimaticZones();"> \
	                                <option value="global" selected="">Global</option> \
	                                <optgroup label="COUNTRY">';
	                                if (zones.length > 0) {
	    								dojo.forEach(zones,function(entry, i){
	    									content1 += '<option value="'+i+'">'+entry.country+'</option>';
	    								});
	                                }
	                            content1 += '</optgroup></select>';
                                
                                /*if (dojo.isFF >= 3.6 || dojo.isChrome >= 6.0 || dojo.isSafari >= 6.0 || dojo.isOpera >= 11.1 || dojo.isIE >= 10.0) {
		                            content1 +='<div class="fileParamsinputs"> \
	                                	<input id="paramsfileToLoad" type="file" class="fileparams" onChange="loadSavedParams();"/> \
										<div class="fakefile"> \
											<input style="width:88px;" class="btn btn-primary" /> \
											<p class="loadFileTitle">Load Params...</p> \
										</div> \
									</div> \
									<div id="loadparamshelp" style="position:relative;float:right;top:6px;z-index:10;" class="icon-question-sign"></div>';
								}*/

								content1 +='<hr/> \
		                        <p style="text-align:center;margin-top:20px;"><a id="step1Btn" class="btn btn-success btn-large" href="JavaScript:void(0);" >Continue &raquo;</a></p> \
		                    </div> \
		                    </td><td style="width:50%;"> \
		                        <div id="mouseposition" class="unselectable"></div> \
		                        <div id="maphelp"><span class="icon-question-sign"></span></div> \
		                        <div id="map"></div>\
		                    </td> </tr> \
	                    </div> \
                    </table> \
                    </div>';
	var item1 = new CarouselItem_ege({content: content1});
	//STEP 2
	var content2 = '<div class="carousel-steps"> \
			        <div class="carousel-steps-content"> \
			            <h3>Step 2: Select a direction and global climate models </h3> \
			            <div> \
				            <h5 style="display:inline; margin-right:20px;">Direction:</h5> \
				            <div id="directionBtns" class="btn-group" data-toggle="buttons-radio"> \
				                <button type="button" class="btn" name="backward">Backward</button> \
				                <button type="button" class="btn" name="forward">Forward</button> \
				                <button type="button" class="active btn btn-primary" name="none">None</button> \
				            </div> \
				            <span id="directionhelp" class="icon-question-sign"></span> \
				            <p class="btnStep2"><a id="step2Btn" class="btn btn-success btn-large" href="JavaScript:void(0);" >Continue &raquo;</a></p> \
		                </div> \
			            <div> \
				            <h5 style="margin-bottom:0px;">Global climate models: <span id="gcmshelp" class="icon-question-sign"></span></h5> \
				            <table style="margin-bottom:0px;width:99%; background-color:#f9f9f9;"> \
					        <tr><td style="width:40%;"> \
					            <div class="gcmOptions"> \
						            <h5 style="text-align:center;">Reference site:</h5> \
						            <select id="refPeriod" style="width:250px;" onchange="changeRefPeriod(this.options[this.selectedIndex].value);"> \
		                                <option value="1960_1990" selected="">1960 - 1990</option> \
		                                <option value="2020_2049">2020 - 2049</option> \
		                            </select>\
		                            <select id="refScenario" style="width:250px;" onchange="changeRefScenario(this.options[this.selectedIndex].value);"> \
		                                <option value="baseline" selected="">Baseline</option> \
		                                <option value="a1b">SRES A1B</option> \
                                        <option value="a2" disabled="disabled">SRES A2</option> \
                                        <option value="b1" disabled="disabled">SRES B1</option> \
		                            </select>\
						            <select id="refgcm" multiple="multiple" name="refModelGCM" size="5" style="width:250px;" onchange="changeRefGCM(this.options[this.selectedIndex].value);">';
									if (gcms.length > 0) {
										dojo.forEach(gcms,function(entry, i){
											if (entry == "CURRENT") {
												content2 += '<option value="'+entry+'" selected="">'+entry+'</option>';
											} else {
												content2 += '<option value="'+entry+'">'+entry+'</option>';
											}
										});
			                        }
						content2 += '</select> \
									<select id="refResolution" style="width:250px;" onchange="changeRefResolution(this.options[this.selectedIndex].value);"> \
										<option value="30s" disabled="disabled">30 arc-seconds</option> \
		                                <option value="2_5min" >2.5 arc-minutes</option> \
		                                <option value="5min" disabled="disabled">5 arc-minutes</option> \
		                                <option value="10min" selected="" >10 arc-minutes</option> \
		                                <option value="25min" disabled="disabled">25 arc-minutes</option> \
										<option value="30min" disabled="disabled">30 arc-minutes</option> \
		                            </select>\
					            </div> \
						    </td>\
						    <td style="width:20%;text-align:center;vertical-align:top;"> \
						    	<div style="margin-top:48px;"><strong>Period</strong> <span id="periodhelp" class="icon-question-sign"></span></div> \
						    	<div style="margin-top:24px;"><strong>Scenario</strong> <span id="scenariohelp" class="icon-question-sign"></span></div> \
						    	<div style="margin-top:55px;"><strong>Model</strong> <span id="modelhelp" class="icon-question-sign"></span></div> \
						    	<div style="margin-top:60px;"><strong>Resolution</strong> <span id="resolutionhelp" class="icon-question-sign"></span></div> \
						    </td>\
						    <td style="width:40%;"> \
					            <div class="gcmOptions"> \
						            <h5 style="text-align:center;">Search range:</h5> \
						            <select id="targetPeriod" style="width:250px;" onchange="changeTargetPeriod(this.options[this.selectedIndex].value);"> \
		                                <option value="1960_1990" selected="">1960 - 1990</option> \
		                                <option value="2020_2049">2020 - 2049</option> \
		                            </select>\
		                            <select id="targetScenario" style="width:250px;" onchange="changeTargetScenario(this.options[this.selectedIndex].value);"> \
		                                <option value="baseline" selected="">Baseline</option> \
		                                <option value="a1b">SRES A1B</option> \
                                        <option value="a2" disabled="disabled">SRES A2</option> \
                                        <option value="b1" disabled="disabled">SRES B1</option> \
		                            </select>\
						            <select id="targetgcm" multiple="multiple" name="targetModelGCM" size="5" style="width:250px;" onchange="changeTargetGCM(this.options[this.selectedIndex].value);">';
									if (gcms.length > 0) {
										dojo.forEach(gcms,function(entry, i){
											if (entry == "CURRENT") {
												content2 += '<option value="'+entry+'" selected="">'+entry+'</option>';
											} else {
												content2 += '<option value="'+entry+'">'+entry+'</option>';
											}
										});
			                        }
						content2 += '</select> \
									<select id="targetResolution" style="width:250px;" onchange="changeTargetResolution(this.options[this.selectedIndex].value);"> \
		                                <option value="30s" disabled="disabled">30 arc-seconds</option> \
		                                <option value="2_5min">2.5 arc-minutes</option> \
		                                <option value="5min" disabled="disabled">5 arc-minutes</option> \
		                                <option value="10min" selected="" >10 arc-minutes</option> \
		                                <option value="25min" disabled="disabled">25 arc-minutes</option> \
										<option value="30min" disabled="disabled">30 arc-minutes</option> \
		                            </select>\
					            </div> \
				            </td></tr> \
				            </table> \
			            </div> \
			        </div>\
			    </div>';
	var item2 = new CarouselItem_ege({content: content2});

	var content3 ='<div class="carousel-steps"> \
				    <div class="carousel-steps-content"> \
				        <h3>Step 3: Select climate variables and define other analysis settings</h3> \
				        <div style="width:100%;height:325px;overflow:visible;"> \
                    	<table style="width:100%;height:325px;"> \
                        <tr> \
                            <td width="55%"> \
                                <p style="position:relative;float:left;font-weight:bold;">Climatic and bioclimatic variables &nbsp;&nbsp; \
                                <span id="climaticvarshelp" class="icon-question-sign"></span></p> \
                                <p style="position:relative;float:right;margin-right:35px;ont-weight:bold;">Weights&nbsp;&nbsp; \
                                <span id="weightshelp" class="icon-question-sign"></span></p> \
                                <div id="divclimaticvars" style="width:100%;height:288px;overflow-y:auto;border: 1px solid rgb(41, 116, 53);border-radius: 5px;" \
                                class="form-horizontal"> \
                                <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_tmean" checked="true"/> \
                                <label class="control-label" for="tmean">MONTHLY MEAN TEMPERATURE</label> \
                                <input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="0.5" id="tmean"></p> \
                                <p class="pclimaticvars"><input type="checkbox" id="chk_prec" checked="true"/> \
                                <label class="control-label" for="prec">MONTHLY PRECIPITATION</label> \
                                <input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="0.5" id="prec"></p> \
                                <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_1"/> \
                                <label class="control-label" for="bio_1">ANNUAL MEAN TEMPERATURE</label> \
                                <input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_1"></p> \
                                <p class="pclimaticvars"><input type="checkbox" id="chk_bio_2"/> \
                                <label class="control-label" for="bio_2">MEAN DIURNAL RANGE</label> \
                                <input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_2"></p> \
                                <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_3"/> \
                                <label class="control-label" for="bio_3">ISOTHERMALITY</label> \
                                <input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_3"></p> \
                                <p class="pclimaticvars"><input type="checkbox" id="chk_bio_4"/> \
                                <label class="control-label" for="bio_4">TEMPERATURE SEASONALITY \
                                </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_4"></p> \
                                <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_5"/> \
                                <label class="control-label" for="bio_5">MAX TEMPERATURE OF WARMEST PERIOD \
                                </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_5"></p> \
                                <p class="pclimaticvars"><input type="checkbox" id="chk_bio_6"/> \
                                <label class="control-label" for="bio_6">MIN TEMPERATURE OF COLDEST PERIOD \
                                </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_6"></p> \
                                <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_7"/> \
                                <label class="control-label" for="bio_7">TEMPERATURE ANNUAL RANGE \
                                </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_7"></p> \
                                <p class="pclimaticvars"><input type="checkbox" id="chk_bio_8"/> \
                                <label class="control-label" for="bio_8">MEAN TEMPERATURE OF WETTEST QUARTER \
                                </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_8"></p> \
                                <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_9"/> \
                                <label class="control-label" for="bio_9">MEAN TEMPERATURE OF DRIEST QUARTER \
                                </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_9"></p> \
                                <p class="pclimaticvars"><input type="checkbox" id="chk_bio_10"/> \
                                <label class="control-label" for="bio_10">MEAN TEMPERATURE OF WARMEST QUARTER \
                                </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_10"></p> \
                                <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_11"/> \
                                <label class="control-label" for="bio_11">MEAN TEMPERATURE OF COLDEST QUARTER \
                                </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_11"></p> \
                                <p class="pclimaticvars"><input type="checkbox" id="chk_bio_12"/> \
                                <label class="control-label" for="bio_12">ANNUAL PRECIPITATION \
                                </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_12"></p> \
                                <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_13"/> \
                                <label class="control-label" for="bio_13">PRECIPITATION OF WETTEST PERIOD \
                                </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_13"></p> \
                                <p class="pclimaticvars"><input type="checkbox" id="chk_bio_14"/> \
                                <label class="control-label" for="bio_14">PRECIPITATION OF DRIEST PERIOD \
                                </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_14"></p> \
                                <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_15"/> \
                                <label class="control-label" for="bio_15">PRECIPITATION SEASONALITY \
                                </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_15"></p> \
                                <p class="pclimaticvars"><input type="checkbox" id="chk_bio_16"/> \
                                <label class="control-label" for="bio_16">PRECIPITATION OF WETTEST QUARTER \
                                </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_16"></p> \
                                <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_17"/> \
                                <label class="control-label" for="bio_17">PRECIPITATION OF DRIEST QUARTER \
                                </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_17"></p> \
                                <p class="pclimaticvars"><input type="checkbox" id="chk_bio_18"/> \
                                <label class="control-label" for="bio_18">PRECIPITATION OF WARMEST QUARTER</label> \
                                <input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_18"></p> \
                                <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_19"/> \
                                <label class="control-label" for="bio_19">PRECIPITATION OF COLDEST QUARTER</label> \
                                <input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_19"></p> \
                        </div> \
                            </td> \
                            <td width="50%"> \
                            <div class="divOtherSettings"> \
                                <div style="display:none;"> \
					                <h5 style="display:inline; margin-right:20px;">Similarity Index:</h5> \
						            <div id="methodBtns" class="btn-group"> \
						                <button type="button" class="active btn btn-primary" name="ccafs">ccafs</button> \
						                <button type="button" class="btn" name="hallegatte">hallegatte</button> \
						            </div> \
						            <span id="similarityIndexhelp" class="icon-question-sign"></span> \
					            </div>\
					            <div id="rotationOpts"> \
					                <h5 style="display:inline; margin-right:10px;">Rotation:</h5> \
						            <div id="rotationBtns" class="btn-group"> \
						                <button type="button" class="btn" name="prec">prec</button> \
						                <button type="button" class="btn" name="tmean">tmean</button> \
						                <button type="button" class="btn" name="both">both</button> \
						                <button type="button" class="active btn btn-primary" name="none">none</button> \
						            </div> \
						            <span id="rotationhelp" class="icon-question-sign"></span> \
					            </div>\
					            <div> \
					                <h5>Temporal scope: &nbsp;&nbsp;<span id="growingseasonhelp" class="icon-question-sign"></span></h5> \
					                <div id="temporalScope" class="temporalScope"> \
						                <table style="width:100%;text-align:center;"> \
						                	<tr><td rowspan="2"><strong>Growing season date 1:</strong></td><td>Start</td><td></td><td>End</td></tr> \
						                	<tr> \
							                	<td><input id="growingSeason1_startDate" value="1" class="span1" type="number" min="1" max="12" data-dojo-type="bootstrap/Datepicker"></td> \
							                	<td></td> \
							                	<td><input id="growingSeason1_endDate" value="12" class="span1" type="number" min="1" max="12" data-dojo-type="bootstrap/Datepicker"></td> \
							                </tr> \
							                <tr><td rowspan="2"><strong>Growing season date 2:</strong></td><td>Start</td><td></td><td>End</td></tr> \
							                <tr> \
								                <td><input id="growingSeason2_startDate" value="" class="span1" type="number" min="1" max="12" data-dojo-type="bootstrap/Datepicker"></td> \
								                <td></td> \
								                <td><input id="growingSeason2_endDate" value="" class="span1" type="number" min="1" max="12" data-dojo-type="bootstrap/Datepicker"></td> \
							                </tr> \
					            		</table>\
					            	</div>\
					            </div>\
					            <div> \
					                <h5>Threshold:  \
					                <input id="threshold" type="number" step="0.01" min="0.0" max="1.0" value="0.0" class="input-mini"/> \
					                &nbsp;&nbsp;<span id="thresholdhelp" class="icon-question-sign"></span></h5> \
					            </div>\
					            </div> \
					        <p class="btnStep3"><a id="step3Btn" class="btn btn-success btn-large" href="JavaScript:void(0);" >Run Analysis &raquo;</a></p> \
					        </td> \
                        </tr> \
                    </table> \
                </div> \
		    </div>\
		</div>';
	var item3 = new CarouselItem_ege({content: content3});

	var content4 = '<div class="carousel-steps"> \
                    <table cellpadding="4" style="width:100%;height:100%;"> \
                        <tr><td style="width:50%;"> \
                        <div style="width:100%; height:400px;margin:1px;border:1px solid #999;background:#f9f9f9;"> \
                            <div id="step4" style="padding-left:15px;padding-right:15px;"> \
	                            <h3>Step 4: Selecting candidate analogue sites:</h3> \
	                            <div id="divResults"> \
	                                <table id="tablelyrResults" class="table table-striped" style="margin:5px 0px;width:100%;"> \
				                    </table> \
                                </div> \
                                <div id="sessionBtns" style="display:block;text-align:left;margin-top:5px;">\
                                	<div class="fileinputs"> \
	                                	<input id="fileToLoad" type="file" class="file" onChange="loadSession();"/> \
										<div class="fakefile"> \
											<input style="width:80px;height:20px;" class="btn btn-primary" /> \
											<p class="loadFileTitle">Load Session</p> \
										</div> \
									</div> \
									<a id="saveSessionBtn" class="btn btn-primary" href="JavaScript:saveSession();">Save Session</a>\
	                            </div> \
                                <hr style="margin:13px;"/> \
                                <div> \
                                	<div id="divProgressBar" class="progress progress-success progress-striped active"> \
                                		<div class="bar" style="width: 100%;"> \
                                		<i style="position:relative;top:4px;">Calculating Climate Analogues for the selected site...</i> \
                                		</div> \
                                	</div> \
                                	<p style="position:relative;float:left;text-align:center;"><a id="step4DownloadBtn" class="btn btn-success btn-large" href="JavaScript:void(0);" >Download Last Result</a></p> \
		                    		<p style="position:relative;float:right;text-align:center;"><a id="step4showMapLargeScreenBtn" class="btn btn-success btn-large" href="JavaScript:void(0);" >View Larger Map</a></p> \
		                    	</div> \
		                    </div> \
		                    </td><td style="width:50%;"> \
		                    	<div id="mapaResultado"><div id="loading"><div id="loadingMessage">Processing Climate Similarity...<br><img src="imgs/loading_gray_circle.gif"></div> </div></div>\
		                        <div id="mapResults">\
		                        <div id="mapResultsMouseposition" class="unselectable"></div>\
		                        <div id="mapResultsLegend" class="unselectable" title="Interpreting results: Areas that have higher similarity values more closely resemble the specified climate at the reference site."></div>\
		                        </div>\
		                    </td> </tr> \
	                    </div> \
                    </table> \
                    </div>';

	var item4 = new CarouselItem_ege({content: content4});
	//
	dojo.setAttr(item1.domNode, "data-dojo-type", "CarouselItem_ege");
	dojo.setAttr(item2.domNode, "data-dojo-type", "CarouselItem_ege");
	dojo.setAttr(item3.domNode, "data-dojo-type", "CarouselItem_ege");
	dojo.setAttr(item4.domNode, "data-dojo-type", "CarouselItem_ege");

	dojo.byId('analoguesSteps').appendChild(item1.domNode);
	dojo.byId('analoguesSteps').appendChild(item2.domNode);
	dojo.byId('analoguesSteps').appendChild(item3.domNode);
	dojo.byId('analoguesSteps').appendChild(item4.domNode);

	steps = new Carousel_ege({interval: false, pauseOnHover: false, indicators: true, navigatable: false}, dojo.byId('analoguesSteps'));
	steps.startup();

	//GrowingSeasons
	var dpGS1_startDate = new Datepicker({format: 'M',minViewMode: 1},dojo.byId("growingSeason1_startDate"));
	var dpGS1_endDate = new Datepicker({format: 'M',minViewMode: 1},dojo.byId("growingSeason1_endDate"));
	var dpGS2_startDate = new Datepicker({format: 'M',minViewMode: 1},dojo.byId("growingSeason2_startDate"));
	var dpGS2_endDate = new Datepicker({format: 'M',minViewMode: 1},dojo.byId("growingSeason2_endDate"));
	dojo.connect(dpGS1_startDate,'hide', changeGrowingSeason);
    dojo.connect(dpGS1_endDate,'hide', changeGrowingSeason);
    dojo.connect(dpGS2_startDate,'hide', changeGrowingSeason);
    dojo.connect(dpGS2_endDate,'hide', changeGrowingSeason);
	
	//Event needed to control GGL maps baselayer display when div container is not visible.
	dojo.connect(dojo.query('[data-slide-to="0"]')[0], 'click', function(e){
	   	setTimeout( function() { updateMapSize();}, 200);
	});
	dojo.connect(dojo.query('[data-slide-to="3"]')[0], 'click', function(e){
	   	setTimeout( function() { updateMapSize();}, 200);
	});

	//Step 4 Default Buttons
	dojo.byId('divProgressBar').style.display = 'none';
	dojo.byId('step4showMapLargeScreenBtn').style.display = 'none';
	dojo.byId('step4DownloadBtn').style.display = 'none';
	dojo.byId('mapResultsLegend').style.display = 'none';
	dojo.byId('saveSessionBtn').style.visibility = 'hidden';
	
	//Drag 'n Drog for session file loaded
	// Setup the dnd listeners.
	var dropZone = dojo.byId('divResults');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);

	//Some Events
	dojo.connect(dojo.byId("step1Btn"), "click", stepOne);
	dojo.connect(dojo.byId("step2Btn"), "click", stepTwo);
	dojo.connect(dojo.byId("step3Btn"), "click", stepThree);
	dojo.connect(dojo.byId("step4showMapLargeScreenBtn"), "click", viewLargerMap);
	
	//Create the Map
	loadOpenLyr();
}


// Utils
function updateMapSize() {
	if (map) map.getOLMap().baseLayer.onMapResize();
	if (mapResults) mapResults.baseLayer.onMapResize();
}

function changeMapBaseMap(){
	if (map.getOLMap().getZoom() > 12) {
		map.getOLMap().baseLayer.type = 'hybrid';
		map.getOLMap().baseLayer.redraw();
	} else {
		map.getOLMap().baseLayer.type = 'roadmap';
		map.getOLMap().baseLayer.redraw();
	}
	
}

function qs_init() {
  var params = {};
  var qs = location.search.substring(1, location.search.length);

  qs = qs.replace(/\+/g, ' ');
  var args = qs.split('&'); // parse out name/value pairs separated via &

  for (var i = 0; i < args.length; i++) {
    var pair = args[i].split('=');
    var name = decodeURIComponent(pair[0]);

    var value = (pair.length==2)? decodeURIComponent(pair[1]): name;
    params[name] = value;
  }
  return params;
}



function get_osm_url (bounds) {
  var res = this.map.getOLMap().getResolution();
  var x = Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
  var y = Math.round ((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
  var z = this.map.getOLMap().getZoom();
  var limit = Math.pow(2, z);

  if (y < 0 || y >= limit) {
      return OpenLayers.Util.getImagesLocation() + "404.png";
  } else {
      x = ((x % limit) + limit) % limit;
      return this.url + z + "/" + x + "/" + y + "." + this.type;
  }

}


function setMapCenter(center, zoom) {
   var numzoom = map.getOLMap().getNumZoomLevels();
   if (zoom >= numzoom) zoom = numzoom - 1;
   map.getOLMap().setCenter(center.clone().transform(epsg4326, map.getOLMap().getProjectionObject()), zoom);
}

//OpenLayers Dojo
function layerType(id){ 
    var i = dom.byId(id);
    var v = i.value;
    map.setBaseLayerType(v);
}

function getTiempoTransc(){
  var msec = new Date() - tiempo;
  var hh = Math.floor(msec / 1000 / 60 / 60);
  msec -= hh * 1000 * 60 * 60;
  var mm = Math.floor(msec / 1000 / 60);
  msec -= mm * 1000 * 60;
  var ss = Math.floor(msec / 1000);
  msec -= ss * 1000;
  return "Time: "+mm+" min "+ss+" sec"
}

//Check out for existing site
function isMapResultLoaded(siteName) {
	for (var i=0; i < runAnalysis.length; i++){
		if (runAnalysis[i].site === siteName) {
			return true
		}
	}
	return false
}

function displayZoom(){
	changeMapBaseMap();
}

function handleMapClick(e) {
  if (siteLyr) siteLyr.removeAllFeatures();
  var point = map.getOLMap().getLonLatFromViewPortPx(e.xy);
  var lonlat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(point.lon, point.lat));
  if (siteLyr) siteLyr.addFeatures([lonlat]);
  lonlat.geometry.transform(epsg900913, epsg4326);
  dojo.byId("lng").value = parseFloat(lonlat.geometry.x).toFixed(3);
  dojo.byId("lat").value = parseFloat(lonlat.geometry.y).toFixed(3);

  if (markers) {
  	markers.clearMarkers();
  	var size = new OpenLayers.Size(24,24);
  	var offset = 0;
  	var icon = new OpenLayers.Icon('imgs/targetred.png', size, offset);
  	markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(point.lon,point.lat),icon));
  }
  dojo.query('.alertaError')[0].style.visibility = "hidden";
  updateParams();
} 

function addSiteSelected(){
	var x = dojo.byId('lng').value;
	var y = dojo.byId('lat').value;
	if (x === "" || y === "" || x === "undefined" || y === "undefined") {
		return
	}
	//Draw the user selected point
	var point = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(parseFloat(x), parseFloat(y)));
	point.geometry.transform(epsg4326, epsg900913);
	if (siteLyr) siteLyr.addFeatures([point]);
	if (markers) {
	  	markers.clearMarkers();
	  	var size = new OpenLayers.Size(24,24);
	  	var offset = 0;
	  	var icon = new OpenLayers.Icon('imgs/targetred.png', size, offset);
	  	markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(point.geometry.x,point.geometry.y),icon));
	}
	updateParams();
}

function cloneSiteSelected(sitename){
	var x = dojo.byId('lng').value;
	var y = dojo.byId('lat').value;
	if (x === "" || y === "" || x === "undefined" || y === "undefined") {
		return
	}
	//Draw the user selected point
	var point = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(parseFloat(x), parseFloat(y)));
	point.geometry.transform(epsg4326, epsg900913);
	if (site) {
	  	var size = new OpenLayers.Size(24,24);
	  	var offset = 0;
	  	var icon = new OpenLayers.Icon('imgs/targetred.png', size, offset);
	  	var marker = new OpenLayers.Marker(new OpenLayers.LonLat(point.geometry.x,point.geometry.y),icon);
	  	marker.id = sitename;
		site.addMarker(marker);
	}
}

function zoomtoZone(idCntry){
	var ll = new OpenLayers.Geometry.Point(parseFloat(zones[idCntry].bounds[0]), parseFloat(zones[idCntry].bounds[1]));
	var ur = new OpenLayers.Geometry.Point(parseFloat(zones[idCntry].bounds[2]), parseFloat(zones[idCntry].bounds[3]));
	ll.transform(epsg4326, epsg900913);
	ur.transform(epsg4326, epsg900913);
	var bounds = new OpenLayers.Bounds(ll.x, ll.y, ur.x, ur.y);
	map.getOLMap().zoomToExtent(bounds, false);
}

function checkClimaticZones(){
	var ref = dojo.byId('ClimaticZone').value;
	if (ref =="global" || ref =="africa" || ref =="asia" || ref =="australia" || ref =="europe" || 
				 ref =="latinamerica" || ref =="northamerica" || ref =="russia") {
		dojo.byId('refResolution').selectedIndex = 3;
		dojo.byId('refResolution').options[0].setAttribute('disabled','disabled');
		dojo.byId('refResolution').options[1].removeAttribute('disabled');
		dojo.byId('refResolution').options[3].removeAttribute('disabled');
	} else {
		dojo.byId('refResolution').selectedIndex = 0;
		dojo.byId('refResolution').options[0].removeAttribute('disabled');
		dojo.byId('refResolution').options[1].setAttribute('disabled','disabled');
		dojo.byId('refResolution').options[3].setAttribute('disabled','disabled');
	}

	var target = dojo.byId('SearchRange').value;
	if (target =="global" || target =="africa" || target =="asia" || target =="australia" || target =="europe" || 
				 target =="latinamerica" || target =="northamerica" || target =="russia") {
		dojo.byId('targetResolution').selectedIndex = 3;
		dojo.byId('targetResolution').options[0].setAttribute('disabled','disabled');
		dojo.byId('targetResolution').options[1].removeAttribute('disabled');
		dojo.byId('targetResolution').options[3].removeAttribute('disabled');
	} else {
		dojo.byId('targetResolution').selectedIndex = 0;
		dojo.byId('targetResolution').options[0].removeAttribute('disabled');
		dojo.byId('targetResolution').options[1].setAttribute('disabled','disabled');
		dojo.byId('targetResolution').options[3].setAttribute('disabled','disabled');
	}
}

//Zoom to Climatic Zone
function ZoomtoClimaticZone(zone){
	currentClimaticZone = zone.toString();
    if (currentClimaticZone == 'none') return;

    //Update raster resolution options
    checkClimaticZones(); //Regla temporal mientras se actualiza la informacion y se agregan mas datos
    
    switch(currentClimaticZone.toString()){
    	case 'global':
    		map.getOLMap().zoomToExtent(initialExtent);
    		break;
        case 'africa':
        	map.getOLMap().zoomToExtent(new OpenLayers.Bounds(-2318793.6896435,-3600489.7797,6545455.6049441,4226661.9153), true);
            break;
        case 'asia':
            map.getOLMap().zoomToExtent(new OpenLayers.Bounds(6017122.8655892,-127191.2150436,14881372.160177,7699960.4799564), true);
            break;
        case 'australia':
        	map.getOLMap().zoomToExtent(new OpenLayers.Bounds(11557278.674674,-7391766.3819652,20421527.969262,435385.3130348), true);
            break;
        case 'europe':
        	map.getOLMap().zoomToExtent(new OpenLayers.Bounds(-919690.32412488,4089686.7606372,3512434.3231689,8003262.6081372), true);
            break;
        case 'latinamerica':
        	map.getOLMap().zoomToExtent(new OpenLayers.Bounds(-11667347.995321,-5224623.7564125,-2803098.7007339,2602527.9385875), false);
            break;
        case 'northamerica':
        	map.getOLMap().zoomToExtent(new OpenLayers.Bounds(-16104364.612416,2690583.3951568,-7240115.3178282,10517735.090157), true);
            break;
        case 'russia':
        	map.getOLMap().zoomToExtent(new OpenLayers.Bounds(6075826.5032472,5792092.254294,14940075.797835,13619243.949294), true);
            break;
        // Local Climate Data
        default:
        	map.fitTo(zones[zone].bounds);
            break;
    }
}

function getSearchRangeExtent(){
	var extent = initialExtent;
	var searchRangeval = dojo.byId('SearchRange').value;

	if (searchRangeval != "global") {
		cntryiso = zones[parseInt(searchRangeval)].iso;
		extent = getExtentbyCountry(cntryiso);
	}
	return extent;
}

/*
 * Get Zones
 */
 function getZones(url){
  var def = new dojo.Deferred();
  var csv = new dojox.data.CsvStore({
    url: url
  });

  csv.fetch({
    onComplete: dojo.partial(processZonesCsv, def),
    onError: function (err) {
    console.log("Zones csv error: ", err);
    }
  });
  return def;
}

function processZonesCsv(def, items, request) { 
	//process csv data and create in memory object store.
	var store = request.store;
	dojo.forEach(items, function (item, i) {
	    //ISO,COUNTRY,XMIN,XMAX,YMIN,YMAX,DX,DY,NCOLS,NROWS,NTILES,NCOLS_TILES,NROWS_TILES
	    var iso = store.getValue(item, "ISO");
	    var country = store.getValue(item, "COUNTRY");
	    var xmin = parseFloat(store.getValue(item, "XMIN"), 10);
	    var xmax = parseFloat(store.getValue(item, "XMAX"), 10);
	    var ymin = parseFloat(store.getValue(item, "YMIN"), 10);
	    var ymax = parseFloat(store.getValue(item, "YMAX"), 10);
	    var ntiles = parseInt(store.getValue(item, "NTILES"), 10);
	    
	    var attributes = { "iso": iso, "country": country, "bounds": [xmin, ymin, xmax, ymax], "ntiles": ntiles }; 
	    zones.push(attributes);
	  });
	def.resolve(zones);
}

function loadZones(){
  getZones("./config/zones.csv")
  .then(function(res){
      	//Create Steps
		createSteps();
  });
}


/*
 * Get current Direction and setup global climate models parameters
 */
function changeDirection(evt){
	evt.stopPropagation(); // prevent default bootstrap behavior
	if( !evt ) evt = window.event;
    var e = evt.target||evt.srcElement;
	if (e.type != "button") return
	var dir = e.name;
	//Update Button selected
	dojo.forEach(dojo.query('#directionBtns.btn-group > button.btn'), function(entry){
	    dojo.removeClass(entry,'active btn-primary');
	});
	e.className = 'active btn btn-primary';
	//Setting up rules or constraints
	setupGCMsbyDirection(dir);
}


function getRefModelGCM_Selected(){
	var selected = [];
	dojo.forEach(dojo.byId('refgcm').options, function(opt){
	    if(opt.selected) {
            selected.push(opt.value);
       	}
	});
	return selected
}

function getTargetModelGCM_Selected(){
	var selected = [];
	dojo.forEach(dojo.byId('targetgcm').options, function(opt){
	    if(opt.selected) {
            selected.push(opt.value);
       	}
	});
	return selected
}

/*
 * 
 */
function setupGCMsbyDirection(dir){
	switch(dir){
		case 'none':
			//reference
			dojo.byId('refPeriod').removeAttribute('disabled');
			dojo.byId('refPeriod').selectedIndex = 0;
			dojo.byId('refPeriod').options[0].removeAttribute('disabled');
			dojo.byId('refScenario').removeAttribute('disabled');
			dojo.byId('refScenario').selectedIndex = 0;
			dojo.byId('refScenario').options[0].removeAttribute('disabled');
			dojo.byId('refgcm').removeAttribute('disabled');
			dojo.byId('refgcm').selectedIndex = 0;
			dojo.byId('refgcm').options[0].removeAttribute('disabled');
			// dojo.byId('refResolution').selectedIndex = 0;

			//target
			dojo.byId('targetPeriod').removeAttribute('disabled');
			dojo.byId('targetPeriod').selectedIndex = 0;
			dojo.byId('targetPeriod').options[0].removeAttribute('disabled');
			dojo.byId('targetScenario').removeAttribute('disabled');
			dojo.byId('targetScenario').selectedIndex = 0;
			dojo.byId('targetScenario').options[0].removeAttribute('disabled');
			dojo.byId('targetgcm').removeAttribute('disabled');
			dojo.byId('targetgcm').selectedIndex = 0;
			dojo.byId('targetgcm').options[0].removeAttribute('disabled');

			var refgcm = getRefModelGCM_Selected();
			var targetgcm = getTargetModelGCM_Selected();

			if (targetgcm && targetgcm.length > 1) {
				dojo.byId('errMsg').innerHTML = '<h4 class="alert-heading">Target GCM</h4> \
	                            				<p>Please select just one Reference model or change the direction option</p>';
				dojo.query('#alertMsg').removeClass('alert-error');
				dojo.query('.alertaError')[0].style.visibility = "visible";
				
				return;
			}

			changeRefPeriod(null);
			changeTargetPeriod(null);
			break;
		case 'backward':
			//reference
			dojo.byId('refPeriod').removeAttribute('disabled');
			dojo.byId('refPeriod').selectedIndex = 1;
			dojo.byId('refPeriod').options[0].setAttribute('disabled','disabled');
			dojo.byId('refScenario').removeAttribute('disabled');
			dojo.byId('refScenario').selectedIndex = 1;
			dojo.byId('refScenario').options[0].setAttribute('disabled','disabled');
			dojo.byId('refScenario').options[1].removeAttribute('disabled');//SRES A1B
			dojo.byId('refScenario').options[2].removeAttribute('disabled');//SRES A2
			dojo.byId('refScenario').options[3].removeAttribute('disabled');//SRES B1
			dojo.byId('refgcm').removeAttribute('disabled');
			dojo.byId('refgcm').selectedIndex = 1;
			dojo.byId('refgcm').options[0].setAttribute('disabled','disabled');
			// dojo.byId('refResolution').selectedIndex = 0;

			//target
			dojo.byId('targetPeriod').selectedIndex = 0;
			dojo.byId('targetPeriod').setAttribute('disabled','disabled');
			dojo.byId('targetScenario').selectedIndex = 0;
			dojo.byId('targetScenario').setAttribute('disabled','disabled');
			dojo.byId('targetgcm').selectedIndex = 0;
			dojo.byId('targetgcm').setAttribute('disabled','disabled');
			// dojo.byId('targetResolution').selectedIndex = 0;

			changeRefScenario(null);
			break;
		case 'forward':
			//reference
			dojo.byId('refPeriod').setAttribute('disabled','disabled');
			dojo.byId('refPeriod').selectedIndex = 0;
			dojo.byId('refScenario').setAttribute('disabled','disabled');
			dojo.byId('refScenario').selectedIndex = 0;
			dojo.byId('refScenario').options[0].removeAttribute('disabled');
			dojo.byId('refgcm').setAttribute('disabled','disabled');
			dojo.byId('refgcm').selectedIndex = 0;
			// dojo.byId('refResolution').selectedIndex = 0;

			//target
			dojo.byId('targetPeriod').selectedIndex = 1;
			dojo.byId('targetPeriod').removeAttribute('disabled');
			dojo.byId('targetPeriod').options[0].setAttribute('disabled','disabled');
			dojo.byId('targetScenario').selectedIndex = 1;
			dojo.byId('targetScenario').removeAttribute('disabled');
			dojo.byId('targetScenario').options[0].setAttribute('disabled','disabled');
			dojo.byId('targetScenario').options[1].removeAttribute('disabled');
			dojo.byId('targetScenario').options[2].removeAttribute('disabled');
			dojo.byId('targetScenario').options[3].removeAttribute('disabled');
			dojo.byId('targetgcm').selectedIndex = 1;
			dojo.byId('targetgcm').removeAttribute('disabled');
			dojo.byId('targetgcm').options[0].setAttribute('disabled','disabled');
			// dojo.byId('targetResolution').selectedIndex = 0;

			changeTargetScenario(null);
			break;
	}
	
	updateParams();
}

/*
 * Get current Reference Period
 */
function changeRefPeriod(e){
	//console.log('changeRefPeriod');
	var refPeriod = dojo.byId('refPeriod').value;
	switch(refPeriod) {
		case '1960_1990':
			if (analoguesParams.direction == "none") {
				//dojo.byId('refScenario').setAttribute('disabled','disabled');
				dojo.byId('refScenario').options[0].removeAttribute('disabled');
				dojo.byId('refScenario').options[1].setAttribute('disabled','disabled');
				dojo.byId('refScenario').options[2].setAttribute('disabled','disabled');
				dojo.byId('refScenario').options[3].setAttribute('disabled','disabled');
				dojo.byId('refScenario').selectedIndex = 0;
				//present to present
				dojo.byId('targetPeriod').removeAttribute('disabled');
				dojo.byId('targetPeriod').selectedIndex = 0;
				dojo.byId('targetPeriod').options[0].removeAttribute('disabled');
				dojo.byId('targetScenario').options[0].removeAttribute('disabled');
				dojo.byId('targetScenario').options[1].setAttribute('disabled','disabled');
				dojo.byId('targetScenario').options[2].setAttribute('disabled','disabled');
				dojo.byId('targetScenario').options[3].setAttribute('disabled','disabled');
				dojo.byId('targetScenario').selectedIndex = 0;
			}

			break;
		case '2020_2049':
			if (analoguesParams.direction == "none") {
				//dojo.byId('refScenario').setAttribute('disabled','disabled');
				dojo.byId('refScenario').options[0].setAttribute('disabled','disabled');
				dojo.byId('refScenario').options[1].removeAttribute('disabled');
				dojo.byId('refScenario').options[2].removeAttribute('disabled');
				dojo.byId('refScenario').options[3].removeAttribute('disabled');
				dojo.byId('refScenario').selectedIndex = 1;

				//present to present
				dojo.byId('targetPeriod').removeAttribute('disabled');
				dojo.byId('targetPeriod').selectedIndex = 1;
				dojo.byId('targetPeriod').options[1].removeAttribute('disabled');
				dojo.byId('targetScenario').options[1].removeAttribute('disabled');
				dojo.byId('targetScenario').options[2].removeAttribute('disabled');
				dojo.byId('targetScenario').options[3].removeAttribute('disabled');
				dojo.byId('targetScenario').options[0].setAttribute('disabled','disabled');
				dojo.byId('targetScenario').selectedIndex = 1;
			}
			
			break;
	}
	changeRefScenario(null);
	changeTargetScenario(null);

}
/*
 * Get current Reference Scenario
 */
function changeRefScenario(e){
	//console.log('changeRefScenario');
	var refScenario = dojo.byId('refScenario').value;
	var refgcm = dojo.byId('refgcm').options;
	switch(refScenario) {
		case 'baseline':
			for (var i = 0; i < refgcm.length; i++) {
				if (refgcm[i].value != "CURRENT")
					refgcm[i].setAttribute('disabled','disabled'); //refgcm[i].style.visibility = 'hidden';
			}
			dojo.byId('refgcm').selectedIndex = 0;
			break;
		case 'a1b':
			dojo.byId('refgcm').options[0].setAttribute('disabled','disabled');
			for (var i = 0; i < refgcm.length; i++) {
				if (refgcm[i].value != "CURRENT")
					refgcm[i].removeAttribute('disabled');
			}
			dojo.byId('refgcm').selectedIndex = 1;
			break;
		case 'a2':
			dojo.byId('refgcm').options[0].setAttribute('disabled','disabled');
			for (var i = 0; i < refgcm.length; i++) {
				if (refgcm[i].value != "CURRENT")
					refgcm[i].removeAttribute('disabled');
			}
			dojo.byId('refgcm').selectedIndex = 1;
			break;
		case 'b1':
			dojo.byId('refgcm').options[0].setAttribute('disabled','disabled');
			for (var i = 0; i < refgcm.length; i++) {
				if (refgcm[i].value != "CURRENT")
					refgcm[i].removeAttribute('disabled');
			}
			dojo.byId('refgcm').selectedIndex = 1;
			break;
	}
	updateParams();
}
/*
 * Get current Reference GCMs
 */
function changeRefGCM(e){
	var refgcm = getRefModelGCM_Selected();
	if (refgcm && refgcm.length > 3) {
    	dojo.byId('errMsg').innerHTML = '<h4 class="alert-heading">Warning in Model: Reference GCMs</h4> \
                            			<p>More than 3 reference GCMs are selected, so that, It will take a long time to get results...</p>';
        dojo.query('#alertMsg').removeClass('alert-error');
		dojo.query('.alertaError')[0].style.visibility = "visible";
		return -1
    }
    dojo.query('.alertaError')[0].style.visibility = "hidden";
    updateParams();
    return 1
}

/*
 * Get current Reference Resolution
 */
function changeRefResolution(e){
	updateParams();
}

/*
 * Get current Target Period
 */
function changeTargetPeriod(e){
	//console.log('changeTargetPeriod');
	var targetPeriod = dojo.byId('targetPeriod').value;
	switch(targetPeriod) {
		case '1960_1990':
			//dojo.byId('targetScenario').setAttribute('disabled','disabled');
			dojo.byId('targetScenario').options[0].removeAttribute('disabled');
			dojo.byId('targetScenario').options[1].setAttribute('disabled','disabled');
			dojo.byId('targetScenario').options[2].setAttribute('disabled','disabled');
			dojo.byId('targetScenario').options[3].setAttribute('disabled','disabled');
			dojo.byId('targetScenario').selectedIndex = 0;

			//present to present
			dojo.byId('refPeriod').removeAttribute('disabled');
			dojo.byId('refPeriod').selectedIndex = 0;
			dojo.byId('refPeriod').options[0].removeAttribute('disabled');
			dojo.byId('refScenario').options[0].removeAttribute('disabled');
			dojo.byId('refScenario').options[1].setAttribute('disabled','disabled');
			dojo.byId('refScenario').options[2].setAttribute('disabled','disabled');
			dojo.byId('refScenario').options[3].setAttribute('disabled','disabled');
			dojo.byId('refScenario').selectedIndex = 0;

			break;
		case '2020_2049':
			//dojo.byId('targetScenario').setAttribute('disabled','disabled');
			dojo.byId('targetScenario').options[0].setAttribute('disabled','disabled');
			dojo.byId('targetScenario').options[1].removeAttribute('disabled');
			dojo.byId('targetScenario').options[2].removeAttribute('disabled');
			dojo.byId('targetScenario').options[3].removeAttribute('disabled');
			dojo.byId('targetScenario').selectedIndex = 1;

			//present to present
			dojo.byId('refPeriod').removeAttribute('disabled');
			dojo.byId('refPeriod').selectedIndex = 1;
			dojo.byId('refPeriod').options[1].removeAttribute('disabled');
			dojo.byId('refScenario').options[1].removeAttribute('disabled');
			dojo.byId('refScenario').options[2].removeAttribute('disabled');
			dojo.byId('refScenario').options[3].removeAttribute('disabled');
			dojo.byId('refScenario').options[0].setAttribute('disabled','disabled');
			dojo.byId('refScenario').selectedIndex = 1;
						
			break;
	}
	changeRefScenario(null);
	changeTargetScenario(null);
}
/*
 * Get current Target Scenario
 */
function changeTargetScenario(e){
	//console.log('changeTargetScenario');
	var targetScenario = dojo.byId('targetScenario').value;
	var targetgcm = dojo.byId('targetgcm').options;
	switch(targetScenario) {
		case 'baseline':
			for (var i = 0; i < targetgcm.length; i++) {
				if (targetgcm[i].value != "CURRENT")
					targetgcm[i].setAttribute('disabled','disabled'); //refgcm[i].style.visibility = 'hidden';
			}
			dojo.byId('targetgcm').selectedIndex = 0;
			break;
		case 'a1b':
			dojo.byId('targetgcm').options[0].setAttribute('disabled','disabled');
			for (var i = 0; i < targetgcm.length; i++) {
				if (targetgcm[i].value != "CURRENT")
					targetgcm[i].removeAttribute('disabled');
			}
			dojo.byId('targetgcm').selectedIndex = 1;
			break;
		case 'a2':
			dojo.byId('targetgcm').options[0].setAttribute('disabled','disabled');
			for (var i = 0; i < targetgcm.length; i++) {
				if (targetgcm[i].value != "CURRENT")
					targetgcm[i].removeAttribute('disabled');
			}
			dojo.byId('targetgcm').selectedIndex = 1;
			break;
		case 'b1':
			dojo.byId('targetgcm').options[0].setAttribute('disabled','disabled');
			for (var i = 0; i < targetgcm.length; i++) {
				if (targetgcm[i].value != "CURRENT")
					targetgcm[i].removeAttribute('disabled');
			}
			dojo.byId('targetgcm').selectedIndex = 1;
			break;
	}
	updateParams();
}
/*
 * Get current Target GCMs
 */
function changeTargetGCM(e){
	var targetgcm = getTargetModelGCM_Selected();
	
    if (targetgcm && targetgcm.length > 3) {
    	dojo.byId('errMsg').innerHTML = '<h4 class="alert-heading">Warning in Model: Target GCMs</h4> \
                            			<p>More than 3 target GCMs are selected, so that, It will take a long time to get results...</p>';
		dojo.query('#alertMsg').removeClass('alert-error');
		dojo.query('.alertaError')[0].style.visibility = "visible";
		return -1
    }
    dojo.query('.alertaError')[0].style.visibility = "hidden";
    updateParams();
    return 1
}

/*
 * Get current Target Resolution
 */
function changeTargetResolution(e){
	updateParams();
}

//
function changeMethod(evt){
	evt.stopPropagation(); // prevent default bootstrap behavior
	if( !evt ) evt = window.event;
    var e = evt.target||evt.srcElement;
	if (e.type != "button") return
	var method = e.name;
	//Update Button selected
	dojo.forEach(dojo.query('#methodBtns.btn-group > button.btn'), function(entry){
	    dojo.removeClass(entry,'active btn-primary');
	});
	e.className = 'active btn btn-primary';
	//Setting up rules or constraints
	switch(method){
		case 'ccafs':
			break;
		case 'hallegatte':
			break;
	}
	updateParams();
}

function changeRotation(evt){
	evt.stopPropagation(); // prevent default bootstrap behavior
	if( !evt ) evt = window.event;
    var e = evt.target||evt.srcElement;
	if (e.type != "button") return
	var rot = e.name;
	//Update Button selected
	dojo.forEach(dojo.query('#rotationBtns.btn-group > button.btn'), function(entry){
	    dojo.removeClass(entry,'active btn-primary');
	});
	e.className = 'active btn btn-primary';
	//Setting up rules or constraints
	switch(rot){
		case 'prec':
			break;
		case 'tmean':
			break;
		case 'both':
			break;
		case 'none':
			break;
	}
	updateParams();
}

function onkeypressClimaticVars(){
	var error = false; 
	dojo.forEach(dojo.query('#divclimaticvars input'), function(i){
		if (i.type != "checkbox" && (parseFloat(i.value) < 0.0 || parseFloat(i.value) > 1.0)) {
			error = true;
		}
	});
	if (error) {
    	dojo.byId('errMsg').innerHTML = '<h4 class="alert-heading">Warning in Climatic Variables: Weights</h4> \
                            			<p>The weights are valid values between 0.0 and 1.0</p>';
        dojo.query('#alertMsg').removeClass('alert-error');
		dojo.query('.alertaError')[0].style.visibility = "visible";
		return
    }

    dojo.query('.alertaError')[0].style.visibility = "hidden";
}
function changeClimaticVars(){
	var sum = 0.0;
	var numvars = 0;

	//Disable all null inputs
	dojo.forEach(dojo.query('#divclimaticvars input'), function(i){
		if (i.type == "checkbox" && i.checked == true) {
             var id = i.id.replace("chk_","");
             dojo.byId(id).removeAttribute('disabled');
             var val = dojo.byId(id).value;
             if(parseFloat(val) == 0) {
             	dojo.byId(id).setAttribute('disabled','disabled');
            	dojo.byId(id).value = "";
            	dojo.byId(i.id).checked = false;
             }
             if (id !== 'tmean' && id !== 'prec') {
	            dojo.byId('rotationOpts').style.visibility = "hidden";
	         } else {
	         	if (id == 'tmean' || id == 'prec') dojo.byId('rotationOpts').style.visibility = "visible";
	         }
             sum += parseFloat(val);
        } else if (i.type == "checkbox" && i.checked == false) {
        	var id = i.id.replace("chk_","");
            dojo.byId(id).setAttribute('disabled','disabled');
            dojo.byId(id).value = "";
        }
	});

	dojo.forEach(dojo.query('#divclimaticvars input'), function(i){
		if (i.type == "checkbox" && i.checked == true)
			numvars ++;
	});
	//Constraint to allow run analysis without errors
	if (numvars == 1) {
		if (dojo.byId('chk_tmean').checked  && analoguesParams.rotation == "prec") {
			dojo.byId('errMsg').innerHTML = '<h4 class="alert-heading">Warning in Rotation: Precipitation</h4> \
                            			<p>It\'s not possible to rotate precipitation values with only temperature data.</p>';
			dojo.query('#alertMsg').removeClass('alert-error');
			dojo.query('.alertaError')[0].style.visibility = "visible";
			return -1
		}
		if (dojo.byId('chk_prec').checked  && analoguesParams.rotation == "tmean") {
			dojo.byId('errMsg').innerHTML = '<h4 class="alert-heading">Warning in Rotation: Mean Temperature</h4> \
                            			<p>It\'s not possible to rotate temperature values with only precipitation data.</p>';
			dojo.query('#alertMsg').removeClass('alert-error');
			dojo.query('.alertaError')[0].style.visibility = "visible";
			return -1
		}
	}

	if (sum != 1.0 && numvars > 0) {
    	dojo.byId('errMsg').innerHTML = '<h4 class="alert-heading">Warning in Climatic Variables: Weights</h4> \
                            			<p>The sum of the weights must be 1</p>';
		//dojo.query('#alertMsg').removeClass('alert-error');
		dojo.query('.alertaError')[0].style.visibility = "visible";
		return -1
    }

	if (numvars > 5) {
    	dojo.byId('errMsg').innerHTML = '<h4 class="alert-heading">Warning in Climatic Variables:</h4> \
                            			<p>The number of variables selected are incorrect. You could select a maximum of five (5)</p>';
        dojo.query('#alertMsg').removeClass('alert-error');
		dojo.query('.alertaError')[0].style.visibility = "visible";
		return -1
    }

    dojo.query('.alertaError')[0].style.visibility = "hidden";
    updateParams();
    return 1
}


function changeGrowingSeason(){
	var GS1_SD = dojo.byId('growingSeason1_startDate').value;
	var GS1_ED = dojo.byId('growingSeason1_endDate').value;
	var GS2_SD = dojo.byId('growingSeason2_startDate').value;
	var GS2_ED = dojo.byId('growingSeason2_endDate').value;

	if (GS1_SD < 1 || GS1_SD > 12 || GS1_ED < 1 || GS1_ED > 12) {
    	dojo.byId('errMsg').innerHTML = '<h4 class="alert-heading">Error in Temporal Scope: Growing Season date 1</h4> \
                            			<p>Please check out the values for Start and End Date.</p>';
		dojo.query('#alertMsg').addClass('alert-error');
		dojo.query('.alertaError')[0].style.visibility = "visible";
		return -1
    }
    if (GS2_SD !="" || GS2_ED !="" ){
    	if (GS2_SD < 1 || GS2_SD > 12 || GS2_ED < 1 || GS2_ED > 12) {
	    	dojo.byId('errMsg').innerHTML = '<h4 class="alert-heading">Error in Temporal Scope: Growing Season date 2</h4> \
	                            			<p>Please check out the values for Start and End Date.</p>';
			dojo.query('#alertMsg').addClass('alert-error');
			dojo.query('.alertaError')[0].style.visibility = "visible";
			return -1
	    }
    }
    
    dojo.query('.alertaError')[0].style.visibility = "hidden";
    updateParams();
    return 1
}

function resetParams(){
	changeRefPeriod(null);
	changeTargetPeriod(null);
}

/*
 * Update Params object
 */
function updateParams() {

	//Step 1
	var source = dojo.byId('ClimaticZone').value;
	var target = dojo.byId('SearchRange').value;
	var x = dojo.byId('lng').value;
	var y = dojo.byId('lat').value;
	//Step 2
	var direction = dojo.query('#directionBtns.btn-group > button.active')[0].name;
	var refPeriod = dojo.byId('refPeriod').value;
	var targetPeriod = dojo.byId('targetPeriod').value;
	var refScenario = dojo.byId('refScenario').value;
	var targetScenario = dojo.byId('targetScenario').value;
	var refResolution = dojo.byId('refResolution').value;
	var targetResolution = dojo.byId('targetResolution').value;
	var refgcm = getRefModelGCM_Selected();
	var targetgcm = getTargetModelGCM_Selected();
	//Step 3
	var rotation = dojo.query('#rotationBtns.btn-group > button.active')[0].name;
	var growingSeason1_startDate = dojo.byId('growingSeason1_startDate').value;
	var growingSeason1_endDate = dojo.byId('growingSeason1_endDate').value;
	var growingSeason2_startDate = dojo.byId('growingSeason2_startDate').value;
	var growingSeason2_endDate = dojo.byId('growingSeason2_endDate').value;
	//Threshold
	var threshold = parseFloat(dojo.byId('threshold').value);

	//
	//Create a blank analogues parameters object to support several results
	analoguesParams = new Parameters();
	analoguesParams.x = x;
	analoguesParams.y = y;
	if (source !="none") {
		if (target !="global" && source !="global") {
			analoguesParams.zones = [zones[source].iso, zones[target].iso];
		} else if (target =="global" && source !="global") {
			analoguesParams.zones = [zones[source].iso, "global"];
		} else if (target !="global" && source =="global") {
			analoguesParams.zones = ["global", zones[target].iso];
		} else if (target =="global" && source =="global") {
			analoguesParams.zones = ["global", "global"];
		}
	} else {
		analoguesParams.zones = ["global", "global"];
	}
	
	analoguesParams.direction = direction;
	analoguesParams.period = [refPeriod, targetPeriod];
	analoguesParams.scenario = [refScenario, targetScenario];
	analoguesParams.resolution = [refResolution, targetResolution];
	analoguesParams.model = [];
	if (refgcm)
		for (var i = 0; i < refgcm.length; i++) analoguesParams.model.push(refgcm[i].toLowerCase());
	if (targetgcm)
   		for (var i = 0; i < targetgcm.length; i++) analoguesParams.model.push(targetgcm[i].toLowerCase());
    
    analoguesParams.vars = [];
    analoguesParams.weights = [];
    dojo.forEach(dojo.query('#divclimaticvars input'), function(i){
		if (i.type != "checkbox" && parseFloat(i.value) > 0.0) {
			analoguesParams.vars.push(i.id);
			analoguesParams.weights.push(i.value);
		}	
	});

    analoguesParams.rotation = rotation;
    analoguesParams.threshold = threshold;

    if (growingSeason2_startDate != ""){
    	analoguesParams.growingseason = [growingSeason1_startDate +':'+growingSeason1_endDate, growingSeason2_startDate+':'+growingSeason2_endDate];
    } else {
    	analoguesParams.growingseason = [growingSeason1_startDate +':'+growingSeason1_endDate];
    }
    

}

/*
 * Run Analogues in R
 */
function runAnalogues() {
    tiempo = new Date();
    dojo.byId('mapaResultado').style.display = 'block';
    dojo.byId('mapaResultado').style.opacity = '1';
    dojo.byId('loading').style.display = 'block';
    dojo.query('[data-dojo-attach-point="indicatorsNode"]')[0].style.visibility = "hidden";
    OpenLayers.Request.GET({
        url: wps,
        params: {
            "SERVICE": "WPS",
            "REQUEST": "GetCapabilities"
        },
        success: function(response){
            capabilities = new OpenLayers.Format.WPSCapabilities().read(
                response.responseText
            );
            //Get information about the process
            if (capabilities) {
              var selection = 'analogues';
              OpenLayers.Request.GET({
                  url: wps,
                  params: {
                      "SERVICE": "WPS",
                      "REQUEST": "DescribeProcess",
                      "VERSION": capabilities.version,
                      "STATUS": true,
                      "IDENTIFIER": selection
                  },
                  success: function(response) {
                      process = new OpenLayers.Format.WPSDescribeProcess().read(
                          response.responseText
                      ).processDescriptions[selection];
                      
                      // execute the process
                      if(process) {
                          	//Unique Name for the Climate Layer results
							var country = analoguesParams.zones[1];
							tileLayerName = country.toUpperCase() + "_" + new Date().getTime();

							process.dataInputs = [{ identifier: 'Lng', data: { literalData: { value: parseFloat(analoguesParams.x) } } }, 
	                                                { identifier: 'Lat', data: { literalData: { value: parseFloat(analoguesParams.y) } } },
	                                                { identifier: 'Method', data: { literalData: { value: analoguesParams.method } } },
	                                                { identifier: 'Model', data: { literalData: { value: analoguesParams.getModel() } } },
	                                                { identifier: 'Vars', data: { literalData: { value: analoguesParams.getVars() } } },
	                                                { identifier: 'Weights', data: { literalData: { value: analoguesParams.getWeights() } } },
	                                                { identifier: 'Ndivisions', data: { literalData: { value: analoguesParams.getNdivisions() } } },
	                                                { identifier: 'Envdata', data: { literalData: { value: analoguesParams.envdata } } },
	                                                { identifier: 'Ext', data: { literalData: { value: analoguesParams.ext } } },
	                                                { identifier: 'Direction', data: { literalData: { value: analoguesParams.direction } } },
	                                                { identifier: 'Growingseason', data: { literalData: { value: analoguesParams.getGrowingseason2() } } },
	                                                { identifier: 'Rotation', data: { literalData: { value: analoguesParams.rotation } } },
	                                                { identifier: 'Period', data: { literalData: { value: analoguesParams.getPeriod() } } },
	                                                { identifier: 'Zones', data: { literalData: { value: analoguesParams.getZones() } } },
	                                                { identifier: 'Resolution', data: { literalData: { value: analoguesParams.getResolution() } } },
	                                                { identifier: 'Scenario', data: { literalData: { value: analoguesParams.getScenario() } } },
	                                                { identifier: 'Outfile', data: { literalData: { value: analoguesParams.outfile } } },
	                                                { identifier: 'Threshold', data: { literalData: { value: parseFloat(analoguesParams.threshold) } } },
	                                                { identifier: 'TileLayerName', data: { literalData: { value: tileLayerName } } }
	                                              ];
	                        

							process.responseForm = { parameters: { identifier: "params" } };
							OpenLayers.Request.POST({
	                              url: wps,
	                              async: true,
	                              data: new OpenLayers.Format.WPSExecute().write(process),
	                              success: showOutput,
	                              failure: function(e){ 
	                              			  console.log(e.responseText);
	                                        }
                          	});
                      } else {
                        console.log('Error on describing services...');
                      }

                  }
              });
            } else {
              console.log('Error trying to get the geoservices...');
            }
            
        }
    });
}

// add the process's output to the page
function showOutput(response) {
	//if (mapResults) mapResults.destroy();
	dojo.fadeOut({ node: dojo.byId('mapaResultado'), duration: 1200 }).play();
	var t2 = setTimeout( function() { 
		dojo.byId('mapaResultado').style.display = 'none';
		dojo.byId('loading').style.display = 'none';
		dojo.query('[data-dojo-attach-point="indicatorsNode"]')[0].style.visibility = "visible";
	}, 1500);
	
	var urls = [
	    "http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
	    "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
	    "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"
	];
	if (!mapRsultsLoaded){
		mapResults = new OpenLayers.Map('mapResults', {
			maxExtent: new OpenLayers.Bounds(-20037508.3427892,-20037508.3427892,20037508.3427892,20037508.3427892), 
			numZoomLevels:22, 
			maxResolution:156543.03390625, 
			units:'m', 
			projection: epsg3857,
			displayProjection: epsg4326,
			controls: [ new OpenLayers.Control.Attribution(),
						new OpenLayers.Control.TouchNavigation({
						  dragPanOptions: {
						      enableKinetic: true
						  }
						}),
						new OpenLayers.Control.Zoom(),
						new OpenLayers.Control.ScaleLine(),
						new OpenLayers.Control.Navigation({zoomWheelEnabled:false})
						],
			layers: [
		             	new OpenLayers.Layer.XYZ("OSM", urls, {
				            transitionEffect: "resize", buffer: 2, sphericalMercator: true,
				            attribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
				        })
			        ]
			
		});

		mapResults.layerContainerDiv.style.position = 'relative'; //Bug OL, Necesario cuando esta dentro de elementos anidados
		site = new OpenLayers.Layer.Markers( "Sites Selected" ); //tileLayerName
	  	site.animationEnabled = true;
	  	mapResults.addLayer(site);
	  	mapRsultsLoaded = true;

	}

	if (tileLayerName) addLayerResultstoMap(tileLayerName);
	//Add result to Map Gallery
	if(response) addLastResultstoMapGallery(tileLayerName);
	
    //Zoom to search range
    mapResults.zoomToExtent(getSearchRangeExtent(), true);
    cloneSiteSelected(tileLayerName);
  	mapResults.updateSize();

  	//Display Step 4 Buttons
  	dojo.byId('divProgressBar').style.display = 'none';
  	if (dojo.isFF >= 3.6 || dojo.isChrome >= 6.0 || dojo.isSafari >= 6.0 || dojo.isOpera >= 11.1 || dojo.isIE >= 10.0) {
		dojo.byId('sessionBtns').style.display = 'block';
	}
	if (dojo.isFF >= 10.0 || dojo.isChrome >= 20.0 || dojo.isSafari >= 5.1 || dojo.isOpera >= 12.1 || dojo.isIE >= 11.0) {
		dojo.byId('step4showMapLargeScreenBtn').style.display = 'block';
	}

	dojo.byId('step4DownloadBtn').style.display = 'block';
	dojo.byId('mapResultsLegend').style.display = 'block';

	//Show interpreting results msg.
	dojo.byId('errMsg').innerHTML = '<p>Areas that have higher similarity values more closely resemble the specified climate at the reference site.</p>';
	dojo.query('#alertMsg').removeClass('alert-error');
	dojo.query('#alertMsg').addClass('alert-info');
	dojo.query('.alertaError')[0].style.visibility = "visible";

	setTimeout( function() { 
		dojo.query('#alertMsg').removeClass('alert-info');
		dojo.query('.alertaError')[0].style.visibility = "hidden"; 
	}, 15000);
	
}

function addLayerResultstoMap(lyrName){
	if (!lyrName) {
		lyrName = tileLayerName;
	} else {
		tileLayerName = lyrName;
    }
    climateSimLyr = new OpenLayers.Layer.TMS(  lyrName,  ["analogues/outputs/"+lyrName+"/tiles/cache/"], {type:'png', getURL: getAnaloguesMap_url,
    	attribution: "&copy; <a href='http://www.ciat.cgiar.org/' target='new'>CIAT</a>, <a href='http://ernestogiron.blogspot.com/' target='new'>egiron</a>", isBaseLayer: false,
    	transitionEffect: null, visibility: true, opacity: 0.95, alpha: true} );  /* 2014-03-20 id:02 modification from the direction new OpenLayers.Layer.TMS(  lyrName,  ["/tiles/"+lyrName+"/"]*/
    
    climateResultsLayers.push(climateSimLyr);
    mapResults.addLayer(climateSimLyr);
    mapResults.raiseLayer(climateSimLyr, -1);

    //Add results to array
    runAnalysis.push({site:lyrName, params:analoguesParams});
    //Add to Layer Manager
    addRow_Results();
}

function getAnaloguesMap_url (bounds) {
  var res = mapResults.getResolution();
  var x = Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
  var y = Math.round ((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
  var z = mapResults.getZoom();
  var limit = Math.pow(2, z);

  if (y < 0 || y >= limit) {
      return OpenLayers.Util.getImagesLocation() + "404.png";
  } else {
      x = ((x % limit) + limit) % limit;
      return this.url + z + "/" + x + "/" + y + "." + this.type;
  }

}

function getAnaloguesMap2_url (bounds) {
  var res = mapResults.getOLMap().getResolution();
  var x = Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
  var y = Math.round ((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
  var z = mapResults.getOLMap().getZoom();
  var limit = Math.pow(2, z);

  if (y < 0 || y >= limit) {
      return OpenLayers.Util.getImagesLocation() + "404.png";
  } else {
      x = ((x % limit) + limit) % limit;
      return this.url + z + "/" + x + "/" + y + "." + this.type;
  }

}


function initTooltips(){
	//STEP 1
	//Climatic Zones
	var helpzones = "<p>The reference site is the location for which you want to find analogue climates. <br/> \
						The reference site may be located within any land area (except for Antarctica)</p>";
	var tt = new Popover({trigger:"hover", placement:"right", content:helpzones, title:"<strong>Reference site</strong>"}, dojo.byId('zoneshelp'));
	
	//Search Range
	var helpsearchrange = "<p>The search range is the area within which you will look for analogue climates.<br/> \
							Narrowing the search range to a specific country reduces calculation time, facilitating the use of higher resolution data.</p>";
	var tt16 = new Popover({trigger:"hover", placement:"right", content:helpsearchrange, title:"<strong>Search range</strong>"}, dojo.byId('searchrangehelp'));
	
	var helploadparams = "<p>Save time by loading parameters from a previous run. Parameters may be saved at step 4.</p>";
	var tt0 = new Popover({trigger:"hover", placement:"right", content:helploadparams, title:"<strong>Load parameters file</strong>"}, dojo.byId('loadparamshelp'));
	
	//Latitude
	var helpLat = "<p>Latitude or coordinate Y of the reference site. Values between -60 and 90. Can be decimal, but ensure the combination x,y falls within land areas. </p> \
				   <p>This can be done either by clicking on the location on the map, or by manually entering the latitude in the box.</p>";
	var tt1 = new Popover({trigger:"hover", placement:"right", content:helpLat, title:"<strong>Latitude or coordinate Y</strong>"}, dojo.byId('lathelp'));
	//Longitude
	var helpLng = "<p>Longitude or coordinate X of the reference site. Values between -180 and 180. Can be decimal, but ensure the combination x,y falls in land areas. </p>\
				   <p>This can be done either by clicking on the location on the map, or by manually entering the longitude in the box.</p>";
	var tt2 = new Popover({trigger:"hover", placement:"right", content:helpLng, title:"<strong>Longitude or coordinate X</strong>"}, dojo.byId('lnghelp'));

	//Map Help Tooltip
	var mapHelpContent ='<ul><li>Click over the map to get x,y coordinates</li> \
							<li>Drag to pan</li> \
							<li>SHIFT + Click to zoom in</li> \
							<li>SHIFT + Drag to zoom in</li> \
							<li>Mouse Scroll Forward to zoom in</li> \
							<li>Mouse Scroll Backward to zoom out</li> \
						</ul>';
	var tt3 = new Popover({trigger:"hover", placement:"left", content:mapHelpContent, title:"<strong>Map navigation using mouse</strong>"}, dojo.byId('maphelp'));

	//STEP 2
	//Direction
	var directionhelp = "<p>The three possible directions to run the analogue tool are:</p> \
						<p><b>Backward</b> analysis (future to present): where can I find sites whose current climate is similar to the future modeled climate of my reference site?</p> \
						<p><b>Forward</b> analysis (present to future): where will I find my current climate in modeled future climates?</p> \
						<p><b>None</b> (same time period): where can I find sites that have a similar climate to my reference site concurrently? This may be now or in the future.</p>";
	var tt4 = new Popover({trigger:"hover", placement:"right", content:directionhelp, title:"<strong>Direction</strong>"}, dojo.byId('directionhelp'));

	//GCMs
	var gcmshelp = "<p>There are two types of climate data in our files: 1960-1990 baseline data (referred to as ‘current’) and future climates (the product of a SRES emission scenario, a future time period and a GCM).</p>";
	var tt5 = new Popover({trigger:"hover", placement:"right", content:gcmshelp, title:"<strong>Global Climate Models (GCMs)</strong>"}, dojo.byId('gcmshelp'));

	//Period
	var periodhelp = "<p>The time period over which current and future climates are calculated. <br/><br/> \
					 <i>NOTE: At the moment, the time period for climate projections is the decade 2030s (i.e. the years 2020-2049).</i></p>";
	var tt6 = new Popover({trigger:"hover", placement:"right", content:periodhelp, title:"<strong>Period</strong>"}, dojo.byId('periodhelp'));

	//Scenario
	var scenariohelp = "<p>The list of scenario families described by the Special Report on Emission Scenarios (SRES) to \
						predict the effects of globalization vs. regionalization, and an economic vs. environmental development focus on future global greenhouse gas emissions.</p>";
						
	var tt7 = new Popover({trigger:"hover", placement:"right", content:scenariohelp, title:"<strong>Scenario</strong>"}, dojo.byId('scenariohelp'));

	//Model
	var modelhelp =  '<p>The list of Global Climate Models (GCMs) for which data is available. You can choose specific GCMs (a maximum of 3 at a time) or an ensemble which utilizes the mean of all available GCMs for that emissions scenario.</p>';
	var tt8 = new Popover({trigger:"hover", placement:"right", content:modelhelp, title:"<strong>Model</strong>"}, dojo.byId('modelhelp'));

	//Resolution
	var resolutionhelp = "<p>Spatial resolution available for the dataset. 30 arc-minutes is approximately 56 km at the equator while 30 arc-seconds is approximately 1 km.</p>";
	var tt9 = new Popover({trigger:"hover", placement:"right", content:resolutionhelp, title:"<strong>Resolution</strong>"}, dojo.byId('resolutionhelp'));

	//STEP 3
	//Similarity Index
	var similarityIndexhelp = "<p></p>";
	var tt10 = new Popover({trigger:"hover", placement:"right", content:similarityIndexhelp, title:"<strong>Similarity Index</strong>"}, dojo.byId('similarityIndexhelp'));

	//rotationBtns
	var rotationhelp = "<p>This option is only available for monthly mean temperature (tmean) and precipitation (prec). The rotation accounts for seasonality allowing you to identify sites that experience similar climates at different times of the year e.g. correcting for the occurrence of summer in the Northern vs. Southern Hemisphere.</p>";
	var tt11 = new Popover({trigger:"hover", placement:"top", content:rotationhelp, title:"<strong>Rotation</strong>"}, dojo.byId('rotationhelp'));

	//Climatic and Bio
	var climaticvarshelp = "<p>You can select between two types of variables for the analysis:</p> \
							<p>1) <b>Climatic variables</b>:<br/>- monthly mean temperature<br/> \
							- monthly precipitation<br/>- both of the above variables</p> \
							2) <b>Bioclimatic variables</b>: Nineteen variables that describe the averages, the extremes and the seasonality of climatic variables.\
							<br/><br/>Up to three may be chosen simultaneously.";
	
	var tt12 = new Popover({trigger:"hover", placement:"right", content:climaticvarshelp, title:"<strong>Climatic and bioclimatic variables</strong>"}, dojo.byId('climaticvarshelp'));

	//Weights
	var weightshelp = "<p>Variables may be weighted depending on the importance you want to give them in the analysis. \
						A weighting of 0.5 means that the selected variable will account for 50% of the overall similarity statistic across \
						the search range. 0.1 = 10%, 0.2 = 20%, etc.<br/><br/>\
						The sum of all weights must equal 1.</p>";
	
	var tt13 = new Popover({trigger:"hover", placement:"right", content:weightshelp, title:"<strong>Weights</strong>"}, dojo.byId('weightshelp'));

	//crop growing season
	var growingseasonhelp = "<p>The time frame over which the analysis is run may be modified to represent a specific growing season of interest. \
							Up to two different growing seasons may be selected. Only the selected months will be analyzed when calculating the similarity statistic.</p>";
	var tt14 = new Popover({trigger:"hover", placement:"top", content:growingseasonhelp, title:"<strong>Crop growing season</strong>"}, dojo.byId('growingseasonhelp'));

	//Threshold
	var thresholdhelp = "<p>The threshold value allows you to restrict the results of the analysis to only the most similar sites \
						e.g. a threshold of 0.60 will result in only those sites with a similarity greater than 0.60 being displayed.</p>";
		
	var tt15 = new Popover({trigger:"hover", placement:"top", content:thresholdhelp, title:"<strong>Threshold</strong>"}, dojo.byId('thresholdhelp'));

}

function initTooltipLayerResult(lryName){
	//if (isMapResultLoaded(lryName)) return
	var tt = new Tooltip({trigger:"hover", placement:"top", title:"Turn Off/On layer"}, dojo.byId('lyrOnOff_'+lryName));
	var tt1 = new Tooltip({trigger:"hover", placement:"top", title:"Layer Name"}, dojo.byId('lyrName_'+lryName));
	var tt2 = new Tooltip({trigger:"hover", placement:"top", title:"Zoom to Layer"}, dojo.byId('lyrZoomIn_'+lryName));
	// var tt3 = new Tooltip({trigger:"hover", placement:"top", title:"Up Layer"}, dojo.byId('lyrPositionUp_'+lryName));
	// var tt4 = new Tooltip({trigger:"hover", placement:"top", title:"Down Layer"}, dojo.byId('lyrPositionDown_'+lryName));
	//var tt5 = new Tooltip({trigger:"hover", placement:"top", title:"Transparency of the Layer"}, dojo.byId('lyrOpacity_'+lryName));
	var tt6 = new Tooltip({trigger:"hover", placement:"top", title:"Parameters used"}, dojo.byId('lyrInfo_'+lryName));
	var tt7 = new Tooltip({trigger:"hover", placement:"top", title:"Code to use in R"}, dojo.byId('lyrRcode_'+lryName));
	var tt8 = new Tooltip({trigger:"hover", placement:"top", title:"Save these parameters to disk"}, dojo.byId('lyrSaveParams_'+lryName));
	var tt9 = new Tooltip({trigger:"hover", placement:"top", title:"Download the map results in GeoTiff format"}, dojo.byId('lyrDownload_'+lryName));
	var tt10 = new Tooltip({trigger:"hover", placement:"top", title:"Remove this result"}, dojo.byId('lyrDelete_'+lryName));
	//arrTooltips.push({site:lryName, tooltips:[tt,tt1,tt2,tt6,tt7,tt8,tt9,tt10]});
}

function addRow_Results(){
	tabla = dojo.byId('tablelyrResults');
	if (tabla && tabla.rows.length > 0) {
		tr = tabla.insertRow(tabla.rows.length);
	} else {
		tr = tabla.insertRow(0);
	}
	tr.setAttribute('align','left');
	tr.id = "tr_"+tileLayerName;
	//tr.className = "success"; //error //warning //info
	
	//Turn On/Off Option
	td = tr.insertCell(tr.cells.length);
	td.className = "unselectable";
	td.innerHTML = '<span data-toggle="tooltip" id="lyrOnOff_'+tileLayerName +'" class="icon-eye-open icono" onClick="toggleLayerOnOff(\''+tileLayerName+'\');"></span>';

	td = tr.insertCell(tr.cells.length);
	td.style = "width:100px;";
	td.innerHTML = '<div rel="tooltip" id="lyrName_'+tileLayerName +'" class="lryName">'+tileLayerName+'</div>';
	td = tr.insertCell(tr.cells.length);
	td.innerHTML = '<span rel="tooltip" id="lyrZoomIn_'+tileLayerName +'" class="icon-zoom-in icono" onClick="zoomToLayer(\''+tileLayerName+'\');">';
	
	td = tr.insertCell(tr.cells.length);
	td.style = "width:80px;";
	td.innerHTML = '<div id="lyrOpacity_'+tileLayerName +'"></div>';
	var lyrName = tileLayerName.trim();
	var slider = new dijit.form.HorizontalSlider({
            name: "slider_"+tileLayerName,
            value: 75,
            minimum: 0,
            maximum: 100,
            intermediateChanges: true,
			showButtons: false,
            style: "width:60px;",
            onChange: function(value) {
            	changeTransparency(value/100, lyrName); 
            }
        }, "lyrOpacity_"+tileLayerName);

	td = tr.insertCell(tr.cells.length);
	td.innerHTML = '<span rel="tooltip" id="lyrInfo_'+tileLayerName +'" class="icon-info-sign icono" onClick="showMoreInfo(\''+tileLayerName+'\');"></span>';
	td = tr.insertCell(tr.cells.length);
	td.innerHTML = '<span rel="tooltip" id="lyrRcode_'+tileLayerName +'" class="icon-comment icono" onClick="toRCode(\''+tileLayerName+'\');"></span>';

	if (dojo.isFF >= 3.6 || dojo.isChrome >= 6.0 || dojo.isSafari >= 6.0 || dojo.isOpera >= 11.1 || dojo.isIE >= 10.0) {
		td = tr.insertCell(tr.cells.length);
		td.innerHTML = '<span rel="tooltip" id="lyrSaveParams_'+tileLayerName +'" class="icon-download-alt icono" onClick="savelyrParams(\''+tileLayerName+'\');"></span>';
	}
	td = tr.insertCell(tr.cells.length);
	td.innerHTML = '<a rel="tooltip" id="lyrDownload_'+tileLayerName +'" class="icon-download icono" href="'+serverResults+lyrName+'/'+lyrName+'.zip"></a>';
	var downloadLink = document.getElementById('lyrDownload_'+tileLayerName);
        addListener(downloadLink, 'click', function(event) {
          ga('send', 'event', 'downloadMapResults', 'click', tileLayerName); 
          console.log(downloadLink); 
          console.log(event.target.getAttribute('id'));
        });
        td = tr.insertCell(tr.cells.length);
        
	td.innerHTML = '<span rel="tooltip" id="lyrDelete_'+tileLayerName +'" class="icon-trash icono" onClick="deleteLayerResult(\''+tileLayerName+'\');"></span>';

	//Update button link to download last results
	dojo.byId('step4DownloadBtn').setAttribute('href', serverResults+lyrName+'/'+lyrName+'.zip');

	//Update Tooltips
	initTooltipLayerResult(tileLayerName);

}
function addListener(element, type, callback) {
            if (element.addEventListener) element.addEventListener(type, callback);
            else if (element.attachEvent) element.attachEvent('on' + type, callback);
}

function getExtentbyCountry(cntryISO){
	for (var i=0; i < zones.length; i++){
		if (zones[i].iso == cntryISO.toLowerCase()) {
			var ll = new OpenLayers.Geometry.Point(parseFloat(zones[i].bounds[0]), parseFloat(zones[i].bounds[1]));
			var ur = new OpenLayers.Geometry.Point(parseFloat(zones[i].bounds[2]), parseFloat(zones[i].bounds[3]));
			ll.transform(epsg4326, epsg900913);
			ur.transform(epsg4326, epsg900913);
			var bounds = new OpenLayers.Bounds(ll.x, ll.y, ur.x, ur.y);
			return bounds
		} else {
			if ("global" == cntryISO.toLowerCase()) {
				return initialExtent
			}
		}
	}
}

function zoomToLayer(lyrName){
	if (mapResults){
		var layer = mapResults.getLayersByName(lyrName)[0];
		if(layer != null){
			var bounds = getExtentbyCountry(lyrName.split('_',1).toString());
			mapResults.zoomToExtent(bounds, false);
		}
	}
}

function toggleLayerOnOff(lyrName){
	if (mapResults){
		var layer = mapResults.getLayersByName(lyrName)[0];
		if(layer != null) {
			if (layer.getVisibility() ) {
				layer.setVisibility(false);
				dojo.removeClass(dojo.byId('lyrOnOff_'+lyrName),'icon-eye-open');
				dojo.addClass(dojo.byId('lyrOnOff_'+lyrName),'icon-eye-close');
			} else {
				layer.setVisibility(true);
				dojo.removeClass(dojo.byId('lyrOnOff_'+lyrName),'icon-eye-close');
				dojo.addClass(dojo.byId('lyrOnOff_'+lyrName),'icon-eye-open');
			}
		}
	}
}

function changeTransparency(value,lyrName){
	if (mapResults){
		var layer = mapResults.getLayersByName(lyrName)[0];
		if(layer != null){
			layer.setOpacity(value);
		}
	}
}

function deleteLayerResult(lyrName){
	if (mapResults){
		var layer = mapResults.getLayersByName(lyrName)[0]; 
		if(layer != null){
			dijit.byId("lyrOpacity_"+lyrName).destroy(); 
		    dojo.destroy(dojo.byId("tr_"+lyrName));
			mapResults.removeLayer(layer);

			//Remove from global array
			runAnalysis = dojo.filter(runAnalysis, function(m){
				return m.site !== lyrName;
			});
			//Remove registered widget or tooltips ids
			//Bug it needs to check out
			dojo.forEach(dojo.query('.tooltip'), function(t){
			   dojo.destroy(t);
			});
			
			//Remove Marker
			if (site && site.markers.length > 0){
				//Remove point from site Layer
				for (var i=0; i < site.markers.length; i++){
					if (site.markers[i].id == lyrName){
						site.removeMarker(site.markers[i]);
					}
				}
				
			}
			
		}
	}
}

function toRCode(lyrName){
	var rcode = "";
	if (runAnalysis){
		for (var i=0; i < runAnalysis.length; i++){
			if (runAnalysis[i].site === lyrName)
				rcode = runAnalysis[i].params.toRCode();
		}
	}
	var m = new Modal({
						content:rcode, 
						backdrop:true, showOnStart: true,
						header:"<h4>R Code</h4>", 
						footer:'<span style="position:relative;float:left;"><a class="btn btn-primary" href="http://code.google.com/p/ccafs-analogues/" target="new">Go to R Analogues site</a></span><span style="position:relative;float:right;"><a class="btn btn-primary" href="'+serverResults+lyrName+'/Analogues_'+lyrName+'.R" download="Analogues_'+lyrName+'.R" type="application/octet-stream" target="new">Download R file</a></span>'
					});
	m.startup();
}

function showMoreInfo(lyrName){
	var prms = null;
	if (runAnalysis){
		for (var i=0; i < runAnalysis.length; i++){
			if (runAnalysis[i].site === lyrName)
				prms = runAnalysis[i].params;
		}
	}

	if (prms) {
		var content = '<table class="table table-striped"><tbody>'+
					//'<tr><td><b>Analysis Type</b>:</td><td>GRIDBASED</td></tr>'+
					'<tr><td style="width:170px;"><b>Method </b>:</td><td>'+prms.method.toUpperCase()+'</td></tr>'+
					'<tr><td><b>Site Location (dd) </b>:</td><td><b>Lat </b>:'+parseFloat(prms.y).toFixed(3)+', <b>Lng </b>:'+parseFloat(prms.x).toFixed(3)+'</td></tr>'+
					'<tr><td><b>Climatic data zones </b>:</td><td>'+prms.zones[0].toUpperCase()+'</td></tr>'+
					'<tr><td><b>Scenarios </b>:</td><td>'+prms.scenario[0].toUpperCase()+' , '+prms.scenario[1].toUpperCase()+'</td></tr>'+
					'<tr><td><b>Resolution </b>:</td><td>'+prms.resolution[0].toString().replace(/\,/g, " , ")+'</td></tr>'+
					'<tr><td><b>Models </b>:</td><td>'+prms.model.toString().toUpperCase().replace(/\,/g, " , ")+'</td></tr>'+
					//'<tr><td><b>Climate Target </b>:</td><td>CURRENT</td></tr>'+
					'<tr><td><b>Period </b>:</td><td>'+prms.period.toString().toUpperCase().replace(/\,/g, " , ")+'</td></tr>'+
					'<tr><td><b>Variables </b>:</td><td>'+prms.vars.toString().toUpperCase().replace(/\,/g, " , ")+'</td></tr>'+
					'<tr><td><b>Weights </b>:</td><td>'+prms.weights.toString().replace(/\,/g, " , ")+'</td></tr>';
					if (prms.rotation === "tmean")
						content +='<tr><td><b>Rotation </b>:</td><td>'+prms.rotation.replace("tmean","MEAN TEMPERATURE").toUpperCase()+'</td></tr>';
					if (prms.rotation == 'prec')
						content +='<tr><td><b>Rotation </b>:</td><td>'+prms.rotation.replace("prec","PRECIPITATION").toUpperCase()+'</td></tr>';
					content +='<tr><td><b>Number of time steps</b>:</td><td>12</td></tr>'+ //prms.getNdivisions()
					'<tr><td><b>Direction </b>:</td><td>'+prms.direction.toUpperCase()+'</td></tr>'+
					'<tr><td><b>Crop Growing Season </b>:</td><td>'+prms.getGrowingseason2()+'</td></tr>'+
					'<tr><td><b>Threshold </b>:</td><td>'+ (100 - (parseFloat(prms.threshold) * 100))+' %</td></tr></tbody></table>';
		
		var m = new Modal({
						content:content, 
						backdrop:true, showOnStart: true,
						header:"<h4>Parameters used</h4>"
						//footer:'<a class="btn btn-primary" href="javascript:void(0);">Download params file</a>'
					});
		m.startup();
	}
	
}


function viewLargerMap(){
	fullscreen(dojo.byId('mapResults'));
	setTimeout( function() { addMapComponentsFullScreen();}, 500);
}


//if (dojo.isFF >= 10.0 || dojo.isChrome >= 20.0 || dojo.isSafari >= 5.1 || dojo.isOpera >= 12.1 || dojo.isIE >= 11.0)
document.cancelFullScreen = document.webkitExitFullscreen || document.mozCancelFullScreen || document.exitFullscreen;
function fullscreen(e){
	e.onwebkitfullscreenchange = onFullScreenEnter;
	e.onmozfullscreenchange = onFullScreenEnter;
	e.onfullscreenchange = onFullScreenEnter;
	document.onmozfullscreenchange = onFullScreenEnter;
	if (e.webkitRequestFullScreen) {
		e.webkitRequestFullScreen();
	} else {
		if (e.mozRequestFullScreen) {
	      e.mozRequestFullScreen();
	    } else {
	      e.requestFullscreen();
	    }
	}
}


function onFullScreenEnter() {
  e = dojo.byId('mapResults');
  e.onwebkitfullscreenchange = onFullScreenExit;
  e.onmozfullscreenchange = onFullScreenExit;
  document.onmozfullscreenchange = onFullScreenExit;
  e.onfullscreenchange = onFullScreenExit;
};

// Called whenever the browser exits fullscreen.
function onFullScreenExit() {
  if (logoCCAFSfullScreen) dojo.byId('logoCCAFSfullScreen').style.display = "none";
  if (mapResults) {
  		
		if (mapResultmousePosition){
			dojo.byId('mapResultsMouseposition').style.display = 'none';
			mapResults.removeControl(mapResultmousePosition);
			mapResultmousePosition.destroy();
			mapResultmousePosition = null;
			
		} 
		if (mapResultgraticule){
			mapResults.removeControl(mapResultgraticule);
			mapResultgraticule.destroy();
			mapResultgraticule = null;
		} 
		if (mapResultlayerSwitcher){
			mapResults.removeControl(mapResultlayerSwitcher);
			mapResultlayerSwitcher.destroy();
			mapResultlayerSwitcher = null;
		} 
  }

  updateMapSize();
}

function addMapComponentsFullScreen(){
	if (mapResults) {
		if (!mapResultlayerSwitcher)
			mapResultlayerSwitcher = new OpenLayers.Control.LayerSwitcher({ascending: false, roundedCorner: false});
		mapResults.addControl(mapResultlayerSwitcher);

		if (!mapResultmousePosition)
			mapResultmousePosition = new OpenLayers.Control.MousePosition({
				displayProjection: epsg4326,
        		div: dojo.byId('mapResultsMouseposition')
			});
		mapResults.addControl(mapResultmousePosition);
		dojo.byId('mapResultsMouseposition').style.display = 'block';

		if (!mapResultgraticule)
			mapResultgraticule = new OpenLayers.Control.Graticule({displayInLayerSwitcher: true});
		mapResults.addControl(mapResultgraticule);
	    
		//Add More Layers
		if (!ghyb_lyr)
			ghyb_lyr = new OpenLayers.Layer.Google( "Google Hybrid", {type: google.maps.MapTypeId.HYBRID, sphericalMercator: true, numZoomLevels: 22, visibility: false, isBaseLayer: true, transitionEffect: "resize"} );
		
		if (!gphy_lyr)
			gphy_lyr = new OpenLayers.Layer.Google( "Google Physical", {type: google.maps.MapTypeId.TERRAIN, sphericalMercator: true, visibility: false, transitionEffect: "resize"} );
		
		if (!gmap_lyr)
			gmap_lyr = new OpenLayers.Layer.Google( "Google Streets", {type: google.maps.MapTypeId.ROADMAP, numZoomLevels: 20, sphericalMercator: true, visibility: false, transitionEffect: "resize"} );

		if (!esritopo_lyr)
			esritopo_lyr = new OpenLayers.Layer.XYZ( "ESRI Topo", "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}",
		                {sphericalMercator: true, visibility: false, transitionEffect: "resize",
		            	attribution: "&copy;<a href='http://www.esri.com/software/arcgis/arcgis-online-map-and-geoservices/map-services' target='new'>2013 ESRI</a>, DeLorme, NAVTEQ"} );
		
		if (!esristreet_lyr)
			esristreet_lyr = new OpenLayers.Layer.XYZ( "ESRI World Street Map", "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}",
		                {sphericalMercator: true, visibility: false, transitionEffect: "resize",
		            	attribution: "&copy;<a href='http://www.esri.com/software/arcgis/arcgis-online-map-and-geoservices/map-services' target='new'>2013 ESRI</a>, DeLorme, NAVTEQ, USGS, Intermap..."} );
		
		if (!esrigray_lyr)
			esrigray_lyr = new OpenLayers.Layer.XYZ( "ESRI Light Gray", "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${z}/${y}/${x}",
		                {sphericalMercator: true, visibility: false, transitionEffect: "resize", attribution: "&copy;<a href='http://www.esri.com/software/arcgis/arcgis-online-map-and-geoservices/map-services' target='new'>2013 ESRI</a>, DeLorme, NAVTEQ"} );
		
		if (!esriterrain_lyr)
			esriterrain_lyr = new OpenLayers.Layer.XYZ( "ESRI Terrain", "http://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/${z}/${y}/${x}",
		                {sphericalMercator: true, visibility: false, transitionEffect: "resize", attribution: "&copy;<a href='http://www.esri.com/software/arcgis/arcgis-online-map-and-geoservices/map-services' target='new'>2013 ESRI</a>, USGS, NOAA"} );
		    

		mapResults.addLayers([gmap_lyr, ghyb_lyr, gphy_lyr, esriterrain_lyr, esristreet_lyr, esritopo_lyr, esrigray_lyr]);

		for (var i=mapResults.layers.length-1; i>=0; --i) {
			mapResults.layers[i].animationEnabled = true;
		}

		if (!logoCCAFSfullScreen){
			logoCCAFSfullScreen = dojo.create('div');
			logoCCAFSfullScreen.id = "logoCCAFSfullScreen";
			logoCCAFSfullScreen.className = "LogoCCAFSfullScreen";
			dojo.byId('mapResults').appendChild(logoCCAFSfullScreen);
		} else {
			dojo.byId('logoCCAFSfullScreen').style.display = "block";
		}
		
	}
}


function saveSession() {
	var session = new Date().getTime();
	var textToWrite = '{ "session":"'+session+'","data":[';

    var prms = null;
	if (runAnalysis){
		var items = '';
		for (var i=0; i < runAnalysis.length; i++){
			prms = runAnalysis[i];
			if (prms) {
				var params = prms.params;
				items += '{' +
							'"site":"'+prms.site +'",'+
							'"zones":"'+params.zones +'",'+
							'"x":'+params.x +','+
							'"y":'+params.y +','+
							'"direction":"'+params.direction +'",'+
							'"period":"'+params.period +'",'+
							'"scenario":"'+params.scenario +'",'+
							'"model":"'+params.model +'",'+
							'"resolution":"'+params.resolution +'",'+
							'"vars":"'+params.vars +'",'+
							'"weights":"'+params.weights +'",'+
							'"rotation":"'+params.rotation +'",'+
							'"growingseason":"'+params.growingseason +'",'+
							'"threshold":'+params.threshold +
						'},';
			}
		}
		textToWrite += items.substr(0,items.length-1);
	}
	textToWrite += ']}';

    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
    var fileNameToSaveAs = "Analogues_Session_"+session+".ccafs";

    var downloadLink = document.createElement("a");
    downloadLink.href = dojo.isChrome ? window.webkitURL.createObjectURL(textFileAsBlob) : window.URL.createObjectURL(textFileAsBlob);
    downloadLink.download = fileNameToSaveAs;
    if (dojo.isFF){
    	var theEvent = document.createEvent("MouseEvent");
		theEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		downloadLink.dispatchEvent(theEvent);

		while (downloadLink)
		{
		    if (downloadLink.tagName == "A" && downloadLink.href != "")
		    {
		        if (downloadLink.target == "_blank") { window.open(downloadLink.href, downloadLink.target); }
		        else { document.location = downloadLink.href; }
		        downloadLink = null;
		    }
		    else
		    {
		        downloadLink = downloadLink.parentElement;
		    }
		}
    } else {
    	downloadLink.click();
    }
}
function loadandDisplaysessionResults(runs){
	if (!mapRsultsLoaded) showOutput();

	dojo.forEach(runs.data,function(item, i){
		//Check out for existing site
		if (!isMapResultLoaded(item.site)) {
			//Crear new analoguesParams and add points to the map
	    	analoguesParams = new Parameters({x:item.x.toString(), y:item.y.toString(), zones:item.zones.split(","), direction:item.direction, period:item.period.split(","), 
								scenario:item.scenario.split(","), model:item.model.split(","), resolution:item.resolution.split(","), vars:item.vars.split(","),
	    						weights:item.weights.split(","), rotation:item.rotation, growingseason:item.growingseason.split(","), threshold:item.threshold
	    					  });
	    	//Draw the user selected point
	    	if (site){
	    		var point = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(parseFloat(item.x), parseFloat(item.y)));
				point.geometry.transform(epsg4326, epsg900913);
				if (site) {
				  	var size = new OpenLayers.Size(20,20);
				  	var offset = 0;
				  	var icon = new OpenLayers.Icon('imgs/target.png', size, offset);
				  	var marker = new OpenLayers.Marker(new OpenLayers.LonLat(point.geometry.x,point.geometry.y),icon);
				  	marker.id = item.site;
				  	marker.events.register('mousedown', marker, function(evt) { alert(this.id); OpenLayers.Event.stop(evt); });
            		site.addMarker(marker);
				}
	    	}
			//Add raster map
	    	addLayerResultstoMap(item.site);
		}
		
	});
	if (dojo.isFF >= 3.6 || dojo.isChrome >= 6.0 || dojo.isSafari >= 6.0 || dojo.isOpera >= 11.1 || dojo.isIE >= 10.0) {
		if (dojo.byId('tablelyrResults').rows.length <= 0) {
			dojo.byId('saveSessionBtn').style.visibility = 'hidden';
		} else {
			dojo.byId('saveSessionBtn').style.visibility = 'visible';
		}
	}
	        
}
function loadSession() {
	var fileToLoad = document.getElementById("fileToLoad").files[0];
	if(window.FileReader) {
	   	var fileReader = new FileReader();
	    fileReader.onload = function(fileLoadedEvent){
	        var textFromFileLoaded = fileLoadedEvent.target.result;
	        var runs = JSON.parse(textFromFileLoaded);
	        if (runs) loadandDisplaysessionResults(runs);
	    };
	    fileReader.readAsText(fileToLoad, "UTF-8");
	} else {
	   //the browser doesn't support the FileReader Object, so do this
	}
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
}

function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	var files = evt.dataTransfer.files; // FileList object.
	var fileToLoad = files[0];
	
	if(window.FileReader) {
	   	var fileReader = new FileReader();
	    fileReader.onload = function(fileLoadedEvent){
	        var textFromFileLoaded = fileLoadedEvent.target.result;
	        var runs = JSON.parse(textFromFileLoaded);
	        if (runs) loadandDisplaysessionResults(runs);
	    };
	    fileReader.readAsText(fileToLoad, "UTF-8");
	} else {
	   //the browser doesn't support the FileReader Object, so do this
	}
}


function loadSavedParams(){
	var fileToLoad = document.getElementById("paramsfileToLoad").files[0];
	
	if(window.FileReader) {
	   	var fileReader = new FileReader();
	    fileReader.onload = function(fileLoadedEvent) 
	    {
	        var textFromFileLoaded = fileLoadedEvent.target.result;
	        var params = JSON.parse(textFromFileLoaded);
	        //Step 1
	        var target = params.zones;
	        if (target =="global" || target =="africa" || target =="asia" || target =="australia" || target =="europe" || target =="latinamerica" || target =="northamerica" || target =="russia") {
					 	dojo.query('#ClimaticZone').attr('value', target)
			} else {
				var idx = -1;
				if (zones){
					for (var i=0; i < zones.length; i++){
						if (zones[i].country === target) idx = i; continue;
					}
					if (idx == -1)
						dojo.query('#ClimaticZone').attr('value', 'global');
				}
				dojo.query('#ClimaticZone').attr('value', idx);
				zoomtoZone(idx);
			}
	        
	        dojo.byId('lng').value = params.x;
	        dojo.byId('lat').value = params.y;
	        addSiteSelected();

	        //Step 2
	        //direction
	        var direction = dojo.query('#directionBtns.btn-group > button.active')[0].name;
	        if (direction != params.direction){
	        	dojo.forEach(dojo.query('#directionBtns.btn-group > button.btn'), function(entry){
		        	if (entry.name === params.direction) {
		        		dojo.addClass(entry,'active btn-primary');
		        	} else {
		        		dojo.removeClass(entry,'active btn-primary');
		        	}
				});
	        }
	        //Setting up rules or constraints
			setupGCMsbyDirection(params.direction);
	        
	        //Period
	        dojo.query('#refPeriod').attr('value', params.period.split(",")[0]);
	        dojo.query('#targetPeriod').attr('value', params.period.split(",")[1]);
	        //Scenario
	        dojo.query('#refScenario').attr('value', params.scenario.split(",")[0]);
			dojo.query('#targetScenario').attr('value', params.scenario.split(",")[1]);
			//Model
			// dojo.byId('refgcm').selectedOptions = "current,ensemble,bccr_bcm2_0";
			// dojo.byId('targetgcm').selectedOptions;
			
			//Resolution
			dojo.query('#refResolution').attr('value', params.resolution.split(",")[0]);
			dojo.query('#targetResolution').attr('value', params.resolution.split(",")[1]);

			//Step 3
			//Variables & Weights
			var vars = params.vars.split(",");
			var weights = params.weights.split(",");
			if (vars && vars.length > 0){
				for (var i=0; i < vars.length; i++){
					dojo.query('#divclimaticvars input#'+vars[i]).attr('value', weights[i]);
					dojo.byId('chk_'+vars[i]).checked = true;
				}
			}
			changeClimaticVars();

			//Rotation
			var rotation = dojo.query('#rotationBtns.btn-group > button.active')[0].name;
	        if (rotation != params.rotation){
	        	dojo.forEach(dojo.query('#rotationBtns.btn-group > button.btn'), function(entry){
		        	if (entry.name === params.rotation) {
		        		dojo.addClass(entry,'active btn-primary');
		        	} else {
		        		dojo.removeClass(entry,'active btn-primary');
		        	}
				});
	        }
	        //Growing Season
			var growingSeason = params.growingseason.split(",");
			if (growingSeason.length == 2){
				var growingSeason1 = growingSeason[0].split(":");
				var growingSeason2 = growingSeason[1].split(":");
				dojo.byId('growingSeason1_startDate').value = growingSeason1[0];
				dojo.byId('growingSeason1_endDate').value = growingSeason1[1];
				dojo.byId('growingSeason2_startDate').value = growingSeason2[0];
				dojo.byId('growingSeason2_endDate').value = growingSeason2[1];
			} else if (growingSeason.length == 1) {
				var growingSeason1 = growingSeason[0].split(":");
				dojo.byId('growingSeason1_startDate').value = growingSeason1[0];
				dojo.byId('growingSeason1_endDate').value = growingSeason1[1];
				dojo.byId('growingSeason2_startDate').value = "";
				dojo.byId('growingSeason2_endDate').value = "";
			} else {
				dojo.byId('growingSeason1_startDate').value = 1;
				dojo.byId('growingSeason1_endDate').value = 12;
				dojo.byId('growingSeason2_startDate').value = "";
				dojo.byId('growingSeason2_endDate').value = "";
			}
			changeGrowingSeason();
			//Threshold
			dojo.byId('threshold').value = params.threshold;
	    };
	    fileReader.readAsText(fileToLoad, "UTF-8");
	} else {
	   //the browser doesn't support the FileReader Object, so do this
	}

	
}


function savelyrParams(lyrName){
	var prms = null;
	if (runAnalysis){
		for (var i=0; i < runAnalysis.length; i++){
			if (runAnalysis[i].site === lyrName)
				prms = runAnalysis[i];
		}
	}

	if (prms) {
		var params = prms.params;
		var textToWrite = '{' +
							  '"site":"'+prms.site +'",'+
							  '"zones":"'+params.zones[0] +'",'+
							  '"x":'+params.x +','+
							  '"y":'+params.y +','+
							  '"direction":"'+params.direction +'",'+
							  '"period":"'+params.period +'",'+
							  '"scenario":"'+params.scenario +'",'+
							  '"model":"'+params.model +'",'+
							  '"resolution":"'+params.resolution +'",'+
							  '"vars":"'+params.vars +'",'+
							  '"weights":"'+params.weights +'",'+
							  '"rotation":"'+params.rotation +'",'+
							  '"growingseason":"'+params.growingseason +'",'+
							  '"threshold":'+params.threshold +
						  '}';

	    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
	    var fileNameToSaveAs = lyrName+"_parmans.json";

	    var downloadLink = document.createElement("a");
	    downloadLink.href = dojo.isChrome ? window.webkitURL.createObjectURL(textFileAsBlob) : window.URL.createObjectURL(textFileAsBlob);
	    downloadLink.download = fileNameToSaveAs;
	    if (dojo.isFF){
	    	var theEvent = document.createEvent("MouseEvent");
			theEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			downloadLink.dispatchEvent(theEvent);

			while (downloadLink)
			{
			    if (downloadLink.tagName == "A" && downloadLink.href != "")
			    {
			        if (downloadLink.target == "_blank") { window.open(downloadLink.href, downloadLink.target); }
			        else { document.location = downloadLink.href; }
			        downloadLink = null;
			    }
			    else
			    {
			        downloadLink = downloadLink.parentElement;
			    }
			}
	    } else {
	    	downloadLink.click();
	    }
	    
	}    
}


/*
 * Get Analogues Runs History
 */
 function getAnaloguesHistoryRuns(url){
  var def = new dojo.Deferred();
  var csv = new dojox.data.CsvStore({
    url: url,
    separator: "|"
  });

  csv.fetch({
    onComplete: dojo.partial(processAnaloguesHistoryRunsCsv, def),
    onError: function (err) {
    console.log("AnaloguesHistoryRuns csv error: ", err);
    }
  });
  return def;
}

function processAnaloguesHistoryRunsCsv(def, items, request) { 
	//process csv data and create in memory object store.
	var store = request.store;
	var runs = [];
	dojo.forEach(items, function (item, i) {
		//SITENAME|LNG|LAT|METHOD|MODEL|VARS|WEIGHTS|NDIVISIONS|DIRECTION|GROWINGSEASON|ROTATION|PERIOD|ZONES|RESOLUTION|SCENARIO|OUTFILE|THRESHOLD
	    var site = store.getValue(item, "SITENAME");
	    var lng = parseFloat(store.getValue(item, "LNG"), 10);
	    var lat = parseFloat(store.getValue(item, "LAT"), 10);
	    var method = store.getValue(item, "METHOD")
	    var model = store.getValue(item, "MODEL").replace("[","").replace("]","").split(",");
	    var vars = store.getValue(item, "VARS").replace("[","").replace("]","").split(",");
		var weights = store.getValue(item, "WEIGHTS").replace("[","").replace("]","").split(",");
		var ndivisions = store.getValue(item, "NDIVISIONS").replace("[","").replace("]","").split(",");
		var direction = store.getValue(item, "DIRECTION");
		var growingseason = store.getValue(item, "GROWINGSEASON");
		var rotation = store.getValue(item, "ROTATION");
		var period = store.getValue(item, "PERIOD").replace("[","").replace("]","").split(",");
		var zones = store.getValue(item, "ZONES").replace("[","").replace("]","").split(",");
		var resolution = store.getValue(item, "RESOLUTION").replace("[","").replace("]","").split(",");
		var scenario = store.getValue(item, "SCENARIO").replace("[","").replace("]","").split(",");
		var outfile = store.getValue(item, "OUTFILE");
		var threshold = parseFloat(store.getValue(item, "THRESHOLD"), 10);
	    
	    //console.debug(i+"->"+site +" - "+lng +" - "+lat+" - "+model);
	    var attributes = { "site": site, "x": lng, "y": lat, "method": method, "model": model, 
	    					"vars": vars, "weights": weights, "ndivisions":ndivisions, "direction": direction,
	    					"growingseason": growingseason, "rotation": rotation, "period": period, "zones":zones,
	    					"resolution": resolution, "scenario": scenario, "outfile":outfile, "threshold":threshold,
	    					"thumbnail":serverResults+site+'/'+site+'.png' }; 
	    runs.push(attributes);
	  });
	def.resolve(runs);
}

/*
 * Display the analogues results created by users
 */
function showLastResultsSites(){
  getAnaloguesHistoryRuns("./config/AnaloguesHistoryRuns.csv")
  .then(function(res){
      	//Setup the pager
      	res.sort();
		res.reverse();
		analoguesHistoryRuns = res;
		setupPager();

      	// Get a reference to our container
		var analoguesContainer = dojo.byId("lastvisitedSites");
		for (var i=0; i<5; i++){ 
			var widget = new mapgallery(res[i]).placeAt(analoguesContainer);
		}

		showresults = false;
  });
}

/*
 * Add resutls to the map gallery
 */
function addLastResultstoMapGallery(lyrName){
	
	var mr = { "site": lyrName, "x": analoguesParams.x, "y": analoguesParams.y, "method": analoguesParams.method, 
						"model": analoguesParams.model, "vars": analoguesParams.vars, "weights":analoguesParams.weights, 
						"ndivisions":analoguesParams.ndivisions, "direction": analoguesParams.direction,
	    				"growingseason": analoguesParams.growingseason, "rotation": analoguesParams.rotation, 
	    				"period": analoguesParams.period, "zones":analoguesParams.zones, "resolution": analoguesParams.resolution, 
	    				"scenario": analoguesParams.scenario, "outfile":analoguesParams.outfile, "threshold":analoguesParams.threshold,
	    				"thumbnail":serverResults+lyrName+'/'+lyrName+'.png' }; 

	if (analoguesHistoryRuns) analoguesHistoryRuns.unshift(mr);
	var pager = dojo.byId("analoguespager");
	if (pager){
		var pageActive = dojo.query("li:.active", pager);
		if (pageActive && pageActive.textContent == "1") {
			var analoguesite = new mapgallery(mr).placeAt(dojo.byId("lastvisitedSites"), "first");
		} else {
			setupPager();
	      	updateLastResultContainer(1);
		}
	}
		
}

var MAX_NUMBER_OF_PAGES = 10;//Maximum number of pages shown
var ITEMS_PER_PAGE = 5;//how much items per page to show
function setupPager(pageMin, pageMax){
	if (!pageMin) pageMin = 1;
	var number_of_items = 0;
	//getting the amount of elements inside content div
	if (analoguesHistoryRuns) number_of_items = analoguesHistoryRuns.length || 0;
	
	if (number_of_items > 0) {
		//calculate the number of pages we are going to have
		var number_of_pages = Math.ceil(number_of_items/ITEMS_PER_PAGE);
		if (!pageMax && number_of_pages > MAX_NUMBER_OF_PAGES) {
			pageMax = (number_of_pages < MAX_NUMBER_OF_PAGES) ? number_of_pages : MAX_NUMBER_OF_PAGES;;
		} else {
			pageMax = (number_of_pages > MAX_NUMBER_OF_PAGES) ? pageMin + MAX_NUMBER_OF_PAGES - 1 : number_of_pages;
		}
		var pager = dojo.byId("analoguespager");
		if (dojo.query("#analoguespager > ul").length > 0) {
			dojo.forEach(dojo.query("#analoguespager > ul > li"), function(entry){
			    dojo.destroy(entry);
			});
		}
		var ul = dojo.create("ul");
		//Prev
		var li = dojo.create("li");
		li.id = "PrevGallery";
		li.className=(pageMin && pageMin == 1) ? "disabled" : "";
		var a = dojo.create('a');
		a.href = "Javascript:void(0)";
		a.innerHTML = "Prev";
		li.appendChild(a);
		ul.appendChild(li);
		dojo.connect(li, "click", previousPage);
		//Page 1
		var li1 = dojo.create("li");
		li1.className="active";
		var a1 = dojo.create('a');
		a1.href = "Javascript:void(0);";
		a1.innerHTML = pageMin;
		li1.appendChild(a1);
		ul.appendChild(li1);
       	dojo.connect(li1, "click", click_pager);
       	//rest of pages
       	for (var i=pageMin; i<pageMax; i++){
       		var lix = dojo.create("li");
			ax = dojo.create('a');
			ax.href = "Javascript:void(0);";
			ax.innerHTML = (i+1);
			lix.appendChild(ax);
			ul.appendChild(lix);
			dojo.connect(lix, "click", click_pager);
       	}
       	//Page Next
       	var linext = dojo.create("li");
       	linext.id = "NextGallery";
       	linext.className = (pageMax <= 1) ? "disabled" : "";
		var anext = dojo.create('a');
		anext.href = "Javascript:void(0);";
		anext.innerHTML = "Next";
		linext.appendChild(anext);
		ul.appendChild(linext);
		dojo.connect(linext, "click", nextPage);
       	pager.appendChild(ul);
        
	}
}

function click_pager(evt){
	evt.stopPropagation();
	evt.preventDefault();
	if( !evt ) evt = window.event;
    var e = evt.target||evt.srcElement;
    var page = e.parentNode;
	var numPage = e.textContent;
	//Update Button selected
	//"NextGallery"; "PrevGallery";
	var pager = dojo.byId("analoguespager");
	dojo.forEach(dojo.query("li", pager), function(entry){
	    dojo.removeClass(entry,'active');
	});
	if (numPage !== "Prev" && numPage !== "Next") {
		page.className = 'active';
		updateLastResultContainer(numPage);
	}
}

function nextPage(){
	var pager = dojo.byId("analoguespager");
	if (pager){
		var pageActive = dojo.query("li:.active", pager);
		var nextPage = pageActive[0].nextSibling;
		var pageNumber = parseInt(pageActive[0].textContent);
		var number_of_pages = Math.ceil(analoguesHistoryRuns.length / ITEMS_PER_PAGE);
		if (pageNumber >= number_of_pages) {
			dojo.query('#NextGallery').addClass('disabled');
		} else {
			dojo.query('#NextGallery').removeClass('disabled');
			dojo.query('#PrevGallery').removeClass('disabled');
		}
		if (nextPage && nextPage.textContent !== "Next") {
			pageActive.removeClass('active');
			nextPage.className = 'active';
			updateLastResultContainer(nextPage.textContent);
		} else if (pageNumber < number_of_pages && nextPage.textContent == "Next"){
				var pageMin = (pageNumber + MAX_NUMBER_OF_PAGES) < number_of_pages ? (pageNumber + 1) : (number_of_pages - MAX_NUMBER_OF_PAGES + 1);
				var pageMax = (pageNumber + MAX_NUMBER_OF_PAGES) > number_of_pages ? number_of_pages : (pageNumber + MAX_NUMBER_OF_PAGES);
				setupPager(pageMin, pageMax);
				if (pageMax >= number_of_pages) {
					updateLastResultContainer(pageNumber+1);
					dojo.forEach(dojo.query("li", pager), function(entry){
				   		dojo.removeClass(entry,'active');
					    if (parseInt(entry.textContent) == (pageNumber+1)) {
						    dojo.addClass(entry,'active');
						    //entry.click();
						}
					});
				} /*else {
					updateLastResultContainer(pageMax);
				}*/
		}
	}
}

function previousPage(){
	var pager = dojo.byId("analoguespager");
	if (pager){
		var pageActive = dojo.query("li:.active", pager);
		var prevPage = pageActive[0].previousSibling;
		var pageNumber = parseInt(pageActive[0].textContent);
		var number_of_pages = Math.ceil(analoguesHistoryRuns.length / ITEMS_PER_PAGE);
		if (pageNumber <= 1) {
			dojo.query('#PrevGallery').addClass('disabled');
		} else {
			dojo.query('#PrevGallery').removeClass('disabled');
			dojo.query('#NextGallery').removeClass('disabled');
		}
		if (prevPage && prevPage.textContent !== "Prev") {
			pageActive.removeClass('active');
			prevPage.className = 'active';
			updateLastResultContainer(prevPage.textContent);
		} else if (pageNumber > 1 && pageNumber < MAX_NUMBER_OF_PAGES && prevPage.textContent == "Prev"){
				var pageMin = (pageNumber - MAX_NUMBER_OF_PAGES) <= 0 ? 1 : pageNumber - MAX_NUMBER_OF_PAGES;
				var pageMax = (pageNumber - MAX_NUMBER_OF_PAGES) < MAX_NUMBER_OF_PAGES ? MAX_NUMBER_OF_PAGES : pageNumber - 1; 
				setupPager(pageMin, pageMax);

				if (pageMax >= MAX_NUMBER_OF_PAGES) {
					updateLastResultContainer(pageNumber-1);
					dojo.forEach(dojo.query("li", pager), function(entry){
				   		dojo.removeClass(entry,'active');
					    if (parseInt(entry.textContent) == (pageNumber-1)) {
						    dojo.addClass(entry,'active');
						}
					});
				} else {
					updateLastResultContainer(pageMin);
				}
		}
		
	}
}


function updateLastResultContainer(pageNumber){
	var analoguesMapas = dojo.query(".analoguesWidget");
	dojo.forEach(analoguesMapas, function(entry){
		//dojo.fadeOut({ node: entry, duration: 100 }).play();
	    dojo.destroy(entry);
	});
	var from = parseInt(pageNumber) * ITEMS_PER_PAGE - ITEMS_PER_PAGE;
	var to = parseInt(pageNumber) * ITEMS_PER_PAGE;
	//console.log("From: "+from+" - To: "+to);
	if (analoguesHistoryRuns && (to > analoguesHistoryRuns.length)) to = analoguesHistoryRuns.length
	var analoguesContainer = dojo.byId("lastvisitedSites");
	analoguesContainer.style.opacity = 0;
	for (var i=from; i<to; i++){
			var widget = new mapgallery(analoguesHistoryRuns[i]).placeAt(analoguesContainer);
	}
	dojo.fadeIn({ node: dojo.byId('lastvisitedSites'), duration: 500 }).play();
}

/*
 * Cookie for the Splash window
 */
function getCookie(c_name) {
  var c_value = document.cookie;
  var c_start = c_value.indexOf(" " + c_name + "=");
  if (c_start == -1) {
    c_start = c_value.indexOf(c_name + "=");
  }
  if (c_start == -1) {
    c_value = null;
  } else {
    c_start = c_value.indexOf("=", c_start) + 1;
    var c_end = c_value.indexOf(";", c_start);
    if (c_end == -1) {
      c_end = c_value.length;
    }
    c_value = unescape(c_value.substring(c_start,c_end));
  }
  return c_value;
}

function setCookie(c_name,value,exdays) {
  var exdate=new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
  document.cookie=c_name + "=" + c_value;
}


function checkSplash() {
  var showmsg=getCookie("showmsg");
  if (showmsg!=null && showmsg!="" && showmsg=="true") {
    
  } else {
    //Create the popup win
    var content = '<div id="welcomesplash" class="divwelcome"> \
			  <p> Climate Analogues is used to identify areas that experience statistically similar climatic conditions, \
			  but which may be separated temporally and/or spatially. In essence, the approach allows you to glimpse into the \
			  future by locating areas whose climate today is similar to the projected future climate of a place of interest \
			  (i.e. where can we find today the future climate of Nairobi, Kenya?), or vice-versa. \
			  </p> \
			  <p>If you are ready to start please follow the links to:</p> \
			  <div style="width:100%;"> \
			      <span class="stepsBtn">1</span><p class="steps">Select a search range and reference site</p> \
			      <span class="stepsBtn">2</span><p class="steps">Select direction and global climate models</p> \
			      <span class="stepsBtn">3</span><p class="steps">Select climate variables and other analysis settings</p> \
			      <span class="stepsBtn">4</span><p class="steps">Observe and save your results</p> \
			      <p style="font-size:0.9em;font-style:italic;">(You are able to navigate back to previous pages using the icons at the top right hand corner of the page)</p> \
			      <p><span id="icono_help" class="icon-question-sign"></span>&nbsp;&nbsp;&nbsp;&nbsp;For additional information please use these help icons.</p> \
			      <div class="btnWelcome">\
			      <p style="text-align:center;margin-top:15px;"><a id="welcomeBtn" class="btn btn-success btn-large" href="JavaScript:welcomeModal.hide();void(0);" >Get started &raquo;</a></p> \
			  </div> \
			  <p style="text-decoration: overline;font-size:0.8em;text-align:left;margin-bottom:-10px;margin-top:20px;">For best performance we recommend the use of Google Chrome or Mozilla Firefox.</p> \
			   \
			</div>';
	
	welcomeModal = new Modal({
						content:content, 
						backdrop:true, showOnStart: true,
						header:"<h4>Welcome to the Climate Analogues online platform</h4>",
						footer:'<p class="chkmsg">&nbsp;&nbsp;<input type="checkbox" id="chk_showmsg" onchange="applyShowMsg();"/>Do not show this message again</p>'
					});
	welcomeModal.startup();

  }
}

function applyShowMsg(){
  showmsg = document.getElementById('chk_showmsg').checked;
  if (showmsg!=null && showmsg!="") {
    setCookie("showmsg",showmsg,365);
  }
}
