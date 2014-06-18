//Making a static list of all the attributes

var main = ['Name', 'Telephone', 'Address', 'Locality', 'Region', 'Geocode'];
var other = ['Post Code', 'Country', 'Website', 'Category ID'];

function MenuBarCtrl($scope){
	$scope.mainAttribs = main;
	$scope.otherAttribs = other;

}