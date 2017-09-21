/*
* @Author: Duc Anh Nguyen
* @Email: anhnd@hacvntech.com
* @LinkedIn: https://www.linkedin.com/in/duc-anh-nguyen-31173552
* @Date:   2016-04-11 19:00:54
* @Last Modified by:   Duc Anh Nguyen
* @Last Modified time: 2016-05-05 12:42:49
*/

'use strict';

angular.module('excel-table', ['ui.bootstrap'])
    .factory('excelTableModel', function() {
        var dataModel = null,
            model = null,
            predicate = null,
            reverse = null;
        return {
            setDataModel: function(data){
                dataModel = data;
            },
            getDataModel: function(){
                return dataModel;
            },
            setModel: function(model){
                model = model;
            },
            getModel: function(){
                return model;
            },
            setPredicate: function(predicate){
                predicate = predicate;
            },
            getPredicate: function(){
                return predicate;
            },
            setReverse: function(reverse){
                reverse = reverse;
            },
            getReverse: function(){
                return reverse;
            }
        };
    })
    .filter('startFrom', function () {
        return function (input, start) {
            if (input) {
                start = +start;
                return input.slice(start);
            }
            return [];
        };
    })
    .directive('tbCell', function ($window, excelTableModel, $timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                /* watch height changes of element for re-calculate all same class element */
                scope.$watch(
                    function () { return element.height(); },
                    function (newValue, oldValue) {
                        $timeout(function () {
                            if(element.attr('class').indexOf('tb-row tb-cell row-') != -1 && element.attr('class').indexOf('tb-row tb-cell row-{{$index+1}}-{{tableId}}') == -1){
                                var elms = document.getElementsByClassName(element.attr('class'));
                                var maxHeight = 0;
                                for(var i = 0; i < elms.length; i++){
                                    if(maxHeight < elms[i].offsetHeight){
                                        maxHeight = elms[i].offsetHeight;
                                    }
                                }
                                for(var i = 0; i < elms.length; i++){
                                    if(elms[i] != element[0]){
                                        elms[i].style.height = maxHeight+'px';
                                    }
                                }
                            }
                            if(element.attr('class').indexOf('table-header-container') != -1){
                                var elms = document.getElementsByClassName(element.attr('class'));
                                var maxHeight = 0;
                                for(var i = 0; i < elms.length; i++){
                                    if(maxHeight < elms[i].offsetHeight){
                                        maxHeight = elms[i].offsetHeight;
                                    }
                                }
                                for(var i = 0; i < elms.length; i++){
                                    if(elms[i] != element[0]){
                                        elms[i].style.height = maxHeight+'px';
                                    }
                                }
                            }
                        });
                    }
                );
                element.on('mouseover', function () {
                    if(attrs.class.indexOf('row-') != -1){
	                    var elms = document.getElementsByClassName(attrs.class);
						var n = elms.length;
						for(var i = 0; i < n; i ++) {
						    elms[i].className += " row-hover";
						}
                    }
                });
                element.on('mouseout', function () {
                    if(attrs.class.indexOf('row-') != -1){
	                    var elms = document.getElementsByClassName(attrs.class);
						var n = elms.length;
						for(var i = 0; i < n; i ++) {
						    elms[i].className = elms[i].className.replace(" row-hover", "");
						}
                    }
                });
                scope.editRow = function(e){
                    scope.$emit('editRow', e);
                }
                element.on('click', function() {
                    if(element[0].className.indexOf('sortable') != -1){
                        if(scope.recordEditing != undefined){
                            // alert("Cannot sort column while editing");
                            return false;
                        }
                        var isAscending = true;
                        var elms = document.getElementsByClassName('sortable');
                        var icon = element[0].querySelector('.fa');
                        // var field = element[0].className.substring(element[0].className.indexOf("col-")+4, element[0].className.indexOf(" ng-class"));
                        var field = attrs.column;
                        if(icon == undefined)
                            return false;

                        for(var i = 0; i < elms.length; i++){
                            elms[i].className = elms[i].className.replace(" active", "");
                        }
                        element[0].className += ' active';

                        if(icon.className.indexOf('desc') == -1){
                            icon.className = icon.className.replace('asc','desc');
                            isAscending = false;
                        }
                        else{
                            icon.className = icon.className.replace('desc','asc');
                            isAscending = true;
                        }
                        /* call order function */
                        scope.order(field, isAscending);
                    }
                });
            }
        };
    })
    .directive('compileHtml', ['$compile', function ($compile) {
        return function(scope, element, attrs) {
            scope.$watch(
                function(scope) {
                    // watch the 'compile' expression for changes
                    return scope.$eval(attrs.compileHtml);
                },
                function(value) {
                    // when the 'compile' expression changes
                    // assign it into the current DOM
                    element.html(value);

                    // compile the new DOM and link it to the current
                    // scope.
                    // NOTE: we only compile .childNodes so that
                    // we don't get into infinite loop compiling ourselves
                    $compile(element.contents())(scope);
                }
            );
        };
    }])
    .directive('excelTable', function ($compile, $filter, excelTableModel, $http, $rootScope) {
        return {
            scope: {
	            model:'=model',
                data:'=data',
                tableOption:'=tblOption',
                controller: '=controller'
	        },
            restrict: 'E',
            // templateUrl: 'template/table.html',
            templateUrl: function(elem,attrs) {
                return attrs.templateUrl || 'template/table.html'
            },
            link: function (scope, element, attrs) {
                scope.order = function(predicate, isAscending) {
                    if(scope.tableOption.rud.read.type == "remote"){
                        /* remote sorting */
                        scope.predicate = predicate;
                        scope.dataParams['sort'] = {
                            predicate: predicate,
                            order: isAscending ? 'ASC' : 'DESC'
                        };
                        scope.getRecords();
                    }
                    else{
                        /* local sorting */
                        scope.predicate = predicate;
                        scope.data = $filter('orderBy')(scope.data, predicate, !isAscending);
                        scope.$apply();
                    }
                };
                scope.getRecords = function(dataParams){
                    if(scope.tableOption.rud.read != undefined){
                        if(dataParams != undefined)
                            scope.tableOption.rud.read.data = angular.extend(scope.tableOption.rud.read.data, dataParams);
                        var httpOpts = {
                            url: scope.tableOption.rud.read.url,
                            method: scope.tableOption.rud.read.method,
                            withCredentials: scope.tableOption.rud.credentials == undefined ? false : scope.tableOption.rud.credentials,
                            header: scope.tableOption.rud.header
                        };
                        if(scope.tableOption.rud.read.type == 'remote'){
                            httpOpts['data'] = scope.tableOption.rud.read.data;
                            /* merge custom request data with default request data before send */
                            if(httpOpts['data'][scope.tableOption.rud.customScopeParams] != undefined){
                                Object.keys(scope.dataParams).map(function(key, index){
                                    if(httpOpts['data'][scope.tableOption.rud.customScopeParams][key] != undefined)
                                        httpOpts['data'][scope.tableOption.rud.customScopeParams][key] = scope.dataParams[key];
                                });
                            }
                            else{
                                httpOpts['data'][scope.tableOption.rud.customScopeParams] = scope.dataParams;
                            }
                        }
                        $http(httpOpts).then(function successCallback(response) {
                            scope.data = response.data.data;
                            if(scope.tableOption.allowPaging){
                                scope.paging.totalItems = response.data.total;
                            }
                            if(typeof(scope.tableOption.rud.read.fn.success) == "function"){
                                scope.tableOption.rud.read.fn.success(response);
                            }
                        }, function errorCallback(response) {
                            if(typeof(scope.tableOption.rud.read.fn.success) == "function"){
                                scope.tableOption.rud.read.fn.failure(response);
                            }
                        });
                    }
                };
                scope.recursiveGroupHeader = function(model){
                    var o = model.items,
                        total = 0;
                    for(var m = 0; m < o.length; m++){
                        if(o[m].items != undefined){
                            total += scope.recursiveGroupHeader(o[m]);
                        }
                        else{
                            total += o[m].width;
                        }
                    }
                    model.width = total;
                    return total;
                }
                scope.recursiveModelGroupHeader = function(model, totalWidth, level){
                    var o = model.items;
                    for(var m = 0; m < o.length; m++){
                        if(o[m].items != undefined){
                            scope.recursiveModelGroupHeader(o[m], totalWidth, level + 1);
                        }
                        else{
                            if(scope.tableOption.forceFit){
                                o[m].width = ((o[m].width/model.width) * 100) + '%';
                            }
                            else{
                                o[m].width = o[m].width - (m == o.length-1 ? level+1 : 0) + 'px';   
                            }
                        }
                    }
                    if(scope.tableOption.forceFit){
                        model.width = ((model.width/totalWidth) * 100) + '%';
                    } else {
                        model.width = model.width - 1 + 'px';
                    }
                }
                $rootScope.$on('rowEditing', function(event, data) {
                    scope.recordEditing = data
                });
                scope.bindKeyDownEvent = function($e, data){
                    if($e.keyCode == 27){
                        scope.cellFilter[data] = "";
                    }
                }
                scope.controller.getRecords = scope.getRecords;
                scope.controller.initTable = function(){
                    if(scope.model == undefined)
                        return;
                    scope.tableId = 'xtable-'+attrs.id;
                    scope.cellFilter = {};
                    scope.dataParams = {
                        start: 0,
                        length: 0,
                        sort: {
                            predicate: "",
                            order: "ASC"
                        },
                        search: {}
                    };
                    scope.totalWidth = '100%';
                    scope.tblDefaultOptions = {
                        type: 'local',
                        forceFit: true, // true: column fit table, false: column has actual size
                        allowPaging: false,
                        allowFilter: false,
                        dblClickToEdit: true,
                        rud: {
                            customScopeParams: undefined,
                            read: undefined,
                            update: undefined
                        },
                        pagingOption: undefined
                    };
                    
                    Object.keys(scope.tblDefaultOptions).map(function(key, index){
                        if(scope.tableOption != undefined)
                            scope.tblDefaultOptions[key] = scope.tableOption[key];
                    });
                    /* re-assign default option after merge user options and default options */
                    scope.tableOption = scope.tblDefaultOptions;

                    /* event scroll y-axis of page and set position of control-wrapper */
                    element.bind("scroll", function() {
                        this.querySelector('.ctrl-panel-wrapper').style.left = (this.offsetWidth/2 - 100) + this.scrollLeft + 'px';
                        // scope.$apply();
                    });
                    /* calculate column's width if forceFit = true */
                    var totalWidth = 0;
                    for(var m = 0; m < scope.model.length; m++){
                        if(scope.model[m].items != undefined){
                            totalWidth += scope.recursiveGroupHeader(scope.model[m]);
                        }
                        else{
                            if(!scope.tableOption.forceFit){
                                scope.model[m].width += 'px';
                            }
                            totalWidth += parseFloat(scope.model[m].width);
                        }
                    }
                    for(var m = 0; m < scope.model.length; m++){
                        if(scope.model[m].items != undefined){
                            scope.recursiveModelGroupHeader(scope.model[m], totalWidth, 0);
                        }
                        else if(scope.tableOption.forceFit){
                            scope.model[m].width = ((scope.model[m].width/totalWidth) * 100) + '%';
                        }
                    }
                    if(!scope.tableOption.forceFit){
                        scope.totalWidth = (totalWidth + 1) + 'px';
                        element.width(scope.totalWidth);
                    }
                    excelTableModel.setModel(scope.model);
                    excelTableModel.setDataModel(scope.data);
                    scope.primaryKey = attrs.primary;
                    if(scope.tableOption.allowPaging){
                        scope.paging = {
                            currentPage: 1,
                            totalItems: undefined,
                            pagingSize: undefined,
                            itemsPerPage: 5,
                            boundaryLinks: false,
                            boundaryLinkNumbers: false,
                            rotate: true,
                            directionLinks: true,
                            firstText: 'First',
                            previousText: 'Previous',
                            nextText: 'Next',
                            lastText: 'Last',
                            forceEllipses: false
                        };
                        Object.keys(scope.paging).map(function(key, index){
                            if(scope.tableOption.pagingOption[key] != undefined)
                                scope.paging[key] = scope.tableOption.pagingOption[key]
                        });
                        scope.dataParams['start'] = 0;
                        scope.dataParams['length'] = scope.paging.itemsPerPage;
                        scope.getRecords();
                        scope.pageChanged = function(){
                            /* get remote paging data */
                            if(scope.tableOption.rud.read.type == "remote"){
                                scope.dataParams.start = (scope.paging.currentPage - 1) * scope.paging.itemsPerPage;
                                scope.getRecords();
                            }
                        }
                        scope.updateTableData = function(){
                            if(scope.recordEditing != undefined){
                                // alert("Cannot paging while editing");
                                return false;
                            }
                            if(scope.tableOption.rud.read.type == "remote"){
                                scope.paging.currentPage = 1;
                                scope.dataParams.start = 0;
                                scope.dataParams.length = scope.paging.itemsPerPage;
                                scope.getRecords();
                            }
                        }
                    }
                    else{
                        scope.getRecords();
                    }
                    scope.$watch('cellFilter', function (newVal, oldVal) {
                        angular.forEach(scope.cellFilter, function(value, key){
                            if(value == "")
                                delete scope.cellFilter[key];
                        });
                        if(scope.tableOption.rud.read != undefined && scope.tableOption.rud.read.type == "remote"){
                            scope.paging.currentPage = 1;
                            scope.dataParams['search'] = newVal;
                            scope.getRecords();
                        }
                        else{
                            scope.filtered = $filter('filter')(scope.data, newVal);
                            if(scope.filtered != undefined && scope.paging != undefined){
                                scope.paging.totalItems = scope.filtered.length;
                                // scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
                                scope.currentPage = 1;
                            }
                        }
                    }, true);
                }
            }
        };
    })
    .run(['$templateCache', function ($templateCache) {
        $templateCache.put("template/table.html","<div class=\"excel-table\" style=\"width:{{totalWidth}}\"><div class=\"tb-col\" ng-repeat=\"col in model\" style=\"width:{{col.width}}\"><div tb-cell=\"\" class=\"table-header-container\"><div tb-cell=\"\" class=\"{{tableId}} tb-cell header\" data-column=\"{{col.dataIndex}}\" ng-class=\"{\'sortable\' : col.sortable, \'group-header\':col.items.length > 0, \'col-{{col.dataIndex}}\':col.items == undefined}\">{{col.title}} <span class=\"pull-right\" ng-if=\"col.sortable\"><i class=\"fa fa-sort-amount-asc\"></i></span></div><div class=\"group-header-item\"><div class=\"tb-col\" ng-repeat=\"col in col.items\" style=\"width:{{col.width}}\" ng-class=\"{\'first-group-header\' : $first, \'last-group-header\' : $last}\" ng-include=\"\'template/group_header.html\'\"></div></div></div><div ng-if=\"col.items == undefined\"><div ng-if=\"tableOption.allowFilter\" tb-cell=\"\" class=\"tb-cell cell-filter col-{{col.dataIndex}}\"><input ng-disabled=\"col.allowFilter == false || col.type == \'html\'\" class=\"form-control\" type=\"text\" ng-model=\"cellFilter[col.dataIndex]\"></div><div tb-cell=\"\" data-index=\"{{$index}}\" data-record=\"{{cell[primaryKey]}}\" class=\"tb-row tb-cell row-{{$index+1}}-{{tableId}}\" ng-repeat=\"cell in {true: (data | filter:cellFilter | startFrom:(paging.currentPage-1)*paging.itemsPerPage | limitTo:paging.itemsPerPage), false: (data | filter:cellFilter)}[tableOption.rud.read.type == \'local\'] track by $index\" ng-switch=\"col.type\"><span ng-switch-when=\"date\" ng-bind=\"cell[col.dataIndex] | date:col.dateFormat\"></span><span ng-switch-when=\"number\" ng-bind=\"cell[col.dataIndex] | number:col.fractionSize\"></span><span ng-switch-when=\"currency\" ng-bind=\"cell[col.dataIndex] | currency: col.symbol : col.fractionSize\"></span><span ng-switch-when=\"html\" compile-html=\"col.html\"></span> <span ng-switch-default=\"\" ng-bind=\"cell[col.dataIndex]\"></span></div></div><div ng-if=\"col.items != undefined\"><div class=\"tb-col\" ng-repeat=\"col in col.items\" style=\"width:{{col.width}}\" ng-include=\"\'template/group_columns.html\'\"></div></div></div></div><div class=\"table-control form-group\" ng-if=\"tableOption.allowPaging\"><uib-pagination class=\"pagination-sm right\" ng-model=\"paging.currentPage\" total-items=\"paging.totalItems\" max-size=\"paging.pagingSize\" items-per-page=\"paging.itemsPerPage\" boundary-links=\"paging.boundaryLinks\" boundary-link-numbers=\"paging.boundaryLinkNumbers\" rotate=\"paging.rotate\" direction-links=\"paging.directionLinks\" first-text=\"{{paging.firstText}}\" previous-text=\"{{paging.previousText}}\" next-text=\"{{paging.nextText}}\" last-text=\"{{paging.lastText}}\" force-ellipses=\"paging.forceEllipses\" ng-change=\"pageChanged()\" num-pages=\"numPages\"></uib-pagination><div class=\"pager-limitTo\"><label>Per page:</label> <input type=\"number\" class=\"form-control\" ng-model=\"paging.itemsPerPage\" min=\"1\" max=\"100\" step=\"1\" ng-change=\"updateTableData()\"> <label>{{paging.itemsPerPage > 1 ? \'records\' : \'record\'}}</label></div></div>");
        $templateCache.put("template/group_columns.html","<div style=\"width: 100%;\"><div ng-if=\"col.items == undefined\"><div ng-if=\"tableOption.allowFilter\" tb-cell=\"\" class=\"tb-cell cell-filter col-{{col.dataIndex}}\"><input ng-disabled=\"col.allowFilter == false || col.type == \'html\'\" class=\"form-control\" type=\"text\" ng-model=\"cellFilter[col.dataIndex]\"></div><div tb-cell=\"\" data-index=\"{{$index}}\" data-record=\"{{cell[primaryKey]}}\" class=\"tb-row tb-cell row-{{$index+1}}-{{tableId}}\" ng-repeat=\"cell in {true: (data | filter:cellFilter | startFrom:(paging.currentPage-1)*paging.itemsPerPage | limitTo:paging.itemsPerPage), false: (data | filter:cellFilter)}[tableOption.rud.read.type == \'local\'] track by $index\" ng-switch=\"col.type\"><span ng-switch-when=\"date\" ng-bind=\"cell[col.dataIndex] | date:col.dateFormat\"></span><span ng-switch-when=\"number\" ng-bind=\"cell[col.dataIndex] | number:col.fractionSize\"></span><span ng-switch-when=\"currency\" ng-bind=\"cell[col.dataIndex] | currency: col.symbol : col.fractionSize\"></span><span ng-switch-when=\"html\" compile-html=\"col.html\"></span> <span ng-switch-default=\"\" ng-bind=\"cell[col.dataIndex]\"></span></div></div><div ng-if=\"col.items != undefined\"><div class=\"tb-col\" ng-repeat=\"col in col.items\" style=\"width:{{col.width}}\" ng-include=\"\'template/group_columns.html\'\"></div></div></div>");
        $templateCache.put("template/group_header.html","<div style=\"width: 100%;\"><div tb-cell=\"\" class=\"{{tableId}} tb-cell header\" data-column=\"{{col.dataIndex}}\" ng-class=\"{\'sortable\' : col.sortable, \'group-header\':col.items.length > 0, \'col-{{col.dataIndex}}\':col.items == undefined}\">{{col.title}} <span class=\"pull-right\" ng-if=\"col.sortable\"><i class=\"fa fa-sort-amount-asc\"></i></span></div><div class=\"group-header-item\"><div class=\"tb-col\" ng-repeat=\"col in col.items\" style=\"width:{{col.width}}\" ng-class=\"{\'first-group-header\' : $first, \'last-group-header\' : $last}\" ng-include=\"\'template/group_header.html\'\"></div></div></div>");
    }]);