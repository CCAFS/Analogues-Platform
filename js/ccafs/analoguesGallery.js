/*
 * analoguesGallery.js 1.0 - Analogues Results Gallery
 * Allows to select analysis results from various users runs
 *
 * Copyright (c) 2013, CCAFS - CIAT
 * Author: Ernesto Giron Echeverry (http://ernestogiron.blogspot.com)
 *
 */

define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/cache",
    "dojo/_base/xhr",
    "dojo/_base/array",
    "ccafs/dijit/mapgallery/mapgallery"
], function (declare, _WidgetBase, _TemplatedMixin, cache, xhr, array, mapgallery) {

    return declare("analoguesGallery", [_WidgetBase, _TemplatedMixin], {

      templateString: cache("ccafs", "analoguesGalleryTemplate.html"),
      widgetsInTemplate: false,
      constructor: function(options, srcNodeRef) {
        
        this._resultsData = options.data || [];
        this._map = options.map;
        
        // mixin constructor options 
        dojo.safeMixin(this, options);
      
      },

      postCreate: function(){
          // Get a DOM node reference for the root of our widget
          var domNode = this.domNode;
          
          // Run any parent postCreate processes - can be done at any point
          this.inherited(arguments);

          if (this._resultsData.length == 0){
            // Load up our Naalogues Result by default
            var def = xhr.get({
              url: "js/ccafs/dijit/mapgallery/data/mapgallery.json",
              handleAs: "json"
            });
            // Once ready, process the analogues
            def.then(function(listAnalogues){
              //Populate our local data
              this._resultsData = listAnalogues;
              //console.debug(listAnalogues);
              // Get a reference to our container
              //var resultsContainer = document.getElementById(this._domNodeId);
              //console.debug(resultsContainer);
              array.forEach(listAnalogues, function(a){
                // Create our widget and place it
                var widget = new mapgallery(a).placeAt(domNode);
                //console.debug(widget);
              });

            });
          } 

      },

      startup: function() {
        this.inherited(arguments);
        //console.log('Gallery iniciada..');
      },
      destroy: function() {
        dojo.empty(this.domNode);
        // this.inherited(arguments);
      },
      
      _processStates: function() {
        //console.log('Procesando States ...');
        // first time through, loop through the points
        for ( var j = 0, jl = this._resultsData.length; j < jl; j++ ) {
          // see if the current feature should be added to a cluster
          var state = this._resultsData[j];
          //console.debug(state);
        
        }
      }
  });
});