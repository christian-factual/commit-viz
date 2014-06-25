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
			return _finalURL;
		}
		/** Setter for the commit ID variable
		**/
		this.setCommitID = function(ID){
			_commitID = ID;
		}
		/** Getter for the commit ID variable
		**/
		this.getCommitID = function(){
			return _commitID;
		}
		/** Function to make http call to the the server.
		**/
		this.callDSApi = function(callback){
			makeURL();
			$http({
				method: 'GET',
				url: _finalURL
			})
			.success(function(data, status){
				console.log("This worked!");
				inputReportCleaner.storeJSON(data);
				// callback(status, inputReportCleaner.generateTableInfo())
				callback(status, data);
			})
			.error(function(data, status){
				console.log("This crap didnt work");
				alert("Wasn't able to find this commit ID");
				// callback(status, null);
			})	
		}
	})
	.service('inputReportCleaner', function(){
		var inputReport = {};
		var chartInfo = {};

		this.storeJSON = function(data){
			inputReport = data; 
			console.log("here!",inputReport);
		}

		this.getInputReport = function(){
			return inputReport;
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
			console.log(info);
			for(var key in info){
				//special case that we have a rawaddress
				if(key==='address'){
					console.log('inside the address');
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
		// http call JSON. Method takes in str 'type' and returns a formatted 
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
				console.log("Ths is temp: ", temp);
				dataArr.push(temp);
			}
			pInfo = {
				series: [],
				data: dataArr
			}
			return pInfo;
		}
	})
	.controller('pageCtrl', function($scope, attArrays, dsApiService, inputReportCleaner){
		//vars
		$scope.inputID = '';
		$scope.tableInfo = {};
		//Info for the menu bar
		$scope.mainAttribs = attArrays.main;
		$scope.otherAttribs = attArrays.other;
		//Logic for choosing active tabs
		$scope.activeTab = 'Name';
		$scope.selectAttrib = function(event){
			//onclick set the active 
			$scope.activeTab = event.target.attributes[2].nodeValue
			console.log("This is the active: ", $scope.activeTab)
			try{
				$scope.data = inputReportCleaner.generateChartInfo($scope.activeTab);
			}
			catch(err){
				//probably happening because the info used in the method has not been populated
				console.log(err);
			}
		};

		//function needed to get the JSON file from the server
		$scope.getJSON = function(){
			//dsApiService.callDSApi($scope.inputID);
			dsApiService.callDSApi(function(error, returnJSON){
			//set table info
			other = returnJSON;
			$scope.tableInfo = inputReportCleaner.generateTableInfo();
			//set chart info
			$scope.data = inputReportCleaner.generateChartInfo($scope.activeTab);
			});
		};

		//details for the angular charts instatiation
		//type of chart
		$scope.chartType = 'pie';
		//scope.data information that is set.
		$scope.data = {}; //Data for the pie
		$scope.data2 = {}; //data for the bar

		console.log($scope.data);
		//config of the chrart details
		$scope.config = {
			labels: false,
			title : "",
			legend : {
				display: true,
				position:'left'
			},
			click : function(d) {
				// console.log('clicked!');
			},
			mouseover : function(d) {
				// console.log('mouseover!');
			},
			mouseout : function(d) {
				// console.log('mouseout!');
			},
			innerRadius: 0,
			lineLegend: 'lineEnd',
		}
	});







