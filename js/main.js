//Making a static list of all the attributes

var commitID = "H4sIAAAAAAAAAA3HyxECQQgA0Yim-AwwEIIBGABgjV50D-7B8N0-vKoGdIPzd3u-7xDo9JA9R7fzEKw5siKHLHZvUzZEIHBE6ZYy5nBfnFWJ6lHlvnk1fI7xOr4n4BUBCbJRsMklrGm0qVQ1S7OtQ68Lw8UihvMP-2NSlJAAAAA";
// //Get the JSON file from the server
// var commitReport;
// //currently this is wrong, must do in angular.
// $.getJSON("http://localhost:8888/resources/peets_input_report.json", function(json) {
//     // console.log(json); // this will show the info it in firebug console
//     commitReport = json;
// });
// var other = {};

var commitVizModule = angular.module('commitViz',['angularCharts'])
	.value('attArrays', {
		'main': ['Name', 'Telephone', 'Address', 'Locality', 'Region', 'Geocode'],
		'other': ['Post Code', 'Country', 'Website', 'Category ID']
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
				callback(status, inputReportCleaner.generateTableInfo())
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
			// generateTableInfo();
		}

		this.getInputReport = function(){
			return inputReport;
		}

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
			console.log(info);
			return info;
		}

		this.generateChartInfo = function(type){

		}
	})
	.controller('pageCtrl', function($scope, attArrays, dsApiService){
		//vars
		$scope.inputID = '';
		$scope.tableInfo = {};
		//Info for the menu bar
		$scope.mainAttribs = attArrays.main;
		$scope.otherAttribs = attArrays.other;
		//function needed to get the JSON file from the server
		$scope.getJSON = function(){
			//dsApiService.callDSApi($scope.inputID);
			dsApiService.callDSApi(function(error, tableJson){
			//set table info
			$scope.tableInfo = tableJson;
			//set chart info
			// $scope.data
			});
		};

		//details for the angular charts instatiation
		//scope.data information that is set.
		$scope.data = {
			// series: ['Sales', 'Income', 'Expense'],
			data : [{
				x : "Jack",
				y: [100,210, 384],
				tooltip:"this is tooltip"
			},
			{
				x : "John",
				y: [300, 289, 456]
			},
			{
				x : "Stacy",
				y: [351, 170, 255]
			},
			{
				x : "Luke",
				y: [54, 341, 879]
			}]     
		}
		//config of the chrart details
		$scope.config = {
			labels: false,
			title : "Not Procuts",
			legend : {
				display: true,
				position:'left'
			},
			click : function(d) {
				console.log('clicked!');
			},
			mouseover : function(d) {
				console.log('mouseover!');
			},
			mouseout : function(d) {
				console.log('mouseout!');
			},
			innerRadius: 0,
			lineLegend: 'lineEnd',
		}
	});







