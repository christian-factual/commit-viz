//Making a static list of all the attributes

var commitID = "H4sIAAAAAAAAAA3HyxECQQgA0Yim-AwwEIIBGABgjV50D-7B8N0-vKoGdIPzd3u-7xDo9JA9R7fzEKw5siKHLHZvUzZEIHBE6ZYy5nBfnFWJ6lHlvnk1fI7xOr4n4BUBCbJRsMklrGm0qVQ1S7OtQ68Lw8UihvMP-2NSlJAAAAA";
// //Get the JSON file from the server
// var commitReport;
// //currently this is wrong, must do in angular.
// $.getJSON("http://localhost:8888/resources/peets_input_report.json", function(json) {
//     // console.log(json); // this will show the info it in firebug console
//     commitReport = json;
// });
var other = {};

var commitVizModule = angular.module('commitViz',['angularCharts'])
	.value('attArrays', {
		'main': ['Name', 'Tel', 'Address', 'Locality', 'Region', 'Geocode'],
		'other': ['Postcode', 'Country', 'Website'] //, 'Category ID'
	})
	.filter('splitCap', function(){
		return function(input){
			input = input || '';
			var out = "";
			var temp = input.split("_");
			for(var index = 0; index<temp.length; index++){
				var other = temp[index].charAt(0).toUpperCase() + temp[index].slice(1) + " ";
				out = out + other;
			}
			return out;
		};
	})
	.service('dsApiService', function(inputReportCleaner, $http){
		//This is where I'm making the JSON call to DSAPIs
		var baseURL = 'http://localhost:8888/resources/';
		var _commitID= 'peets_input_report.json'; //****This will be an input later
		var _finalURL = '';
		/** Method combines the final URL from user input
			and the base URL. Then sets the final URL variable.
		**/
		var makeURL= function(){
			_finalURL = baseURL + _commitID;
			console.log("Looking at this URL: ", _finalURL);
			return _finalURL;
		}
		/** Setter for the commit ID variable
		**/
		this.setCommitID = function(ID){
			console.log('hit');
			if(ID == ''){
				_commitID= 'peets_input_report.json';
			}
			else{
				_commitID = ID;
			}
		}
		/** Getter for the commit ID variable
		**/
		this.getCommitID = function(){
			return _commitID;
		}
		/** Function to make http call to the the server.
		**/
		this.callDSApi = function(url, callback){
			this.setCommitID(url);
			makeURL();
			$http({
				method: 'GET',
				url: _finalURL
			})
			.success(function(data, status){
				console.log("This worked!");
				inputReportCleaner.storeJSON(data);
				callback(status, data);
			})
			.error(function(data, status){
				console.log("This crap didnt work");
				alert("Wasn't able to find this commit ID");
			})	
		}
	})
	.service('inputReportCleaner', function(){
		//vars used.
		var inputReport = {};
		var chartInfo = {};

		//Method takes in a data instance, which is the JSON returned from the http
		//call and assigns it to the inputReport variable of this service.
		this.storeJSON = function(data){
			inputReport = data; 
		}
		//Method uses the stored commit JSON and formats 
		//it so that the Angular driven table can be generated. 
		this.generateTableInfo = function(){
			//Create object
			var info = {};
			var finalSummary = inputReport.summary_report.summary.payload;
			var raw = inputReport.input.payloadRaw;
			var clean = inputReport.input.payload;

			for(var key in finalSummary){
				if(finalSummary.hasOwnProperty(key)){
					info[key] = [finalSummary[key]];
				}
			}
			for(var key in info){
				//special case that we have a rawaddress
				if(key==='address'){
					info[key].unshift(raw[key], clean['rawaddress']);
					continue;
				}
				//case that both have this field
				if(clean.hasOwnProperty(key) && raw.hasOwnProperty(key)){
					info[key].unshift(raw[key], clean[key]);
					continue;
				}
				else if(clean.hasOwnProperty(key)){
					info[key].unshift(' ', clean[key]);
					continue;
				}
				else if(raw.hasOwnProperty(key)){
					info[key].unshift(raw[key], ' ');
					continue;
				}
				else{
					info[key].unshift(' ', ' ');
				}				
			}
			return info;
		}
		//Method generates pie chart formatted JSON from the stored
		//http call JSON. Method takes in str 'type' and returns a formatted 
		//JSON object for Angular-charts
		this.generateChartInfo = function(type){
			var pInfo = {};
			var bInfo = {};
			var attrib = type.toLowerCase();

			//this is the summary object; key= name, value=weight
			var summaryStats = inputReport.summary_report.field_summarizer_stats[attrib];
			//data is an array of objects
			var dataArr = [];

			for(var key in summaryStats){
				var temp = {
					x: key, 
					y: [summaryStats[key]]
				}
				dataArr.push(temp);
			}
			pInfo = {
				// series: ['thing', 'thing2', 'thing3'],
				data: dataArr
			}
			return pInfo;
		}

		//Method takes in a type var, which is the attribute that is 
		//being displayed. It gets information from the JSON and then
		//gathers the info needed for the midpane. It also formats it into 
		//an object with 'userInput', 'explain', highestW', 'totalW' & 'confidence'
		//as the keys.
		this.generateContentText = function(type){
			var attrib = type.toLowerCase();
			var text = {
				userInput: '',
				explain: '',
				highestW: 0,
				totalW: 0,
				confidence: 0
			};

			var stats = inputReport.latest_summary.fieldMetas[attrib];
			text['totalW'] = stats.scores['total_weight'];
			text['highestW'] = stats.scores['highest_weight'];
			text['confidence'] = stats['confidence'];
			//get user input if its there
			if(inputReport.input.payloadRaw[attrib] !== undefined){
				text['userInput'] = inputReport.input.payloadRaw[attrib];
			}
			
			//try and get explanation if its there.
			
			var temp = inputReport.summary_report.input_contributions_explained
			for(var key in temp){
				//since I dont know the key, iterate.
				for(var entry in temp[key]){//check if this field has an explination
					if(attrib == entry){
						text['explain'] = temp[key][entry];
					}
				}
			}
			return text;
		}
	})
	.controller('pageCtrl', function($scope, attArrays, dsApiService, inputReportCleaner){
		//random
		$scope.myData = [
			{name: 'AngularJS', count: 300},
			{name: 'D3.JS', count: 150},
			{name: 'jQuery', count: 400},
			{name: 'Backbone.js', count: 300},
			{name: 'Ember.js', count: 100}
		];

		//vars
		$scope.inputID = '';
		$scope.tableInfo = {};
		//info for the content pane
		$scope.explain = '';
		$scope.userInput = '';
		$scope.highestW = '';
		$scope.totalW = '';
		$scope.confidence = '';
		//Info for the menu bar
		$scope.mainAttribs = attArrays.main;
		$scope.otherAttribs = attArrays.other;
		//Logic for choosing active tabs
		$scope.activeTab = 'Name';

		//Method is called when the attribute toggle on the html page
		//is clicked. This updates the page to the attribute and calls 
		//methods to reset and assign the view for the correct attribute.
		//This method is also called when the page is first loaded.
		$scope.selectAttrib = function(event){
			//onclick set the active 
			$scope.activeTab = event.target.attributes[2].nodeValue
			try{
				$scope.data = inputReportCleaner.generateChartInfo($scope.activeTab);
				$scope.assignContentText(inputReportCleaner.generateContentText($scope.activeTab));
			}
			catch(err){
				//probably happening because the info used in the method has not been populated
			}
		};

		//Method assigns the content pane's text. Gets information from
		//JSON object as assigns it to each scope.variable
		$scope.assignContentText = function(arr){
			$scope.explain = arr['explain'];
			$scope.userInput = arr['userInput'];
			$scope.highestW = arr['highestW'];
			$scope.totalW = arr['totalW'];
			$scope.confidence = arr['confidence'];
		}

		//function needed to get the JSON file from the server
		//Also calls methods to set variables used in html
		$scope.getJSON = function(){
			//dsApiService.callDSApi($scope.inputID);
			dsApiService.callDSApi($scope.inputID, function(error, returnJSON){
			//set table info
			other = returnJSON;
			$scope.tableInfo = inputReportCleaner.generateTableInfo();
			//set chart info
			$scope.data = inputReportCleaner.generateChartInfo($scope.activeTab);
			//set content
			$scope.assignContentText(inputReportCleaner.generateContentText($scope.activeTab));
			});
		};

		//details for the angular charts instatiation
		//type of chart
		$scope.chartType = 'pie';
		//scope.data information that is set.
		$scope.data = {}; //Data for the pie
		$scope.data2 = {}; //data for the bar

		//config of the chrart details
		$scope.config = {
			labels: false,
			title : "",
			legend : {
				display: true,
				position:'left'
			},
			click : function(d) {
			
			},
			mouseover : function(d) {
				
			},
			mouseout : function(d) {
				
			},
			innerRadius: 165,
			lineLegend: 'lineEnd',
		}
	});

