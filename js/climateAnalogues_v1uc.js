function init() {
    checkSplash(), 
	OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3, 
	OpenLayers.Util.onImageLoadErrorColor = "transparent", 
	loadZones(), 
	analoguesParams = new Parameters
}

function stepOne(a) {
    dojo.byId("ClimaticZone").value;
    var c = dojo.byId("lng").value,
        d = dojo.byId("lat").value;
    return "" === c || "" === d || "undefined" === c || "undefined" === d ? 
	(dojo.byId("errMsg").innerHTML = '<h4 class="alert-heading">Warning in coordinates </h4>                             			<p>Please select a point over map or enter x,y coordinates in decimal degrees (dd).</p>', dojo.query("#alertMsg").removeClass("alert-error"), dojo.query(".alertaError")[0].style.visibility = "visible", -1) : d >= 90 || -60 >= d ? (dojo.byId("errMsg").innerHTML = '<h4 class="alert-heading">Error in Latitude value </h4>                             			<p>You have to enter a valid value between 90 and -60.</p>', dojo.query("#alertMsg").addClass("alert-error"), dojo.query(".alertaError")[0].style.visibility = "visible", -1) : c >= 180 || -180 >= c ? (dojo.byId("errMsg").innerHTML = '<h4 class="alert-heading">Error in Longitude value </h4>                             			<p>You have to enter a valid value between 180 and -180.</p>', dojo.query("#alertMsg").addClass("alert-error"), dojo.query(".alertaError")[0].style.visibility = "visible", -1) : (dojo.query(".alertaError")[0].style.visibility = "hidden", null != a && (updateParams(), steps.next()), void 0)
}

function stepTwo(a) {
    var b = stepOne(null);
    if (-1 == b) return steps.to(0, !0), -1;
    var b = changeRefGCM();
    if (-1 == b) return -2;
    var b = changeTargetGCM();
    return -1 == b ? -2 : (dojo.query(".alertaError")[0].style.visibility = "hidden", null != a && (updateParams(), steps.next()), void 0)
}

function stepThree(a) {
    var b = stepTwo(null);
    if (-1 == b) return steps.to(0, !0), void 0;
    if (-2 == b) return steps.to(1, !0), void 0;
    var b = changeClimaticVars();
    if (-1 == b) return -3;
    var b = changeGrowingSeason();
    return -1 == b ? -3 : (dojo.query(".alertaError")[0].style.visibility = "hidden", null != a && (updateParams(), steps.next()), (dojo.isFF >= 3.6 || dojo.isChrome >= 6 || dojo.isSafari >= 6 || dojo.isOpera >= 11.1 || dojo.isIE >= 10) && (dojo.byId("sessionBtns").style.display = "block", dojo.byId("saveSessionBtn").style.visibility = dojo.byId("tablelyrResults").rows.length <= 0 ? "hidden" : "visible"), dojo.byId("step4showMapLargeScreenBtn").style.display = "none", dojo.byId("step4DownloadBtn").style.display = "none", dojo.byId("mapResultsLegend").style.display = "none", dojo.byId("divProgressBar").style.display = "block", runAnalogues(), void 0)
}

function loadOpenLyr() {
    initialExtent = new OpenLayers.Bounds(-17728498.589175, -15654303.39, 17728498.589175, 15654303.39), map = new dojox.geo.openlayers.Map("map", {
        baseLayerType: dojox.geo.openlayers.BaseLayerType.GOOGLE,
        maxExtent: initialExtent,
        numZoomLevels: 18,
        maxResolution: 156543.0339,
        units: "m",
        projection: epsg900913,
        displayProjection: epsg4326
    }), map.getOLMap().addControl(new OpenLayers.Control.Zoom);
    var a = new OpenLayers.Control.MousePosition({
        numDigits: 3,
        displayProjection: epsg4326,
        div: dojo.byId("mouseposition")
    });
    map.getOLMap().addControl(a), markers = new OpenLayers.Layer.Markers("Markers"), markers.animationEnabled = !0, map.getOLMap().addLayer(markers);
    var b = qs_init();
    b.lat || b.lon || b.zoom ? (setMapCenter(new OpenLayers.LonLat(b.lon, b.lat), b.zoom), dojo.byId("lng").value = b.lon, dojo.byId("lat").value = b.lat, addSiteSelected()) : setMapCenter(new OpenLayers.LonLat(0, 0), 1), (1 == b.showresults || "yes" == b.showresults) && (dojo.byId("mapgallery").style.display = "block", showresults = !0, showLastResultsSites()), map.getOLMap().events.register("click", map, handleMapClick), map.getOLMap().events.register("moveend", null, displayZoom), initEventsParams(), resetParams(), initTooltips()
}

function initEventsParams() {
    dojo.connect(dojo.byId("lat"), "onkeypress", addSiteSelected), dojo.connect(dojo.byId("lng"), "onkeypress", addSiteSelected), dojo.forEach(dojo.query("#directionBtns.btn-group > button.btn"), function (a) {
        dojo.connect(a, "onclick", changeDirection)
    }), dojo.forEach(dojo.query("#methodBtns.btn-group > button.btn"), function (a) {
        dojo.connect(a, "onclick", changeMethod)
    }), dojo.forEach(dojo.query("#rotationBtns.btn-group > button.btn"), function (a) {
        dojo.connect(a, "onclick", changeRotation)
    }), dojo.forEach(dojo.query("#divclimaticvars input"), function (a) {
        if (dojo.connect(a, "onchange", changeClimaticVars), "checkbox" == a.type && 0 == a.checked) {
            var b = a.id.replace("chk_", "");
            dojo.byId(b).setAttribute("disabled", "disabled")
        }
    })
}

