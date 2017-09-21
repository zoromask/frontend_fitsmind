'use strict';

angular.module('googlemarker')
	.service('mainService', mainService)
	.service('apiBuilder', apiBuilder)

function mainService(toaster, $timeout, apiBuilder,$cookieStore,$state){
	
}
function apiBuilder($http, config, $cookieStore, $rootScope, $timeout){
	
}