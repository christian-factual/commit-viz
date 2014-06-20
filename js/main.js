//Making a static list of all the attributes

var main = ['Name', 'Telephone', 'Address', 'Locality', 'Region', 'Geocode'];
var other = ['Post Code', 'Country', 'Website', 'Category ID'];
var commitID = "H4sIAAAAAAAAAA3HyxECQQgA0Yim-AwwEIIBGABgjV50D-7B8N0-vKoGdIPzd3u-7xDo9JA9R7fzEKw5siKHLHZvUzZEIHBE6ZYy5nBfnFWJ6lHlvnk1fI7xOr4n4BUBCbJRsMklrGm0qVQ1S7OtQ68Lw8UihvMP-2NSlJAAAAA";
//Get the JSON file from the server
var commitReport;
//currently this is wrong, must do in angular.
$.getJSON("http://localhost:8888/resources/peets_input_report.json", function(json) {
    console.log(json); // this will show the info it in firebug console
    commitReport = json;
});

var commitVizModule = angular.module('commitViz',[]);

function MenuBarCtrl($scope){
	$scope.mainAttribs = main;
	$scope.otherAttribs = other;

}

function TableCtrl($scope){
	// $scope.rawInput = commitReport.input.payloadRaw;
	$scope.payload
}