function createSteps() {
    var a = '<div class="carousel-steps">                     <table cellpadding="4" style="width:100%;height:100%;">   '         
+	'<tr><td style="width:50%;">                         <div style="width:100%; height:400px;margin:1px;border:1px solid #999;background:#f9f9f9;">                             <div id="step1" style="padding-left:15px;padding-right:15px;"> 	                            <h3>Step 1: Select your location</h3> 	                            <p style="display:inline;">i) Select a reference site:</p> 	                            <div id="zoneshelp" style="position:relative;margin-left:10px;margin-bottom:5px;" class="icon-question-sign"></div> 	                            <div class="alert fade in">                                 	Use the tab below to zoom to a country then click a location on the map to get coordinates, or alternatively, enter the latitude and longitude directly                                 </div>                                 <select id="ClimaticZone" style="width:150px;display:inline;" title="" onchange="ZoomtoClimaticZone(this.options[this.selectedIndex].value);"> 	                                <option disabled="disabled" value="none" selected="">Zoom to country</option> 	                                <option value="global" >Global</option> 	                                <optgroup label="COUNTRY">';
    zones.length > 0 && dojo.forEach(zones, function (b, c) {
        a += '<option value="' + c + '">' + b.country + "</option>"
    }), a += '</optgroup></select>                                 <div style="position:relative;width:250px;float:right;top:-10px;"> 	                                <div class="form-horizontal control-group"> 										<label class="control-label" for="lat">Latitude:</label> 										<div class="controls"> 											<input id="lat" onchange="addSiteSelected();" type="number" step="any" min="-60.0" max="90.0" class="input-small"  value="" placeholder="eg. 33.593"/> 											<span id="lathelp" class="icon-question-sign"></span> 										</div> 									</div> 									<div class="form-horizontal control-group"> 										<label class="control-label" for="lng">Longitude:</label> 										<div class="controls"> 											<input id="lng" onchange="addSiteSelected();" type="number" step="any" min="-180.0" max="180.0" class="input-small" value="" placeholder="eg. 0.732" /> 											<span id="lnghelp" class="icon-question-sign"></span> 										</div> 									</div>								</div>								<hr/> 	                            <p style="display:inline;">ii) Select a search range:</p> 	                            <div id="searchrangehelp" style="position:relative;margin-left:10px;margin-bottom:10px;margin-right:25px;" class="icon-question-sign"></div> 	                            <select id="SearchRange" onchange="checkClimaticZones();"> 	                                <option value="global" selected="">Global</option> 	                                <optgroup label="COUNTRY">', zones.length > 0 && dojo.forEach(zones, function (b, c) {
        a += '<option value="' + c + '">' + b.country + "</option>"
    }), a += "</optgroup></select>", a += '<hr/> 		                        <p style="text-align:center;margin-top:20px;"><a id="step1Btn" class="btn btn-success btn-large" href="JavaScript:void(0);" >Continue &raquo;</a></p> 		                    </div> 		                    </td><td style="width:50%;"> 		                        <div id="mouseposition" class="unselectable"></div> 		                        <div id="maphelp"><span class="icon-question-sign"></span></div> 		                        <div id="map"></div>		                    </td> </tr> 	                    </div>                     </table>                     </div>';
    var b = new CarouselItem_ege({
        content: a
    }),
        c = '<div class="carousel-steps"> 			        <div class="carousel-steps-content"> 			            <h3>Step 2: Select a direction and global climate models </h3> 			            <div> 				            <h5 style="display:inline; margin-right:20px;">Direction:</h5> 				            <div id="directionBtns" class="btn-group" data-toggle="buttons-radio"> 				                <button type="button" class="btn" name="backward">Backward</button> 				                <button type="button" class="btn" name="forward">Forward</button> 				                <button type="button" class="active btn btn-primary" name="none">None</button> 				            </div> 				            <span id="directionhelp" class="icon-question-sign"></span> 				            <p class="btnStep2"><a id="step2Btn" class="btn btn-success btn-large" href="JavaScript:void(0);" >Continue &raquo;</a></p> 		                </div> 			            <div> 				            <h5 style="margin-bottom:0px;">Global climate models: <span id="gcmshelp" class="icon-question-sign"></span></h5> 				            <table style="margin-bottom:0px;width:99%; background-color:#f9f9f9;"> 					        <tr><td style="width:40%;"> 					            <div class="gcmOptions"> 						            <h5 style="text-align:center;">Reference site:</h5> 						            <select id="refPeriod" style="width:250px;" onchange="changeRefPeriod(this.options[this.selectedIndex].value);"> 		                                <option value="1960_1990" selected="">1960 - 1990</option> 		                                <option value="2020_2049">2020 - 2049</option> 		                            </select>		                            <select id="refScenario" style="width:250px;" onchange="changeRefScenario(this.options[this.selectedIndex].value);"> 		                                <option value="baseline" selected="">Baseline</option> 		                                <option value="a1b">SRES A1B</option>                                         <option value="a2" disabled="disabled">SRES A2</option>                                         <option value="b1" disabled="disabled">SRES B1</option> 		                            </select>						            <select id="refgcm" multiple="multiple" name="refModelGCM" size="5" style="width:250px;" onchange="changeRefGCM(this.options[this.selectedIndex].value);">';
    gcms.length > 0 && dojo.forEach(gcms, function (a) {
        c += "CURRENT" == a ? '<option value="' + a + '" selected="">' + a + "</option>" : '<option value="' + a + '">' + a + "</option>"
    }), c += '</select> 									<select id="refResolution" style="width:250px;" onchange="changeRefResolution(this.options[this.selectedIndex].value);"> 										<option value="30s" disabled="disabled">30 arc-seconds</option> 		                                <option value="2_5min" >2.5 arc-minutes</option> 		                                <option value="5min" disabled="disabled">5 arc-minutes</option> 		                                <option value="10min" selected="" >10 arc-minutes</option> 		                                <option value="25min" disabled="disabled">25 arc-minutes</option> 										<option value="30min" disabled="disabled">30 arc-minutes</option> 		                            </select>					            </div> 						    </td>						    <td style="width:20%;text-align:center;vertical-align:top;"> 						    	<div style="margin-top:48px;"><strong>Period</strong> <span id="periodhelp" class="icon-question-sign"></span></div> 						    	<div style="margin-top:24px;"><strong>Scenario</strong> <span id="scenariohelp" class="icon-question-sign"></span></div> 						    	<div style="margin-top:55px;"><strong>Model</strong> <span id="modelhelp" class="icon-question-sign"></span></div> 						    	<div style="margin-top:60px;"><strong>Resolution</strong> <span id="resolutionhelp" class="icon-question-sign"></span></div> 						    </td>						    <td style="width:40%;"> 					            <div class="gcmOptions"> 						            <h5 style="text-align:center;">Search range:</h5> 						            <select id="targetPeriod" style="width:250px;" onchange="changeTargetPeriod(this.options[this.selectedIndex].value);"> 		                                <option value="1960_1990" selected="">1960 - 1990</option> 		                                <option value="2020_2049">2020 - 2049</option> 		                            </select>		                            <select id="targetScenario" style="width:250px;" onchange="changeTargetScenario(this.options[this.selectedIndex].value);"> 		                                <option value="baseline" selected="">Baseline</option> 		                                <option value="a1b">SRES A1B</option>                                         <option value="a2" disabled="disabled">SRES A2</option>                                         <option value="b1" disabled="disabled">SRES B1</option> 		                            </select>						            <select id="targetgcm" multiple="multiple" name="targetModelGCM" size="5" style="width:250px;" onchange="changeTargetGCM(this.options[this.selectedIndex].value);">', gcms.length > 0 && dojo.forEach(gcms, function (a) {
        c += "CURRENT" == a ? '<option value="' + a + '" selected="">' + a + "</option>" : '<option value="' + a + '">' + a + "</option>"
    }), c += '</select> 									<select id="targetResolution" style="width:250px;" onchange="changeTargetResolution(this.options[this.selectedIndex].value);"> 		                                <option value="30s" disabled="disabled">30 arc-seconds</option> 		                                <option value="2_5min">2.5 arc-minutes</option> 		                                <option value="5min" disabled="disabled">5 arc-minutes</option> 		                                <option value="10min" selected="" >10 arc-minutes</option> 		                                <option value="25min" disabled="disabled">25 arc-minutes</option> 										<option value="30min" disabled="disabled">30 arc-minutes</option> 		                            </select>					            </div> 				            </td></tr> 				            </table> 			            </div> 			        </div>			    </div>';
    var d = new CarouselItem_ege({
        content: c
    }),
        e = '<div class="carousel-steps"> 				    <div class="carousel-steps-content"> 				        <h3>Step 3: Select climate variables and define other analysis settings</h3> 				        <div style="width:100%;height:325px;overflow:visible;">                     	<table style="width:100%;height:325px;">                         <tr>                             <td width="55%">                                 <p style="position:relative;float:left;font-weight:bold;">Climatic and bioclimatic variables &nbsp;&nbsp;                                 <span id="climaticvarshelp" class="icon-question-sign"></span></p>                                 <p style="position:relative;float:right;margin-right:35px;ont-weight:bold;">Weights&nbsp;&nbsp;                                 <span id="weightshelp" class="icon-question-sign"></span></p>                                 <div id="divclimaticvars" style="width:100%;height:288px;overflow-y:auto;border: 1px solid rgb(41, 116, 53);border-radius: 5px;"                                 class="form-horizontal">                                 <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_tmean" checked="true"/>                                 <label class="control-label" for="tmean">MONTHLY MEAN TEMPERATURE</label>                                 <input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="0.5" id="tmean"></p>                                 <p class="pclimaticvars"><input type="checkbox" id="chk_prec" checked="true"/>                                 <label class="control-label" for="prec">MONTHLY PRECIPITATION</label>                                 <input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="0.5" id="prec"></p>                                 <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_1"/>                                 <label class="control-label" for="bio_1">ANNUAL MEAN TEMPERATURE</label>                                 <input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_1"></p>                                 <p class="pclimaticvars"><input type="checkbox" id="chk_bio_2"/>                                 <label class="control-label" for="bio_2">MEAN DIURNAL RANGE</label>                                 <input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_2"></p>                                 <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_3"/>                                 <label class="control-label" for="bio_3">ISOTHERMALITY</label>                                 <input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_3"></p>                                 <p class="pclimaticvars"><input type="checkbox" id="chk_bio_4"/>                                 <label class="control-label" for="bio_4">TEMPERATURE SEASONALITY                                 </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_4"></p>                                 <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_5"/>                                 <label class="control-label" for="bio_5">MAX TEMPERATURE OF WARMEST PERIOD                                 </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_5"></p>                                 <p class="pclimaticvars"><input type="checkbox" id="chk_bio_6"/>                                 <label class="control-label" for="bio_6">MIN TEMPERATURE OF COLDEST PERIOD                                 </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_6"></p>                                 <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_7"/>                                 <label class="control-label" for="bio_7">TEMPERATURE ANNUAL RANGE                                 </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_7"></p>                                 <p class="pclimaticvars"><input type="checkbox" id="chk_bio_8"/>                                 <label class="control-label" for="bio_8">MEAN TEMPERATURE OF WETTEST QUARTER                                 </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_8"></p>                                 <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_9"/>                                 <label class="control-label" for="bio_9">MEAN TEMPERATURE OF DRIEST QUARTER                                 </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_9"></p>                                 <p class="pclimaticvars"><input type="checkbox" id="chk_bio_10"/>                                 <label class="control-label" for="bio_10">MEAN TEMPERATURE OF WARMEST QUARTER                                 </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_10"></p>                                 <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_11"/>                                 <label class="control-label" for="bio_11">MEAN TEMPERATURE OF COLDEST QUARTER                                 </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_11"></p>                                 <p class="pclimaticvars"><input type="checkbox" id="chk_bio_12"/>                                 <label class="control-label" for="bio_12">ANNUAL PRECIPITATION                                 </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_12"></p>                                 <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_13"/>                                 <label class="control-label" for="bio_13">PRECIPITATION OF WETTEST PERIOD                                 </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_13"></p>                                 <p class="pclimaticvars"><input type="checkbox" id="chk_bio_14"/>                                 <label class="control-label" for="bio_14">PRECIPITATION OF DRIEST PERIOD                                 </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_14"></p>                                 <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_15"/>                                 <label class="control-label" for="bio_15">PRECIPITATION SEASONALITY                                 </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_15"></p>                                 <p class="pclimaticvars"><input type="checkbox" id="chk_bio_16"/>                                 <label class="control-label" for="bio_16">PRECIPITATION OF WETTEST QUARTER                                 </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_16"></p>                                 <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_17"/>                                 <label class="control-label" for="bio_17">PRECIPITATION OF DRIEST QUARTER                                 </label><input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_17"></p>                                 <p class="pclimaticvars"><input type="checkbox" id="chk_bio_18"/>                                 <label class="control-label" for="bio_18">PRECIPITATION OF WARMEST QUARTER</label>                                 <input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_18"></p>                                 <p class="pclimaticvars bgGray"><input type="checkbox" id="chk_bio_19"/>                                 <label class="control-label" for="bio_19">PRECIPITATION OF COLDEST QUARTER</label>                                 <input onkeypress="onkeypressClimaticVars();" type="number" step="0.01" min="0.0" max="1.0" class="input-small" value="" id="bio_19"></p>                         </div>                             </td>                             <td width="50%">                             <div class="divOtherSettings">                                 <div style="display:none;"> 					                <h5 style="display:inline; margin-right:20px;">Similarity Index:</h5> 						            <div id="methodBtns" class="btn-group"> 						                <button type="button" class="active btn btn-primary" name="ccafs">ccafs</button> 						                <button type="button" class="btn" name="hallegatte">hallegatte</button> 						            </div> 						            <span id="similarityIndexhelp" class="icon-question-sign"></span> 					            </div>					            <div id="rotationOpts"> 					                <h5 style="display:inline; margin-right:10px;">Rotation:</h5> 						            <div id="rotationBtns" class="btn-group"> 						                <button type="button" class="btn" name="prec">prec</button> 						                <button type="button" class="btn" name="tmean">tmean</button> 						                <button type="button" class="btn" name="both">both</button> 						                <button type="button" class="active btn btn-primary" name="none">none</button> 						            </div> 						            <span id="rotationhelp" class="icon-question-sign"></span> 					            </div>					            <div> 					                <h5>Temporal scope: &nbsp;&nbsp;<span id="growingseasonhelp" class="icon-question-sign"></span></h5> 					                <div id="temporalScope" class="temporalScope"> 						                <table style="width:100%;text-align:center;"> 						                	<tr><td rowspan="2"><strong>Growing season date 1:</strong></td><td>Start</td><td></td><td>End</td></tr> 						                	<tr> 							                	<td><input id="growingSeason1_startDate" value="1" class="span1" type="number" min="1" max="12" data-dojo-type="bootstrap/Datepicker"></td> 							                	<td></td> 							                	<td><input id="growingSeason1_endDate" value="12" class="span1" type="number" min="1" max="12" data-dojo-type="bootstrap/Datepicker"></td> 							                </tr> 							                <tr><td rowspan="2"><strong>Growing season date 2:</strong></td><td>Start</td><td></td><td>End</td></tr> 							                <tr> 								                <td><input id="growingSeason2_startDate" value="" class="span1" type="number" min="1" max="12" data-dojo-type="bootstrap/Datepicker"></td> 								                <td></td> 								                <td><input id="growingSeason2_endDate" value="" class="span1" type="number" min="1" max="12" data-dojo-type="bootstrap/Datepicker"></td> 							                </tr> 					            		</table>					            	</div>					            </div>					            <div> 					                <h5>Threshold:  					                <input id="threshold" type="number" step="0.01" min="0.0" max="1.0" value="0.0" class="input-mini"/> 					                &nbsp;&nbsp;<span id="thresholdhelp" class="icon-question-sign"></span></h5> 					            </div>					            </div> 					        <p class="btnStep3"><a id="step3Btn" class="btn btn-success btn-large" href="JavaScript:void(0);" >Run Analysis &raquo;</a></p> 					        </td>                         </tr>                     </table>                 </div> 		    </div>		</div>',
        f = new CarouselItem_ege({
            content: e
        }),
        g = '<div class="carousel-steps">                     <table cellpadding="4" style="width:100%;height:100%;">                         <tr><td style="width:50%;">                         <div style="width:100%; height:400px;margin:1px;border:1px solid #999;background:#f9f9f9;">                             <div id="step4" style="padding-left:15px;padding-right:15px;"> 	                            <h3>Step 4: Selecting candidate analogue sites:</h3> 	                            <div id="divResults"> 	                                <table id="tablelyrResults" class="table table-striped" style="margin:5px 0px;width:100%;"> 				                    </table>                                 </div>                                 <div id="sessionBtns" style="display:block;text-align:left;margin-top:5px;">                                	<div class="fileinputs"> 	                                	<input id="fileToLoad" type="file" class="file" onChange="loadSession();"/> 										<div class="fakefile"> 											<input style="width:80px;height:20px;" class="btn btn-primary" /> 											<p class="loadFileTitle">Load Session</p> 										</div> 									</div> 									<a id="saveSessionBtn" class="btn btn-primary" href="JavaScript:saveSession();">Save Session</a>	                            </div>                                 <hr style="margin:13px;"/>                                 <div>                                 	<div id="divProgressBar" class="progress progress-success progress-striped active">                                 		<div class="bar" style="width: 100%;">                                 		<i style="position:relative;top:4px;">Calculating Climate Analogues for the selected site...</i>                                 		</div>                                 	</div>                                 	<p style="position:relative;float:left;text-align:center;"><a id="step4DownloadBtn" class="btn btn-success btn-large" href="JavaScript:void(0);" >Download Last Result</a></p> 		                    		<p style="position:relative;float:right;text-align:center;"><a id="step4showMapLargeScreenBtn" class="btn btn-success btn-large" href="JavaScript:void(0);" >View Larger Map</a></p> 		                    	</div> 		                    </div> 		                    </td><td style="width:50%;"> 		                    	<div id="mapaResultado"><div id="loading"><div id="loadingMessage">Processing Climate Similarity...<br><img src="imgs/loading_gray_circle.gif"></div> </div></div>		                        <div id="mapResults">		                        <div id="mapResultsMouseposition" class="unselectable"></div>		                        <div id="mapResultsLegend" class="unselectable" title="Interpreting results: Areas that have higher similarity values more closely resemble the specified climate at the reference site."></div>		                        </div>		                    </td> </tr> 	                    </div>                     </table>                     </div>',
        h = new CarouselItem_ege({
            content: g
        });
    dojo.setAttr(b.domNode, "data-dojo-type", "CarouselItem_ege"), dojo.setAttr(d.domNode, "data-dojo-type", "CarouselItem_ege"), dojo.setAttr(f.domNode, "data-dojo-type", "CarouselItem_ege"), dojo.setAttr(h.domNode, "data-dojo-type", "CarouselItem_ege"), dojo.byId("analoguesSteps").appendChild(b.domNode), dojo.byId("analoguesSteps").appendChild(d.domNode), dojo.byId("analoguesSteps").appendChild(f.domNode), dojo.byId("analoguesSteps").appendChild(h.domNode), steps = new Carousel_ege({
        interval: !1,
        pauseOnHover: !1,
        indicators: !0,
        navigatable: !1
    }, dojo.byId("analoguesSteps")), steps.startup();
    var i = new Datepicker({
        format: "M",
        minViewMode: 1
    }, dojo.byId("growingSeason1_startDate")),
        j = new Datepicker({
            format: "M",
            minViewMode: 1
        }, dojo.byId("growingSeason1_endDate")),
        k = new Datepicker({
            format: "M",
            minViewMode: 1
        }, dojo.byId("growingSeason2_startDate")),
        l = new Datepicker({
            format: "M",
            minViewMode: 1
        }, dojo.byId("growingSeason2_endDate"));
    dojo.connect(i, "hide", changeGrowingSeason), dojo.connect(j, "hide", changeGrowingSeason), dojo.connect(k, "hide", changeGrowingSeason), dojo.connect(l, "hide", changeGrowingSeason), dojo.connect(dojo.query('[data-slide-to="0"]')[0], "click", function () {
        setTimeout(function () {
            updateMapSize()
        }, 200)
    }), dojo.connect(dojo.query('[data-slide-to="3"]')[0], "click", function () {
        setTimeout(function () {
            updateMapSize()
        }, 200)
    }), dojo.byId("divProgressBar").style.display = "none", dojo.byId("step4showMapLargeScreenBtn").style.display = "none", dojo.byId("step4DownloadBtn").style.display = "none", dojo.byId("mapResultsLegend").style.display = "none", dojo.byId("saveSessionBtn").style.visibility = "hidden";
    var m = dojo.byId("divResults");
    m.addEventListener("dragover", handleDragOver, !1), m.addEventListener("drop", handleFileSelect, !1), dojo.connect(dojo.byId("step1Btn"), "click", stepOne), dojo.connect(dojo.byId("step2Btn"), "click", stepTwo), dojo.connect(dojo.byId("step3Btn"), "click", stepThree), dojo.connect(dojo.byId("step4showMapLargeScreenBtn"), "click", viewLargerMap), loadOpenLyr()
}

function updateMapSize() {
    map && map.getOLMap().baseLayer.onMapResize(), mapResults && mapResults.baseLayer.onMapResize()
}

function changeMapBaseMap() {
    map.getOLMap().getZoom() > 12 ? (map.getOLMap().baseLayer.type = "hybrid", map.getOLMap().baseLayer.redraw()) : (map.getOLMap().baseLayer.type = "roadmap", map.getOLMap().baseLayer.redraw())
}

function qs_init() {
    var a = {}, b = location.search.substring(1, location.search.length);
    b = b.replace(/\+/g, " ");
    for (var c = b.split("&"), d = 0; d < c.length; d++) {
        var e = c[d].split("="),
            f = decodeURIComponent(e[0]),
            g = 2 == e.length ? decodeURIComponent(e[1]) : f;
        a[f] = g
    }
    return a
}

function get_osm_url(a) {
    var b = this.map.getOLMap().getResolution(),
        c = Math.round((a.left - this.maxExtent.left) / (b * this.tileSize.w)),
        d = Math.round((this.maxExtent.top - a.top) / (b * this.tileSize.h)),
        e = this.map.getOLMap().getZoom(),
        f = Math.pow(2, e);
    return 0 > d || d >= f ? OpenLayers.Util.getImagesLocation() + "404.png" : (c = (c % f + f) % f, this.url + e + "/" + c + "/" + d + "." + this.type)
}

function setMapCenter(a, b) {
    var c = map.getOLMap().getNumZoomLevels();
    b >= c && (b = c - 1), map.getOLMap().setCenter(a.clone().transform(epsg4326, map.getOLMap().getProjectionObject()), b)
}

function layerType(a) {
    var b = dom.byId(a),
        c = b.value;
    map.setBaseLayerType(c)
}

