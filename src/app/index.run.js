(function() {
  'use strict';

  angular
    .module('googlemarker')
    // .constant('TIMEZONE', -(new Date().getTimezoneOffset()))
    // .constant('COUNTRY_CODE', {"AU":{"name":"Australia","code":"61"},"US":{"name":"United States","code":"1"},"VN":{"name":"Vietnam","code":"84"}})
    .run(runBlock);

  /** @ngInject */
	function runBlock($log,$rootScope, $cookieStore, $state, toasterConfig, $cookies, mainService) {
		// toasterConfig['position-class'] = "toast-top-center";
		// toasterConfig['close-button'] = true;
		// toasterConfig['time-out'] = 5000;
		
		$rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
			// $state.transitionTo("index.dashboard");
			/*end get permission*/
			/*if(toState.name === 'homepage.login' && $cookieStore.get("token") !== undefined){
				$state.transitionTo("index.dashboard");
				event.preventDefault();
			}
			else if(toState.name.indexOf('index.') !== -1 && $cookieStore.get("token") === undefined){
				// User isn’t authenticated
				$cookieStore.remove('token');
				// $cookieStore.remove('permission');
				$state.transitionTo("homepage.login");
				event.preventDefault();
			}*/
		});
		// window.onresize = function(event){
		// 	if($(".highchart-wrapper").length > 0){
  //           	$(".highchart-wrapper").highcharts().reflow();
  //           }
		// }
	}

})();
