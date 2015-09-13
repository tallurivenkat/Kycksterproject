app.controller('ResultsController',    
		['$scope', '$filter', '$location', '$timeout', '$rootScope', '$state', '$stateParams', '$routeParams', 'JsonGetService', 'JsonPostService', 'Cache',
		 function ($scope, $filter, $location, $timeout, $rootScope, $state, $stateParams, $routeParams, JsonGetService, JsonPostService, Cache) {
			'use strict';
	   
			
			init();
			

			function init() {
				
				$scope.spinnerInProgress = false;
				
				if ($scope.srTabLabel === undefined) {
					
					if ($rootScope.lcmTeamIndicator)
				        $scope.srTabLabel = "Service Requests";
					else
						$scope.srTabLabel = "Site Requests";
			    }

				
	        	initializeScopeVariables();

				setupScopeMethods();
			
				populatePicklistValues();

				
				//invoke this function at the end of the call stack, effectively executing it after all DOM elements 
				//have been properly compiled and linked into place by Angular.
				
				$timeout(function () {
					// remove Flot Tooltip ...
					$("#flotTip").remove();
					//$("#tooltip").remove();

					$('.datepicker').datepicker();
					
					setupWatches();
					
	            }, 0, false);

			};  

			
			function setupWatches() {
			
				$rootScope.$watch('lcmTeamIndicator', function (newValue, oldValue) {
					console.log("newValue = " + newValue + ", oldValue = " + oldValue);
				
					// only need to reset the picklist dropdown values when there is a change in LCM Team Indicator
					
					if (oldValue !== newValue) {
				
						assignPickListsToScopeVariablesBasedOnUserRole();
						
					}
				});
				
				
				$scope.$watch('savedSearchesSelection', function (newValue, oldValue) {
					console.log("savedSearchesSelection watch fired:  newValue = " + newValue + ", oldValue = " + oldValue);
				
					// only need to reset the picklist dropdown values when there is a change in LCM Team Indicator
					
					if (oldValue !== newValue) {
						$scope.executeSavedSearch($scope.searchCriteria.selectedOrderType.name);
					}
				});
				
			}
			
			
			function clearScopeVariables() {
				
				$scope.orderSearch = { 
						serviceOrderId: '',
						orderAssociatedId: '',
						customerName: '',
						orderOwner: '',
						mcn: '',
						grc: '',					
						soc: '',						
						orderStartDate: '',
						orderEndDate: '',
						
						orderSiteNameCity: '',
						
						orderSiteAttribute: {},
						siteRegion: {},
						srSiteState: {},
						srSiteCountry: {},
						orderAssociatedIdType: {},
						orderMarketStrata: {},
						inJeopardy: {},
						productOffering: {},
						mcnTriplet: {},
						orderStatus: {},
						orderDateSelection: {}
				};
				
				$scope.srSearch = {
						
						serviceRequestId: '',
						srAssociatedId: '',
						customerName: '',
						orderOwner: '',
						mcn: '',
						grc: '',					
						soc: '',						
						srStartDate: '',
						srEndDate: '',
						
						srSiteNameCity: '',
						
						srSiteAttribute: {},
						siteRegion: {},
						srSiteState: {},
						srSiteCountry: {},
						srAssociatedIdType: {},
						srMarketStrata: {},
						inJeopardy: {},
						productOffering: {},
						mcnTriplet: {},
						srStatus: {},
						srDateSelection: {}
				};
				
				$scope.crSearch = { 
						
						customerRequestId: '',
						crAssociatedId: '',
						customerName: '',
						orderOwner: '',
						mcn: '',
						crStartDate: '',
						crEndDate: '',
						crAssociatedIdType: {},
						crMarketStrata: {},
						crStatus: {},
						crDateSelection: {}
	
				};
				
			}
			
			
			function initializeScopeVariables() {

				$scope.name = "Results";
	
				
				//We want to pull all of the search criteria from cache if available so the back/fwd buttons 
				//don't blow away previously selected criteria (like the refresh does)
			
				
				$scope.searchCriteria = Cache.get('searchcriteria') || {};
				
				if ( !$scope.searchCriteria.isCached ) {
					
					clearScopeVariables();
					
				} else {

					//Loading from cache
					$scope.orderSearch = $scope.searchCriteria.orderSearch;
					$scope.srSearch = $scope.searchCriteria.srSearch;
					$scope.crSearch = $scope.searchCriteria.crSearch; 
					
				}
				
    
				//Setup some scope vars for html switches.  These replace the datatable with 
				//an empty string or an error block

				$scope.resultsets =
				{
						'USRP': { searchRequestErrorMsg: null,	isCriteriaCollapsed: false,  resultData: {}},
						'SR'  : { searchRequestErrorMsg: null,	isCriteriaCollapsed: false,  resultData: {}},
						'CR'  : { searchRequestErrorMsg: null,	isCriteriaCollapsed: false,  resultData: {}}
				};
				
                // AngularJS will trigger the $destroy event on the scope when the controller is killed. This gives us a chance to cancel any
                // pending timer that we may have.
				
                $scope.$on( "$destroy", function( event ) {
                		cancelOutstandingSearchRequest();
                		
                		//Save search criteria to cache
                		$scope.searchCriteria.isCached = true;
                		$scope.searchCriteria.orderSearch = $scope.orderSearch;
                		$scope.searchCriteria.srSearch = $scope.srSearch;
                		$scope.searchCriteria.crSearch = $scope.crSearch;
                		Cache.put('searchcriteria', $scope.searchCriteria);
                    }
                );	
                
                
                //Setup container for map of saved searches for this user
                $scope.savedSearches = {};
				$scope.savedSearchesSelection = null;
                getSavedSearches();
                
                $scope.outstandingServiceRequest = null;
                
                //Setup error value that controls whether we've received a successful result from retreival of picklist values
                //which allows the search button to enable and requests to be made
                $scope.picklistError = null;

			};

			$scope.convertToUTC = function(dt) {
				if(dt!==undefined && dt!=="" && dt!==null){
		        var localDate = new Date(dt);
		        var localTime = localDate.getTime();
		        var localOffset = localDate.getTimezoneOffset() * 60000;
		        var datewithZone=new Date(localTime + localOffset);
		        var date=$filter('date')(datewithZone, "MM/dd/yyyy");
		        return date ;}
				else return "";
				
		    };

			function setupScopeMethods() {

				// for start date and end date
				setupDatePicker();

				// for ng-click functions ...

				//$scope.refresh = function() {
				//	getDashboardStateSummaryData ();
				//};

			
				$scope.search = function(searchOrderType) {
					//If there's an outstanding search request... the search button was actually labeled 'cancel' and 
					//the user wants to cancel it... So do just that, then get out.
					
					if ( cancelOutstandingSearchRequest() )
						return;

					//OK, actual search feature is desires so figure out what kind and do it
					
					console.log("search Type is ..........."+searchOrderType);
					console.log("$stateParams.searchOrderType = " + $state.params.searchOrderType);
					searchOrderType=$state.params.searchOrderType;
					if (searchOrderType === "USRP Sales Order") {
						//var value=$scope.orderSearch.lcm.name;
						//splitAttid(value);
						var postData= {  
								orderId: $scope.orderSearch.serviceOrderId,
								orderAssociatedIdType: $scope.orderSearch.orderAssociatedIdType.name,
								orderAssociatedId: $scope.orderSearch.orderAssociatedId,
								orderStatus: $scope.orderSearch.orderStatus.name,
								inJeopardy:$scope.orderSearch.inJeopardy.name,
		                        customerName:$scope.orderSearch.customerName,
		                        marketStrata:$scope.orderSearch.orderMarketStrata.name,
		                        productOffering:$scope.orderSearch.productOffering.name,
		                        
		                        mcnTripletType:$scope.orderSearch.mcnTripletType.name,
		                        mcn:$scope.orderSearch.mcn,
		                        grc:$scope.orderSearch.grc,
		                        soc:$scope.orderSearch.soc,
		              
		                        orderDateSelection:$scope.orderSearch.orderDateSelection.name,
		                        orderStartDate:$scope.convertToUTC(orderStartDate.value),
								orderEndDate:$scope.convertToUTC(orderEndDate.value),
		                        
								orderOwner:$scope.orderSearch.orderOwner,
								siteAttribute:$scope.orderSearch.orderSiteAttribute.name,
								siteRegion: ($scope.orderSearch.orderSiteAttribute.name == "Site Region" ? $scope.orderSearch.orderSiteRegion.name : ""),
								siteName: ($scope.orderSearch.orderSiteAttribute.name == "Site Name" ? $scope.orderSearch.orderSiteNameCity : ""),
								siteCity: ($scope.orderSearch.orderSiteAttribute.name == "Site City" ? $scope.orderSearch.orderSiteNameCity : ""),
								siteState:$scope.orderSearch.orderSiteState.name,
								siteCountry:$scope.orderSearch.orderSiteCountry.name,
								
								lcmTeamIndicator:$rootScope.lcmTeamIndicator
								
						};
						console.log("=============== USRP Search, postData = " + angular.toJson(postData));
						if(postData.orderId=="" && postData.orderAssociatedIdType=="" &&
								postData.orderAssociatedId=="" && postData.orderStatus=="" &&
								postData.customerName=="" && postData.inJeopardy=="" && postData.marketStrata=="" && 
								postData.mcn=="" && postData.grc==""  && postData.soc==""  &&
								postData.orderDateSelection=="" && postData.orderStartDate=="" &&	postData.orderEndDate=="" &&
								postData.orderOwner=="" && postData.siteAttribute=="" && postData.siteRegion=="" && 
								postData.siteName=="" && postData.siteCity=="" && 
								postData.siteState=="" && postData.siteCountry=="")
						{
							$("#searchCriteriaAlertModal").modal("show");
						}
						else
						{
							
							//Change condition so error message (if prior one) isn't displayed since we're starting a new search
							$scope.resultsets['USRP'].searchRequestErrorMsg = null;
							this.clearUSRPData();
							$scope.spinnerInProgress = true;
							$scope.outstandingSearchRequest = JsonPostService.getAdvancedUsrpOrderSearchResults(postData);
							
							//No need to handle failure case... jsonPostService formulates errors and resolves the same
							$scope.outstandingSearchRequest.promise.then(
									function(data) {
										processSearchResult(data, 'USRP');			//turns off spinner, kicks table into gear, ensures tab is open or closed
									});
						}
						
					}
					else if (searchOrderType === "NX-SR ID") {
						//var value=$scope.srSearch.lcm.name;
						//splitAttid(value);
						var postData= {
								serviceRequestId: $scope.srSearch.serviceRequestId,
								srAssociatedIdType: $scope.srSearch.srAssociatedIdType.name,
								srAssociatedId: $scope.srSearch.srAssociatedId,
								srStatus: $scope.srSearch.srStatus.name,
								inJeopardy:$scope.srSearch.inJeopardy.name,
		                        customerName:$scope.srSearch.customerName,
		                        marketStrata:$scope.srSearch.srMarketStrata.name,
		                        productOffering:$scope.srSearch.productOffering.name,
		                        
		                        mcnTripletType:$scope.srSearch.mcnTripletType.name,
		                        mcn:$scope.srSearch.mcn,
		                        grc:$scope.srSearch.grc,
		                        soc:$scope.srSearch.soc,
		              
		                        srDateSelection:$scope.srSearch.srDateSelection.name,
		                        srStartDate:$scope.convertToUTC(srStartDate.value),
								srEndDate:$scope.convertToUTC(srEndDate.value),
		                        
								orderOwner:$scope.srSearch.orderOwner,
								siteAttribute:$scope.srSearch.srSiteAttribute.name,
								siteRegion: ($scope.srSearch.srSiteAttribute.name == "Site Region" ? $scope.srSearch.srSiteRegion.name : ""),
								siteName: ($scope.srSearch.srSiteAttribute.name == "Site Name" ? $scope.srSearch.srSiteNameCity : ""),
								siteCity: ($scope.srSearch.srSiteAttribute.name == "Site City" ? $scope.srSearch.srSiteNameCity : ""),
								siteState:$scope.srSearch.srSiteState.name,
								siteCountry:$scope.srSearch.srSiteCountry.name,
								
								lcmTeamIndicator:$rootScope.lcmTeamIndicator
						
						};
						console.log("=============== SR Search, postData = " + angular.toJson(postData));

						if(postData.serviceRequestId=="" && postData.srAssociatedIdType=="" &&
								postData.srAssociatedId=="" && postData.srStatus=="" &&
								postData.customerName=="" && postData.inJeopardy=="" && postData.marketStrata=="" && 
								postData.mcn=="" && postData.grc==""  && postData.soc==""  && postData.mcnTripletType=="" &&
								postData.srDateSelection=="" && postData.srStartDate=="" &&	postData.srEndDate=="" &&
							    postData.orderOwner=="" && postData.siteAttribute=="" && postData.siteRegion=="" && 
								postData.siteName=="" && postData.siteCity=="" && 
								postData.siteState=="" && postData.siteCountry=="")
							
						{
							$("#searchCriteriaAlertModal").modal("show");
						}
						else
						{
							
							//Change condition so error message (if prior one) isn't displayed since we're starting a new search
							$scope.resultsets['SR'].searchRequestErrorMsg = null;
							this.clearSRCriteria();
							$scope.spinnerInProgress = true;
							$scope.outstandingSearchRequest = JsonPostService.getAdvancedSrSearchResults(postData);
							
							//No need to handle failure case... jsonPostService formulates errors and resolves the same
							$scope.outstandingSearchRequest.promise.then(function(data) {
								processSearchResult(data, 'SR');
							});
						}
					}
					else if (searchOrderType === "NX-CR ID") {
						//var value=$scope.crSearch.lcm.name;
						//splitAttid(value);
						var postData= { 
								customerRequestId: $scope.crSearch.customerRequestId,
								crAssociatedIdType: $scope.crSearch.crAssociatedIdType.name,
								crAssociatedId: $scope.crSearch.crAssociatedId,
								crStatus:$scope.crSearch.crStatus.name,
								customerName:$scope.crSearch.customerName,
								orderOwner:$scope.crSearch.orderOwner,
								marketStrata:$scope.crSearch.crMarketStrata.name,
								mcn:$scope.crSearch.mcn,
								crDateSelection:$scope.crSearch.crDateSelection.name,
								crStartDate:$scope.convertToUTC(crStartDate.value),
								crEndDate:$scope.convertToUTC(crEndDate.value),
								
								lcmTeamIndicator:$rootScope.lcmTeamIndicator
						};

						console.log("===============CR Search, postData = " + angular.toJson(postData));

						if(postData.customerRequestId=="" &&  postData.crAssociatedIdType=="" && 
								postData.crAssociatedId=="" && postData.crStatus=="" &&
								postData.customerName=="" && postData.orderOwner=="" &&
								postData.marketStrata=="" && 
								postData.mcn=="" && postData.crDateSelection=="" &&
								postData.crStartDate=="" && postData.crEndDate=="" )
						{
							$("#searchCriteriaAlertModal").modal("show");
						}
						else
						{	
							
							//Change condition so error message (if prior one) isn't displayed since we're starting a new search
							$scope.resultsets['CR'].searchRequestErrorMsg = null;
							this.clearCRCriteria();
							$scope.spinnerInProgress = true;
							$scope.outstandingSearchRequest = JsonPostService.getAdvancedCrSearchResults(postData);
							
							//No need to handle failure case... jsonPostService formulates errors and resolves the same
							$scope.outstandingSearchRequest.promise.then(function(data) {

								processSearchResult(data, 'CR');
							});
							
						}
					}
				};

				
				//This method is called from HTML in each tab content when it is first created in the DOM by switching to 
				//a tab.  It works for all tabs since the type can be 'USRP', 'CR' or 'SR'
				//Returns true if the toggle arrow should be shown at all...
				//It should be shown if there is an error message or the data table exists whether it has data or not
				
				$scope.shouldCollapserBeVisible = function(type) {
					return ($scope.resultsets[type].searchRequestErrorMsg == undefined || $scope.resultsets[type].searchRequestErrorMsg != null) &&
							$scope.resultsets[type].resultData.API.isTableExist();
				};
				
				
				$scope.clearUSRPData = function() {
					$scope.wrongOrderStartDateEntered = false;
					$scope.wrongOrderEndDateEntered = false;
					
					cancelOutstandingSearchRequest();
				};

				$scope.clearSRCriteria = function() {

					$scope.wrongSrStartDateEntered = false;
					$scope.wrongSrEndDateEntered = false;
	
					cancelOutstandingSearchRequest();
				};


				$scope.clearCRCriteria = function() {
					$scope.wrongCrStartDateEntered = false;
					$scope.wrongCrEndDateEntered = false;
					
					cancelOutstandingSearchRequest();
				};




				$scope.getDetailsResult = function(orderType, id)
				{
					console.log("[Details Results] orderType = " + orderType + ", id = " + id);

					$state.transitionTo('details', {orderType: orderType, id: id});

				};
				
				
				$scope.toggleSavedSearchPanel = function() {
					var switcherPanel = $('#flyoutpanel-inner');
					if(switcherPanel.hasClass('open')) {
						switcherPanel.hide(300);
						switcherPanel.removeClass('open');
					} else {
						switcherPanel.show(300);
						switcherPanel.addClass('open');
					}
				};

				
				//User has selected a saved search... load the search criteria into the fields and kick off a search
				$scope.executeSavedSearch = function(searchOrderType) {
					if ( $scope.savedSearchesSelection && $scope.savedSearchesSelection != null ) {
						console.log("Executing saved search:  " + $scope.savedSearchesSelection.name);
						
						loadCriteriaFromSaved($scope.savedSearchesSelection);
						
						//Cheat a bit here and only call the collapser if we came from the slide out panel...
						//which will go away once we choose which method we're doing
						if ( $('#flyoutpanel-inner').hasClass('open') )
							$scope.toggleSavedSearchPanel();
						
						$scope.search(searchOrderType);
					}
				}
			}
			
			
			function loadCriteriaFromSaved( savedSearch ) {
				$scope.orderSearch.orderStatus = $scope.orderStatusList[0];
			}
			
			
		    function getSavedSearches() {

		    	$scope.savedSearchRetrievalError = null;

		        var promise = JsonGetService.getSavedSearchesForUser($rootScope.attUid);

		 	    promise.then(function(data) {
		 			
		            console.log("just retrieved saved searches for user => " + angular.toJson(data));
		            
		            //Map with USRP, CR, SR as keys to arrays of saved searches
		    		$scope.savedSearches = data.savedSearches;
		            $scope.spinnerInProgress = false;
		            
				}, function(reason) {
					
					//WS call failed for some reason... This is not recoverable until the use reloads the page
					//Most likely the reason is HTML... 
					$scope.spinnerInProgress = false;
					$scope.savedSearchRetrievalError = reason.errorMsg;
					$scope.savedSearchRetrievalErrorHtml = reason.errorHtml;
		      	  
				});
		    };

		    
		
			
			function assignPickListsToScopeVariablesBasedOnUserRole() {
				
				// Common pick lists shared by users regardless of their role (if they are in LCM Team or not)
				$scope.mcnTripletList = $rootScope.picklists.mcnTripletList;
				$scope.jeopardyList = $rootScope.picklists.jeopardyList;

				$scope.orderSiteAttributeList = $rootScope.picklists.siteAttributeList;
				$scope.srSiteAttributeList = $rootScope.picklists.siteAttributeList;
				
				$scope.orderMarketStrataList = $rootScope.picklists.marketStrataList;
	    		$scope.srMarketStrataList = $rootScope.picklists.marketStrataList;
	    		$scope.crMarketStrataList = $rootScope.picklists.marketStrataList;

	    		
				if ($rootScope.lcmTeamIndicator) {
					
					$scope.productOfferingList = $rootScope.picklists.productOfferingList;
					
					// Service Orders
					$scope.orderAssociatedIdList = $rootScope.picklists.orderAssociatedIdList;
					$scope.orderStatusList = $rootScope.picklists.orderStatusList;
					$scope.orderDateSelectionList = $rootScope.picklists.orderDateSelectionList;
			
					$scope.orderSiteRegionList = $rootScope.picklists.siteRegionList;
					$scope.orderSiteStateList = $rootScope.picklists.siteStateList;
					$scope.orderSiteCountryList = $rootScope.picklists.siteCountryList;
				
					// SR
					$scope.srAssociatedIdList = $rootScope.picklists.srAssociatedIdList;
					$scope.srStatusList = $rootScope.picklists.srStatusList;
					$scope.srDateSelectionList = $rootScope.picklists.srDateSelectionList;
			
					$scope.srSiteRegionList = $rootScope.picklists.siteRegionList;
					$scope.srSiteStateList = $rootScope.picklists.siteStateList;
					$scope.srSiteCountryList = $rootScope.picklists.siteCountryList;
				
	                // CR
					$scope.crAssociatedIdList = $rootScope.picklists.crAssociatedIdList;
					$scope.crStatusList = $rootScope.picklists.crStatusList;
				    $scope.crDateSelectionList = $rootScope.picklists.crDateSelectionList;
    			}
				else {
					
					$scope.productOfferingList = $rootScope.picklists.omProductOfferingList;
					
					// Service Orders
					$scope.orderAssociatedIdList = $rootScope.picklists.omOrderAssociatedIdList;
					$scope.orderStatusList = $rootScope.picklists.omOrderStatusList;
					$scope.orderDateSelectionList = $rootScope.picklists.omOrderDateSelectionList;
			
					$scope.orderSiteRegionList = $rootScope.picklists.omSiteRegionList;
					$scope.orderSiteStateList = $rootScope.picklists.omSiteStateList;
					$scope.orderSiteCountryList = $rootScope.picklists.omSiteCountryList;

					// SR
					$scope.srAssociatedIdList = $rootScope.picklists.omSrAssociatedIdList;
					$scope.srStatusList = $rootScope.picklists.omSrStatusList;	
		        	$scope.srDateSelectionList = $rootScope.picklists.omSrDateSelectionList;
				
		        	$scope.srSiteRegionList = $rootScope.picklists.omSiteRegionList;
					$scope.srSiteStateList = $rootScope.picklists.omSiteStateList;
					$scope.srSiteCountryList = $rootScope.picklists.omSiteCountryList;
				
	                // CR
					$scope.crAssociatedIdList = $rootScope.picklists.omCrAssociatedIdList;
					$scope.crStatusList = $rootScope.picklists.omCrStatusList;
				    $scope.crDateSelectionList = $rootScope.picklists.omCrDateSelectionList;
				}
		
				if ( !$scope.searchCriteria.isCached ) {
					
					// set the first item in the dropdown as default
					
					if ($rootScope.lcmTeamIndicator) {
					    $scope.srTabLabel = "Service Requests";
					    
						$scope.crSearch.crAssociatedIdType = $scope.crAssociatedIdList[0];
					    
	    				$scope.orderSearch.orderMarketStrata = $scope.orderMarketStrataList[0];
						$scope.srSearch.srMarketStrata = $scope.srMarketStrataList[0];
						$scope.crSearch.crMarketStrata = $scope.crMarketStrataList[0];
					}
					else {
						$scope.srTabLabel = "Site Requests";
			
						for (var i=0; i < $scope.crAssociatedIdList.length; i++) {
							if ($scope.crAssociatedIdList[i].name === "SOR ID") {
								$scope.crSearch.crAssociatedIdType = $scope.crAssociatedIdList[i];
								break;
							}
						}
					}
					
					$scope.orderSearch.orderAssociatedIdType = $scope.orderAssociatedIdList[0];
					$scope.orderSearch.orderStatus = $scope.orderStatusList[0];
					$scope.orderSearch.inJeopardy = $scope.jeopardyList[0];
				
					$scope.orderSearch.orderDateSelection = $scope.orderDateSelectionList[0];
					
					$scope.orderSearch.mcnTripletType = $scope.mcnTripletList[0];
					$scope.orderSearch.productOffering = $scope.productOfferingList[0];
					
					$scope.orderSearch.orderSiteAttribute = $scope.orderSiteAttributeList[0];
					$scope.orderSearch.orderSiteRegion = $scope.orderSiteRegionList[0];
					$scope.orderSearch.orderSiteState = $scope.orderSiteStateList[0];
					$scope.orderSearch.orderSiteCountry = $scope.orderSiteCountryList[0];

					$scope.srSearch.srAssociatedIdType = $scope.srAssociatedIdList[0];
					$scope.srSearch.srStatus = $scope.srStatusList[0];
					$scope.srSearch.srDateSelection = $scope.srDateSelectionList[0];
					
					$scope.srSearch.mcnTripletType = $scope.mcnTripletList[0];
					$scope.srSearch.productOffering = $scope.productOfferingList[0];
					
					$scope.srSearch.srSiteAttribute = $scope.srSiteAttributeList[0];
					$scope.srSearch.srSiteRegion = $scope.srSiteRegionList[0];
					$scope.srSearch.srSiteState = $scope.srSiteStateList[0];
					$scope.srSearch.srSiteCountry = $scope.srSiteCountryList[0];
					
					$scope.srSearch.inJeopardy = $scope.jeopardyList[0];

					$scope.crSearch.crStatus = $scope.crStatusList[0];
					$scope.crSearch.crDateSelection = $scope.crDateSelectionList[0];

		
					//Default the LCM for searching to nothing at first... it will be re-populated when the user object
					//is available in the following watch
					//$scope.orderSearch.lcm = $scope.srSearch.lcm = $scope.crSearch.lcm = $scope.lcmList[0];
				}
				
			}
			
		
			function populatePicklistValues() {

			    // picklists for the Newton GUI are loaded in app.js
			    $rootScope.$watch('picklists', function () {
					
			    	if ($rootScope.picklists !== undefined) {
						//$scope.spinnerInProgress = false;	
	
				    	$scope.searchOrderTypes  = $rootScope.picklists.orderTypeList;   
			
				    	// set the first item in the dropdown as default
						if ( !$scope.searchCriteria.isCached ) 
							$scope.searchCriteria.selectedOrderType = $scope.searchOrderTypes[0];
						
						assignPickListsToScopeVariablesBasedOnUserRole();
	
						//It's safe to keep the dashboard transition OUT of the watch for user.. since it can get it's own user
						//values from the lcm list which has already been populated.  No need to key in on currently logged in user
	
						if($rootScope.isDashboardResults == true && ($rootScope.dashboardValues.orderType != undefined && $rootScope.dashboardValues.orderType != "")) {
	
							$scope.spinnerInProgress = true;
	
							populateSearchCriteriaForDashboardDrilldown();
						}
			    	}
           
				});
			}

			//Cancel outstanding search request
			//Returns true if request had to be canceled... false otherwise
			
			function cancelOutstandingSearchRequest() {
				
				if ( $scope.outstandingSearchRequest == null )
					return false;
				
				$scope.outstandingSearchRequest.resolve();
				$scope.outstandingSearchRequest = null;
				$scope.spinnerInProgress = false;
				return true;
			}



			function setupDatePicker() {

				/************************** 
	 		USRP - Start/End Dates
				 **************************/
				$scope.pickOrderStartDate = function() {
					$scope.wrongOrderStartDateEntered = false;
					$("#orderStartDate").datepicker({autoclose: true});

				};

				$scope.pickOrderEndDate = function() {
					$scope.wrongOrderEndDateEntered = false;
					$("#orderEndDate").datepicker({autoclose: true});
				};


				/************************************* 
			Service Request -  Start/End Dates
				 *************************************/
				
				$scope.pickCrStartDate = function() {
					$scope.wrongSrStartDateEntered = false;
					$("#srStartDate").datepicker({autoclose: true});
				};

				$scope.pickCrEndDate = function() {
					$scope.wrongSrEndDateEntered = false;
					$("#srEndDate").datepicker({autoclose: true});
				};

				/************************************* 
			Customer Request - Start/End Dates
				 *************************************/
				$scope.pickCrStartDate = function() {
					$scope.wrongCrStartDateEntered = false;
					$("#crStartDate").datepicker({autoclose: true});
				};

				$scope.pickCrEndDate = function() {
					$scope.wrongCrEndDateEntered = false;
					$("#crEndDate").datepicker({autoclose: true});
				};



				$scope.$watch(function(){



					/********************************************* 
				     Service Order - Start/End Dates Validation
					 *********************************************/
					$('#orderSDate').datepicker({ autoclose: true, endDate: '0' }).on('changeDate', function(){
						if (Date.parse(orderEndDate.value) > Date.parse(orderStartDate.value)){
							if(!$scope.$$phase) {
							$scope.$apply(function() {
								$scope.orderSearch.eDate=orderEndDate.value;
								$scope.orderSearch.sDate = orderStartDate.value;
								$scope.wrongOrderStartDateEntered = false;
							});
						}
						}
						else if (Date.parse(orderEndDate.value) < Date.parse(orderStartDate.value)){
							$scope.$apply(function() {
								$scope.wrongOrderStartDateEntered = true;
							});
							orderStartDate.value='';
						}
						});
					
					
					$('#orderEDate').datepicker({ autoclose: true , endDate: '0'}).on('changeDate', function(){
						if (Date.parse(orderEndDate.value) > Date.parse(orderStartDate.value)){
							if(!$scope.$$phase) {
							$scope.$apply(function() {
								$scope.orderSearch.eDate = orderEndDate.value;
								$scope.orderSearch.sDate = orderStartDate.value;
								$scope.wrongOrderEndDateEntered = false;
							});
						}}
						else if (Date.parse(orderEndDate.value) < Date.parse(orderStartDate.value)){
							$scope.$apply(function() {
								$scope.wrongOrderEndDateEntered = true;
							});
							orderEndDate.value='';
						}
					});




					/********************************************* 
				     Service Request - Start/End Dates Validation
					 *********************************************/
					
					$('#srSDate').datepicker({ autoclose: true, endDate: '0' }).on('changeDate', function(){
						if (Date.parse(srEndDate.value) > Date.parse(srStartDate.value)){
							if(!$scope.$$phase) {
							$scope.$apply(function() {
								$scope.srSearch.sDate = srStartDate.value;
								$scope.srSearch.eDate = srEndDate.value;
								$scope.wrongSrStartDateEntered = false;
							});
						}}
						else if (Date.parse(srEndDate.value) < Date.parse(srStartDate.value)){
							$scope.$apply(function() {
								$scope.wrongSrStartDateEntered = true;
							});
							srStartDate.value='';
						}

					});

					$('#srEDate').datepicker({ autoclose: true, endDate: '0' }).on('changeDate', function(){
						if (Date.parse(srEndDate.value) > Date.parse(srStartDate.value)){
							if(!$scope.$$phase) {
							$scope.$apply(function() {
								$scope.srSearch.eDate = srEndDate.value;
								$scope.srSearch.sDate = srStartDate.value;
								$scope.wrongSrEndDateEntered = false;
							});
						}}
						else if (Date.parse(srEndDate.value) < Date.parse(srStartDate.value)){
							$scope.$apply(function() {
								$scope.wrongSrEndDateEntered = true;
							});
							srEndDate.value='';
						}
					});
				
					/********************************************** 
				     Customer Request - Start/End Dates Validation
					 **********************************************/
					$('#crSDate').datepicker({ autoclose: true, endDate: '0' }).on('changeDate', function(){
						if (Date.parse(crEndDate.value) > Date.parse(crStartDate.value)){
							if(!$scope.$$phase) {
							$scope.$apply(function() {
								$scope.crSearch.sDate = crStartDate.value;
								$scope.crSearch.eDate = crEndDate.value;
								$scope.wrongCrStartDateEntered = false;
							});
						}}
						else if (Date.parse(crEndDate.value) < Date.parse(crStartDate.value)){
							$scope.$apply(function() {
								$scope.wrongCrStartDateEntered = true;
							});
							crStartDate.value='';
						}

					});

					$('#crEDate').datepicker({ autoclose: true, endDate: '0' }).on('changeDate', function(){
						if (Date.parse(crEndDate.value) > Date.parse(crStartDate.value)){
							if(!$scope.$$phase) {
							$scope.$apply(function() {
								$scope.crSearch.eDate = crEndDate.value;
								$scope.crSearch.sDate = crStartDate.value;
								$scope.wrongCrEndDateEntered = false;
							});
						}}
						else if (Date.parse(crEndDate.value) < Date.parse(crStartDate.value)){
							$scope.$apply(function() {
								$scope.wrongCrEndDateEntered = true;
							});
							crEndDate.value='';
						}
					});

				});
			}



			//Usually called following a result from a search post (executing inside promise) to set calling parms for the table
			//regeneration and/or loading the error condition.
			//This will also kick off table processing of the data after during the digest call
			//and turn off the spinner.
			//IT will also ensure the criteria is expanded if there is no table present and if not (and subsequently 
			//hide the toggle)
			//responseData:   ReturnDTO class

			function processSearchResult(responseData, tableType) {

				//tableType will either be 'USRP', 'CR' or 'SR'
				var tableData = $scope.resultsets[tableType];
				
				//Sometimes the response is nothing, indicating the user canceled this request
				if ( responseData === undefined || responseData === null || responseData.errorStaus != "Success" ) {
					//Assign error message which will show up above the table after digest
					tableData.searchRequestErrorMsg = responseData != undefined && responseData != null ? responseData.errorMessage : null;
					
					//Could also be HTTP error data involved if we stuffed it in jsonPostServer
					tableData.searchRequestErrorMsgHtml = responseData != undefined && responseData != null && responseData.errorHtml != undefined ? responseData.errorHtml : null;

					//Kill the data and table type, which will wipe out the table (totally gone, which 
					//looks different from an empty table
					//MAD refactored from YM change to object w/metadata rather than simply rows with embedded column defs
					//To tell the table directive to process, we need to define an empty table definition
					tableData.resultData.tableDefinition = {};
					tableData.resultData.loadTrigger = 0;			//fires off table, tells it to kill table
					
					//Expand the criteria and kill the expander control
					tableData.isCriteriaCollapsed = false;
					$('#criteriaCollapser' + tableType).hide();
					
				} else {
					//Tell the table what kind of table we're loading, load the data and kick off a refresh
					//MAD refactored from YM change to object w/metadata rather than simply rows with embedded column defs
					tableData.resultData.tableDefinition = responseData.tableRows;
					++tableData.resultData.loadTrigger;			//fires off table generation upon digest
					
					//Ensure the expander control is on and since we're into the table's space just a little
					//we have to make sure the thing is now clickable
					$('#criteriaCollapser' + tableType).show().css('z-index', 3000);
				
				}

				//All outstanding requests are complete or we wouldn't be in the process method... so it's safe to null this
				$scope.outstandingSearchRequest = null;
				
				//Turn off the spinner
				$scope.spinnerInProgress = false;	
			};


			function splitAttid(value){

				if(value!=="" && value!== undefined){
					var values = value.split("(");
					$scope.templateid = values[0];
					$scope.userid = values[1];
					var tempData=values[1].split(")");
					$scope.lcmid=tempData[0];
				} else {$scope.lcmid="";}
			};

			function getServiceTypes () {

				var promise = JsonGetService.getServiceTypes();

				promise.then(function(data) {
					$scope.services  = data.serviceTypeList;      
				});
			}



			function populateSearchCriteriaForDashboardDrilldown() {

				var orderType = $rootScope.dashboardValues.orderType;

				var status='';

				if($rootScope.dashboardValues.state != undefined && $rootScope.dashboardValues.state != "") {
					var state = $rootScope.dashboardValues.state;

					if(state.indexOf('In Progress') >= 0) {
						status = 'In Progress';
					} else if(state.indexOf('Completed') >= 0) {
						status = 'Completed';
					} else if(state.indexOf('Cancelled') >= 0) {
						status = 'Cancelled';
					}
				}

				if(orderType === "orderByStatus") {

					populateUsrpOrderSearchCriteria(status);

				} else if(orderType === "SR") {

					populateSRSearchCriteria(status);

				} else if(orderType === "CR") {

					populateCRSearchCriteria(status);

				}


				if (($rootScope.dashboardValues.lcmAttUid != undefined && $rootScope.dashboardValues.lcmAttUid != "") || 
						($rootScope.dashboardValues.customerName != undefined && $rootScope.dashboardValues.customerName != "") ||
						($rootScope.dashboardValues.orderType != undefined && $rootScope.dashboardValues.orderType != "") || 
						($rootScope.dashboardValues.state != undefined && $rootScope.dashboardValues.state != "") ||
						($rootScope.dashboardValues.jeopardy != undefined && $rootScope.dashboardValues.jeopardy != "")) {

					//console.log("[Dashboard Results] params => " + angular.toJson($state.params));
					showDashboardSearchResults($rootScope.dashboardValues.lcmAttUid, 
							$rootScope.dashboardValues.customerName, 
							$rootScope.dashboardValues.orderType, 
							$rootScope.dashboardValues.state,
							$rootScope.dashboardValues.jeopardy);
				};

				$rootScope.isDashboardResults = false;
			}



			function populateUsrpOrderSearchCriteria(status) {

				var statusCount = 0;

				angular.forEach($scope.orderStatusList, function(value){
					if(value.name === status) {
						$scope.orderSearch.orderStatus = $scope.orderStatusList[statusCount];
					}
					statusCount++;
				});

				if(status === 'Completed' || status === 'Cancelled') {
					var daysCount = 6;
	
					$scope.orderSearch.eDate = formatDateString(0);
					$("#orderEDate").datepicker("update", $scope.orderSearch.eDate);
					$("#orderEDate").datepicker({ autoclose: true, endDate: '0' });
	
					$scope.orderSearch.sDate = formatDateString(daysCount);
					$("#orderSDate").datepicker("update", $scope.orderSearch.sDate);
					$("#orderSDate").datepicker({ autoclose: true, endDate: '0' });
				}
				
				if($rootScope.dashboardValues.jeopardy != undefined && $rootScope.dashboardValues.jeopardy != "") {
					var jeopardy = $rootScope.dashboardValues.jeopardy;
					var index = 0;

					angular.forEach($scope.jeopardyList, function(value) {
						if(value.name.indexOf(jeopardy) >= 0) {
							$scope.orderSearch.inJeopardy = $scope.jeopardyList[index];
						}
						index++;
					});
				}
				
				if($rootScope.dashboardValues.lcmAttUid != undefined && $rootScope.dashboardValues.lcmAttUid != "") {
					var lcmAttUid = $rootScope.dashboardValues.lcmAttUid;
					 
					
					$timeout(function () {
						if($scope.lcmList!= null){
						for (var i=0; i < $scope.lcmList.length; i++) {
							if($scope.lcmList[i].name.indexOf(lcmAttUid) >= 0) {
								$scope.orderSearch.lcm = $scope.lcmList[i];
				    			break;
							}			
						}
						}
		            }, 0, false);

				}

				
				if($rootScope.dashboardValues.customerName != undefined && $rootScope.dashboardValues.customerName != "") {
					$scope.orderSearch.customerName = $rootScope.dashboardValues.customerName;
				}

			}


			function populateCRSearchCriteria(status) {

				var statusCount = 0;

				angular.forEach($scope.crStatusList, function(value){
					if(value.name === status) {
						$scope.crSearch.crStatus = $scope.crStatusList[statusCount];
					}
					statusCount++;
				});

				if(status === 'Completed' || status === 'Cancelled') {					
					var daysCount = 6;
					
					$scope.crSearch.eDate = formatDateString(0);
					$("#crEDate").datepicker("update", $scope.crSearch.eDate);
					$("#crEDate").datepicker({ autoclose: true, endDate: '0' });
	
					$scope.crSearch.sDate = formatDateString(daysCount);
					$("#crSDate").datepicker("update", $scope.crSearch.sDate);
					$("#crSDate").datepicker({ autoclose: true, endDate: '0' });
				}
					
				console.log("lcmAttUid from dashboard => " + $rootScope.dashboardValues.lcmAttUid);

				if($rootScope.dashboardValues.lcmAttUid != undefined && $rootScope.dashboardValues.lcmAttUid != "") {
					var lcmAttUid = $rootScope.dashboardValues.lcmAttUid;
					 
					$timeout(function () {
						if($scope.lcmList!= null){
						for (var i=0; i < $scope.lcmList.length; i++) {
							if($scope.lcmList[i].name.indexOf(lcmAttUid) >= 0) {
								$scope.crSearch.lcm = $scope.lcmList[i];
				    			break;
							}
							
						}
						}
		            }, 0, false);
		
				}
				
				if($rootScope.dashboardValues.customerName != undefined && $rootScope.dashboardValues.customerName != "") {
					$scope.crSearch.customerName = $rootScope.dashboardValues.customerName;
				}

			}


			function populateSRSearchCriteria(status) {

				var statusCount = 0;

				angular.forEach($scope.srStatusList, function(value){
					if(value.name === status) {
						$scope.srSearch.srStatus = $scope.srStatusList[statusCount];
					}
					statusCount++;
				});
				
				if(status === 'Completed' || status === 'Cancelled') {	
					var daysCount = 6;
					
					$scope.srSearch.eDate = formatDateString(0);
					$("#srEDate").datepicker("update", $scope.srSearch.eDate);
					$("#srEDate").datepicker({ autoclose: true, endDate: '0' });
	
					$scope.srSearch.sDate = formatDateString(daysCount);
					$("#srSDate").datepicker("update", $scope.srSearch.sDate);
					$("#srSDate").datepicker({ autoclose: true, endDate: '0' });
				}
					
				console.log("lcmAttUid from dashboard => " + $rootScope.dashboardValues.lcmAttUid);

				if($rootScope.dashboardValues.lcmAttUid != undefined && $rootScope.dashboardValues.lcmAttUid != "") {
					var lcmAttUid = $rootScope.dashboardValues.lcmAttUid;
					
					
					$timeout(function () {
						if($scope.lcmList!= null){
						for (var i=0; i < $scope.lcmList.length; i++) {
							if($scope.lcmList[i].name.indexOf(lcmAttUid) >= 0) {
								$scope.srSearch.lcm = $scope.lcmList[i];
				    			break;
							}
							
						}
						}
		            }, 0, false);
					
				}
				
				if($rootScope.dashboardValues.customerName != undefined && $rootScope.dashboardValues.customerName != "") {
					$scope.srSearch.customerName = $rootScope.dashboardValues.customerName;
				}
			}


			function formatDateString(numberOfDaysPriorToToday) {

				var todaysDate = new Date();
				todaysDate.setDate(todaysDate.getDate() - numberOfDaysPriorToToday);

				return (todaysDate.getMonth() + 1) + '/' + todaysDate.getDate() + '/' +  todaysDate.getFullYear();

			};


			// invoke this function when the number is clicked on CR/SR/Orders charts
			function showDashboardSearchResults(lcmAttUid, customerName, orderType, state, jeopardy) {

				console.log(lcmAttUid + '; ' + customerName + '; ' + orderType + '; '+ state + '; ' + jeopardy);

				var status='';


				if(state.indexOf('In Progress') >= 0) {
					status = 'In Progress';
				} else if(state.indexOf('Completed') >= 0) {
					status = 'Completed';		
				} else if(state.indexOf('Cancelled') >= 0) {
					status = 'Cancelled';
				}


				if (orderType === "orderByStatus") {

					var postData= {
							orderStatus:status,
							customerName:customerName,
							completionStartDate:$scope.convertToUTC($scope.orderSearch.sDate),
							completionEndDate:$scope.convertToUTC($scope.orderSearch.eDate),
							lcmAttUid:lcmAttUid,
							inJeopardy:jeopardy,
							lcmTeamIndicator:$rootScope.lcmTeamIndicator
					};

					//console.log("[USRP Search]");
					//console.log(angular.toJson(postData));

					$scope.outstandingSearchRequest = JsonPostService.getAdvancedUsrpOrderSearchResults(postData);
					
					//No need to handle failure case... jsonPostService formulates errors and resolves the same
					$scope.outstandingSearchRequest.promise.then(function(data) {

						processSearchResult(data, 'USRP');

						$scope.searchCriteria.selectedOrderType = $scope.searchOrderTypes[0];
						
						//TODO: Will check for a better solution
						$('#ordersTab').removeClass();
						$('#ordersTab').addClass('active');
						$('#srTab').removeClass();
						$('#crTab').removeClass();

						$('#tab1').removeClass();
						$('#tab1').addClass('tab-pane active');
						$('#tab2').removeClass();
						$('#tab2').addClass('tab-pane');
						$('#tab3').removeClass();
						$('#tab3').addClass('tab-pane');
						
						//console.log(angular.toJson(data.tableRows));

					});
				}
				else if (orderType === "SR") {

					var postData= {
							srStatus:status,
							customerName:customerName,
							completionStartDate:$scope.convertToUTC($scope.srSearch.sDate),
							completionEndDate:$scope.convertToUTC($scope.srSearch.eDate),
							lcmAttUid:lcmAttUid,
							lcmTeamIndicator:$rootScope.lcmTeamIndicator
					};
					//console.log("[SR Search]");
					//console.log(angular.toJson(postData));

					$scope.outstandingSearchRequest = JsonPostService.getAdvancedSrSearchResults(postData);
					
					//No need to handle failure case... jsonPostService formulates errors and resolves the same
					$scope.outstandingSearchRequest.promise.then(function(data) {

						processSearchResult(data, 'SR');
						
						$scope.searchCriteria.selectedOrderType = $scope.searchOrderTypes[1];
						
						//TODO: Will check for a better solution
						$('#ordersTab').removeClass();
						$('#srTab').removeClass();
						$('#srTab').addClass('tab-pane active');
						$('#crTab').removeClass();

						$('#tab1').removeClass();
						$('#tab1').addClass('tab-pane');
						$('#tab2').removeClass();
						$('#tab2').addClass('tab-pane active');
						$('#tab3').removeClass();
						$('#tab3').addClass('tab-pane');
                        
						//console.log(angular.toJson(data.tableRows));
					});
				}
				else if (orderType === "CR") {

					var postData= { 
							crStatus:status,
							customerName:customerName,
							completionStartDate:$scope.convertToUTC($scope.crSearch.sDate),
							completionEndDate:$scope.convertToUTC($scope.crSearch.eDate),
							lcmAttUid:lcmAttUid,
							lcmTeamIndicator:$rootScope.lcmTeamIndicator
					};

					//console.log("[CR Search]");
					//console.log(angular.toJson(postData));

					$scope.outstandingSearchRequest = JsonPostService.getAdvancedCrSearchResults(postData);
					
					//No need to handle failure case... jsonPostService formulates errors and resolves the same
					$scope.outstandingSearchRequest.promise.then(function(data) {

						processSearchResult(data, 'CR');
						
						$scope.searchCriteria.selectedOrderType = $scope.searchOrderTypes[2];

						//TODO: Will check for a better solution
						$('#ordersTab').removeClass();
						$('#srTab').removeClass();
						$('#crTab').removeClass();
						$('#crTab').addClass('tab-pane active');

						$('#tab1').removeClass();
						$('#tab1').addClass('tab-pane');
						$('#tab2').removeClass();
						$('#tab2').addClass('tab-pane');
						$('#tab3').removeClass();
						$('#tab3').addClass('tab-pane active');
						
						//	console.log(angular.toJson(data.tableRows));
					});
				}
			}
			
		}]);