function getTiempoTransc() {
    var a = new Date - tiempo,
        b = Math.floor(a / 1e3 / 60 / 60);
    a -= 60 * 60 * 1e3 * b;
    var c = Math.floor(a / 1e3 / 60);
    a -= 60 * 1e3 * c;
    var d = Math.floor(a / 1e3);
    return a -= 1e3 * d, "Time: " + c + " min " + d + " sec"
}

function isMapResultLoaded(a) {
    for (var b = 0; b < runAnalysis.length; b++)
        if (runAnalysis[b].site === a) return !0;
    return !1
}

function displayZoom() {
    changeMapBaseMap()
}

function handleMapClick(a) {
    siteLyr && siteLyr.removeAllFeatures();
    var b = map.getOLMap().getLonLatFromViewPortPx(a.xy),
        c = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(b.lon, b.lat));
    if (siteLyr && siteLyr.addFeatures([c]), c.geometry.transform(epsg900913, epsg4326), dojo.byId("lng").value = parseFloat(c.geometry.x).toFixed(3), dojo.byId("lat").value = parseFloat(c.geometry.y).toFixed(3), markers) {
        markers.clearMarkers();
        var d = new OpenLayers.Size(24, 24),
            e = 0,
            f = new OpenLayers.Icon("imgs/targetred.png", d, e);
        markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(b.lon, b.lat), f))
    }
    dojo.query(".alertaError")[0].style.visibility = "hidden", updateParams()
}

function addSiteSelected() {
    var a = dojo.byId("lng").value,
        b = dojo.byId("lat").value;
    if ("" !== a && "" !== b && "undefined" !== a && "undefined" !== b) {
        var c = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(parseFloat(a), parseFloat(b)));
        if (c.geometry.transform(epsg4326, epsg900913), siteLyr && siteLyr.addFeatures([c]), markers) {
            markers.clearMarkers();
            var d = new OpenLayers.Size(24, 24),
                e = 0,
                f = new OpenLayers.Icon("imgs/targetred.png", d, e);
            markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(c.geometry.x, c.geometry.y), f))
        }
        updateParams()
    }
}

function cloneSiteSelected(a) {
    var b = dojo.byId("lng").value,
        c = dojo.byId("lat").value;
    if ("" !== b && "" !== c && "undefined" !== b && "undefined" !== c) {
        var d = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(parseFloat(b), parseFloat(c)));
        if (d.geometry.transform(epsg4326, epsg900913), site) {
            var e = new OpenLayers.Size(24, 24),
                f = 0,
                g = new OpenLayers.Icon("imgs/targetred.png", e, f),
                h = new OpenLayers.Marker(new OpenLayers.LonLat(d.geometry.x, d.geometry.y), g);
            h.id = a, site.addMarker(h)
        }
    }
}

function zoomtoZone(a) {
    var b = new OpenLayers.Geometry.Point(parseFloat(zones[a].bounds[0]), parseFloat(zones[a].bounds[1])),
        c = new OpenLayers.Geometry.Point(parseFloat(zones[a].bounds[2]), parseFloat(zones[a].bounds[3]));
    b.transform(epsg4326, epsg900913), c.transform(epsg4326, epsg900913);
    var d = new OpenLayers.Bounds(b.x, b.y, c.x, c.y);
    map.getOLMap().zoomToExtent(d, !1)
}

function checkClimaticZones() {
    var a = dojo.byId("ClimaticZone").value;
    "global" == a || "africa" == a || "asia" == a || "australia" == a || "europe" == a || "latinamerica" == a || "northamerica" == a || "russia" == a ? (dojo.byId("refResolution").selectedIndex = 3, dojo.byId("refResolution").options[0].setAttribute("disabled", "disabled"), dojo.byId("refResolution").options[1].removeAttribute("disabled"), dojo.byId("refResolution").options[3].removeAttribute("disabled")) : (dojo.byId("refResolution").selectedIndex = 0, dojo.byId("refResolution").options[0].removeAttribute("disabled"), dojo.byId("refResolution").options[1].setAttribute("disabled", "disabled"), dojo.byId("refResolution").options[3].setAttribute("disabled", "disabled"));
    var b = dojo.byId("SearchRange").value;
    "global" == b || "africa" == b || "asia" == b || "australia" == b || "europe" == b || "latinamerica" == b || "northamerica" == b || "russia" == b ? (dojo.byId("targetResolution").selectedIndex = 3, dojo.byId("targetResolution").options[0].setAttribute("disabled", "disabled"), dojo.byId("targetResolution").options[1].removeAttribute("disabled"), dojo.byId("targetResolution").options[3].removeAttribute("disabled")) : (dojo.byId("targetResolution").selectedIndex = 0, dojo.byId("targetResolution").options[0].removeAttribute("disabled"), dojo.byId("targetResolution").options[1].setAttribute("disabled", "disabled"), dojo.byId("targetResolution").options[3].setAttribute("disabled", "disabled"))
}

function ZoomtoClimaticZone(a) {
    if (currentClimaticZone = a.toString(), "none" != currentClimaticZone) switch (checkClimaticZones(), currentClimaticZone.toString()) {
    case "global":
        map.getOLMap().zoomToExtent(initialExtent);
        break;
    case "africa":
        map.getOLMap().zoomToExtent(new OpenLayers.Bounds(-2318793.6896435, -3600489.7797, 6545455.6049441, 4226661.9153), !0);
        break;
    case "asia":
        map.getOLMap().zoomToExtent(new OpenLayers.Bounds(6017122.8655892, -127191.2150436, 14881372.160177, 7699960.4799564), !0);
        break;
    case "australia":
        map.getOLMap().zoomToExtent(new OpenLayers.Bounds(11557278.674674, -7391766.3819652, 20421527.969262, 435385.3130348), !0);
        break;
    case "europe":
        map.getOLMap().zoomToExtent(new OpenLayers.Bounds(-919690.32412488, 4089686.7606372, 3512434.3231689, 8003262.6081372), !0);
        break;
    case "latinamerica":
        map.getOLMap().zoomToExtent(new OpenLayers.Bounds(-11667347.995321, -5224623.7564125, -2803098.7007339, 2602527.9385875), !1);
        break;
    case "northamerica":
        map.getOLMap().zoomToExtent(new OpenLayers.Bounds(-16104364.612416, 2690583.3951568, -7240115.3178282, 10517735.090157), !0);
        break;
    case "russia":
        map.getOLMap().zoomToExtent(new OpenLayers.Bounds(6075826.5032472, 5792092.254294, 14940075.797835, 13619243.949294), !0);
        break;
    default:
        map.fitTo(zones[a].bounds)
    }
}

function getSearchRangeExtent() {
    var a = initialExtent,
        b = dojo.byId("SearchRange").value;
    return "global" != b && (cntryiso = zones[parseInt(b)].iso, a = getExtentbyCountry(cntryiso)), a
}

function getZones(a) {
    var b = new dojo.Deferred,
        c = new dojox.data.CsvStore({
            url: a
        });
    return c.fetch({
        onComplete: dojo.partial(processZonesCsv, b),
        onError: function (a) {
            console.log("Zones csv error: ", a)
        }
    }), b
}

function processZonesCsv(a, b, c) {
    var d = c.store;
    dojo.forEach(b, function (a) {
        var c = d.getValue(a, "ISO"),
            e = d.getValue(a, "COUNTRY"),
            f = parseFloat(d.getValue(a, "XMIN"), 10),
            g = parseFloat(d.getValue(a, "XMAX"), 10),
            h = parseFloat(d.getValue(a, "YMIN"), 10),
            i = parseFloat(d.getValue(a, "YMAX"), 10),
            j = parseInt(d.getValue(a, "NTILES"), 10),
            k = {
                iso: c,
                country: e,
                bounds: [f, h, g, i],
                ntiles: j
            };
        zones.push(k)
    }), a.resolve(zones)
}

function loadZones() {
    getZones("./config/zones.csv").then(function () {
        createSteps()
    })
}

function changeDirection(a) {
    a.stopPropagation(), a || (a = window.event);
    var b = a.target || a.srcElement;
    if ("button" == b.type) {
        var c = b.name;
        dojo.forEach(dojo.query("#directionBtns.btn-group > button.btn"), function (a) {
            dojo.removeClass(a, "active btn-primary")
        }), b.className = "active btn btn-primary", setupGCMsbyDirection(c)
    }
}

function getRefModelGCM_Selected() {
    var a = [];
    return dojo.forEach(dojo.byId("refgcm").options, function (b) {
        b.selected && a.push(b.value)
    }), a
}

function getTargetModelGCM_Selected() {
    var a = [];
    return dojo.forEach(dojo.byId("targetgcm").options, function (b) {
        b.selected && a.push(b.value)
    }), a
}

function setupGCMsbyDirection(a) {
    switch (a) {
    case "none":
        dojo.byId("refPeriod").removeAttribute("disabled"), dojo.byId("refPeriod").selectedIndex = 0, dojo.byId("refPeriod").options[0].removeAttribute("disabled"), dojo.byId("refScenario").removeAttribute("disabled"), dojo.byId("refScenario").selectedIndex = 0, dojo.byId("refScenario").options[0].removeAttribute("disabled"), dojo.byId("refgcm").removeAttribute("disabled"), dojo.byId("refgcm").selectedIndex = 0, dojo.byId("refgcm").options[0].removeAttribute("disabled"), dojo.byId("targetPeriod").removeAttribute("disabled"), dojo.byId("targetPeriod").selectedIndex = 0, dojo.byId("targetPeriod").options[0].removeAttribute("disabled"), dojo.byId("targetScenario").removeAttribute("disabled"), dojo.byId("targetScenario").selectedIndex = 0, dojo.byId("targetScenario").options[0].removeAttribute("disabled"), dojo.byId("targetgcm").removeAttribute("disabled"), dojo.byId("targetgcm").selectedIndex = 0, dojo.byId("targetgcm").options[0].removeAttribute("disabled"), getRefModelGCM_Selected();
        var c = getTargetModelGCM_Selected();
        if (c && c.length > 1) return dojo.byId("errMsg").innerHTML = '<h4 class="alert-heading">Target GCM</h4> 	                            				<p>Please select just one Reference model or change the direction option</p>', dojo.query("#alertMsg").removeClass("alert-error"), dojo.query(".alertaError")[0].style.visibility = "visible", void 0;
        changeRefPeriod(null), changeTargetPeriod(null);
        break;
    case "backward":
        dojo.byId("refPeriod").removeAttribute("disabled"), dojo.byId("refPeriod").selectedIndex = 1, dojo.byId("refPeriod").options[0].setAttribute("disabled", "disabled"), dojo.byId("refScenario").removeAttribute("disabled"), dojo.byId("refScenario").selectedIndex = 1, dojo.byId("refScenario").options[0].setAttribute("disabled", "disabled"), dojo.byId("refScenario").options[1].removeAttribute("disabled"), dojo.byId("refScenario").options[2].removeAttribute("disabled"), dojo.byId("refScenario").options[3].removeAttribute("disabled"), dojo.byId("refgcm").removeAttribute("disabled"), dojo.byId("refgcm").selectedIndex = 1, dojo.byId("refgcm").options[0].setAttribute("disabled", "disabled"), dojo.byId("targetPeriod").selectedIndex = 0, dojo.byId("targetPeriod").setAttribute("disabled", "disabled"), dojo.byId("targetScenario").selectedIndex = 0, dojo.byId("targetScenario").setAttribute("disabled", "disabled"), dojo.byId("targetgcm").selectedIndex = 0, dojo.byId("targetgcm").setAttribute("disabled", "disabled"), changeRefScenario(null);
        break;
    case "forward":
        dojo.byId("refPeriod").setAttribute("disabled", "disabled"), dojo.byId("refPeriod").selectedIndex = 0, dojo.byId("refScenario").setAttribute("disabled", "disabled"), dojo.byId("refScenario").selectedIndex = 0, dojo.byId("refScenario").options[0].removeAttribute("disabled"), dojo.byId("refgcm").setAttribute("disabled", "disabled"), dojo.byId("refgcm").selectedIndex = 0, dojo.byId("targetPeriod").selectedIndex = 1, dojo.byId("targetPeriod").removeAttribute("disabled"), dojo.byId("targetPeriod").options[0].setAttribute("disabled", "disabled"), dojo.byId("targetScenario").selectedIndex = 1, dojo.byId("targetScenario").removeAttribute("disabled"), dojo.byId("targetScenario").options[0].setAttribute("disabled", "disabled"), dojo.byId("targetScenario").options[1].removeAttribute("disabled"), dojo.byId("targetScenario").options[2].removeAttribute("disabled"), dojo.byId("targetScenario").options[3].removeAttribute("disabled"), dojo.byId("targetgcm").selectedIndex = 1, dojo.byId("targetgcm").removeAttribute("disabled"), dojo.byId("targetgcm").options[0].setAttribute("disabled", "disabled"), changeTargetScenario(null)
    }
    updateParams()
}

function changeRefPeriod() {
    var b = dojo.byId("refPeriod").value;
    switch (b) {
    case "1960_1990":
        "none" == analoguesParams.direction && (dojo.byId("refScenario").options[0].removeAttribute("disabled"), dojo.byId("refScenario").options[1].setAttribute("disabled", "disabled"), dojo.byId("refScenario").options[2].setAttribute("disabled", "disabled"), dojo.byId("refScenario").options[3].setAttribute("disabled", "disabled"), dojo.byId("refScenario").selectedIndex = 0, dojo.byId("targetPeriod").removeAttribute("disabled"), dojo.byId("targetPeriod").selectedIndex = 0, dojo.byId("targetPeriod").options[0].removeAttribute("disabled"), dojo.byId("targetScenario").options[0].removeAttribute("disabled"), dojo.byId("targetScenario").options[1].setAttribute("disabled", "disabled"), dojo.byId("targetScenario").options[2].setAttribute("disabled", "disabled"), dojo.byId("targetScenario").options[3].setAttribute("disabled", "disabled"), dojo.byId("targetScenario").selectedIndex = 0);
        break;
    case "2020_2049":
        "none" == analoguesParams.direction && (dojo.byId("refScenario").options[0].setAttribute("disabled", "disabled"), dojo.byId("refScenario").options[1].removeAttribute("disabled"), dojo.byId("refScenario").options[2].removeAttribute("disabled"), dojo.byId("refScenario").options[3].removeAttribute("disabled"), dojo.byId("refScenario").selectedIndex = 1, dojo.byId("targetPeriod").removeAttribute("disabled"), dojo.byId("targetPeriod").selectedIndex = 1, dojo.byId("targetPeriod").options[1].removeAttribute("disabled"), dojo.byId("targetScenario").options[1].removeAttribute("disabled"), dojo.byId("targetScenario").options[2].removeAttribute("disabled"), dojo.byId("targetScenario").options[3].removeAttribute("disabled"), dojo.byId("targetScenario").options[0].setAttribute("disabled", "disabled"), dojo.byId("targetScenario").selectedIndex = 1)
    }
    changeRefScenario(null), changeTargetScenario(null)
}

