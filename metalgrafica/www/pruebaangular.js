angular.module('formExample', [])
    .controller('ExampleController', ['$scope','$http', function($scope,$http) {
      $scope.master = {};

      $scope.update = function(user) {
        $scope.master = angular.copy(user);
        $scope.filas.push(
            {
                id: 300,
                name: $scope.user.name
            }
        )
      };

      $scope.reset = function() {
        $scope.user = angular.copy($scope.master);
      };
      $scope.filas = [{name:"eee"}];
      $http({
				//url: "/api/resource/Item%20Group",
                url: "/?cmd=metalgrafica.util.get_prueba_filas",
			    method: "GET"				
			}).then(function(response) {
				$scope.filas = response.data.message;
	});
        
      $scope.reset();
    }]);