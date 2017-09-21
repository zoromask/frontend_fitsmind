'use strict';

//Directive used to set metisMenu and minimalize button
angular.module('googlemarker')
    .directive('sideNavigation', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                // Call metsi to build when user signup
                scope.$watch('authentication.user', function() {
                    $timeout(function() {
                        element.metisMenu();
                    });
                });

            }
        };
    })
    .directive('minimalizaSidebar', function ($timeout) {
        return {
            restrict: 'A',
            template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
            controller: function ($scope) {
                $scope.minimalize = function () {
                    angular.element('body').toggleClass('mini-navbar');
                    if (!angular.element('body').hasClass('mini-navbar') || angular.element('body').hasClass('body-small')) {
                        // Hide menu in order to smoothly turn on when maximize menu
                        angular.element('#side-menu').hide();
                        // For smoothly turn on menu
                        $timeout(function () {
                            angular.element('#side-menu').fadeIn(400);
                        }, 200);
                        $timeout(function () {
                        	if($(".highchart-wrapper").length > 0){
                            	$(".highchart-wrapper").highcharts().reflow();
                            }
                        }, 500);
                    } else {
                        // Remove all inline style from jquery fadeIn function to reset menu state
                        angular.element('#side-menu').removeAttr('style');
                        $timeout(function () {
                        	if($(".highchart-wrapper").length > 0){
                            	$(".highchart-wrapper").highcharts().reflow();
                            }
                        }, 500);
                    }
                };
            }
        };
    })
    //upload image
    .directive('ngThumb', ['$window', function($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function(scope, element, attributes) {
                if (!helper.support) return;

                var params = scope.$eval(attributes.ngThumb);

                if (!helper.isFile(params.file)) return;
                if (!helper.isImage(params.file)) return;

                var canvas = element.find('canvas');
                var reader = new FileReader();

                reader.onload = onLoadFile;
                reader.readAsDataURL(params.file);

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var width = params.width || this.width / this.height * params.height;
                    var height = params.height || this.height / this.width * params.width;
                    canvas.attr({ width: width, height: height });
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                }
            }
        };
    }])
    //selected service
    .directive('itemService', function ($timeout){
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.on('click', function(e){
                    if(angular.element(element).hasClass('selected'))
                        angular.element(element).removeClass('selected');
                    else
                        angular.element(element).addClass('selected');
                });
            }
        };
    })
    // focus to first invalid field
    .directive('customSubmit' , function(){
        return {
            restrict: 'A',
            link: function( scope , element , attributes )
            {
                var $element = angular.element(element);
                // Add novalidate to the form element.
                attributes.$set( 'novalidate' , 'novalidate' );
                $element.bind( 'submit' , function( e ) {
                    e.preventDefault();
                    // Remove the class pristine from all form elements.
                    $element.find( '.ng-pristine' ).removeClass( 'ng-pristine' );
                    
                    // Get the form object.
                    var form = scope[ attributes.name ];
                    
                    // Set all the fields to dirty and apply the changes on the scope so that
                    // validation errors are shown on submit only.
                    angular.forEach( form , function( formElement , fieldName ) {
                        // If the fieldname starts with a '$' sign, it means it's an Angular
                        // property or function. Skip those items.
                        if ( fieldName[0] === '$' ) return;
                        
                        formElement.$pristine = false;
                        formElement.$dirty = true;
                    });
                    
                    // Do not continue if the form is invalid.
                    if ( form.$invalid ) {
                        // Focus on the first field that is invalid.
                        if($element.find( '.ng-invalid' ).first()[0] == undefined)
                            return;
                        var style = $element.find( '.ng-invalid' ).first()[0].getAttribute("style");
                        if(style == null || style != 'display:none'){
                            //$element.find( '.ng-invalid' ).first().blur();
                            //console.log($element.find( ':focus' ));
                            var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
                            if(isSafari){
                                $('html, body').animate({
                                    scrollTop: $element.find( '.ng-invalid' ).first().offset().top - 100
                                }, 2000, function(){
                                    $element.find( '.ng-invalid' ).first().focus();
                                });
                            }else{
                                $element.find( '.ng-invalid' ).first().focus();
                            }
                            
                            // $element.find( '.ng-invalid' ).first().focus();
                            //$element.find( '.ng-invalid' ).first().$setTouched();
                            //console.log($element.find( '.ng-invalid' ).first());
                            // $timeout(function() {
                            //     //element.metisMenu();
                            //     $element.find( '.ng-invalid' ).first().focus();
                            // },500);
                            //console.log($element.find( '.ng-invalid' ).first().click());
                        }else{
                            //display:none
                            //console.log($element.find( '#div_exclusivity' ).find( 'button' ));
                            $element.find( '#div_exclusivity' ).find( 'button' ).trigger('click');
                        }
                        return false;
                    }
                    // From this point and below, we can assume that the form is valid.
                    scope.$eval( attributes.customSubmit );
                    scope.$apply();
                });
            }
        };
    })
    .directive("summerNote", function(){
        return {
            restrict : 'A',
            link: function (scope, el, attr) {
                el.summernote({
                    height: 300,        // set editor height
                    minHeight: null,    // set minimum height of editor
                    maxHeight: null,    // set maximum height of editor
                    focus: false        // set focus to editable area after initializing summernote
                });
            }
        };
    })
    .directive('starRating', function () {
        return {
            restrict: 'A',
            template: '<ul class="rating">' +
                '<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' +
                '\u2605' +
                '</li>' +
                '</ul>',
            scope: {
                ratingValue: '=',
                max: '=',
                onRatingSelected: '&'
            },
            link: function (scope, elem, attrs) {

                var updateStars = function () {

                    scope.stars = [];
                    for (var i = 0; i < scope.max; i++) {
                        
                        console.log
                        scope.stars.push({
                            filled: i < scope.ratingValue
                        });
                        console.log(i+1); 
                    }
                };

                scope.toggle = function (index) {
                    scope.ratingValue = index + 1;
                    scope.onRatingSelected({
                        rating: index + 1
                    });
                };

                scope.$watch('ratingValue', function (oldVal, newVal) {
                    if (newVal) {
                        updateStars();
                    }
                });
            }
        }
    })
    .directive('mobiScroll', function (){
        return {
            restrict: 'E',
            scope: {
                options: '=',
                dpVal: '=',
                dpOpts: '='
            },
            transclude: true,
            templateUrl: 'app/template/mobiscroll.html',
            replace: true,
            link: function(scope, element, attrs) {
                scope.type = attrs.type;
                scope.isRequired = attrs.require
                scope.trigger = function(e){
                    angular.element(e.currentTarget).prev().trigger('click');
                }
                var mobiInstance = null;
                switch(attrs.type){
                    case "date":
                        mobiInstance = element.children('.datepicker').mobiscroll().date({
                            display: 'bottom',
                            lang: 'en',
                            mode: 'mixed',
                            dateFormat: 'mm-dd-yy',
                            onBeforeShow: function (inst) {
                                inst.setVal(moment(scope.dpVal, "MM-DD-YYYY").toDate());
                            }
                        });
                        break;
                    case "time":
                        mobiInstance = element.children('.datepicker').mobiscroll().time({
                            display: 'bottom',
                            lang: 'en',
                            mode: 'mixed',
                            timeFormat: 'HH:ii',
                            timeWheels: 'HHii',
                            onBeforeShow: function (inst) {
                                inst.setVal(moment(scope.dpVal, "HH:mm").toDate());
                            }
                        });
                        break;
                    case "month":
                        mobiInstance = element.children('.datepicker').mobiscroll().date({
                            display: 'bottom',
                            lang: 'en',
                            mode: 'mixed',
                            dateOrder: 'MMyyyy',
                            dateFormat: 'mm-yy',
                            showLabel : true,
                            onBeforeShow: function (inst) {
                                inst.setVal(moment(scope.dpVal, "MM-YYYY").toDate());
                            }
                        });
                        break;
                    case "custom":
                        mobiInstance = element.children('.datepicker').mobiscroll().scroller(scope.options);
                        break;
                    default:
                        mobiInstance = element.children('.datepicker').mobiscroll().datetime({
                            display: 'bottom',
                            lang: 'en',
                            mode: 'mixed',
                            // dateOrder: 'ddMMyyyy',
                            dateFormat: 'mm-dd-yyyy',
                            timeFormat: 'HH:ii',
                            timeWheels: 'HHii',
                            showLabel : true,
                            onBeforeShow: function (inst) {
                                inst.setVal(moment(scope.dpVal, "MM-DD-YYYY HH:mm").toDate());
                            }/*,
                            onSelect : function (valueText,inst) {
                                scope.closedFunction({value:valueText,id:idMobileScroll,inst:inst});
                            }*/
                        });
                        break;
                }
                if(scope.dpOpts != undefined){
                    mobiInstance.mobiscroll('option', scope.dpOpts);
                }
            }
        };
    })
    .directive('uploadfile', function () {
        return {
            restrict: 'A',
            link: function(scope, element) {
                element.bind('click', function(e) {
                    element.next().trigger('click');
                });
            }
        }
    })
    .directive('validNumber', function() {
      return {
        require: '?ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
          if(!ngModelCtrl) {
            return; 
          }

          ngModelCtrl.$parsers.push(function(val) {
            if (angular.isUndefined(val)) {
                var val = '';
            }
            
            var clean = val.replace(/[^-0-9\.]/g, '');
            var negativeCheck = clean.split('-');
            var decimalCheck = clean.split('.');
            if(!angular.isUndefined(negativeCheck[1])) {
                negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                clean =negativeCheck[0] + '-' + negativeCheck[1];
                if(negativeCheck[0].length > 0) {
                    clean =negativeCheck[0];
                }
                
            }
              
            if(!angular.isUndefined(decimalCheck[1])) {
                decimalCheck[1] = decimalCheck[1].slice(0,2);
                clean =decimalCheck[0] + '.' + decimalCheck[1];
            }

            if (val !== clean) {
              ngModelCtrl.$setViewValue(clean);
              ngModelCtrl.$render();
            }
            return clean;
          });

          element.bind('keypress', function(event) {
            if(event.keyCode === 32) {
              event.preventDefault();
            }
          });
        }
      };
    })
    .directive('customValidation', function(){
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function (inputValue) {
                    if(attrs.validatetype === "number"){
                        var transformedInput = inputValue.replace(/[^0-9]/g, ''); 
                    }
                    else if(attrs.validatetype === "price"){
                        var transformedInput = inputValue.replace(/[^0-9,\.]/g, ''); 
                    }
                    else if(attrs.validatetype === "creditcard"){
                        element.bind("keydown", function (e) {
                            // Allow: backspace, delete, tab, escape, enter
                            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
                                 // Allow: Ctrl+A, Command+A
                                (e.keyCode == 65 && ( e.ctrlKey === true || e.metaKey === true ) ) || 
                                 // Allow: home, end, left, right, down, up
                                (e.keyCode >= 35 && e.keyCode <= 40)) {
                                     // let it happen, don't do anything
                                     return;
                            }
                            // Ensure that it is a number and stop the keypress
                            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                e.preventDefault();
                            }
                        });
                        var transformedInput = inputValue.replace(/[^0-9]/g, '').replace(/(\d{4}(?!\s))/g, '$1 '); 
                    }
                    else if(attrs.validatetype === "text-symbol"){
                        var transformedInput = inputValue.replace(/[^a-zA-Z0-9]/g, ''); 
                    }
                    else if(attrs.validatetype === "emailphone"){
                        var transformedInput = inputValue.replace(/[^a-z@.0-9]/g, ''); 
                    }
                    else if(attrs.validatetype === "email"){
                        var transformedInput = inputValue.replace(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i, ''); 
                    }
                    else if(attrs.validatetype === "month"){
                        var transformedInput = inputValue.replace(/[^0-9]/g, '');
                    }
                    else{
                        var transformedInput = inputValue;
                    }
                    if(transformedInput.length > parseInt(attrs.validatelen))
                        transformedInput = transformedInput.substr(0,parseInt(attrs.validatelen));
                    if(attrs.validatemin != undefined && parseInt(transformedInput) < parseInt(attrs.validatemin))
                        transformedInput = attrs.validatemin;
                    if(attrs.validatemax != undefined && parseInt(transformedInput) > parseInt(attrs.validatemax))
                        transformedInput = attrs.validatemax;
                    if (transformedInput!=inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }         
                    return transformedInput;         
                });
            }
        };
    })
    .directive('ngHighchart', function () {
		return {
			restrict: 'A',
			transclude: true,
			scope: {
				options: '=',
				chart: '='
			},
			link: function (scope, element) {
				if(window.Highcharts != undefined){
                    if(scope.options != undefined)
					   scope.chart = Highcharts.chart(element[0], scope.options);
				}
				else
					console.log("No Highchart Library");
			}
		};
    })
    .directive('back', ['$window', function($window) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                // console.log(elem.text())
                elem.bind('click', function () {
                    $window.history.back();
                });
            }
        };
    }])
    .filter('customerGender', function(){
        return function(gender){
            if(gender == 1){
                return 'Male';       
            }
            if(gender == 2){
                return 'Female';       
            }
            if(gender == 3){
                return 'Children';       
            }
        }
    })
    .filter('customerType', function(){
        return function(type){
            if(type == 1){
                return 'Vip';
            }
            if(type == 2){
                return 'Royal';
            }
        }
    })
    .filter('formatPhoneNumber', function(){
        return function(tel){
            var value = tel.toString().trim().replace(/^\+/, '');
            if (value.match(/[^0-9]/)) {
                return tel;
            }
            var country, city, number;
            country = 1;
            city = value.slice(0, 3);
            number = value.slice(3);
            if (country == 1) {
                country = "";
            }
            number = number.slice(0, 3) + '-' + number.slice(3);
            return (country + " (" + city + ") " + number).trim();
        }
    })
    .filter('ceil', function() {
        return function(input) {
            return Math.ceil(input);
        };
    })
    .filter('hourConvert', function(){
        return function(item){
            var hour = item;
            if(item <= "12"){
                hour = ("0"+item.toString()).slice(-2)+":00 AM";
            }else{
                if(parseInt(item) > 12){
                    item -= 12;
                }
                if(item != undefined)
                    hour = ("0"+item.toString()).slice(-2)+":00 PM";
            }
            return hour;
        }
    });
    