function changeRefScenario() {
    var b = dojo.byId("refScenario").value,
        c = dojo.byId("refgcm").options;
    switch (b) {
    case "baseline":
        for (var d = 0; d < c.length; d++) "CURRENT" != c[d].value && c[d].setAttribute("disabled", "disabled");
        dojo.byId("refgcm").selectedIndex = 0;
        break;
    case "a1b":
        dojo.byId("refgcm").options[0].setAttribute("disabled", "disabled");
        for (var d = 0; d < c.length; d++) "CURRENT" != c[d].value && c[d].removeAttribute("disabled");
        dojo.byId("refgcm").selectedIndex = 1;
        break;
    case "a2":
        dojo.byId("refgcm").options[0].setAttribute("disabled", "disabled");
        for (var d = 0; d < c.length; d++) "CURRENT" != c[d].value && c[d].removeAttribute("disabled");
        dojo.byId("refgcm").selectedIndex = 1;
        break;
    case "b1":
        dojo.byId("refgcm").options[0].setAttribute("disabled", "disabled");
        for (var d = 0; d < c.length; d++) "CURRENT" != c[d].value && c[d].removeAttribute("disabled");
        dojo.byId("refgcm").selectedIndex = 1
    }
    updateParams()
}

function changeRefGCM() {
    var b = getRefModelGCM_Selected();
    return b && b.length > 3 ? (dojo.byId("errMsg").innerHTML = '<h4 class="alert-heading">Warning in Model: Reference GCMs</h4>                             			<p>More than 3 reference GCMs are selected, so that, It will take a long time to get results...</p>', dojo.query("#alertMsg").removeClass("alert-error"), dojo.query(".alertaError")[0].style.visibility = "visible", -1) : (dojo.query(".alertaError")[0].style.visibility = "hidden", updateParams(), 1)
}

function changeRefResolution() {
    updateParams()
}

function changeTargetPeriod() {
    var b = dojo.byId("targetPeriod").value;
    switch (b) {
    case "1960_1990":
        dojo.byId("targetScenario").options[0].removeAttribute("disabled"), dojo.byId("targetScenario").options[1].setAttribute("disabled", "disabled"), dojo.byId("targetScenario").options[2].setAttribute("disabled", "disabled"), dojo.byId("targetScenario").options[3].setAttribute("disabled", "disabled"), dojo.byId("targetScenario").selectedIndex = 0, dojo.byId("refPeriod").removeAttribute("disabled"), dojo.byId("refPeriod").selectedIndex = 0, dojo.byId("refPeriod").options[0].removeAttribute("disabled"), dojo.byId("refScenario").options[0].removeAttribute("disabled"), dojo.byId("refScenario").options[1].setAttribute("disabled", "disabled"), dojo.byId("refScenario").options[2].setAttribute("disabled", "disabled"), dojo.byId("refScenario").options[3].setAttribute("disabled", "disabled"), dojo.byId("refScenario").selectedIndex = 0;
        break;
    case "2020_2049":
        dojo.byId("targetScenario").options[0].setAttribute("disabled", "disabled"), dojo.byId("targetScenario").options[1].removeAttribute("disabled"), dojo.byId("targetScenario").options[2].removeAttribute("disabled"), dojo.byId("targetScenario").options[3].removeAttribute("disabled"), dojo.byId("targetScenario").selectedIndex = 1, dojo.byId("refPeriod").removeAttribute("disabled"), dojo.byId("refPeriod").selectedIndex = 1, dojo.byId("refPeriod").options[1].removeAttribute("disabled"), dojo.byId("refScenario").options[1].removeAttribute("disabled"), dojo.byId("refScenario").options[2].removeAttribute("disabled"), dojo.byId("refScenario").options[3].removeAttribute("disabled"), dojo.byId("refScenario").options[0].setAttribute("disabled", "disabled"), dojo.byId("refScenario").selectedIndex = 1
    }
    changeRefScenario(null), changeTargetScenario(null)
}

function changeTargetScenario() {
    var b = dojo.byId("targetScenario").value,
        c = dojo.byId("targetgcm").options;
    switch (b) {
    case "baseline":
        for (var d = 0; d < c.length; d++) "CURRENT" != c[d].value && c[d].setAttribute("disabled", "disabled");
        dojo.byId("targetgcm").selectedIndex = 0;
        break;
    case "a1b":
        dojo.byId("targetgcm").options[0].setAttribute("disabled", "disabled");
        for (var d = 0; d < c.length; d++) "CURRENT" != c[d].value && c[d].removeAttribute("disabled");
        dojo.byId("targetgcm").selectedIndex = 1;
        break;
    case "a2":
        dojo.byId("targetgcm").options[0].setAttribute("disabled", "disabled");
        for (var d = 0; d < c.length; d++) "CURRENT" != c[d].value && c[d].removeAttribute("disabled");
        dojo.byId("targetgcm").selectedIndex = 1;
        break;
    case "b1":
        dojo.byId("targetgcm").options[0].setAttribute("disabled", "disabled");
        for (var d = 0; d < c.length; d++) "CURRENT" != c[d].value && c[d].removeAttribute("disabled");
        dojo.byId("targetgcm").selectedIndex = 1
    }
    updateParams()
}

function changeTargetGCM() {
    var b = getTargetModelGCM_Selected();
    return b && b.length > 3 ? (dojo.byId("errMsg").innerHTML = '<h4 class="alert-heading">Warning in Model: Target GCMs</h4>                             			<p>More than 3 target GCMs are selected, so that, It will take a long time to get results...</p>', dojo.query("#alertMsg").removeClass("alert-error"), dojo.query(".alertaError")[0].style.visibility = "visible", -1) : (dojo.query(".alertaError")[0].style.visibility = "hidden", updateParams(), 1)
}

function changeTargetResolution() {
    updateParams()
}

function changeMethod(a) {
    a.stopPropagation(), a || (a = window.event);
    var b = a.target || a.srcElement;
    if ("button" == b.type) {
        var c = b.name;
        switch (dojo.forEach(dojo.query("#methodBtns.btn-group > button.btn"), function (a) {
            dojo.removeClass(a, "active btn-primary")
        }), b.className = "active btn btn-primary", c) {
        case "ccafs":
            break;
        case "hallegatte":
        }
        updateParams()
    }
}

function changeRotation(a) {
    a.stopPropagation(), a || (a = window.event);
    var b = a.target || a.srcElement;
    if ("button" == b.type) {
        var c = b.name;
        switch (dojo.forEach(dojo.query("#rotationBtns.btn-group > button.btn"), function (a) {
            dojo.removeClass(a, "active btn-primary")
        }), b.className = "active btn btn-primary", c) {
        case "prec":
            break;
        case "tmean":
            break;
        case "both":
            break;
        case "none":
        }
        updateParams()
    }
}

function onkeypressClimaticVars() {
    var a = !1;
    return dojo.forEach(dojo.query("#divclimaticvars input"), function (b) {
        "checkbox" != b.type && (parseFloat(b.value) < 0 || parseFloat(b.value) > 1) && (a = !0)
    }), a ? (dojo.byId("errMsg").innerHTML = '<h4 class="alert-heading">Warning in Climatic Variables: Weights</h4>                             			<p>The weights are valid values between 0.0 and 1.0</p>', dojo.query("#alertMsg").removeClass("alert-error"), dojo.query(".alertaError")[0].style.visibility = "visible", void 0) : (dojo.query(".alertaError")[0].style.visibility = "hidden", void 0)
}

function changeClimaticVars() {
    var a = 0,
        b = 0;
    if (dojo.forEach(dojo.query("#divclimaticvars input"), function (b) {
        if ("checkbox" == b.type && 1 == b.checked) {
            var c = b.id.replace("chk_", "");
            dojo.byId(c).removeAttribute("disabled");
            var d = dojo.byId(c).value;
            0 == parseFloat(d) && (dojo.byId(c).setAttribute("disabled", "disabled"), dojo.byId(c).value = "", dojo.byId(b.id).checked = !1), "tmean" !== c && "prec" !== c ? dojo.byId("rotationOpts").style.visibility = "hidden" : ("tmean" == c || "prec" == c) && (dojo.byId("rotationOpts").style.visibility = "visible"), a += parseFloat(d)
        } else if ("checkbox" == b.type && 0 == b.checked) {
            var c = b.id.replace("chk_", "");
            dojo.byId(c).setAttribute("disabled", "disabled"), dojo.byId(c).value = ""
        }
    }), dojo.forEach(dojo.query("#divclimaticvars input"), function (a) {
        "checkbox" == a.type && 1 == a.checked && b++
    }), 1 == b) {
        if (dojo.byId("chk_tmean").checked && "prec" == analoguesParams.rotation) return dojo.byId("errMsg").innerHTML = '<h4 class="alert-heading">Warning in Rotation: Precipitation</h4>                             			<p>It\'s not possible to rotate precipitation values with only temperature data.</p>', dojo.query("#alertMsg").removeClass("alert-error"), dojo.query(".alertaError")[0].style.visibility = "visible", -1;
        if (dojo.byId("chk_prec").checked && "tmean" == analoguesParams.rotation) return dojo.byId("errMsg").innerHTML = '<h4 class="alert-heading">Warning in Rotation: Mean Temperature</h4>                             			<p>It\'s not possible to rotate temperature values with only precipitation data.</p>', dojo.query("#alertMsg").removeClass("alert-error"), dojo.query(".alertaError")[0].style.visibility = "visible", -1
    }
    return 1 != a && b > 0 ? (dojo.byId("errMsg").innerHTML = '<h4 class="alert-heading">Warning in Climatic Variables: Weights</h4>                             			<p>The sum of the weights must be 1</p>', dojo.query(".alertaError")[0].style.visibility = "visible", -1) : b > 5 ? (dojo.byId("errMsg").innerHTML = '<h4 class="alert-heading">Warning in Climatic Variables:</h4>                             			<p>The number of variables selected are incorrect. You could select a maximum of five (5)</p>', dojo.query("#alertMsg").removeClass("alert-error"), dojo.query(".alertaError")[0].style.visibility = "visible", -1) : (dojo.query(".alertaError")[0].style.visibility = "hidden", updateParams(), 1)
}

function changeGrowingSeason() {
    var a = dojo.byId("growingSeason1_startDate").value,
        b = dojo.byId("growingSeason1_endDate").value,
        c = dojo.byId("growingSeason2_startDate").value,
        d = dojo.byId("growingSeason2_endDate").value;
    return 1 > a || a > 12 || 1 > b || b > 12 ? (dojo.byId("errMsg").innerHTML = '<h4 class="alert-heading">Error in Temporal Scope: Growing Season date 1</h4>                             			<p>Please check out the values for Start and End Date.</p>', dojo.query("#alertMsg").addClass("alert-error"), dojo.query(".alertaError")[0].style.visibility = "visible", -1) : "" == c && "" == d || !(1 > c || c > 12 || 1 > d || d > 12) ? (dojo.query(".alertaError")[0].style.visibility = "hidden", updateParams(), 1) : (dojo.byId("errMsg").innerHTML = '<h4 class="alert-heading">Error in Temporal Scope: Growing Season date 2</h4> 	                            			<p>Please check out the values for Start and End Date.</p>', dojo.query("#alertMsg").addClass("alert-error"), dojo.query(".alertaError")[0].style.visibility = "visible", -1)
}

function resetParams() {
    changeRefPeriod(null), changeTargetPeriod(null)
}

function updateParams() {
    var a = dojo.byId("ClimaticZone").value,
        b = dojo.byId("SearchRange").value,
        c = dojo.byId("lng").value,
        d = dojo.byId("lat").value,
        e = dojo.query("#directionBtns.btn-group > button.active")[0].name,
        f = dojo.byId("refPeriod").value,
        g = dojo.byId("targetPeriod").value,
        h = dojo.byId("refScenario").value,
        i = dojo.byId("targetScenario").value,
        j = dojo.byId("refResolution").value,
        k = dojo.byId("targetResolution").value,
        l = getRefModelGCM_Selected(),
        m = getTargetModelGCM_Selected(),
        n = dojo.query("#rotationBtns.btn-group > button.active")[0].name,
        o = dojo.byId("growingSeason1_startDate").value,
        p = dojo.byId("growingSeason1_endDate").value,
        q = dojo.byId("growingSeason2_startDate").value,
        r = dojo.byId("growingSeason2_endDate").value,
        s = parseFloat(dojo.byId("threshold").value);
    if (analoguesParams = new Parameters, analoguesParams.x = c, analoguesParams.y = d, "none" != a ? "global" != b && "global" != a ? analoguesParams.zones = [zones[a].iso, zones[b].iso] : "global" == b && "global" != a ? analoguesParams.zones = [zones[a].iso, "global"] : "global" != b && "global" == a ? analoguesParams.zones = ["global", zones[b].iso] : "global" == b && "global" == a && (analoguesParams.zones = ["global", "global"]) : analoguesParams.zones = ["global", "global"], analoguesParams.direction = e, analoguesParams.period = [f, g], analoguesParams.scenario = [h, i], analoguesParams.resolution = [j, k], analoguesParams.model = [], l)
        for (var t = 0; t < l.length; t++) analoguesParams.model.push(l[t].toLowerCase());
    if (m)
        for (var t = 0; t < m.length; t++) analoguesParams.model.push(m[t].toLowerCase());
    analoguesParams.vars = [], analoguesParams.weights = [], dojo.forEach(dojo.query("#divclimaticvars input"), function (a) {
        "checkbox" != a.type && parseFloat(a.value) > 0 && (analoguesParams.vars.push(a.id), analoguesParams.weights.push(a.value))
    }), analoguesParams.rotation = n, analoguesParams.threshold = s, analoguesParams.growingseason = "" != q ? [o + ":" + p, q + ":" + r] : [o + ":" + p]
}

