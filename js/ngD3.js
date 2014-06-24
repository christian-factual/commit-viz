angular.module('d3', [])
	.factory('d3Service', [
		function(){
		var d3;

		return d3;
	}];);


angular.module('viz.directives'['d3'])
	.directive('pieChart', ['d3Service', function(d3Service){
		return{
			restrict: 'EA',
			//directive code
		}
	}]);