//Making a static list of all the attributes

var commitID = "H4sIAAAAAAAAAA3HyxECQQgA0Yim-AwwEIIBGABgjV50D-7B8N0-vKoGdIPzd3u-7xDo9JA9R7fzEKw5siKHLHZvUzZEIHBE6ZYy5nBfnFWJ6lHlvnk1fI7xOr4n4BUBCbJRsMklrGm0qVQ1S7OtQ68Lw8UihvMP-2NSlJAAAAA";
//Get the JSON file from the server
var commitReport;
//currently this is wrong, must do in angular.
$.getJSON("http://localhost:8888/resources/peets_input_report.json", function(json) {
    // console.log(json); // this will show the info it in firebug console
    commitReport = json;
});

var commitVizModule = angular.module('commitViz',[])
	.value('attArrays', {
		'main': ['Name', 'Telephone', 'Address', 'Locality', 'Region', 'Geocode'],
		'other': ['Post Code', 'Country', 'Website', 'Category ID']
	})
	.service('dsApiService', function(inputReportCleaner, $http, $q){
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
		this.callDSApi = function(){
			makeURL();
			$http({
				method: 'GET',
				url: _finalURL
			})
			.success(function(data, status){
				console.log("This worked! Here's the JSON: ");
				inputReportCleaner.storeJSON(data);
			})
			.error(function(data, status){
				console.log("This crap didnt work");
				alert("Wasn't able to find this commit ID");
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
				//case that both have this field
				if(clean.hasOwnProperty(key) && raw.hasOwnProperty(key)){
					info[key].upshift(raw[key], clean[key]);
					continue;
				}
				else if(clean.hasOwnProperty(key)){
					info[key].upshift(' ', clean[key]);
					continue;
				}
				else if(raw.hasOwnProperty(key)){
					info[key].upshift(raw[key], ' ');
					continue;
				}
				else{
					info[key].upshift(' ', ' ');
				}				
			}
			console.log(info);
			return info;
		}
	})
	.controller('pageCtrl', function($scope, dsApiService){
		$scope.data = {};
		$scope.inputID = '';

		$scope.getJSON = function(){
			//dsApiService.callDSApi($scope.inputID);
			dsApiService.callDSApi();
		};

	})
	.controller('MenuBarCtrl', function($scope, attArrays){
		$scope.mainAttribs = attArrays.main;
		$scope.otherAttribs = attArrays.other;
	})
	.controller('TableCtrl', function($scope, inputReportCleaner){
		$scope.rawFields = inputReportCleaner.generateTableInfo();

		$scope.seeTableInfo = function(){
			console.log($scope.rawFields);
		}
		
	});