function runAnalogues() {
    tiempo = new Date, dojo.byId("mapaResultado").style.display = "block", dojo.byId("mapaResultado").style.opacity = "1", dojo.byId("loading").style.display = "block", dojo.query('[data-dojo-attach-point="indicatorsNode"]')[0].style.visibility = "hidden", OpenLayers.Request.GET({
        url: wps,
        params: {
            SERVICE: "WPS",
            REQUEST: "GetCapabilities"
        },
        success: function (a) {
            if (capabilities = (new OpenLayers.Format.WPSCapabilities).read(a.responseText)) {
                var b = "analogues";
                OpenLayers.Request.GET({
                    url: wps,
                    params: {
                        SERVICE: "WPS",
                        REQUEST: "DescribeProcess",
                        VERSION: capabilities.version,
                        STATUS: !0,
                        IDENTIFIER: b
                    },
                    success: function (a) {
                        if (process = (new OpenLayers.Format.WPSDescribeProcess).read(a.responseText).processDescriptions[b]) {
                            var c = analoguesParams.zones[1];
                            tileLayerName = c.toUpperCase() + "_" + (new Date).getTime(), process.dataInputs = [{
                                identifier: "Lng",
                                data: {
                                    literalData: {
                                        value: parseFloat(analoguesParams.x)
                                    }
                                }
                            }, {
                                identifier: "Lat",
                                data: {
                                    literalData: {
                                        value: parseFloat(analoguesParams.y)
                                    }
                                }
                            }, {
                                identifier: "Method",
                                data: {
                                    literalData: {
                                        value: analoguesParams.method
                                    }
                                }
                            }, {
                                identifier: "Model",
                                data: {
                                    literalData: {
                                        value: analoguesParams.getModel()
                                    }
                                }
                            }, {
                                identifier: "Vars",
                                data: {
                                    literalData: {
                                        value: analoguesParams.getVars()
                                    }
                                }
                            }, {
                                identifier: "Weights",
                                data: {
                                    literalData: {
                                        value: analoguesParams.getWeights()
                                    }
                                }
                            }, {
                                identifier: "Ndivisions",
                                data: {
                                    literalData: {
                                        value: analoguesParams.getNdivisions()
                                    }
                                }
                            }, {
                                identifier: "Envdata",
                                data: {
                                    literalData: {
                                        value: analoguesParams.envdata
                                    }
                                }
                            }, {
                                identifier: "Ext",
                                data: {
                                    literalData: {
                                        value: analoguesParams.ext
                                    }
                                }
                            }, {
                                identifier: "Direction",
                                data: {
                                    literalData: {
                                        value: analoguesParams.direction
                                    }
                                }
                            }, {
                                identifier: "Growingseason",
                                data: {
                                    literalData: {
                                        value: analoguesParams.getGrowingseason2()
                                    }
                                }
                            }, {
                                identifier: "Rotation",
                                data: {
                                    literalData: {
                                        value: analoguesParams.rotation
                                    }
                                }
                            }, {
                                identifier: "Period",
                                data: {
                                    literalData: {
                                        value: analoguesParams.getPeriod()
                                    }
                                }
                            }, {
                                identifier: "Zones",
                                data: {
                                    literalData: {
                                        value: analoguesParams.getZones()
                                    }
                                }
                            }, {
                                identifier: "Resolution",
                                data: {
                                    literalData: {
                                        value: analoguesParams.getResolution()
                                    }
                                }
                            }, {
                                identifier: "Scenario",
                                data: {
                                    literalData: {
                                        value: analoguesParams.getScenario()
                                    }
                                }
                            }, {
                                identifier: "Outfile",
                                data: {
                                    literalData: {
                                        value: analoguesParams.outfile
                                    }
                                }
                            }, {
                                identifier: "Threshold",
                                data: {
                                    literalData: {
                                        value: parseFloat(analoguesParams.threshold)
                                    }
                                }
                            }, {
                                identifier: "TileLayerName",
                                data: {
                                    literalData: {
                                        value: tileLayerName
                                    }
                                }
                            }], process.responseForm = {
                                parameters: {
                                    identifier: "params"
                                }
                            }, OpenLayers.Request.POST({
                                url: wps,
                                async: !0,
                                data: (new OpenLayers.Format.WPSExecute).write(process),
                                success: showOutput,
                                failure: function (a) {
                                    console.log(a.responseText)
                                }
                            })
                        } else console.log("Error on describing services...")
                    }
                })
            } else console.log("Error trying to get the geoservices...")
        }
    })
}

function showOutput(a) {
    dojo.fadeOut({
        node: dojo.byId("mapaResultado"),
        duration: 1200
    }).play(), setTimeout(function () {
        dojo.byId("mapaResultado").style.display = "none", dojo.byId("loading").style.display = "none", dojo.query('[data-dojo-attach-point="indicatorsNode"]')[0].style.visibility = "visible"
    }, 1500);
    var c = ["http://a.tile.openstreetmap.org/${z}/${x}/${y}.png", "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png", "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"];
    mapRsultsLoaded || (mapResults = new OpenLayers.Map("mapResults", {
        maxExtent: new OpenLayers.Bounds(-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892),
        numZoomLevels: 22,
        maxResolution: 156543.03390625,
        units: "m",
        projection: epsg3857,
        displayProjection: epsg4326,
        controls: [new OpenLayers.Control.Attribution, new OpenLayers.Control.TouchNavigation({
            dragPanOptions: {
                enableKinetic: !0
            }
        }), new OpenLayers.Control.Zoom, new OpenLayers.Control.ScaleLine, new OpenLayers.Control.Navigation({
            zoomWheelEnabled: !1
        })],
        layers: [new OpenLayers.Layer.XYZ("OSM", c, {
            transitionEffect: "resize",
            buffer: 2,
            sphericalMercator: !0,
            attribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
        })]
    }), mapResults.layerContainerDiv.style.position = "relative", site = new OpenLayers.Layer.Markers("Sites Selected"), site.animationEnabled = !0, mapResults.addLayer(site), mapRsultsLoaded = !0), tileLayerName && addLayerResultstoMap(tileLayerName), a && addLastResultstoMapGallery(tileLayerName), mapResults.zoomToExtent(getSearchRangeExtent(), !0), cloneSiteSelected(tileLayerName), mapResults.updateSize(), dojo.byId("divProgressBar").style.display = "none", (dojo.isFF >= 3.6 || dojo.isChrome >= 6 || dojo.isSafari >= 6 || dojo.isOpera >= 11.1 || dojo.isIE >= 10) && (dojo.byId("sessionBtns").style.display = "block"), (dojo.isFF >= 10 || dojo.isChrome >= 20 || dojo.isSafari >= 5.1 || dojo.isOpera >= 12.1 || dojo.isIE >= 11) && (dojo.byId("step4showMapLargeScreenBtn").style.display = "block"), dojo.byId("step4DownloadBtn").style.display = "block", dojo.byId("mapResultsLegend").style.display = "block", dojo.byId("errMsg").innerHTML = "<p>Areas that have higher similarity values more closely resemble the specified climate at the reference site.</p>", dojo.query("#alertMsg").removeClass("alert-error"), dojo.query("#alertMsg").addClass("alert-info"), dojo.query(".alertaError")[0].style.visibility = "visible", setTimeout(function () {
        dojo.query("#alertMsg").removeClass("alert-info"), dojo.query(".alertaError")[0].style.visibility = "hidden"
    }, 15e3)
}

function addLayerResultstoMap(a) {
    a ? tileLayerName = a : a = tileLayerName, climateSimLyr = new OpenLayers.Layer.TMS(a, ["/tiles/" + a + "/"], {
        type: "png",
        getURL: getAnaloguesMap_url,
        attribution: "&copy; <a href='http://www.ciat.cgiar.org/' target='new'>CIAT</a>, <a href='http://ernestogiron.blogspot.com/' target='new'>egiron</a>",
        isBaseLayer: !1,
        transitionEffect: null,
        visibility: !0,
        opacity: .95,
        alpha: !0
    }), climateResultsLayers.push(climateSimLyr), mapResults.addLayer(climateSimLyr), mapResults.raiseLayer(climateSimLyr, -1), runAnalysis.push({
        site: a,
        params: analoguesParams
    }), addRow_Results()
}

function getAnaloguesMap_url(a) {
    var b = mapResults.getResolution(),
        c = Math.round((a.left - this.maxExtent.left) / (b * this.tileSize.w)),
        d = Math.round((this.maxExtent.top - a.top) / (b * this.tileSize.h)),
        e = mapResults.getZoom(),
        f = Math.pow(2, e);
    return 0 > d || d >= f ? OpenLayers.Util.getImagesLocation() + "404.png" : (c = (c % f + f) % f, this.url + e + "/" + c + "/" + d + "." + this.type)
}

function getAnaloguesMap2_url(a) {
    var b = mapResults.getOLMap().getResolution(),
        c = Math.round((a.left - this.maxExtent.left) / (b * this.tileSize.w)),
        d = Math.round((this.maxExtent.top - a.top) / (b * this.tileSize.h)),
        e = mapResults.getOLMap().getZoom(),
        f = Math.pow(2, e);
    return 0 > d || d >= f ? OpenLayers.Util.getImagesLocation() + "404.png" : (c = (c % f + f) % f, this.url + e + "/" + c + "/" + d + "." + this.type)
}

function initTooltips() {
    var a = "<p>The reference site is the location for which you want to find analogue climates. <br/> 						The reference site may be located within any land area (except for Antarctica)</p>";
    new Popover({
        trigger: "hover",
        placement: "right",
        content: a,
        title: "<strong>Reference site</strong>"
    }, dojo.byId("zoneshelp"));
    var c = "<p>The search range is the area within which you will look for analogue climates.<br/> 							Narrowing the search range to a specific country reduces calculation time, facilitating the use of higher resolution data.</p>";
    new Popover({
        trigger: "hover",
        placement: "right",
        content: c,
        title: "<strong>Search range</strong>"
    }, dojo.byId("searchrangehelp"));
    var e = "<p>Save time by loading parameters from a previous run. Parameters may be saved at step 4.</p>";
    new Popover({
        trigger: "hover",
        placement: "right",
        content: e,
        title: "<strong>Load parameters file</strong>"
    }, dojo.byId("loadparamshelp"));
    var g = "<p>Latitude or coordinate Y of the reference site. Values between -60 and 90. Can be decimal, but ensure the combination x,y falls within land areas. </p> 				   <p>This can be done either by clicking on the location on the map, or by manually entering the latitude in the box.</p>";
    new Popover({
        trigger: "hover",
        placement: "right",
        content: g,
        title: "<strong>Latitude or coordinate Y</strong>"
    }, dojo.byId("lathelp"));
    var i = "<p>Longitude or coordinate X of the reference site. Values between -180 and 180. Can be decimal, but ensure the combination x,y falls in land areas. </p>				   <p>This can be done either by clicking on the location on the map, or by manually entering the longitude in the box.</p>";
    new Popover({
        trigger: "hover",
        placement: "right",
        content: i,
        title: "<strong>Longitude or coordinate X</strong>"
    }, dojo.byId("lnghelp"));
    var k = "<ul><li>Click over the map to get x,y coordinates</li> 							<li>Drag to pan</li> 							<li>SHIFT + Click to zoom in</li> 							<li>SHIFT + Drag to zoom in</li> 							<li>Mouse Scroll Forward to zoom in</li> 							<li>Mouse Scroll Backward to zoom out</li> 						</ul>";
    new Popover({
        trigger: "hover",
        placement: "left",
        content: k,
        title: "<strong>Map navigation using mouse</strong>"
    }, dojo.byId("maphelp"));
    var m = "<p>The three possible directions to run the analogue tool are:</p> 						<p><b>Backward</b> analysis (future to present): where can I find sites whose current climate is similar to the future modeled climate of my reference site?</p> 						<p><b>Forward</b> analysis (present to future): where will I find my current climate in modeled future climates?</p> 						<p><b>None</b> (same time period): where can I find sites that have a similar climate to my reference site concurrently? This may be now or in the future.</p>";
    new Popover({
        trigger: "hover",
        placement: "right",
        content: m,
        title: "<strong>Direction</strong>"
    }, dojo.byId("directionhelp"));
    var o = "<p>There are two types of climate data in our files: 1960-1990 baseline data (referred to as \u2018current\u2019) and future climates (the product of a SRES emission scenario, a future time period and a GCM).</p>";
    new Popover({
        trigger: "hover",
        placement: "right",
        content: o,
        title: "<strong>Global Climate Models (GCMs)</strong>"
    }, dojo.byId("gcmshelp"));
    var q = "<p>The time period over which current and future climates are calculated. <br/><br/> 					 <i>NOTE: At the moment, the time period for climate projections is the decade 2030s (i.e. the years 2020-2049).</i></p>";
    new Popover({
        trigger: "hover",
        placement: "right",
        content: q,
        title: "<strong>Period</strong>"
    }, dojo.byId("periodhelp"));
    var s = "<p>The list of scenario families described by the Special Report on Emission Scenarios (SRES) to 						predict the effects of globalization vs. regionalization, and an economic vs. environmental development focus on future global greenhouse gas emissions.</p>";
    new Popover({
        trigger: "hover",
        placement: "right",
        content: s,
        title: "<strong>Scenario</strong>"
    }, dojo.byId("scenariohelp"));
    var u = "<p>The list of Global Climate Models (GCMs) for which data is available. You can choose specific GCMs (a maximum of 3 at a time) or an ensemble which utilizes the mean of all available GCMs for that emissions scenario.</p>";
    new Popover({
        trigger: "hover",
        placement: "right",
        content: u,
        title: "<strong>Model</strong>"
    }, dojo.byId("modelhelp"));
    var w = "<p>Spatial resolution available for the dataset. 30 arc-minutes is approximately 56 km at the equator while 30 arc-seconds is approximately 1 km.</p>";
    new Popover({
        trigger: "hover",
        placement: "right",
        content: w,
        title: "<strong>Resolution</strong>"
    }, dojo.byId("resolutionhelp"));
    var y = "<p></p>";
    new Popover({
        trigger: "hover",
        placement: "right",
        content: y,
        title: "<strong>Similarity Index</strong>"
    }, dojo.byId("similarityIndexhelp"));
    var A = "<p>This option is only available for monthly mean temperature (tmean) and precipitation (prec). The rotation accounts for seasonality allowing you to identify sites that experience similar climates at different times of the year e.g. correcting for the occurrence of summer in the Northern vs. Southern Hemisphere.</p>";
    new Popover({
        trigger: "hover",
        placement: "top",
        content: A,
        title: "<strong>Rotation</strong>"
    }, dojo.byId("rotationhelp"));
    var C = "<p>You can select between two types of variables for the analysis:</p> 							<p>1) <b>Climatic variables</b>:<br/>- monthly mean temperature<br/> 							- monthly precipitation<br/>- both of the above variables</p> 							2) <b>Bioclimatic variables</b>: Nineteen variables that describe the averages, the extremes and the seasonality of climatic variables.							<br/><br/>Up to three may be chosen simultaneously.";
    new Popover({
        trigger: "hover",
        placement: "right",
        content: C,
        title: "<strong>Climatic and bioclimatic variables</strong>"
    }, dojo.byId("climaticvarshelp"));
    var E = "<p>Variables may be weighted depending on the importance you want to give them in the analysis. 						A weighting of 0.5 means that the selected variable will account for 50% of the overall similarity statistic across 						the search range. 0.1 = 10%, 0.2 = 20%, etc.<br/><br/>						The sum of all weights must equal 1.</p>";
    new Popover({
        trigger: "hover",
        placement: "right",
        content: E,
        title: "<strong>Weights</strong>"
    }, dojo.byId("weightshelp"));
    var G = "<p>The time frame over which the analysis is run may be modified to represent a specific growing season of interest. 							Up to two different growing seasons may be selected. Only the selected months will be analyzed when calculating the similarity statistic.</p>";
    new Popover({
        trigger: "hover",
        placement: "top",
        content: G,
        title: "<strong>Crop growing season</strong>"
    }, dojo.byId("growingseasonhelp"));
    var I = "<p>The threshold value allows you to restrict the results of the analysis to only the most similar sites 						e.g. a threshold of 0.60 will result in only those sites with a similarity greater than 0.60 being displayed.</p>";
    new Popover({
        trigger: "hover",
        placement: "top",
        content: I,
        title: "<strong>Threshold</strong>"
    }, dojo.byId("thresholdhelp"))
}

