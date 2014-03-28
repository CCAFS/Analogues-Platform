/* ==========================================================
 * Parameters.js v1.0.0
 * ==========================================================
 * Copyright 2013 egiron
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

define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_Contained",
    "dojo/query"
], function (declare, _WidgetBase, _Contained, query) {
    "use strict";

    // module:
    //      Parameters

    return declare("Parameters", [_WidgetBase, _Contained], {
        // summary:
        //      Object to keep R Analogues parameters
        // description:
        //      This object contain the minimun parameters needed for running R analogues.
                // {
                //   'y': 0.73199999999999998, 
                //   'x': 33.593000000000004, 
                //   'method': 'ccafs'
                //   'model': ['current', 'current'], 
                //   'vars': ['prec', 'tmean'], 
                //   'weights': [0.5, 0.5], 
                //   'ndivisions': [12.0, 12.0],
                //   'env.data': '/Users/ernesto/Desktop/Analogues2013/enviromental_data',
                //   'ext': '.tif', 
                //   'direction': 'none', 
                //   'growing.season': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                //   'rotation': 'prec', 
                //   'period': ['1960_1990', '1960_1990'],
                //   'zones': ['uga', 'uga'],
                //   'resolution': ['30s', '30s'], 
                //   'scenario': ['baseline', 'baseline'], 
                //   'outfile': '/Users/ernesto/Desktop/Analogues2013/analogues_results',
                //   'threshold': 0.0,
                // }
        // example:
        // |    new Parameters({x:-76.5, y:3.56, model:'ccafs'});
        //

        // x: Number -> Longitude coordinate of the selected site
        // 
        x: "",
        _setXAttr: function(val){
            if(this.val != ""){
                this._set("x", val);
            }
        },

        y: "",
        _setYAttr: function(val){
            if(this.val != ""){
                this._set("y", val);
            }/* else {
                console.log('Latitude null');
            }*/
        },
        // method: String
        //         'ccafs', 'hallegate'
        method: "ccafs",
        _setMethodAttr: function(val){
            this._set("method", val);
        },
        // model: Array
        //        GCM ['current', 'current'], 
        model: [],
        _setModelAttr: function(val){
            this._set("model", val);
        },
        // vars: String
        //        c("prec","tmean") //['prec', 'tmean'],
        vars: [],
        _setVarsAttr: function(val){
            this._set("vars", val);
        },
        //   'weights': c(0.5,0.5) - [0.5, 0.5],  
        weights: [],
        _setWeightsAttr: function(val){
            this._set("weights", val);
        },
        //   'ndivisions': c(12,12) - [12.0, 12.0],
        ndivisions: [12, 12],
        _setNdivisionsAttr: function(val){
            this._set("ndivisions", val);
        },
        //   'env.data': '/Users/ernesto/Desktop/Analogues2013/enviromental_data',
        envdata: 'c("/box0_p1/data/portals/ccafs-analogues/tiles")', //"c(\"/enviromental_data\")"  //"/enviromental_data",
        _setEnv_dataAttr: function(val){
            this._set("envdata", val);
        },
        //   'ext': '.tif', 
        ext: ".tif",
        _setExtAttr: function(val){
            this._set("ext", val);
        },
        //   'direction': 'none', 'forward', 'backward'
        direction: "none",
        _setDirectionAttr: function(val){
            this._set("direction", val);
        },
        //   'growing.season': '1:12' - c(1:4,6:10)) 
        growingseason: [],
        _setGrowingseasonAttr: function(val){
            this._set("growingseason", val);
        },
        //   'rotation': 'prec', 'tmean', 'both'
        rotation: "prec",
        _setRotationAttr: function(val){
            this._set("rotation", val);
        },
        //   'period': c("1960_1990","1960_1990") - ['1960_1990', '1960_1990'],
        period: [],
        _setPeriodAttr: function(val){
            this._set("period", val);
        },
        //   'zones': c("uga","uga") - ['uga', 'uga'],
        zones: [],
        _setZonesAttr: function(val){
            this._set("zones", val);
        },
        //   'resolution': c("30s","30s") - ['30s', '30s'], 
        resolution: [],
        _setResolutionAttr: function(val){
            this._set("resolution", val);
        },
        //   'scenario': c("baseline","baseline") - ['baseline', 'baseline'], 
        scenario: [],
        _setScenarioAttr: function(val){
            this._set("scenario", val);
        },
        //   'outfile': '/Users/ernesto/Desktop/Analogues2013/analogues_results',
        outfile: "/var/www/analogues/outputs",
        _setOutfileAttr: function(val){
            this._set("outfile", val);
        },
        //   'threshold': 0.0,
        threshold: 0.0,
        _setThresholdAttr: function(val){
            this._set("threshold", val);
        },
        
        //Convierte los parametros en el formato necesario para R Analogues
        getModel: function(){
            var m = 'c("';
            for (var i = 0; i < this.model.length; i++){
                m += this.model[i] + '","';
            }
            m = m.substr(0,m.length - 2) + ')';
            return m
        },
        
        getVars: function(){
            var s = 'c("';
            for (var i = 0; i < this.vars.length; i++){
                s += this.vars[i] + '","';
            }
            s = s.substr(0,s.length - 2) + ')';
            return s
        },

        getWeights: function(){
            var s = 'c(';
            for (var i = 0; i < this.weights.length; i++){
                s += this.weights[i] + ',';
            }
            s = s.substr(0,s.length - 1) + ')';
            return s
        },

        getNdivisions: function(){
            var s = 'c(';
            for (var i = 0; i < this.ndivisions.length; i++){
                s += this.ndivisions[i] + ',';
            }
            s = s.substr(0,s.length - 1) + ')';
            return s
        },

        getGrowingseason: function(){
            var s = 'c(';
            for (var i = 0; i < this.growingseason.length; i++){
                s += this.growingseason[i] + ',';
            }
            s = s.substr(0,s.length - 1) + ')';
            return s
        },
        getGrowingseason2: function(){
            return this.growingseason.toString();
        },

        getPeriod: function(){
            var s = 'c("';
            for (var i = 0; i < this.period.length; i++){
                s += this.period[i] + '","';
            }
            s = s.substr(0,s.length - 2) + ')';
            return s
        },

        getZones: function(){
            var s = 'c("';
            for (var i = 0; i < this.zones.length; i++){
                s += this.zones[i] + '","';
            }
            s = s.substr(0,s.length - 2) + ')';
            return s
        },

        getResolution: function(){
            var s = 'c("';
            for (var i = 0; i < this.resolution.length; i++){
                s += this.resolution[i] + '","';
            }
            s = s.substr(0,s.length - 2) + ')';
            return s
        },

        getScenario: function(){
            var s = 'c("';
            for (var i = 0; i < this.scenario.length; i++){
                s += this.scenario[i] + '","';
            }
            s = s.substr(0,s.length - 2) + ')';
            return s
        },
        //Obtenien los parametros en formato R para cada Array de datos almacenados en este objeto
        getR_param: function(arr){
            var s = 'c("';
            for (var i = 0; i < this.arr.length; i++){
                s += this.arr[i] + '","';
            }
            s = s.substr(0,s.length - 2) + ')';
            return s
        },

        //Test
        showParams: function(){
            console.log('lng: ' + this.x);
            console.log('lat: ' + this.y);
            console.log('method: ' + this.method);
            console.log('model: ' + this.getModel());
            console.log('vars: ' + this.getVars());
            console.log('weights: ' + this.getWeights());
            console.log('ndivisions: ' + this.getNdivisions());
            console.log('envdata: ' + this.envdata);
            console.log('ext: ' + this.ext);
            console.log('direction: ' + this.direction);
            console.log('growingseason: ' + this.getGrowingseason2()); //getGrowingseason() -> c(1:6, 8:10)
            console.log('rotation: ' + this.rotation);
            console.log('period: ' + this.getPeriod());
            console.log('zones: ' + this.getZones());
            console.log('resolution: ' + this.getResolution());
            console.log('scenario: ' + this.getScenario());
            console.log('outfile: ' + this.outfile);
            console.log('threshold: ' + this.threshold);
        },
        //Test
        toRCode: function(){
            var code =  '<p style="color:brown;">###############<br/>' +
                        '##General Run##<br/>' +
                        '###############</p>' +
                        '<p>options(warn=-1)<br/>' +
                        'require(<span style="color:red;">Analogues</span>)<br/>' +
                        '<span style="color:magenta;">data</span>(zones)<br/>' +
                        '<span style="color:magenta;">data</span>(sim_index_table)</p>';
      
            if (this.zones[0] == "global"){
                code += '<p>zones[row.names(zones)=="global",9]=162 <br/>' +
                        'zones[row.names(zones)=="global",10]=18 <br/>' +
                        'zones[row.names(zones)=="global",11]=9 <br/></p>';
            }
            code += '<p>params = <span style="color:magenta;">createParameters</span>(x=<span style="color:blue;">'+this.x+'</span>, y=<span style="color:blue;">'+this.y+'</span>, '+
                    'method=<span style="color:red;">\"'+this.method+'\"</span>, model='+this.getModel()+', '+
                    'vars=<span style="color:red;">'+this.getVars()+'</span>, weights=<span style="color:blue;">'+this.getWeights()+'</span>, ndivisions=<span style="color:blue;">'+this.getNdivisions()+'</span>, '+
                    'env.data=<span style="color:red;">'+this.envdata+'</span>, ext=<span style="color:red;">\"'+this.ext+'\"</span>, '+
                    'direction=<span style="color:red;">\"'+this.direction+'\"</span>, growing.season=<span style="color:blue;">'+this.getGrowingseason2()+'</span>, '+
                    'rotation=<span style="color:red;">\"'+this.rotation+'\"</span>, period=<span style="color:blue;">'+this.getPeriod()+'</span>, '+
                    'zones=<span style="color:red;">'+this.getZones()+'</span>, resolution=<span style="color:blue;">'+this.getResolution()+'</span>, scenario=<span style="color:red;">'+this.getScenario()+'</span>, '+
                    'outfile=<span style="color:red;">"/box0_p1/egiron/analogues_results"</span>, threshold=<span style="color:blue;">'+this.threshold+'</span>)</p>';

            code += '<p>results = <span style="color:magenta;">calc_similarity</span>(params)<br/>' +
                    '<p><span style="color:magenta;">merge_tiles</span>(params)</p>'+
                    '<p>results1=<span style="color:magenta;">raster</span>("<span style="color:blue;">/box0_p1/egiron/analogues_results/out.tif</span>")</p>'+
                    '<p><span style="color:magenta;">plot</span>(results1)<br/>' +
                    '<span style="color:magenta;">points</span>(params$x,params$y,col="red",pch=<span style="color:blue;">16</span>)</p>';
            
            return code

        },

        postCreate:function () {
           
        },
    });
});