/*
* @Author: Duc Anh Nguyen
* @Email: anhnd@hacvntech.com
* @LinkedIn: https://www.linkedin.com/in/duc-anh-nguyen-31173552
* @Date:   2016-05-03 15:31:22
* @Last Modified by:   KienBeo
* @Last Modified time: 2017-01-09 12:06:53
*/
'use strict';

angular.module('googlemarker')

	.controller('GetPlaceUser', function($translate, $scope, config, $cookieStore,$uibModal,$injector, $window) {
		$scope.nickname = $cookieStore.get('nickname');
		$scope.typeRole = $cookieStore.get('type');
		var shop_name_logo = $cookieStore.get('shop_name_logo'); 
		$scope.checkAuthenticate_Marketing = false;
		$scope.checkAuthenticate_Finance = false;
		$scope.logo = '';
		$scope.shop_name = '';
		//set shop name and logo
		if(shop_name_logo != undefined && shop_name_logo.length > 0){
			var array = shop_name_logo.split("|");
			if(array.length == 2){
				$scope.shop_name = array[0];
				$scope.logo = array[1];
			}else if(array.length == 1){
				$scope.shop_name = array[0];
			}

		}
		$scope.resetMenu = function(){

		}


		$scope.linktowebsite = function(){
			$window.open('http://dataeglobal.com/', "_blank");
		}

	});