function initTooltipLayerResult(a) {
    new Tooltip({
        trigger: "hover",
        placement: "top",
        title: "Turn Off/On layer"
    }, dojo.byId("lyrOnOff_" + a)), new Tooltip({
        trigger: "hover",
        placement: "top",
        title: "Layer Name"
    }, dojo.byId("lyrName_" + a)), new Tooltip({
        trigger: "hover",
        placement: "top",
        title: "Zoom to Layer"
    }, dojo.byId("lyrZoomIn_" + a)), new Tooltip({
        trigger: "hover",
        placement: "top",
        title: "Parameters used"
    }, dojo.byId("lyrInfo_" + a)), new Tooltip({
        trigger: "hover",
        placement: "top",
        title: "Code to use in R"
    }, dojo.byId("lyrRcode_" + a)), new Tooltip({
        trigger: "hover",
        placement: "top",
        title: "Save these parameters to disk"
    }, dojo.byId("lyrSaveParams_" + a)), new Tooltip({
        trigger: "hover",
        placement: "top",
        title: "Download the map results in GeoTiff format"
    }, dojo.byId("lyrDownload_" + a)), new Tooltip({
        trigger: "hover",
        placement: "top",
        title: "Remove this result"
    }, dojo.byId("lyrDelete_" + a))
}

function addRow_Results() {
    tabla = dojo.byId("tablelyrResults"), tr = tabla && tabla.rows.length > 0 ? tabla.insertRow(tabla.rows.length) : tabla.insertRow(0), tr.setAttribute("align", "left"), tr.id = "tr_" + tileLayerName, td = tr.insertCell(tr.cells.length), td.className = "unselectable", td.innerHTML = '<span data-toggle="tooltip" id="lyrOnOff_' + tileLayerName + '" class="icon-eye-open icono" onClick="toggleLayerOnOff(\'' + tileLayerName + "');\"></span>", td = tr.insertCell(tr.cells.length), td.style = "width:100px;", td.innerHTML = '<div rel="tooltip" id="lyrName_' + tileLayerName + '" class="lryName">' + tileLayerName + "</div>", td = tr.insertCell(tr.cells.length), td.innerHTML = '<span rel="tooltip" id="lyrZoomIn_' + tileLayerName + '" class="icon-zoom-in icono" onClick="zoomToLayer(\'' + tileLayerName + "');\">", td = tr.insertCell(tr.cells.length), td.style = "width:80px;", td.innerHTML = '<div id="lyrOpacity_' + tileLayerName + '"></div>';
    var a = tileLayerName.trim();
    new dijit.form.HorizontalSlider({
        name: "slider_" + tileLayerName,
        value: 75,
        minimum: 0,
        maximum: 100,
        intermediateChanges: !0,
        showButtons: !1,
        style: "width:60px;",
        onChange: function (b) {
            changeTransparency(b / 100, a)
        }
    }, "lyrOpacity_" + tileLayerName), td = tr.insertCell(tr.cells.length), td.innerHTML = '<span rel="tooltip" id="lyrInfo_' + tileLayerName + '" class="icon-info-sign icono" onClick="showMoreInfo(\'' + tileLayerName + "');\"></span>", td = tr.insertCell(tr.cells.length), td.innerHTML = '<span rel="tooltip" id="lyrRcode_' + tileLayerName + '" class="icon-comment icono" onClick="toRCode(\'' + tileLayerName + "');\"></span>", (dojo.isFF >= 3.6 || dojo.isChrome >= 6 || dojo.isSafari >= 6 || dojo.isOpera >= 11.1 || dojo.isIE >= 10) && (td = tr.insertCell(tr.cells.length), td.innerHTML = '<span rel="tooltip" id="lyrSaveParams_' + tileLayerName + '" class="icon-download-alt icono" onClick="savelyrParams(\'' + tileLayerName + "');\"></span>"), td = tr.insertCell(tr.cells.length), td.innerHTML = '<a rel="tooltip" id="lyrDownload_' + tileLayerName + '" class="icon-download icono" href="' + serverResults + a + "/" + a + '.zip"></a>';
    var c = document.getElementById("lyrDownload_" + tileLayerName);
    addListener(c, "click", function (a) {
        ga("send", "event", "downloadMapResults", "click", tileLayerName), console.log(c), console.log(a.target.getAttribute("id"))
    }), td = tr.insertCell(tr.cells.length), td.innerHTML = '<span rel="tooltip" id="lyrDelete_' + tileLayerName + '" class="icon-trash icono" onClick="deleteLayerResult(\'' + tileLayerName + "');\"></span>", dojo.byId("step4DownloadBtn").setAttribute("href", serverResults + a + "/" + a + ".zip"), initTooltipLayerResult(tileLayerName)
}

function addListener(a, b, c) {
    a.addEventListener ? a.addEventListener(b, c) : a.attachEvent && a.attachEvent("on" + b, c)
}

function getExtentbyCountry(a) {
    for (var b = 0; b < zones.length; b++) {
        if (zones[b].iso == a.toLowerCase()) {
            var c = new OpenLayers.Geometry.Point(parseFloat(zones[b].bounds[0]), parseFloat(zones[b].bounds[1])),
                d = new OpenLayers.Geometry.Point(parseFloat(zones[b].bounds[2]), parseFloat(zones[b].bounds[3]));
            c.transform(epsg4326, epsg900913), d.transform(epsg4326, epsg900913);
            var e = new OpenLayers.Bounds(c.x, c.y, d.x, d.y);
            return e
        }
        if ("global" == a.toLowerCase()) return initialExtent
    }
}

function zoomToLayer(a) {
    if (mapResults) {
        var b = mapResults.getLayersByName(a)[0];
        if (null != b) {
            var c = getExtentbyCountry(a.split("_", 1).toString());
            mapResults.zoomToExtent(c, !1)
        }
    }
}

function toggleLayerOnOff(a) {
    if (mapResults) {
        var b = mapResults.getLayersByName(a)[0];
        null != b && (b.getVisibility() ? (b.setVisibility(!1), dojo.removeClass(dojo.byId("lyrOnOff_" + a), "icon-eye-open"), dojo.addClass(dojo.byId("lyrOnOff_" + a), "icon-eye-close")) : (b.setVisibility(!0), dojo.removeClass(dojo.byId("lyrOnOff_" + a), "icon-eye-close"), dojo.addClass(dojo.byId("lyrOnOff_" + a), "icon-eye-open")))
    }
}

function changeTransparency(a, b) {
    if (mapResults) {
        var c = mapResults.getLayersByName(b)[0];
        null != c && c.setOpacity(a)
    }
}

function deleteLayerResult(a) {
    if (mapResults) {
        var b = mapResults.getLayersByName(a)[0];
        if (null != b && (dijit.byId("lyrOpacity_" + a).destroy(), dojo.destroy(dojo.byId("tr_" + a)), mapResults.removeLayer(b), runAnalysis = dojo.filter(runAnalysis, function (b) {
            return b.site !== a
        }), dojo.forEach(dojo.query(".tooltip"), function (a) {
            dojo.destroy(a)
        }), site && site.markers.length > 0))
            for (var c = 0; c < site.markers.length; c++) site.markers[c].id == a && site.removeMarker(site.markers[c])
    }
}

function toRCode(a) {
    var b = "";
    if (runAnalysis)
        for (var c = 0; c < runAnalysis.length; c++) runAnalysis[c].site === a && (b = runAnalysis[c].params.toRCode());
    var d = new Modal({
        content: b,
        backdrop: !0,
        showOnStart: !0,
        header: "<h4>R Code</h4>",
        footer: '<span style="position:relative;float:left;"><a class="btn btn-primary" href="http://code.google.com/p/ccafs-analogues/" target="new">Go to R Analogues site</a></span><span style="position:relative;float:right;"><a class="btn btn-primary" href="' + serverResults + a + "/Analogues_" + a + '.R" download="Analogues_' + a + '.R" type="application/octet-stream" target="new">Download R file</a></span>'
    });
    d.startup()
}

function showMoreInfo(a) {
    var b = null;
    if (runAnalysis)
        for (var c = 0; c < runAnalysis.length; c++) runAnalysis[c].site === a && (b = runAnalysis[c].params);
    if (b) {
        var d = '<table class="table table-striped"><tbody><tr><td style="width:170px;"><b>Method </b>:</td><td>' + b.method.toUpperCase() + "</td></tr>" + "<tr><td><b>Site Location (dd) </b>:</td><td><b>Lat </b>:" + parseFloat(b.y).toFixed(3) + ", <b>Lng </b>:" + parseFloat(b.x).toFixed(3) + "</td></tr>" + "<tr><td><b>Climatic data zones </b>:</td><td>" + b.zones[0].toUpperCase() + "</td></tr>" + "<tr><td><b>Scenarios </b>:</td><td>" + b.scenario[0].toUpperCase() + " , " + b.scenario[1].toUpperCase() + "</td></tr>" + "<tr><td><b>Resolution </b>:</td><td>" + b.resolution[0].toString().replace(/\,/g, " , ") + "</td></tr>" + "<tr><td><b>Models </b>:</td><td>" + b.model.toString().toUpperCase().replace(/\,/g, " , ") + "</td></tr>" + "<tr><td><b>Period </b>:</td><td>" + b.period.toString().toUpperCase().replace(/\,/g, " , ") + "</td></tr>" + "<tr><td><b>Variables </b>:</td><td>" + b.vars.toString().toUpperCase().replace(/\,/g, " , ") + "</td></tr>" + "<tr><td><b>Weights </b>:</td><td>" + b.weights.toString().replace(/\,/g, " , ") + "</td></tr>";
        "tmean" === b.rotation && (d += "<tr><td><b>Rotation </b>:</td><td>" + b.rotation.replace("tmean", "MEAN TEMPERATURE").toUpperCase() + "</td></tr>"), "prec" == b.rotation && (d += "<tr><td><b>Rotation </b>:</td><td>" + b.rotation.replace("prec", "PRECIPITATION").toUpperCase() + "</td></tr>"), d += "<tr><td><b>Number of time steps</b>:</td><td>12</td></tr><tr><td><b>Direction </b>:</td><td>" + b.direction.toUpperCase() + "</td></tr>" + "<tr><td><b>Crop Growing Season </b>:</td><td>" + b.getGrowingseason2() + "</td></tr>" + "<tr><td><b>Threshold </b>:</td><td>" + (100 - 100 * parseFloat(b.threshold)) + " %</td></tr></tbody></table>";
        var e = new Modal({
            content: d,
            backdrop: !0,
            showOnStart: !0,
            header: "<h4>Parameters used</h4>"
        });
        e.startup()
    }
}

function viewLargerMap() {
    fullscreen(dojo.byId("mapResults")), setTimeout(function () {
        addMapComponentsFullScreen()
    }, 500)
}

function fullscreen(a) {
    a.onwebkitfullscreenchange = onFullScreenEnter, a.onmozfullscreenchange = onFullScreenEnter, a.onfullscreenchange = onFullScreenEnter, document.onmozfullscreenchange = onFullScreenEnter, a.webkitRequestFullScreen ? a.webkitRequestFullScreen() : a.mozRequestFullScreen ? a.mozRequestFullScreen() : a.requestFullscreen()
}

function onFullScreenEnter() {
    e = dojo.byId("mapResults"), e.onwebkitfullscreenchange = onFullScreenExit, e.onmozfullscreenchange = onFullScreenExit, document.onmozfullscreenchange = onFullScreenExit, e.onfullscreenchange = onFullScreenExit
}

function onFullScreenExit() {
    logoCCAFSfullScreen && (dojo.byId("logoCCAFSfullScreen").style.display = "none"), mapResults && (mapResultmousePosition && (dojo.byId("mapResultsMouseposition").style.display = "none", mapResults.removeControl(mapResultmousePosition), mapResultmousePosition.destroy(), mapResultmousePosition = null), mapResultgraticule && (mapResults.removeControl(mapResultgraticule), mapResultgraticule.destroy(), mapResultgraticule = null), mapResultlayerSwitcher && (mapResults.removeControl(mapResultlayerSwitcher), mapResultlayerSwitcher.destroy(), mapResultlayerSwitcher = null)), updateMapSize()
}

