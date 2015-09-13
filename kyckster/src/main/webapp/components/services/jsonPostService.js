app.service('JsonPostService', ['$q', '$http', 'JsonGetService', function ($q, $http, JsonGetService) {
	'use strict';
	
	
	
	this.getUserProfileSearchResults = function (postObject) {

		var deferred = $q.defer();
        $http.post('/newtongui/rest/json/userProfileSearchResults', postObject).success(function (response) {
             deferred.resolve(response);
        });
      
        return deferred.promise; 
	};

	
	this.getAdvancedUsrpOrderSearchResults = function (postObject) {
	
		var deferred = $q.defer();
	    $http.post('/newtongui/rest/json/advancedUsrpOrderSearchResults', postObject).success(function (response) {
	         deferred.resolve(response);
	    })
	    .error(function(data, status, headers, config) {
	    	
        	console.log("getAdvancedUsrpOrderSearchResults HTTP error: " + data);
	    	
	    	//An error ocurred but we should resolve this in the same way
	    	deferred.resolve({
	    		errorStaus: 	"Failed",
	    		errorCode:		status,
	    		//data comes back as a full HTML page, not just an error message.  Until I can figure out a way
	    		//to properly display this as an error, just formulate a simplistic one
	    		errorMessage:	JsonGetService.prepareErrorMessage(data, status, config, "Server failure executing USRP search, "),
	    		errorHtml:		data
    		});

	    	//We could reject the data and this would propagate to the promise's failure methods
	    	//but we've not defined and and handle success/fail codes inside the response object
	    	//deferred.reject(data);
		});
	   
	    //Need to change this to the defer object so it can be canceled.
//	    return deferred.promise; 
	    return deferred;
	
	};
	
	
	this.getAdvancedCrSearchResults = function (postObject) {
		
		var deferred = $q.defer();
	    $http.post('/newtongui/rest/json/advancedCrSearchResults', postObject).success(function (response) {
	         deferred.resolve(response);
	    })
	    .error(function(data, status, headers, config) {

        	console.log("getAdvancedCrSearchResults HTTP error: " + data);
        	
	    	//An error ocurred but we should resolve this in the same way
	    	deferred.resolve({
	    		errorStaus: 	"Failed",
	    		errorCode:		status,
	    		//data comes back as a full HTML page, not just an error message.  Until I can figure out a way
	    		//to properly display this as an error, just formulate a simplistic one
	    		errorMessage:	JsonGetService.prepareErrorMessage(data, status, config, "Server failure executing CR search, "),
	    		errorHtml:		data
	    	});
	    	
	    	//We could reject the data and this would propagate to the promise's failure methods
	    	//but we've not defined and and handle success/fail codes inside the response object
	    	//deferred.reject(data);
	    });
	   
	    //Need to change this to the defer object so it can be canceled.
//	    return deferred.promise;
	    return deferred;
	
	};
	
	
	this.getAdvancedSrSearchResults = function (postObject) {
		
		var deferred = $q.defer();
	    $http.post('/newtongui/rest/json/advancedSrSearchResults', postObject).success(function (response) {
	         deferred.resolve(response);
	    })
	    .error(function(data, status, headers, config) {
	    	
        	console.log("getAdvancedSrSearchResults HTTP error: " + data);
	    	
	    	//An error ocurred but we should resolve this in the same way
	    	deferred.resolve({
	    		errorStaus: 	"Failed",
	    		errorCode:		status,
	    		//data comes back as a full HTML page, not just an error message.  Until I can figure out a way
	    		//to properly display this as an error, just formulate a simplistic one
	    		errorMessage:	JsonGetService.prepareErrorMessage(data, status, config, "Server failure executing SR search, "),
	    		errorHtml:		data
    		});

	    	//We could reject the data and this would propagate to the promise's failure methods
	    	//but we've not defined and and handle success/fail codes inside the response object
	    	//deferred.reject(data);
	    });
	   
	    //Need to change this to the defer object so it can be canceled.
//	    return deferred.promise; 
	    return deferred;
	
	};
	
	
	
	//We don't need to return a deferred object here since the dashboard will likely not need to cancel
	//the outstanding request... so just keep returning a promise
	
	this.getDashboardStateSummaryData = function (postObject) {
			
		var deferred = $q.defer();
     
		$http.post('/newtongui/rest/json/dashboardSummary', postObject).success(function(response){
			
			//Remember that the successful response here does NOT necessarily indicate a successful data 
			//retrieval from inetsoft, as an error could be encoded in their response so that has to be checked 
			//at the dashboard controller level
			
			deferred.resolve(response);
	    })
	    .error(function(data, status, headers, config) {
	    	
        	console.log("getDashboardStateSummaryData HTTP error: " + data);
	    	
	    	//An error ocurred but we should resolve this in the same way, stuffing the html error
        	deferred.reject(
        			{
        				errorMsg: JsonGetService.prepareErrorMessage(data, status, config, "Server failure getting chart data, "),
        				errorHtml: data
        			});

        });
        
        return deferred.promise; 
	
	};
	
	
	
	this.getEnhancedDashboardStateSummaryData = function (postObject) {
		
		var deferred = $q.defer();
     
		$http.post('/newtongui/rest/json/enhanceddashboardSummary', postObject).success(function(response){
			
			//Remember that the successful response here does NOT necessarily indicate a successful data 
			//retrieval from inetsoft, as an error could be encoded in their response so that has to be checked 
			//at the dashboard controller level
			
			deferred.resolve(response);
	    })
	    .error(function(data, status, headers, config) {
	    	
        	console.log("getEnhancedDashboardStateSummaryData HTTP error: " + data);
	    	
	    	//An error ocurred but we should resolve this in the same way, stuffing the html error
        	deferred.reject(
        			{
        				errorMsg: JsonGetService.prepareErrorMessage(data, status, config, "Server failure getting chart data, "),
        				errorHtml: data
        			});

        });
        
        return deferred.promise; 
	
	};
 
}]);