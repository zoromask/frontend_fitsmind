'use strict';

angular.module('googlemarker')
  .controller('DashboardController',DashboardController)


function DashboardController($scope, $compile){
	$scope.directionsService;
   $scope.directionsDisplay;
   $scope.initialize = function() {
      var myLatLng = {lat: 21.027764, lng: 105.834160};
      var map = new google.maps.Map(document.getElementById('map_div'), {
         center: {lat: 21.027764, lng: 105.834160},
         zoom: 14
      });
      $scope.directionsService = new google.maps.DirectionsService;
      $scope.directionsDisplay = new google.maps.DirectionsRenderer({
         draggable: true,
         map: map
      });

      $scope.directionsDisplay.addListener('directions_changed', function(){
         console.log($scope.directionsDisplay.getDirections())
      });
   }   
   $scope.calculateAndDisplayRoute = function(directionsService, directionsDisplay) {
      var waypts = [];
      var arrWaypoints = angular.element('.row-waypoint');
      if(arrWaypoints.length === 0){
         return;
      }
      var origin = "";
      var destination = "";
      for (var i = 0;i < arrWaypoints.length; i++) {
         var index = i+1;
         var itemOrigin = angular.element('.origin-'+index.toString()).val();
         var itemDestination = angular.element('.destination-'+index.toString()).val();
         waypts.push({
            location: itemOrigin,
            stopover: true   
         });
         waypts.push({
            location: itemDestination,
            stopover: true   
         });
         if(i === 0){
            
            var className = ".origin-"+index.toString()
            origin = angular.element(className).val();
         }
         if(i === arrWaypoints.length - 1){
            
            var className = ".destination-"+index.toString();
            destination = angular.element(className).val();
         }
      }
      
      /*
      waypts.push({
         location: origin,
         stopover: true
      })
      waypts.push({
         location: destination,
         stopover: true
      })*/
      directionsService.route({
         origin: origin,
         destination: destination,
         waypoints: waypts,
         optimizeWaypoints: true,
         travelMode: 'DRIVING'
      }, function(response, status) {
         if (status === 'OK') {
            directionsDisplay.setDirections(response);
            var route = response.routes[0];
            /*var summaryPanel = document.getElementById('directions-panel');
            summaryPanel.innerHTML = '';
            // For each route, display summary information.
            for (var i = 0; i < route.legs.length; i++) {
               var routeSegment = i + 1;
               summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
               '</b><br>';
               summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
               summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
               summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
            }*/
         } else {
            window.alert('Directions request failed due to ' + status);
         }
      });
   } 
   $scope.setMap = function(){
		$scope.initialize();
		google.maps.event.addDomListener(window, 'load', $scope.initialize);
      // $scope.calculateAndDisplayRoute($scope.directionsService, $scope.directionsDisplay);
   }
   $scope.setMap();
   $scope.addWaypoint = function(){
      // var origin = angular.element(".origin-1").val();
      // var destination = angular.element(".destination-1").val();
      var index = angular.element('.row-waypoint').length + 1;
      var element = '<div class="row-waypoint" waypoint-count="'+index+'"><label>origin '+index+'</label> <input class="origin-'+index+'"/> ';
         element += '<label>destination '+index+'</label> <input class="destination-'+index+'"/> <button class="btn btn-sm btn-danger" ng-click="deleteRow('+index+')">-</button></div>';
      var template = angular.element('.form-waypoint').append(element);
      $compile(template)($scope);
   }
   $scope.drawWaypoint =function(){
      $scope.calculateAndDisplayRoute($scope.directionsService, $scope.directionsDisplay);
   }
   $scope.deleteRow = function(index){
      var el = angular.element('[waypoint-count = '+index+']');
      el.remove(el.selectedIndex);
      
   }
}