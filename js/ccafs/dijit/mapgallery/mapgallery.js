/*
 * mapgallery.js 1.0 -    JavaScript Climate Similarity Analogues Results Widget - ccafs.dijit.mapgallery
 *
 * Copyright (c) 2013, CCAFS - CIAT
 * Author: Ernesto Giron Echeverry (http://ernestogiron.blogspot.com)
 */

define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dojo/text!./templates/mapgallery.html",
	"dojo/dom-style",
	"dojo/_base/fx",
	"dojo/_base/lang",
	"dojo/on",
	"dojo/mouse",
	"require" // context-sensitive require to get URLs to resources from relative paths
], function(declare, _WidgetBase, _TemplatedMixin, template, domStyle, baseFx, lang, on, mouse, require){
        return declare("mapgallery",[_WidgetBase, _TemplatedMixin], {

			// Some default values for our author
			// These typically map to whatever you're passing to the constructor
			siteName: "No Name",
			//params: options.params || new ccafs.Paramters(),
			// Using require.toUrl, we can get a path to our AuthorWidget's space
			// and we want to have a default thumbnail, just in case
			thumbnail: require.toUrl("./imgs/default.png"),
			note: "",

			// Our template - important!
			templateString: template,
 
			// A class to be applied to the root node in our template
			baseClass: "analoguesWidget",
 
			// A reference to our background animation
			mouseAnim: null,
 
			// Colors for our background animation
			baseBackgroundColor: "#fff",
			mouseBackgroundColor: "#def",
			
			// constructor
        	constructor: function (options) {
        		this.siteName = options.site,
				this.x = options.x,
				this.y = options.y,
				this.method = options.method || "ccafs",
				this.model = options.model,
				this.vars = options.vars,
				this.weights = options.weights,
				this.ndivisions = options.ndivisions || "12",
				//this.envdata = options.envdata,
				this.ext = options.ext || ".tif",
				this.direction = options.direction || "none",
				this.growingseason = options.growingseason || "1:12",
				this.rotation = options.rotation,
				this.period = options.period,
				this.zones = options.zones,
				this.resolution = options.resolution,
				this.scenario = options.scenario,
				//this.outfile = options.outfile,
				this.threshold = options.threshold
				// this._steps = steps,
				// this._mapResults = mapResults
			},

			postCreate: function(){
			    // Get a DOM node reference for the root of our widget
			    var domNode = this.domNode;
			 
			    // Run any parent postCreate processes - can be done at any point
			    this.inherited(arguments);
			 
			    // Set our DOM node's background color to white -
			    // smoothes out the mouseenter/leave event animations
			    domStyle.set(domNode, "backgroundColor", this.baseBackgroundColor);
			    // Set up our mouseenter/leave events
			    // Using dijit/Destroyable's "own" method ensures that event handlers are unregistered when the widget is destroyed
			    // Using dojo/mouse normalizes the non-standard mouseenter/leave events across browsers
			    // Passing a third parameter to lang.hitch allows us to specify not only the context,
			    // but also the first parameter passed to _changeBackground
			    this.own(
			        on(domNode, mouse.enter, lang.hitch(this, "_changeBackground", this.mouseBackgroundColor)),
			        on(domNode, mouse.leave, lang.hitch(this, "_changeBackground", this.baseBackgroundColor)),
			        on(domNode, "click", lang.hitch(this, "_click"))
			    );
			},

			_changeBackground: function(newColor) {
			    // If we have an animation, stop it
			    if (this.mouseAnim) {
			        this.mouseAnim.stop();
			    }
			 
			    // Set up the new animation
			    this.mouseAnim = baseFx.animateProperty({
			        node: this.domNode,
			        properties: {
						backgroundColor: newColor
			        },
			        onEnd: lang.hitch(this, function() {
						// Clean up our mouseAnim property
						this.mouseAnim = null;
			        })
			    }).play();
			},

			_setThumbnailAttr: function(imagePath) {
			    // We only want to set it if it's a non-empty string
			    if (imagePath != "") {
			        // Save it on our widget instance
			        this._set("thumbnail", imagePath);
			        // Using our thumbnailNode attach point, set its src value
			        this.thumbnailNode.src = imagePath;
			    }
			},

			_click: function() {
				//console.log(this.siteName);
				//Check out for existing site
				if (isMapResultLoaded(this.siteName)) return
				steps.to(3, true);
				if (!mapRsultsLoaded) showOutput();
				//console.debug(this);
				//Crear new analoguesParams and add points to the map
	        	analoguesParams = new Parameters({x:this.x.toString(), y:this.y.toString(), zones:this.zones, 
	        							direction:this.direction, period:this.period, 
		        						scenario:this.scenario, model:this.model, 
		        						resolution:this.resolution, vars:this.vars,
	        							weights:this.weights, rotation:this.rotation, 
	        							growingseason:this.growingseason, threshold:this.threshold
	        					  	});
	        	
	        	this.drawSite();
	        	addLayerResultstoMap(this.siteName);
	        	if(mapResults) mapResults.zoomToExtent(getExtentbyCountry(this.zones[0]), false);
		        
		        if (dojo.isFF >= 3.6 || dojo.isChrome >= 6.0 || dojo.isSafari >= 6.0 || dojo.isOpera >= 11.1 || dojo.isIE >= 10.0) {
					if (dojo.byId('tablelyrResults').rows.length <= 0) {
						dojo.byId('saveSessionBtn').style.visibility = 'hidden';
					} else {
						dojo.byId('saveSessionBtn').style.visibility = 'visible';
					}
				}
			},
			//Draw the user selected point
			drawSite: function(){
				if (site){
					var point = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(parseFloat(this.x), parseFloat(this.y)));
					point.geometry.transform(epsg4326, epsg900913);
					if (site) {
					  	var size = new OpenLayers.Size(20,20);
					  	var offset = 0;
					  	var icon = new OpenLayers.Icon('imgs/target.png', size, offset);
					  	var marker = new OpenLayers.Marker(new OpenLayers.LonLat(point.geometry.x,point.geometry.y),icon);
					  	marker.icon.imageDiv.title = this.site;
					  	marker.id = this.site;
					  	marker.title = this.site;
					  	//marker.events.register('mousedown', marker, function(evt) { alert(this.id); OpenLayers.Event.stop(evt); });
	            		site.addMarker(marker);
					}
				}
			}
        });
});
