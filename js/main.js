//Making a static list of all the attributes

var main = ['Name', 'Telephone', 'Address', 'Locality', 'Region', 'Geocode'];
var other = ['Post Code', 'Country', 'Website', 'Category ID'];

var json = $.getJSON("./resources/peets_input_report.json", function(json) {
    console.log(json); // this will show the info it in firebug console
});

function MenuBarCtrl($scope){
	$scope.mainAttribs = main;
	$scope.otherAttribs = other;

}