function addMapComponentsFullScreen() {
    if (mapResults) {
        mapResultlayerSwitcher || (mapResultlayerSwitcher = new OpenLayers.Control.LayerSwitcher({
            ascending: !1,
            roundedCorner: !1
        })), mapResults.addControl(mapResultlayerSwitcher), mapResultmousePosition || (mapResultmousePosition = new OpenLayers.Control.MousePosition({
            displayProjection: epsg4326,
            div: dojo.byId("mapResultsMouseposition")
        })), mapResults.addControl(mapResultmousePosition), dojo.byId("mapResultsMouseposition").style.display = "block", mapResultgraticule || (mapResultgraticule = new OpenLayers.Control.Graticule({
            displayInLayerSwitcher: !0
        })), mapResults.addControl(mapResultgraticule), ghyb_lyr || (ghyb_lyr = new OpenLayers.Layer.Google("Google Hybrid", {
            type: google.maps.MapTypeId.HYBRID,
            sphericalMercator: !0,
            numZoomLevels: 22,
            visibility: !1,
            isBaseLayer: !0,
            transitionEffect: "resize"
        })), gphy_lyr || (gphy_lyr = new OpenLayers.Layer.Google("Google Physical", {
            type: google.maps.MapTypeId.TERRAIN,
            sphericalMercator: !0,
            visibility: !1,
            transitionEffect: "resize"
        })), gmap_lyr || (gmap_lyr = new OpenLayers.Layer.Google("Google Streets", {
            type: google.maps.MapTypeId.ROADMAP,
            numZoomLevels: 20,
            sphericalMercator: !0,
            visibility: !1,
            transitionEffect: "resize"
        })), esritopo_lyr || (esritopo_lyr = new OpenLayers.Layer.XYZ("ESRI Topo", "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}", {
            sphericalMercator: !0,
            visibility: !1,
            transitionEffect: "resize",
            attribution: "&copy;<a href='http://www.esri.com/software/arcgis/arcgis-online-map-and-geoservices/map-services' target='new'>2013 ESRI</a>, DeLorme, NAVTEQ"
        })), esristreet_lyr || (esristreet_lyr = new OpenLayers.Layer.XYZ("ESRI World Street Map", "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}", {
            sphericalMercator: !0,
            visibility: !1,
            transitionEffect: "resize",
            attribution: "&copy;<a href='http://www.esri.com/software/arcgis/arcgis-online-map-and-geoservices/map-services' target='new'>2013 ESRI</a>, DeLorme, NAVTEQ, USGS, Intermap..."
        })), esrigray_lyr || (esrigray_lyr = new OpenLayers.Layer.XYZ("ESRI Light Gray", "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${z}/${y}/${x}", {
            sphericalMercator: !0,
            visibility: !1,
            transitionEffect: "resize",
            attribution: "&copy;<a href='http://www.esri.com/software/arcgis/arcgis-online-map-and-geoservices/map-services' target='new'>2013 ESRI</a>, DeLorme, NAVTEQ"
        })), esriterrain_lyr || (esriterrain_lyr = new OpenLayers.Layer.XYZ("ESRI Terrain", "http://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/${z}/${y}/${x}", {
            sphericalMercator: !0,
            visibility: !1,
            transitionEffect: "resize",
            attribution: "&copy;<a href='http://www.esri.com/software/arcgis/arcgis-online-map-and-geoservices/map-services' target='new'>2013 ESRI</a>, USGS, NOAA"
        })), mapResults.addLayers([gmap_lyr, ghyb_lyr, gphy_lyr, esriterrain_lyr, esristreet_lyr, esritopo_lyr, esrigray_lyr]);
        for (var a = mapResults.layers.length - 1; a >= 0; --a) mapResults.layers[a].animationEnabled = !0;
        logoCCAFSfullScreen ? dojo.byId("logoCCAFSfullScreen").style.display = "block" : (logoCCAFSfullScreen = dojo.create("div"), logoCCAFSfullScreen.id = "logoCCAFSfullScreen", logoCCAFSfullScreen.className = "LogoCCAFSfullScreen", dojo.byId("mapResults").appendChild(logoCCAFSfullScreen))
    }
}

function saveSession() {
    var a = (new Date).getTime(),
        b = '{ "session":"' + a + '","data":[',
        c = null;
    if (runAnalysis) {
        for (var d = "", e = 0; e < runAnalysis.length; e++)
            if (c = runAnalysis[e]) {
                var f = c.params;
                d += '{"site":"' + c.site + '",' + '"zones":"' + f.zones + '",' + '"x":' + f.x + "," + '"y":' + f.y + "," + '"direction":"' + f.direction + '",' + '"period":"' + f.period + '",' + '"scenario":"' + f.scenario + '",' + '"model":"' + f.model + '",' + '"resolution":"' + f.resolution + '",' + '"vars":"' + f.vars + '",' + '"weights":"' + f.weights + '",' + '"rotation":"' + f.rotation + '",' + '"growingseason":"' + f.growingseason + '",' + '"threshold":' + f.threshold + "},"
            }
        b += d.substr(0, d.length - 1)
    }
    b += "]}";
    var g = new Blob([b], {
        type: "text/plain"
    }),
        h = "Analogues_Session_" + a + ".ccafs",
        i = document.createElement("a");
    if (i.href = dojo.isChrome ? window.webkitURL.createObjectURL(g) : window.URL.createObjectURL(g), i.download = h, dojo.isFF) {
        var j = document.createEvent("MouseEvent");
        for (j.initMouseEvent("click", !0, !0, window, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, null), i.dispatchEvent(j); i;) "A" == i.tagName && "" != i.href ? ("_blank" == i.target ? window.open(i.href, i.target) : document.location = i.href, i = null) : i = i.parentElement
    } else i.click()
}

function loadandDisplaysessionResults(a) {
    mapRsultsLoaded || showOutput(), dojo.forEach(a.data, function (a) {
        if (!isMapResultLoaded(a.site)) {
            if (analoguesParams = new Parameters({
                x: a.x.toString(),
                y: a.y.toString(),
                zones: a.zones.split(","),
                direction: a.direction,
                period: a.period.split(","),
                scenario: a.scenario.split(","),
                model: a.model.split(","),
                resolution: a.resolution.split(","),
                vars: a.vars.split(","),
                weights: a.weights.split(","),
                rotation: a.rotation,
                growingseason: a.growingseason.split(","),
                threshold: a.threshold
            }), site) {
                var c = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(parseFloat(a.x), parseFloat(a.y)));
                if (c.geometry.transform(epsg4326, epsg900913), site) {
                    var d = new OpenLayers.Size(20, 20),
                        e = 0,
                        f = new OpenLayers.Icon("imgs/target.png", d, e),
                        g = new OpenLayers.Marker(new OpenLayers.LonLat(c.geometry.x, c.geometry.y), f);
                    g.id = a.site, g.events.register("mousedown", g, function (a) {
                        alert(this.id), OpenLayers.Event.stop(a)
                    }), site.addMarker(g)
                }
            }
            addLayerResultstoMap(a.site)
        }
    }), (dojo.isFF >= 3.6 || dojo.isChrome >= 6 || dojo.isSafari >= 6 || dojo.isOpera >= 11.1 || dojo.isIE >= 10) && (dojo.byId("saveSessionBtn").style.visibility = dojo.byId("tablelyrResults").rows.length <= 0 ? "hidden" : "visible")
}

function loadSession() {
    var a = document.getElementById("fileToLoad").files[0];
    if (window.FileReader) {
        var b = new FileReader;
        b.onload = function (a) {
            var b = a.target.result,
                c = JSON.parse(b);
            c && loadandDisplaysessionResults(c)
        }, b.readAsText(a, "UTF-8")
    }
}

function handleDragOver(a) {
    a.stopPropagation(), a.preventDefault(), a.dataTransfer.dropEffect = "copy"
}

function handleFileSelect(a) {
    a.stopPropagation(), a.preventDefault();
    var b = a.dataTransfer.files,
        c = b[0];
    if (window.FileReader) {
        var d = new FileReader;
        d.onload = function (a) {
            var b = a.target.result,
                c = JSON.parse(b);
            c && loadandDisplaysessionResults(c)
        }, d.readAsText(c, "UTF-8")
    }
}

function loadSavedParams() {
    var a = document.getElementById("paramsfileToLoad").files[0];
    if (window.FileReader) {
        var b = new FileReader;
        b.onload = function (a) {
            var b = a.target.result,
                c = JSON.parse(b),
                d = c.zones;
            if ("global" == d || "africa" == d || "asia" == d || "australia" == d || "europe" == d || "latinamerica" == d || "northamerica" == d || "russia" == d) dojo.query("#ClimaticZone").attr("value", d);
            else {
                var e = -1;
                if (zones) {
                    for (var f = 0; f < zones.length; f++) zones[f].country === d && (e = f); - 1 == e && dojo.query("#ClimaticZone").attr("value", "global")
                }
                dojo.query("#ClimaticZone").attr("value", e), zoomtoZone(e)
            }
            dojo.byId("lng").value = c.x, dojo.byId("lat").value = c.y, addSiteSelected();
            var g = dojo.query("#directionBtns.btn-group > button.active")[0].name;
            g != c.direction && dojo.forEach(dojo.query("#directionBtns.btn-group > button.btn"), function (a) {
                a.name === c.direction ? dojo.addClass(a, "active btn-primary") : dojo.removeClass(a, "active btn-primary")
            }), setupGCMsbyDirection(c.direction), dojo.query("#refPeriod").attr("value", c.period.split(",")[0]), dojo.query("#targetPeriod").attr("value", c.period.split(",")[1]), dojo.query("#refScenario").attr("value", c.scenario.split(",")[0]), dojo.query("#targetScenario").attr("value", c.scenario.split(",")[1]), dojo.query("#refResolution").attr("value", c.resolution.split(",")[0]), dojo.query("#targetResolution").attr("value", c.resolution.split(",")[1]);
            var h = c.vars.split(","),
                i = c.weights.split(",");
            if (h && h.length > 0)
                for (var f = 0; f < h.length; f++) dojo.query("#divclimaticvars input#" + h[f]).attr("value", i[f]), dojo.byId("chk_" + h[f]).checked = !0;
            changeClimaticVars();
            var j = dojo.query("#rotationBtns.btn-group > button.active")[0].name;
            j != c.rotation && dojo.forEach(dojo.query("#rotationBtns.btn-group > button.btn"), function (a) {
                a.name === c.rotation ? dojo.addClass(a, "active btn-primary") : dojo.removeClass(a, "active btn-primary")
            });
            var k = c.growingseason.split(",");
            if (2 == k.length) {
                var l = k[0].split(":"),
                    m = k[1].split(":");
                dojo.byId("growingSeason1_startDate").value = l[0], dojo.byId("growingSeason1_endDate").value = l[1], dojo.byId("growingSeason2_startDate").value = m[0], dojo.byId("growingSeason2_endDate").value = m[1]
            } else if (1 == k.length) {
                var l = k[0].split(":");
                dojo.byId("growingSeason1_startDate").value = l[0], dojo.byId("growingSeason1_endDate").value = l[1], dojo.byId("growingSeason2_startDate").value = "", dojo.byId("growingSeason2_endDate").value = ""
            } else dojo.byId("growingSeason1_startDate").value = 1, dojo.byId("growingSeason1_endDate").value = 12, dojo.byId("growingSeason2_startDate").value = "", dojo.byId("growingSeason2_endDate").value = "";
            changeGrowingSeason(), dojo.byId("threshold").value = c.threshold
        }, b.readAsText(a, "UTF-8")
    }
}

function savelyrParams(a) {
    var b = null;
    if (runAnalysis)
        for (var c = 0; c < runAnalysis.length; c++) runAnalysis[c].site === a && (b = runAnalysis[c]);
    if (b) {
        var d = b.params,
            e = '{"site":"' + b.site + '",' + '"zones":"' + d.zones[0] + '",' + '"x":' + d.x + "," + '"y":' + d.y + "," + '"direction":"' + d.direction + '",' + '"period":"' + d.period + '",' + '"scenario":"' + d.scenario + '",' + '"model":"' + d.model + '",' + '"resolution":"' + d.resolution + '",' + '"vars":"' + d.vars + '",' + '"weights":"' + d.weights + '",' + '"rotation":"' + d.rotation + '",' + '"growingseason":"' + d.growingseason + '",' + '"threshold":' + d.threshold + "}",
            f = new Blob([e], {
                type: "text/plain"
            }),
            g = a + "_parmans.json",
            h = document.createElement("a");
        if (h.href = dojo.isChrome ? window.webkitURL.createObjectURL(f) : window.URL.createObjectURL(f), h.download = g, dojo.isFF) {
            var i = document.createEvent("MouseEvent");
            for (i.initMouseEvent("click", !0, !0, window, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, null), h.dispatchEvent(i); h;) "A" == h.tagName && "" != h.href ? ("_blank" == h.target ? window.open(h.href, h.target) : document.location = h.href, h = null) : h = h.parentElement
        } else h.click()
    }
}

function getAnaloguesHistoryRuns(a) {
    var b = new dojo.Deferred,
        c = new dojox.data.CsvStore({
            url: a,
            separator: "|"
        });
    return c.fetch({
        onComplete: dojo.partial(processAnaloguesHistoryRunsCsv, b),
        onError: function (a) {
            console.log("AnaloguesHistoryRuns csv error: ", a)
        }
    }), b
}

function processAnaloguesHistoryRunsCsv(a, b, c) {
    var d = c.store,
        e = [];
    dojo.forEach(b, function (a) {
        var c = d.getValue(a, "SITENAME"),
            f = parseFloat(d.getValue(a, "LNG"), 10),
            g = parseFloat(d.getValue(a, "LAT"), 10),
            h = d.getValue(a, "METHOD"),
            i = d.getValue(a, "MODEL").replace("[", "").replace("]", "").split(","),
            j = d.getValue(a, "VARS").replace("[", "").replace("]", "").split(","),
            k = d.getValue(a, "WEIGHTS").replace("[", "").replace("]", "").split(","),
            l = d.getValue(a, "NDIVISIONS").replace("[", "").replace("]", "").split(","),
            m = d.getValue(a, "DIRECTION"),
            n = d.getValue(a, "GROWINGSEASON"),
            o = d.getValue(a, "ROTATION"),
            p = d.getValue(a, "PERIOD").replace("[", "").replace("]", "").split(","),
            q = d.getValue(a, "ZONES").replace("[", "").replace("]", "").split(","),
            r = d.getValue(a, "RESOLUTION").replace("[", "").replace("]", "").split(","),
            s = d.getValue(a, "SCENARIO").replace("[", "").replace("]", "").split(","),
            t = d.getValue(a, "OUTFILE"),
            u = parseFloat(d.getValue(a, "THRESHOLD"), 10),
            v = {
                site: c,
                x: f,
                y: g,
                method: h,
                model: i,
                vars: j,
                weights: k,
                ndivisions: l,
                direction: m,
                growingseason: n,
                rotation: o,
                period: p,
                zones: q,
                resolution: r,
                scenario: s,
                outfile: t,
                threshold: u,
                thumbnail: serverResults + c + "/" + c + ".png"
            };
        e.push(v)
    }), a.resolve(e)
}

