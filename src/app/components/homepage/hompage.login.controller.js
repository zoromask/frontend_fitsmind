
'use strict';
angular.module('googlemarker')
	.controller('LoginController',LoginController)
	.controller('ForgotPasswordController',ForgotPasswordController)

function LoginController($scope, mainService, config,toaster, $timeout, $cookieStore,$location,$state, $cookies, COUNTRY_CODE){
	$scope.user = { country_code : 1};
	var imageUrl = config.datacenterUrl;
	//set forcus
	angular.element('.phone-number').focus();
	var country_name = ['Not found'], country_code = ['0'];
	angular.forEach(COUNTRY_CODE, function(value, key) {
		country_name.push(value["name"]);
		country_code.push(value["code"]);
	});
	$scope.dpOptions = {
		display: 'bottom',
		lang: 'en',
		mode: 'mixed',
		showLabel: true,
		disableIndicator: true,
		wheels: [[
			{
				label: 'Your country',
				keys: country_code,
				values: country_name
			}
		]],
		formatResult: function (data) {
			return data[0];
		}
	};
	mainService.getCountryByIP({}, function(data){
		$scope.user.country_code = data.code;
	});
	$scope.login = function(){
		if($scope.user.userName === undefined || $scope.user.userName === "" || $scope.user.password === undefined || $scope.user.password === ""){
			return;
		}
		/*if($scope.user.userName.charAt(0) == parseInt(0)){
			$scope.user.userName = $scope.user.userName.substr(1);
		}
		$scope.user.roleScope = 2;*/

		var params = angular.copy($scope.user);
		mainService.login(params, function(data){
			if(data.data.success){
				var date = new Date();
				date.setMonth(date.getMonth()+1);

				/*$cookieStore.put('nickname', data.data.nickname, {expires: date});
				$cookieStore.put('token', data.headers("authorization"), {expires: date});
				$cookieStore.put('permission', data.headers("x-role"), {expires: date});*/
				if($scope.user.remember){
					$cookies.put('nickname', data.data.nickname, {expires: date});
					$cookies.put('token', data.headers("authorization"), {expires: date});
					// $cookies.put('permission', data.headers("x-role"), {expires: date});	

				}else{
					$cookieStore.put('nickname', data.data.nickname, {expires: date});
					$cookieStore.put('token', data.headers("authorization"), {expires: date});
					// $cookieStore.put('permission', data.headers("x-role"), {expires: date});

				}
				var stringShopName = '';
				if(data.data.place.name != undefined && data.data.place.name.length > 0){
					stringShopName =  data.data.place.name;
					if(data.data.place.logo != undefined && data.data.place.logo.length > 0){
						stringShopName += "|"+imageUrl+data.data.place.logo;
					}
					
				}
				$cookieStore.put('shop_name_logo',stringShopName);
				$cookieStore.put('place_address', data.data.place.address);

				var services = data.data.services.split(",");
				for(var i = 0; i < services.length; i++){
					if(window.location.origin != services[i])
						angular.element('body').append('<img src="'+services[i]+'/sso.php?token='+data.headers("authorization")+'&shop_name_logo='+stringShopName+'&place_address='+data.data.place.address+'" style="display:none;" />');
				}
				angular.element('body').append('<img src="'+config.apiUrl+'web/website-cookie?token='+data.headers("authorization")+'" style="display:none;" />');
				
				$state.go('index.dashboard');

			}else{
				toaster.pop({
					type: 'error',
					title: 'Error',
					body: data.data.msg,
		            timeout: 3000
				});
			}
		})
	}
	$scope.clear = function(){
		$scope.user.userName = "";
		$scope.user.passWord = "";
	}
}
function ForgotPasswordController($scope,mainService, config,toaster, $timeout,$state){
	$scope.forgotPassword = function(frm){
		var params = {};
		params['user'] = $scope.user;
		mainService.forGotPassword(params,function(data){
			if(data.success){
				toaster.pop({
					type: 'success',
					title: 'Success',
					body: 'Reset password success! You check email get password',
					timeout: 3000
				});
				$state.go('index.main');
			}else{
				toaster.pop({
					type: 'error',
					title: 'Error',
					body: data.msg,
					timeout: 3000
				});
			}
		});
	}
}