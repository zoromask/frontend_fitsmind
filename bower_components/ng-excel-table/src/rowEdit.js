/*
* @Author: Duc Anh Nguyen
* @Email: anhnd@hacvntech.com
* @LinkedIn: https://www.linkedin.com/in/duc-anh-nguyen-31173552
* @Date:   2016-04-12 17:58:51
* @Last Modified by:   Duc Anh Nguyen
* @Last Modified time: 2016-04-21 14:19:04
*/

'use strict';

angular.module('xtable.rowEdit', ['isteven-multi-select'])
	.value('defaults', {
		editable: true
	})
    .filter('getCurrentEditRecord', function () {
        return function(obj, primaryKey, val) {
            for (var index in obj){
                if(obj[index][primaryKey] == val){
                    return obj[index];
                }
            }
        }
    })
    .filter('findType', function () {
        return function(val, type) {
            var objarr = [];  
            for (var index in val){
                if(val[index].type === type)
                    objarr.push(val[index]);
            }
            return objarr;
        }
    })
    .filter('mappingDataToList', function () {
        return function(list, mapping, keyMap) {
            for (var i in list){
                delete list[i]["ticked"];
            }
            if(mapping instanceof String){
                var valueArr = mapping.split(",");
                for(var k in valueArr){
                    for (var i in list){
                        if(list[i][keyMap] === valueArr[k])
                            list[i]["ticked"] = true;
                    }
                }
            }
            else{
                return "Invalid Format of List"
            }
            return list;
        }
    })
    .directive('rowEditing', function ($window, excelTableModel, $templateRequest, $compile, defaults, $filter, $http, $rootScope) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
            	scope.editable = defaults.editable;
                /* scope variables for datepicker */
                scope.picker = {};
                scope.datefield = {};
                /* scope variables for select box */
                scope.listIn = {};
                scope.listOut = {};
                scope.listCfg = {};

                /* filter model to get all model has type list */
                var allSelectBoxField = $filter('findType')(scope[attrs.model], "list");
                for(var k in allSelectBoxField){
                    scope.listCfg[allSelectBoxField[k].dataIndex] = {
                        btnDisplay: allSelectBoxField[k].btnDisplay,
                        itemDisplay: allSelectBoxField[k].itemDisplay,
                        valueDisplay: allSelectBoxField[k].valueDisplay,
                        multiSelect: allSelectBoxField[k].multiSelect ? "multiple" : "single"
                    }
                    scope.listIn[allSelectBoxField[k].dataIndex] = allSelectBoxField[k].store;
                    scope.listOut[allSelectBoxField[k].dataIndex] = {}
                }
                /* filter model to get all model has type date */
                var allDateField = $filter('findType')(scope[attrs.model], "date");
                for(var k in allDateField){
                    scope.picker[allDateField[k].dataIndex] = {
                        dateOptions: {
                            dateDisabled: function(date, mode) {
                                if(allDateField[k].disableWeekend){
                                    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
                                }
                                else{
                                    return false;
                                }
                            },
                            maxDate: allDateField[k].maxDate == undefined ? "" : allDateField[k].maxDate,
                            minDate: allDateField[k].minDate == undefined ? "" : allDateField[k].minDate,
                            startingDay: allDateField[k].startingDay == undefined ? 0 : allDateField[k].startingDay
                        },
                        opened: false
                    }
                }

            	$templateRequest("template/rowediting.html").then(function(html){
	            	scope.data = scope[attrs.data];
	            	scope.model = scope[attrs.model];

					var tpl = $compile(html)(scope);
					element.append(tpl);
				});
                scope.editRow = function(e){
                    element[0].querySelector('.ctrl-panel-wrapper').style.left = (element[0].offsetWidth/2 - 100) + element[0].scrollLeft + 'px';
                    var els = [];
                    while(e.target){
                        els.unshift(e.target);
                        if(e.target.matches('.tb-row.tb-cell')) {
                            break;
                        }
                        else if(!e.target.matches('.xtable')) {
                            e.target = e.target.parentNode;
                        }
                        else{
                            return false;
                        }
                    }
                    // if(e.target && e.target.matches('.row-'+(parseInt(e.target.dataset.index)+1))){
                    if(e.target && e.target.matches('.tb-row.tb-cell')){
                        scope.data = scope[attrs.data];
                        scope.model = scope[attrs.model];
                        /* store cell value in first column for reset position purpose after sorting */
                        scope.recordEditing = $filter('getCurrentEditRecord')(scope[attrs.data], attrs.primary, e.target.dataset.record);
                        $rootScope.$emit('rowEditing', scope.recordEditing);
                        /* get position of clicked row */
                        var parent = e.target;
                        while (parent) {
                            parent = parent.parentNode;
                            if(parent.className.indexOf("excel-table") != -1)
                                break;
                        }
                        var top = e.target.offsetTop,
                            left = parent.offsetLeft,
                            cellHeight = e.target.offsetHeight,
                            cellWidth = e.target.offsetWidth;

                        /* show form edit inline and calculate height of input */
                        var allCellInput = parent.parentNode.getElementsByClassName('cell-edit');

                        for(var i=0; i < allCellInput.length; i++){
                            allCellInput[i].style.width = cellWidth+'px';
                            switch(allCellInput[i].parentNode.dataset.type){
                                case "date":
                                    var tempValue = new Date(scope.recordEditing[allCellInput[i].parentNode.dataset.field]);
                                    if(tempValue instanceof Date && tempValue.toString().toLowerCase() != "invalid date")
                                        scope.datefield[allCellInput[i].parentNode.dataset.field] = $filter('date')(tempValue, allCellInput[i].parentNode.dataset.dateformat);
                                    else
                                        scope.datefield[allCellInput[i].parentNode.dataset.field] = $filter('date')(new Date(), allCellInput[i].parentNode.dataset.dateformat);
                                    break;
                                case "list":
                                    var listData = scope.listIn[allCellInput[i].parentNode.dataset.field];
                                    var mapping = new String(scope.recordEditing[allCellInput[i].parentNode.dataset.field]);
                                    var keyMap = scope.listCfg[allCellInput[i].parentNode.dataset.field].valueDisplay;
                                    scope.listIn[allCellInput[i].parentNode.dataset.field] = $filter('mappingDataToList')(listData, mapping, keyMap);
                                    break;
                                default:
                                    allCellInput[i].value = scope.recordEditing[allCellInput[i].parentNode.dataset.field];
                                    break;
                            }
                        }
                        scope.tableEl = parent.parentNode;
                        if(!scope[attrs.tblOption].forceFit){
                            var totalWidth = 0;
                            for(var m = 0; m < scope.model.length; m++){
                                totalWidth += parseFloat(scope.model[m].width);
                            }
                            scope.tableEl.querySelector('.row-edit-form').style.width = (totalWidth + 2) + 'px';
                        }
                        scope.tableEl.querySelector('.row-edit-form').style.display = "block";
                        scope.tableEl.querySelector('.row-edit-form').style.top = top+'px';
                        scope.tableEl.querySelector('.row-edit-form').style.left = left+'px';
                        scope.tableEl.querySelector('.row-edit-form').style.height = cellHeight+'px';
                        if(scope[attrs.tblOption].dblClickToEdit){        
                            scope.$apply();
                        }
                    }
                }
                if(scope[attrs.tblOption].dblClickToEdit){
                    element.on('dblclick', function(e){
                        scope.editRow(e);
                    });
                }
                else{
                    scope.$on('editRow', function(e, el){
                        scope.editRow(el);
                    })
                }
				/* watching data changed for reset position of form */
				scope.$watch(attrs.data, function(value) {
					if(scope.recordEditing != undefined){
						for(var i = 0; i < value.length; i++){
							if(value[i] === scope.recordEditing){
								var newIndexOfRecordEditing = i+1;
								break;
							}
						}
						if(newIndexOfRecordEditing != undefined){
							var newPos = scope.tableEl.querySelector('.tb-cell.row-'+newIndexOfRecordEditing).offsetTop;
							scope.tableEl.querySelector('.row-edit-form').style.top = newPos+'px';
						}
					}
				});
				scope.save = function(){
					var tableEl = scope.tableEl;
                	var allCellInput = tableEl.getElementsByClassName('cell-edit');
            		for(var i=0; i < allCellInput.length; i++){
            			var value = null;
            			switch(allCellInput[i].parentNode.dataset.type){
            				case "number":
            					value = Number(allCellInput[i].value.replace(/[., ]/gi, ""));
            					break;
            				case "string":
            					value = allCellInput[i].value.toString();
            					break;
                            case "date":
                                var tempValue = scope.datefield[allCellInput[i].parentNode.dataset.field];
                                if(tempValue instanceof Date){
                                    value = tempValue;
                                }
                                else
                                    value = "Invalid Date";
                                break;
                            case "list":
                                var tempValue = scope.listOut[allCellInput[i].parentNode.dataset.field];
                                var keyMap = scope.listCfg[allCellInput[i].parentNode.dataset.field].valueDisplay;
                                value = [];
                                for(var k in tempValue){
                                    value.push(tempValue[k][keyMap])
                                }
                                value = value.join();
                                break;
            				default:
            					break;
            			}
            			scope.recordEditing[allCellInput[i].parentNode.dataset.field] = value;
            		}
					scope.tableEl.querySelector('.row-edit-form').style.display = "none";
                    scope.saveUpdatedRecord();
				}
				scope.cancel = function(){
					scope.tableEl.querySelector('.row-edit-form').style.display = "none";
					scope.recordEditing = undefined;
                    $rootScope.$emit('rowEditing', undefined);
				}
                scope.saveUpdatedRecord = function(){
                    if(scope[attrs.tblOption].rud.update.type == 'remote'){
                        var httpOpts = {
                            url: scope[attrs.tblOption].rud.update.url,
                            method: scope[attrs.tblOption].rud.read.method,
                            withCredentials: scope[attrs.tblOption].rud.credentials == undefined ? false : scope.tableOption.rud.credentials,
                            header: scope[attrs.tblOption].rud.header
                        };
                        httpOpts['data'] = scope[attrs.tblOption].rud.update.data;
                        httpOpts['data'][scope[attrs.tblOption].rud.customScopeParams] = scope.recordEditing;

                        $http(httpOpts).then(function successCallback(response) {
                            scope.recordEditing = undefined;
                            $rootScope.$emit('rowEditing', undefined);
                            if(typeof(scope[attrs.tblOption].rud.update.fn.success) == "function"){
                                scope[attrs.tblOption].rud.update.fn.success(response);
                            }
                        }, function errorCallback(response) {
                            if(typeof(scope[attrs.tblOption].rud.update.fn.failure) == "function"){
                                scope[attrs.tblOption].rud.update.fn.failure(response);
                            }
                        });
                    }
                    else{
                        var record = scope.recordEditing;
                        if(typeof(scope[attrs.tblOption].rud.update.fn.success) == "function"){
                            scope[attrs.tblOption].rud.update.fn.success(record);
                        }
                        if(typeof(scope[attrs.tblOption].rud.update.fn.failure) == "function"){
                            scope[attrs.tblOption].rud.update.fn.failure(record);
                        }
                        scope.recordEditing = undefined;
                        $rootScope.$emit('rowEditing', undefined);
                    }
                }
                scope.openDatePicker = function(e, field){
                    e.preventDefault();
                    e.stopPropagation();
                    scope.picker[field].opened = true;
                }
            }
        };
    })
    .run(['$templateCache', function ($templateCache) {
        $templateCache.put("template/rowediting.html","<div class=\"excel-table row-edit-form\"><div class=\"tb-col\" ng-repeat=\"col in model\" style=\"width:{{col.width}}\"><div ng-if=\"col.editable == true || col.editable == undefined\" class=\"tb-cell\" data-field=\"{{col.dataIndex}}\" data-type=\"{{col.type}}\" data-dateformat=\"{{col.dateFormat}}\"><input class=\"cell-edit\" type=\"number\" ng-if=\"col.type == \'number\'\"> <input class=\"cell-edit\" type=\"text\" ng-if=\"col.type == \'string\'\"><isteven-multi-select class=\"cell-edit\" ng-if=\"col.type == \'list\'\" input-model=\"listIn[col.dataIndex]\" output-model=\"listOut[col.dataIndex]\" button-label=\"{{listCfg[col.dataIndex].btnDisplay}}\" item-label=\"{{listCfg[col.dataIndex].itemDisplay}}\" tick-property=\"ticked\" selection-mode=\"{{listCfg[col.dataIndex].multiSelect}}\"></isteven-multi-select><div class=\"cell-edit datepicker\" ng-if=\"col.type == \'date\'\"><input type=\"text\" class=\"form-control\" datepicker-popup=\"{{col.dateFormat}}\" ng-model=\"datefield[col.dataIndex]\" is-open=\"picker[col.dataIndex].opened\" min-date=\"picker[col.dataIndex].dateOptions.minDate\" max-date=\"picker[col.dataIndex].dateOptions.maxDate\" datepicker-options=\"picker[col.dataIndex].dateOptions\" date-disabled=\"picker[col.dataIndex].dateOptions.dateDisabled(date, mode)\" close-text=\"Close\"> <span class=\"input-group-btn\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"openDatePicker($event, col.dataIndex)\"><i class=\"glyphicon glyphicon-calendar\"></i></button></span></div></div><div ng-if=\"col.editable == false\" class=\"tb-cell\" data-field=\"{{col.dataIndex}}\" data-type=\"{{col.type}}\"><input class=\"cell-edit\" type=\"text\" disabled=\"\"></div></div><div class=\"ctrl-panel-container\"><div class=\"ctrl-panel-wrapper\"><span class=\"save\" ng-click=\"save()\">Save</span> <span class=\"cancel\" ng-click=\"cancel()\">Cancel</span></div></div></div>");
    }]);