function showLastResultsSites() {
    getAnaloguesHistoryRuns("./config/AnaloguesHistoryRuns.csv").then(function (a) {
        a.sort(), a.reverse(), analoguesHistoryRuns = a, setupPager();
        for (var b = dojo.byId("lastvisitedSites"), c = 0; 5 > c; c++) new mapgallery(a[c]).placeAt(b);
        showresults = !1
    })
}

function addLastResultstoMapGallery(a) {
    var b = {
        site: a,
        x: analoguesParams.x,
        y: analoguesParams.y,
        method: analoguesParams.method,
        model: analoguesParams.model,
        vars: analoguesParams.vars,
        weights: analoguesParams.weights,
        ndivisions: analoguesParams.ndivisions,
        direction: analoguesParams.direction,
        growingseason: analoguesParams.growingseason,
        rotation: analoguesParams.rotation,
        period: analoguesParams.period,
        zones: analoguesParams.zones,
        resolution: analoguesParams.resolution,
        scenario: analoguesParams.scenario,
        outfile: analoguesParams.outfile,
        threshold: analoguesParams.threshold,
        thumbnail: serverResults + a + "/" + a + ".png"
    };
    analoguesHistoryRuns && analoguesHistoryRuns.unshift(b);
    var c = dojo.byId("analoguespager");
    if (c) {
        var d = dojo.query("li:.active", c);
        d && "1" == d.textContent ? new mapgallery(b).placeAt(dojo.byId("lastvisitedSites"), "first") : (setupPager(), updateLastResultContainer(1))
    }
}

function setupPager(a, b) {
    a || (a = 1);
    var c = 0;
    if (analoguesHistoryRuns && (c = analoguesHistoryRuns.length || 0), c > 0) {
        var d = Math.ceil(c / ITEMS_PER_PAGE);
        b = !b && d > MAX_NUMBER_OF_PAGES ? MAX_NUMBER_OF_PAGES > d ? d : MAX_NUMBER_OF_PAGES : d > MAX_NUMBER_OF_PAGES ? a + MAX_NUMBER_OF_PAGES - 1 : d;
        var e = dojo.byId("analoguespager");
        dojo.query("#analoguespager > ul").length > 0 && dojo.forEach(dojo.query("#analoguespager > ul > li"), function (a) {
            dojo.destroy(a)
        });
        var f = dojo.create("ul"),
            g = dojo.create("li");
        g.id = "PrevGallery", g.className = a && 1 == a ? "disabled" : "";
        var h = dojo.create("a");
        h.href = "Javascript:void(0)", h.innerHTML = "Prev", g.appendChild(h), f.appendChild(g), dojo.connect(g, "click", previousPage);
        var i = dojo.create("li");
        i.className = "active";
        var j = dojo.create("a");
        j.href = "Javascript:void(0);", j.innerHTML = a, i.appendChild(j), f.appendChild(i), dojo.connect(i, "click", click_pager);
        for (var k = a; b > k; k++) {
            var l = dojo.create("li");
            ax = dojo.create("a"), ax.href = "Javascript:void(0);", ax.innerHTML = k + 1, l.appendChild(ax), f.appendChild(l), dojo.connect(l, "click", click_pager)
        }
        var m = dojo.create("li");
        m.id = "NextGallery", m.className = 1 >= b ? "disabled" : "";
        var n = dojo.create("a");
        n.href = "Javascript:void(0);", n.innerHTML = "Next", m.appendChild(n), f.appendChild(m), dojo.connect(m, "click", nextPage), e.appendChild(f)
    }
}

function click_pager(a) {
    a.stopPropagation(), a.preventDefault(), a || (a = window.event);
    var b = a.target || a.srcElement,
        c = b.parentNode,
        d = b.textContent,
        e = dojo.byId("analoguespager");
    dojo.forEach(dojo.query("li", e), function (a) {
        dojo.removeClass(a, "active")
    }), "Prev" !== d && "Next" !== d && (c.className = "active", updateLastResultContainer(d))
}

function nextPage() {
    var a = dojo.byId("analoguespager");
    if (a) {
        var b = dojo.query("li:.active", a),
            c = b[0].nextSibling,
            d = parseInt(b[0].textContent),
            e = Math.ceil(analoguesHistoryRuns.length / ITEMS_PER_PAGE);
        if (d >= e ? dojo.query("#NextGallery").addClass("disabled") : (dojo.query("#NextGallery").removeClass("disabled"), dojo.query("#PrevGallery").removeClass("disabled")), c && "Next" !== c.textContent) b.removeClass("active"), c.className = "active", updateLastResultContainer(c.textContent);
        else if (e > d && "Next" == c.textContent) {
            var f = e > d + MAX_NUMBER_OF_PAGES ? d + 1 : e - MAX_NUMBER_OF_PAGES + 1,
                g = d + MAX_NUMBER_OF_PAGES > e ? e : d + MAX_NUMBER_OF_PAGES;
            setupPager(f, g), g >= e && (updateLastResultContainer(d + 1), dojo.forEach(dojo.query("li", a), function (a) {
                dojo.removeClass(a, "active"), parseInt(a.textContent) == d + 1 && dojo.addClass(a, "active")
            }))
        }
    }
}

function previousPage() {
    var a = dojo.byId("analoguespager");
    if (a) {
        var b = dojo.query("li:.active", a),
            c = b[0].previousSibling,
            d = parseInt(b[0].textContent);
        if (Math.ceil(analoguesHistoryRuns.length / ITEMS_PER_PAGE), 1 >= d ? dojo.query("#PrevGallery").addClass("disabled") : (dojo.query("#PrevGallery").removeClass("disabled"), dojo.query("#NextGallery").removeClass("disabled")), c && "Prev" !== c.textContent) b.removeClass("active"), c.className = "active", updateLastResultContainer(c.textContent);
        else if (d > 1 && MAX_NUMBER_OF_PAGES > d && "Prev" == c.textContent) {
            var f = 0 >= d - MAX_NUMBER_OF_PAGES ? 1 : d - MAX_NUMBER_OF_PAGES,
                g = MAX_NUMBER_OF_PAGES > d - MAX_NUMBER_OF_PAGES ? MAX_NUMBER_OF_PAGES : d - 1;
            setupPager(f, g), g >= MAX_NUMBER_OF_PAGES ? (updateLastResultContainer(d - 1), dojo.forEach(dojo.query("li", a), function (a) {
                dojo.removeClass(a, "active"), parseInt(a.textContent) == d - 1 && dojo.addClass(a, "active")
            })) : updateLastResultContainer(f)
        }
    }
}

function updateLastResultContainer(a) {
    var b = dojo.query(".analoguesWidget");
    dojo.forEach(b, function (a) {
        dojo.destroy(a)
    });
    var c = parseInt(a) * ITEMS_PER_PAGE - ITEMS_PER_PAGE,
        d = parseInt(a) * ITEMS_PER_PAGE;
    analoguesHistoryRuns && d > analoguesHistoryRuns.length && (d = analoguesHistoryRuns.length);
    var e = dojo.byId("lastvisitedSites");
    e.style.opacity = 0;
    for (var f = c; d > f; f++) new mapgallery(analoguesHistoryRuns[f]).placeAt(e);
    dojo.fadeIn({
        node: dojo.byId("lastvisitedSites"),
        duration: 500
    }).play()
}

function getCookie(a) {
    var b = document.cookie,
        c = b.indexOf(" " + a + "=");
    if (-1 == c && (c = b.indexOf(a + "=")), -1 == c) b = null;
    else {
        c = b.indexOf("=", c) + 1;
        var d = b.indexOf(";", c); - 1 == d && (d = b.length), b = unescape(b.substring(c, d))
    }
    return b
}

function setCookie(a, b, c) {
    var d = new Date;
    d.setDate(d.getDate() + c);
    var e = escape(b) + (null == c ? "" : "; expires=" + d.toUTCString());
    document.cookie = a + "=" + e
}

function checkSplash() {
    var a = getCookie("showmsg");
    if (null != a && "" != a && "true" == a);
    else {
        var b = '<div id="welcomesplash" class="divwelcome"> 			  <p> Climate Analogues is used to identify areas that experience statistically similar climatic conditions, 			  but which may be separated temporally and/or spatially. In essence, the approach allows you to glimpse into the 			  future by locating areas whose climate today is similar to the projected future climate of a place of interest 			  (i.e. where can we find today the future climate of Nairobi, Kenya?), or vice-versa. 			  </p> 			  <p>If you are ready to start please follow the links to:</p> 			  <div style="width:100%;"> 			      <span class="stepsBtn">1</span><p class="steps">Select a search range and reference site</p> 			      <span class="stepsBtn">2</span><p class="steps">Select direction and global climate models</p> 			      <span class="stepsBtn">3</span><p class="steps">Select climate variables and other analysis settings</p> 			      <span class="stepsBtn">4</span><p class="steps">Observe and save your results</p> 			      <p style="font-size:0.9em;font-style:italic;">(You are able to navigate back to previous pages using the icons at the top right hand corner of the page)</p> 			      <p><span id="icono_help" class="icon-question-sign"></span>&nbsp;&nbsp;&nbsp;&nbsp;For additional information please use these help icons.</p> 			      <div class="btnWelcome">			      <p style="text-align:center;margin-top:15px;"><a id="welcomeBtn" class="btn btn-success btn-large" href="JavaScript:welcomeModal.hide();void(0);" >Get started &raquo;</a></p> 			  </div> 			  <p style="text-decoration: overline;font-size:0.8em;text-align:left;margin-bottom:-10px;margin-top:20px;">For best performance we recommend the use of Google Chrome or Mozilla Firefox.</p> 			   			</div>';
        welcomeModal = new Modal({
            content: b,
            backdrop: !0,
            showOnStart: !0,
            header: "<h4>Welcome to the Climate Analogues online platform</h4>",
            footer: '<p class="chkmsg">&nbsp;&nbsp;<input type="checkbox" id="chk_showmsg" onchange="applyShowMsg();"/>Do not show this message again</p>'
        }), welcomeModal.startup()
    }
}

function applyShowMsg() {
    showmsg = document.getElementById("chk_showmsg").checked, null != showmsg && "" != showmsg && setCookie("showmsg", showmsg, 365)
}
var map = null,
    mapResults = null,
    steps = null,
    analoguesParams = null,
    mapResultlayerSwitcher = null,
    mapResultmousePosition = null,
    mapResultgraticule = null,
    ghyb_lyr = null,
    gphy_lyr = null,
    gmap_lyr = null,
    esritopo_lyr = esristreet_lyr = null,
    esrigray_lyr = esriterrain_lyr = null,
    logoCCAFSfullScreen = null,
    client, gcms = ["CURRENT", "ENSEMBLE", "BCCR_BCM2_0", "CCCMA_CGCM3_1_T47", "CCCMA_CGCM3_1_T63", "CNRM_CM3", "CSIRO_MK3_0", "CSIRO_MK3_5", "GFDL_CM2_0", "GFDL_CM2_1", "GISS_AOM", "GISS_MODEL_EH", "GISS_MODEL_ER", "IAP_FGOALS1_0_G", "INGV_ECHAM4", "INM_CM3_0", "IPSL_CM4", "MIROC3_2_HIRES", "MIROC3_2_MEDRES", "MIUB_ECHO_G", "MPI_ECHAM5", "MRI_CGCM2_3_2A", "NCAR_CCSM3_0", "NCAR_PCM1", "UKMO_HADCM3", "UKMO_HADGEM1"],
    epsg4326 = new OpenLayers.Projection("EPSG:4326"),
    epsg3857 = new OpenLayers.Projection("EPSG:3857"),
    epsg900913 = new OpenLayers.Projection("EPSG:900913"),
    wps = "http://analogues.ciat.cgiar.org/wps",
    serverResults = "http://analogues.ciat.cgiar.org/outputs/",
    capabilities, process, initialExtent, currentClimaticZone, layers = [],
    zones = [],
    climateResultsLayers = [],
    siteLyr, climateSimLyr, markers, site, tileLayerName = null,
    tiempo = new Date,
    mapRsultsLoaded = !1,
    showresults = !1,
    runAnalysis = [],
    arrTooltips = [],
    analoguesHistoryRuns = null,
    welcomeModal = null,
    isIE = "msie" === navigator.appName || "Microsoft Internet Explorer" === navigator.appName ? !0 : !1;
isIE && alert("Your browser does not support all of the capabilities supply by this web site.\n\nPlease update your browser or use a newest version of Chrome, Safari or Firefox"), require(["dojo/query", "dojo/on", "dojo/parser", "dojo/ready", "esri/main", "esri/map", "dojo/_base/xhr", "bootstrap/CarouselItem_ege", "bootstrap/Carousel_ege", "bootstrap/ButtonGroup", "bootstrap/Popover", "bootstrap/Tooltip", "bootstrap/Datepicker", "bootstrap/Modal", "dojox/geo/openlayers/Map", "dojox/geo/openlayers/GfxLayer", "dojox/geo/openlayers/GeometryFeature", "dojox/geo/openlayers/WidgetFeature", "ccafs/Parameters", "ccafs/analoguesGallery", "ccafs/dijit/mapgallery/mapgallery", "dojo/Deferred", "dojox/data/CsvStore", "dijit/dijit", "dijit/form/HorizontalSlider"], function (a, b, c, d) {
    c.parse().then(function () {}), d(init)
}), document.cancelFullScreen = document.webkitExitFullscreen || document.mozCancelFullScreen || document.exitFullscreen;
var MAX_NUMBER_OF_PAGES = 10,
    ITEMS_PER_PAGE = 5;