commitVizModule.directive('timelineD3', [
	function () {
		return {
			restrict: 'E', 
			scope: {
				data: '='
			},
			link: function(scope, element){
				var w = 500;
				var h = 300;
				var padding = 20;

				var dataset = [
				[600, 150], [5, 20], [480, 90], [250, 50], [100, 33], [330, 95],
				[410, 12], [475, 44], [25, 67], [85, 21], [220, 88]
				];

				var xScale = d3.scale.linear()
								.domain([0, d3.max(dataset, function(d) { return d[0]; })])
								.range([padding, w - padding* 2]);
				var yScale = d3.scale.linear()
								.domain([0, d3.max(dataset, function(d) { return d[1]; })])
								.range([h - padding , padding]);

				var rScale = d3.scale.linear()
									 .domain([0, d3.max(dataset, function(d){
									 	return d[1];
									 })])
									 .range([2,5]);

				var svg = d3.select("#random")
							.append("svg")
							.attr("width", w)
							.attr("height", h);

				svg.selectAll("circle")
				   .data(dataset)
				   .enter()
				   .append("circle")
				   .attr("cx", function(d) {
				   		return xScale(d[0]);
				   })
				   .attr("cy", function(d) {
				   		return yScale(d[1]);
				   })
				   .attr("r", function(d) {
				   		return rScale(d[1]);
				   });

				svg.selectAll("text")
				   .data(dataset)
				   .enter()
				   .append("text")
				   .text(function(d) {
				   		return d[0] + "," + d[1];
				   })
				   .attr("x", function(d) {
				   		return xScale(d[0]);
				   })
				   .attr("y", function(d) {
				   		return yScale(d[1]);
				   })
				   .attr("font-family", "sans-serif")
				   .attr("font-size", "11px")
				   .attr("fill", "red");

				var xAxis = d3.svg.axis()
								  .scale(xScale)
							  	  .orient("bottom");
				svg.append("g")
					.call(xAxis);



				// //Set margins, width, and height
				// var margin = {top: 20, right: 20, bottom: 30, left: 40},
				// width = 480 - margin.left - margin.right,
				// height = 360 - margin.top - margin.bottom;

    //     		//Create the d3 element and position it based on margins
    //    			var svg = d3.select(element[0])
    //     			.append("svg")
    //     			.attr('width', width + margin.left + margin.right)
    //     			.attr('height', height + margin.top + margin.bottom)
    //     			.append("g")
    //     			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    //     		//Watch 'data' and run scope.render(newVal) whenever it changes
    //     		//Use true for 'objectEquality' property so comparisons are done on equality and not reference
    //     		scope.$watch('data', function(){
    //     			scope.render(scope.data);
    //     		}, true);  
			}
		};
	}
]);

