app.controller('DashboardController', ['$scope', '$location', '$rootScope', '$state', 'JsonGetService', 'JsonPostService', 'Cache', function ($scope, $location, $rootScope, $state, JsonGetService, JsonPostService, Cache) {
	'use strict';
	
    init();
 
    
    function init() {
 			
       setupScopeValuesAndMethods();
       
       // picklists for the Newton GUI are loaded in app.js
       $rootScope.$watch('picklists', function () {
    	   
    	   if ($rootScope.picklists !== undefined) {
    	
    		   populateDashboardData();
    		   
    		   $scope.maxDashboardValue={};
    	   }
    	   
       });
    		   
       
      

    }  
        
    
    function setupScopeValuesAndMethods() {
    
    	//Setup error value, error box is initially invisible
    	$scope.pickListError = null;

        $scope.name = "Dashboard";
        	
        //Either retrieve our set of parameters from a prior visit to this page or create a new one
        $scope.dashboard = Cache.get('dashboard') || {};
     	
        if ( !$scope.dashboard.isCached ) {
        	$scope.dashboard.lcmAttUid = '';
        	$scope.dashboard.customerName = '';
        }
      	
       
        // set the color for each state in CR/SR/Orders table
        $scope.tableColor = function(color) {
            return {
                backgroundColor: color,
                width: 50 + 'px'};
        };
        
        //We need to try to save our model values in case user gets back here via back button
        //Write the cached flag so we know not to re-init various things
        
        $scope.$on( "$destroy", function( event ) {
        	$scope.dashboard.isCached = true;
        	Cache.put('dashboard', $scope.dashboard);
        });
        
        
        $scope.refreshCharts = function() {
        	
        	getEnhancedDashboardStateSummaryData ();
        };
        
        
        $scope.getDashboardResults = function(orderType, state, jeopardy)
    	{
    		console.log("[getDashboardResults] orderType = " + orderType + ", state = " + state + ", jeopardy = " + jeopardy);
    		
    		var routeTo = 'orders';
    		
    		if(orderType.indexOf('orderByStatus') >= 0) {
    			routeTo = 'orders';
    		} else if(orderType.indexOf('CR') >= 0) {
    			routeTo = 'cr';		
    		} else if(orderType.indexOf('SR') >= 0) {
    			routeTo = 'sr';
    		}
    		
    		$rootScope.isDashboardResults = true;
    		
    		$rootScope.dashboardValues = {
    			lcmAttUid: $scope.dashboard.lcmAttUid, 
    			customerName: $scope.dashboard.customerName, 
    			orderType: orderType, 
    			state: state,
    			jeopardy: jeopardy
    		};
    	
    		$state.transitionTo('results.'+routeTo);

    	};
        
    };
    
   
   
    // All the Restful calls ....
    
    
    function getEnhancedDashboardStateSummaryData() {
      	 
    	$scope.spinnerInProgress = true;
    	$scope.chartDataError = null;
    	
    	if ($scope.dashboard.selectedSearchBy.name !== undefined) {
    		if ($scope.dashboard.selectedSearchBy.name === "Agent" &&  $scope.dashboard.selectedSearchBy.name.length > 0) {
    			$scope.dashboard.lcmAttUid =  $scope.dashboard.selectedAgent.lcmAttUid;
    			$scope.dashboard.customerName = '';
    		} 
    		else if ($scope.dashboard.selectedSearchBy.name === "Workgroup" &&  $scope.dashboard.selectedSearchBy.name.length > 0) {
    			// both lcmAttUid and customerName will be passed as blanks
    			$scope.dashboard.lcmAttUid = '';
    			$scope.dashboard.customerName = '';
    		}
    		else if ($scope.dashboard.selectedSearchBy.name === "Customer" &&  $scope.dashboard.selectedSearchBy.name.length > 0) {
    			$scope.dashboard.lcmAttUid = '';
    			$scope.dashboard.customerName =  $scope.dashboard.customerName;
    		}
    	} 
      	
		var postData = {
				        lcmAttUid: $scope.dashboard.lcmAttUid,
				        customerName: $scope.dashboard.customerName
	                   };
		
        console.log(angular.toJson(postData));
	
		var promise = JsonPostService.getEnhancedDashboardStateSummaryData(postData);
		
        promise.then(function(data) {
        	
        	//console.log("[dashboard state summary data] => " + angular.toJson(data));	
            
        	$scope.spinnerInProgress = false;	
        	
        	//We have to examine the contents to see if a failure ocurred at the inetsoft level...
        	//If so, populate the error and not the charts
        	
			if ( data === undefined || data === null || data.errorStaus != "Success" ) {
				//Assign error message which will show up above the table after digest
				$scope.chartDataError = 
					data != undefined && data != null && data.errorMessage != undefined && data.errorMessage != null && data.errorMessage.length > 0 ? 
						data.errorMessage : "Unspecified error from WS call retrieving chart data";
					
				//TODO: Should we just leave the old chart data up?   Or clear out the values?
					
			} else {
				
//				$scope.crStateSummaryList = getCombinedCRData(data.nxCrContainer);
//				$scope.srStateSummaryList = getCombinedSRData(data.nxSrContainer);
//				$scope.efmsCrStateSummaryList = getCombinedEfmsCRData(data.efmsCrContainer); 
//				$scope.efmsSrStateSummaryList = getCombinedEfmsSRData(data.efmsSrContainer); 
//				$scope.ordersActivitySummaryList = getCombinedActivitySummaryList(data.orderActivityContainer);
				
				//$scope.ordersStateSummaryList = data.orderStateContainer.usStateSummaryList;
				//$scope.ordersStateSummaryList = getCombinedOrderStateData(data.orderStateContainer);
				
				//New Data for new - enhanced data. - For Charts by Status and Region
				$scope.crStateSummaryList = getCombinedDataObj(data.nxCrCountContainer);
				$scope.srStateSummaryList = getCombinedDataObj(data.nxSrCountContainer);
				$scope.efmsCrStateSummaryList = getCombinedDataObj(data.efmsCrCountContainer); 
				$scope.efmsSrStateSummaryList = getCombinedDataObj(data.efmsSrCountContainer); 
				$scope.ordersStateSummaryList = getCombinedOrderCountData(data.orderCountContainer);
				$scope.ordersActivitySummaryList = data.ordersActivityContainer.usActivitySummaryList;
				
				//Setting the max value for dashboard bar charts
				$scope.maxDashboardValue = getMaxDashboardValue($scope.crStateSummaryList, $scope.srStateSummaryList, $scope.ordersStateSummaryList, $scope.efmsCrStateSummaryList, $scope.efmsSrStateSummaryList);
				
			}
        	
		}, function(reason) {
			
			//WS call failed for some reason... This is not recoverable until the use reloads the page
			//Most likely the reason is HTML... 
			$scope.spinnerInProgress = false;
			$scope.chartDataError = reason.errorMsg; //reason;
			$scope.chartDataErrorHtml = reason.errorHtml;
      	  
		});
    }
    
    function getconcatenatedArray(array1, array2) {
    	var concatenatedArray = new Array();
    	if(array1!=null && array2!=null)
    		concatenatedArray = array1.concat(array2);
    	return concatenatedArray;
    }
    
    function getcombinedArray(usArray, mowArray) {
    	var combinedArray = new Array();
    	var index;
    	
    	if(usArray.length == mowArray.length) {
            for (index = 0; index < usArray.length; index++ ) {
            	combinedArray.push(usArray[index]);
            	combinedArray.push(mowArray[index]);
            }
    	}
    	
    	return combinedArray;
    }
    
    function getcombinedObject(usArray, mowArray) {
    	var combinedObject = [];
    	var index;
    	
    	if(usArray.length == mowArray.length) {
            for (index = 0; index < usArray.length; index++ ) {
            	combinedObject.push(usArray[index]);
            	combinedObject.push(mowArray[index]);
            }
    	}
    	
    	return combinedObject;
    }
    
    function getCombinedActivitySummaryList(orderActivityContainer) {
		var combinedData = new Array();
		
		if(orderActivityContainer.usActivitySummaryList!=null && orderActivityContainer.mowActivitySummaryList!=null)
			combinedData = getconcatenatedArray(orderActivityContainer.usActivitySummaryList, orderActivityContainer.mowActivitySummaryList);
		
    	return combinedData;
    }
    
    function getCombinedCRData(crContainerObject) {
    	var combinedCRData = [];

    	if(crContainerObject.usStateSummaryList!=null && crContainerObject.mowStateSummaryList!=null) {
    		combinedCRData = getcombinedObject(crContainerObject.usStateSummaryList, crContainerObject.mowStateSummaryList);
    	}

    	return combinedCRData;
    }

    function getCombinedSRData(srContainerObject) {
    	var combinedSRData = [];

    	if(srContainerObject.usStateSummaryList!=null && srContainerObject.mowStateSummaryList!=null) {
    		combinedSRData = getcombinedObject(srContainerObject.usStateSummaryList, srContainerObject.mowStateSummaryList);
    	}

    	return combinedSRData;
    }

    function getCombinedEfmsCRData(efmsCrContainerObject) {
    	var combinedEfmsCRData = [];

    	if(efmsCrContainerObject.usStateSummaryList!=null && efmsCrContainerObject.mowStateSummaryList!=null) {
    		combinedEfmsCRData = getcombinedObject(efmsCrContainerObject.usStateSummaryList, efmsCrContainerObject.mowStateSummaryList);
    	}

    	return combinedEfmsCRData;
    }

    function getCombinedEfmsSRData(efmsSrContainerObject) {
    	var combinedEfmsSRData = [];

    	if(efmsSrContainerObject.usStateSummaryList!=null && efmsSrContainerObject.mowStateSummaryList!=null) {
    		combinedEfmsSRData = getcombinedObject(efmsSrContainerObject.usStateSummaryList, efmsSrContainerObject.mowStateSummaryList);
    	}

    	return combinedEfmsSRData;
    }
    
    function getCombinedOrderStateData(orderStateContainer) {
    	
    	var combinedOrderStateData = new Array();
    	
    	if(orderStateContainer!=null) {
    		combinedOrderStateData.push(getUsMowCombinedData(orderStateContainer));
    		combinedOrderStateData.push(getUsNewMowNewCombinedData(orderStateContainer));
    	}
    	
    	return combinedOrderStateData;
    }
    
    function getUsMowCombinedData(containerObject) {
    	var combinedData = new Array();
    	
    	if(containerObject.usStateSummaryList!=null && containerObject.mowStateSummaryList!=null) {
    		combinedData = getcombinedArray(containerObject.usStateSummaryList, containerObject.mowStateSummaryList);
    		//combinedData = getconcatenatedArray(containerObject.usStateSummaryList, containerObject.mowStateSummaryList);
    	}
    	
    	return combinedData;
    }
    
    function getUsNewMowNewCombinedData(containerObject) {
    	var combinedData = new Array();
    	
    	if(containerObject.usNewStateSummaryList!=null && containerObject.mowNewStateSummaryList!=null) {
    		combinedData = getcombinedArray(containerObject.usNewStateSummaryList, containerObject.mowNewStateSummaryList);
    		//combinedData = getconcatenatedArray(containerObject.usNewStateSummaryList, containerObject.mowNewStateSummaryList);
    	}
    	
    	return combinedData;
    }
    
    function getCombinedDataObj(containerObject) {
    	
    	var combinedDataObj = [];
    	
    	if(containerObject.countRegionSummaryByStateList!=null && containerObject.countRegionSummaryByStateList.length>0) {
    		var index = 0;
    		for(index=0; index<containerObject.countRegionSummaryByStateList.length; index++) {
    			var index2 = 0;
    			for(index2=0; index2<4; index2++){
    				combinedDataObj.push(containerObject.countRegionSummaryByStateList[index].countByRegionList[index2]);
    			}
    		}
    	}

    	return combinedDataObj;
    }
    
    function getCombinedOrderCountData(orderCountDataObject) {
    	var combinedOrderCountData = [];
    	
    	if(orderCountDataObject.countStrataSummaryByStateList!=null && orderCountDataObject.countStrataSummaryByStateList.length>0) {
    		var index=0;
    		for(index=0; index<orderCountDataObject.countStrataSummaryByStateList.length; index++) {
    			var index2=0;
    			for(index2=0; index2<3; index2++){
    				combinedOrderCountData.push(orderCountDataObject.countStrataSummaryByStateList[index].countByStrataList[index2]);
    			}
    		}
    	}
    	
    	return combinedOrderCountData;
    }
    
    
    function getMaxDashboardValue(crStateSummaryList, srStateSummaryList, ordersStateSummaryList, efmsCrStateSummaryList, efmsSrStateSummaryList) {
    	$scope.maxCount = [];
		
		var crMaxValue = getMaxCountForEachList(crStateSummaryList);
		$scope.maxCount.push(crMaxValue);
		var srMaxValue = getMaxCountForEachList(srStateSummaryList);
		$scope.maxCount.push(srMaxValue);
		var orderMaxValue = getMaxCountForEachList(ordersStateSummaryList);
		$scope.maxCount.push(orderMaxValue);
		var efmsCrMaxValue = getMaxCountForEachList(efmsCrStateSummaryList);
		$scope.maxCount.push(efmsCrMaxValue);
		var efmsSrMaxValue = getMaxCountForEachList(efmsSrStateSummaryList);
		$scope.maxCount.push(efmsSrMaxValue);
		
		return _.max($scope.maxCount);
    }
    
    function getMaxCountForEachList(summaryList) {
    	
    	var count = Math.max.apply(null, summaryList.map(function(item){
			   return item["count"];
			}));
    	
    	return count;
    }
   
    
    
    function populateDashboardData() {

    
		//'searchByOption' is the variable controlling enabling of the submit button
//		$scope.searchByOptions = data.searchTypeList;
//		$scope.agentList = data.agentList;
//		$scope.workgroupList = data.workgroupList;
		
		// Listen for when logged in user is set...   Main app controls this so if it's not set, we can't proceed
		// So if this watch doesn't execute, we'll be stuck waiting on it.  No need to display anything because 
		// if we're stuck waiting on it then there's a pop up on the main screen obscuring our dashboard.  User won't be confused
		
		$rootScope.$watch('userName', function (value) {
        	  
        	 if (value) {
        		 
        		 //Don't auto-select an agent from the dropdown if the selections are cached
        		 //since that means whatever the user wanted is already setup.
        		 
        		 if ( !$scope.dashboard.isCached ) {
        			 
		  			for (var index=0; index < $rootScope.picklists.agentList.length; index++) {
		  
		  				if ($rootScope.picklists.agentList[index].name === $rootScope.userName) {
		  					 
		  					// set to correct LCM value in Agent's filter by drop down
		  					$scope.dashboard.selectedSearchBy = $rootScope.picklists.searchTypeList[0];
		  					$scope.dashboard.selectedAgent = $rootScope.picklists.agentList[index];
		  					
		  					// default "LifeCycle Management" in Workgroup's filter by drop down
		  					$scope.dashboard.selectedWorkgroup = $rootScope.picklists.workgroupList[0];
		  					
		  					break;
		  				}
		  			}
		  			
		  			// If none of the matching item is found - i.e.
		              // If the user is authorized but is not an LCM, the default should be the Workgroup view 
		  			if (index === $rootScope.picklists.agentList.length) {
		  				$scope.dashboard.selectedSearchBy = $rootScope.picklists.searchTypeList[1];
		  				$scope.dashboard.selectedWorkgroup = $rootScope.picklists.workgroupList[0];
		  				
		  				// default Agent's filter by value to the first one in the list
		  				$scope.dashboard.selectedAgent = $rootScope.picklists.agentList[0];
		  			}
        		 }
	  		
	  			//Fire off another ws call to get the data... it controls it's own spinner
	  		    getEnhancedDashboardStateSummaryData();
			}
		});	 //watch on userName
		
    }
 
    
    /*
    
    function getDashboardPicklistValues () {

    	$scope.spinnerInProgress = true;
		var promise = JsonGetService.getDashboardPicklistValues();

		promise.then(function(data) {
			
			//Returned from web call successfully with data...
			//console.log(angular.toJson(data));
			
			//'searchByOption' is the variable controlling enabling of the submit button
			$scope.searchByOptions = data.searchTypeList;
			$scope.agentList = data.agentList;
			$scope.workgroupList = data.workgroupList;
			
			// Listen for when logged in user is set...   Main app controls this so if it's not set, we can't proceed
			// So if this watch doesn't execute, we'll be stuck waiting on it.  No need to display anything because 
			// if we're stuck waiting on it then there's a pop up on the main screen obscuring our dashboard.  User won't be confused
			
			$rootScope.$watch('userName', function (value) {
	        	  
	        	 if (value) {
	        		 
		  			for (var index=0; index < $scope.agentList.length; index++) {
		  
		  				if ($scope.agentList[index].name === $rootScope.userName) {
		  					 
		  					// set to correct LCM value in Agent's filter by drop down
		  					$scope.dashboard.selectedSearchBy = $scope.searchByOptions[0];
		  					$scope.dashboard.selectedAgent = $scope.agentList[index];
		  					
		  					// default "LifeCycle Management" in Workgroup's filter by drop down
		  					$scope.dashboard.selectedWorkgroup = $scope.workgroupList[0];
		  					
		  					break;
		  				}
		  			}
		  			
		  			// If none of the matching item is found - i.e.
		              // If the user is authorized but is not an LCM, the default should be the Workgroup view 
		  			if (index === $scope.agentList.length) {
		  				$scope.dashboard.selectedSearchBy = $scope.searchByOptions[1];
		  				$scope.dashboard.selectedWorkgroup = $scope.workgroupList[0];
		  				
		  				// default Agent's filter by value to the first one in the list
		  				$scope.dashboard.selectedAgent = $scope.agentList[0];
		  			}
		  		
		  			//Fire off another ws call to get the data... it controls it's own spinner
		  		    getEnhancedDashboardStateSummaryData();
				}
			});			//watch on userName
			
	    	$scope.spinnerInProgress = false;

		}, function(reason) {
			
			//WS call failed for some reason... This is not recoverable until the use reloads the page
			//Most likely the reason is HTML... 
			$scope.spinnerInProgress = false;
			$scope.picklistError = reason.errorMsg;
			$scope.picklistErrorHtml = reason.errorHtml;
      	  
		});
	}
	*/
	
}]);
