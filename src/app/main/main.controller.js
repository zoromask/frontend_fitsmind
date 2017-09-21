'use strict';

angular.module('googlemarker')
  .controller('MainController', function ($scope, mainService, config,$cookieStore) {

	var vm = this;

	vm.datacenterUrl = config.datacenterUrl;
	$scope.doubleClick=function(){
		return false;
	}
	vm.userName = 'Example user';
	vm.home = "Home";
	vm.helloText = 'Welcome in INSPINIA Gulp SeedProject';
	vm.descriptionText = 'It is an application skeleton for a typical AngularJS web app. You can use it to quickly bootstrap your angular webapp projects.';

	/*mainService.getListRole(function(data){
	mainService.getListRolePermission(function(data){
		if(data.success){
			for (var i = 0; i < data.data.length; i++) {
				var code = "code"+data.data[i].code;
				vm[code] = true;
			}
		}
	});*/
	$scope.logOut = function(){
		mainService.logout();
	}
  });