//random graph example. This is just to show the formatting of the code 
commitVizModule.directive('otherthing', [
	function () {
		return {
			restrict: 'E', 
			scope: {
				data: '='
			},
			link: function(scope, element){
				//Set margins, width, and height
				var margin = {top: 20, right: 20, bottom: 30, left: 40},
				width = 480 - margin.left - margin.right,
				height = 360 - margin.top - margin.bottom;

        		//Create the d3 element and position it based on margins
       			var svg = d3.select(element[0])
        			.append("svg")
        			.attr('width', width + margin.left + margin.right)
        			.attr('height', height + margin.top + margin.bottom)
        			.append("g")
        			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        		//Create the scales we need for the graph
        		var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
        		var y = d3.scale.linear().range([height, 0]);

        		//Create the axes we need for the graph
       		 	var xAxis = d3.svg.axis()
        			.scale(x)
        			.orient("bottom");

        		var yAxis = d3.svg.axis()
        			.scale(y)
       				.orient("left")
        			.ticks(10);
        		//Render graph based on 'data'
        		scope.render = function(data) {
        			//Set our scale's domains
        			x.domain(data.map(function(d) { return d.name; }));
        			y.domain([0, d3.max(data, function(d) { return d.count; })]);
        		  	//Remove the axes so we can draw updated ones
  					svg.selectAll('g.axis').remove();
  
  					//Render X axis
 					 svg.append("g")
     					.attr("class", "x axis")
      					.attr("transform", "translate(0," + height + ")")
     					.call(xAxis);
      
  					//Render Y axis
  					svg.append("g")
					    .attr("class", "y axis")
					    .call(yAxis)
					  .append("text")
					    .attr("transform", "rotate(-90)")
					    .attr("y", 6)
					    .attr("dy", ".71em")
					    .style("text-anchor", "end")
					    .text("Count");

					//Create or update the bar data
					var bars = svg.selectAll(".bar").data(data);
					bars.enter()
						.append("rect")
						.attr("class", "bar")
						.attr("x", function(d) { return x(d.name); })
						.attr("width", x.rangeBand());

					//Animate bars
					bars
						.transition()
						.duration(1000)
						.attr('height', function(d) { return height - y(d.count); })
						.attr("y", function(d) { return y(d.count); })

        		}
        
        		//Watch 'data' and run scope.render(newVal) whenever it changes
        		//Use true for 'objectEquality' property so comparisons are done on equality and not reference
        		scope.$watch('data', function(){
        			scope.render(scope.data);
        		}, true);  
			}
		};
	}
]);
