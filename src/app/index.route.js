(function() {
	'use strict';

	angular
		.module('googlemarker')
		.config(routerConfig)
		

	/** @ngInject */
	function routerConfig($stateProvider, $urlRouterProvider, $breadcrumbProvider, $httpProvider) {
		/*$httpProvider.interceptors.push(['$q', '$location', '$cookieStore', '$rootScope', function ($q, $location, $cookieStore, $rootScope, mainService) {
			return {
				'request': function (config) {
				  config.headers = config.headers || {};
				  if ($cookieStore.get("token")) {
					  var token = $cookieStore.get("token");
					  config.headers.Authorization = token;
				  }
				  if(config.data != undefined && typeof config.data === 'object'){
					config.data.timezone = TIMEZONE;
				  }
					
				  return config;
				},
			   'response': function (response) {
					if (response.headers("authorization") != null) {
						var date = new Date();
						date.setDate(date.getDate()+7);
						$cookieStore.put('token', response.headers("authorization"), {expires: date});
					}
					if(response.headers('ROLE-MERCHANT') != null){
					  	$rootScope.role = [];
					  	var permission = angular.fromJson(response.headers("ROLE-MERCHANT"));
					  	angular.forEach(permission, function(value, key) {
					  		if(value.read == 1){
					  			$rootScope.role[key] = true;
					  		}
			   			});
					}
				 
				  	if (response.headers("user-group") != null) {
						var permission = angular.fromJson(response.headers("x-role"));
						$cookieStore.put('permission', response.headers("x-role"));
						for(var i = 0;i<permission.length;i++){
							var code = "code"+permission[i].code;
							$rootScope[code] = true;
						}
					}
				  
				  return response;
				},
			   'responseError': function (response) {
					if ($cookieStore.get("token") != undefined && (response.statusText == "token_invalid" || response.statusText == "Unauthorized")) {
					  alert('WARNING!!!\n\nSomeone just logged in your account!!!');
					  $cookieStore.remove("token");

					  // redirect to login page
					  $location.path('/login');
					}
					return $q.reject(response);
				}
			};
		}]);*/

		// $breadcrumbProvider.setOptions({
		// 	prefixStateName: 'index',
		// 	template: 'bootstrap3',
		// 	templateUrl: 'app/template/breadcrumb.html'
		// });
		$stateProvider
			.state('homepage', {
				abstract: true,
				url: "/homepage",
				templateUrl: "app/components/homepage/content.html"
			 })
			.state('homepage.login', {
				url: "/login",
				controller:LoginController,
				templateUrl: "app/components/homepage/login.html"
			})
			.state('homepage.forgotPassword', {
				url: "/forgot-password",
				controller:ForgotPasswordController,
				templateUrl: "app/components/homepage/forgot-password.html"
			})
			.state('index', {
				abstract: true,
				url: "/index",
				templateUrl: "app/components/common/content.html",
				resolve: {
				  loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
					 //  {
						// serie: true,
						// name: 'cgNotify',
						// files: ['../bower_components/angular-notify/angular-notify.min.css',
						// 	   '../bower_components/angular-notify/angular-notify.js']
					 //  },
					 //  {
		    //                 serie: true,
		    //                 files: ['../bower_components/datatables/datatables.min.js',
		    //                 '../bower_components/datatables/datatables.min.css'
		    //                 ]
		    //             },
		    //             {
		    //                 serie: true,
		    //                 name: 'datatables',
		    //                 files: ['../bower_components/angular-datatables/dist/angular-datatables.js'
		                    		
		    //                 ]
		    //             },
		    //             {
		    //                 serie: true,
		    //                 name: 'datatables.columnfilter',
		    //                 files: ['../bower_components/datatables/datatables.columnfilter.js',
		    //                 '../bower_components/angular-datatables/dist/plugins/columnfilter/angular-datatables.columnfilter.js']
		    //             },
		    //             {
		    //                 serie: true,
		    //                 name: 'datatables.buttons',
		    //                 files: ['../bower_components/datatables/angular-datatables.buttons.min.js']
		    //             }
					]);
				  }
				}
			})
			.state('index.main', {
				url: "/main",
				templateUrl: "app/main/main.html",
				data: { pageTitle: 'Example view' }
			})
			.state('index.dashboard', {
				url: "/dashboard",
				templateUrl: "app/dashboard/dashboard.html",
				controller: DashboardController,
				controllerAs: 'DashboardCtrl',
				data: { pageTitle: 'Example view' },
				resolve: {
				  loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([]);
				  }
				}
			});
			
			

		$urlRouterProvider.otherwise('/index/dashboard');
	}

})();

