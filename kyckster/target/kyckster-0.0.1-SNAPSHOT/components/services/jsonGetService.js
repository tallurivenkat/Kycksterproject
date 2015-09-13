app.service('JsonGetService', ['$q', '$http', 'Cache', '$document', '$sanitize', function ($q, $http, Cache, $document, $sanitize) {
	'use strict';


	function localPrepareErrorMessage(reason, statusCode, config, prefixMsg) {
		
		return (prefixMsg != undefined && prefixMsg != null ? prefixMsg : "") + "Error " + statusCode + " at " + config.url; //reason);
	}
	
	
	//This method takes an error message returned from the $http call and attempts to santize it so that 
	//it can be easily included in our error display.  It comes back as a full HTML page.
	//This needs to be global since jsonPostService uses this error formulation method too
	
	this.prepareErrorMessage = function(reason, statusCode, config, prefixMsg) {
		return localPrepareErrorMessage(reason, statusCode, config, prefixMsg);
	};
	
	
		
	this.getUser = function (attUid) {

		var user = Cache.get('loggedinuser');
		
		var deferred = $q.defer();
		
		if (!user) {
		
	        $http.get('/newtongui/rest/json/user/get/' + attUid).success(function (response) {
	        	 
	        	// populate user object
	            user = {
		    		attUid: 				response.attUid,
		    	    firstName: 				response.firstName,
		    	    lastName: 				response.lastName,
		    	    email: 					response.email,
		    	    tn: 					response.tn,
		    	    adminFlag: 				response.adminFlag,
		    	    lcmFlag: 				response.lcmFlag,
		    	    validNewtonGuiUserFlag: response.validNewtonGuiUserFlag		
			    };
	            
	            Cache.put('loggedinuser', user);

	            console.log("retrieve user data from BE");
	        	  
	            deferred.resolve(user);
	              
	        }).error(function(reason, status, headers, config) {
	         	
	         	console.log("retrieve user from BE FAILED with reason: " + reason);
	         	
	         	//Sanitize the returned HTML first... then use the DOM to strip out the innerHTML pieces
	         	//and return that to the caller to do whatever they want with it.
            	deferred.reject(
            			{
            				errorMsg: localPrepareErrorMessage(reason, status, config, "Server failure getting User, "),
            				errorHtml: reason
            			});
	         	
	        });
	        
		} else {
			deferred.resolve(user);
            console.log("retrieve user data from Cache");
		}    
        
         return deferred.promise; 
	};
		
	
	
	this.getServerInfo = function () {

		 var deferred = $q.defer();
         $http.get('/newtongui/rest/json/serverInfo/get').success(function (response) {
             deferred.resolve(response);
         });
       
         return deferred.promise; 
	};
		
	
	
	this.getUserProfile = function (attUid) {

		 var deferred = $q.defer();
		 $http.get('/newtongui/rest/json/userprofile/get/' + attUid).success(function (response) {
			 
			 deferred.resolve(response);
			 
         }).error(function(reason, status, headers, config) {
	          	
	          	console.log("retrieve userProfile FAILED with reason: " + reason);
	          	
	          	//Sanitize the returned HTML first... then use the DOM to strip out the innerHTML pieces
	          	//and return that to the caller to do whatever they want with it.
	          	deferred.reject(
      			{
      				errorMsg: localPrepareErrorMessage(reason, status, config, "Server failure getting user profile, "),
      				errorHtml: reason
      			});
		 });
     
		 return deferred.promise; 
	};
	
	
	this.getSavedSearchesForUser = function (attUid) {

		 var deferred = $q.defer();
		 $http.get('/newtongui/rest/json/savedsearches/get/' + attUid).success(function (response) {
			 
			 deferred.resolve(response);
			 
        }).error(function(reason, status, headers, config) {
	          	
	          	console.log("retrieve savedSearches FAILED with reason: " + reason);
	          	
	          	//Sanitize the returned HTML first... then use the DOM to strip out the innerHTML pieces
	          	//and return that to the caller to do whatever they want with it.
	          	deferred.reject(
     			{
     				errorMsg: localPrepareErrorMessage(reason, status, config, "Server failure getting saved searches for user, "),
     				errorHtml: reason
     			});
		 });
    
		 return deferred.promise; 
	};
	
	
	this.getPicklistValues = function () {
		
		var data = Cache.get('picklists');
		
		var deferred = $q.defer();
		
		if (!data) {
	        $http.get('/newtongui/rest/json/picklists/get').success(function (response) {
	        	 data = response;
	             deferred.resolve(data);
	             
	             Cache.put('picklists', data);
             
	             console.log("retrieve picklists from BE");
	             
	         }).error(function(reason, status, headers, config) {
	          	
	          	console.log("retrieve picklists from BE FAILED with reason: " + reason);
	          	
	          	//Sanitize the returned HTML first... then use the DOM to strip out the innerHTML pieces
	          	//and return that to the caller to do whatever they want with it.
            	deferred.reject(
            			{
            				errorMsg: localPrepareErrorMessage(reason, status, config, "Server failure getting selection values, "),
            				errorHtml: reason
            			});
            });
	        
		} else {
			deferred.resolve(data);
            console.log("retrieve picklists from Cache");
		}
		
        return deferred.promise; 
	};
	
	

	
	this.getOrderDetails= function (orderType, id) {
		
		var deferred = $q.defer();
        $http.get('/newtongui/rest/json/'+orderType+'/'+id+'/orderDetails/get').success(function (response) {
        	
             deferred.resolve(response);
             
        }).error(function(reason, status, headers, config) {
         	
        	console.log("retrieve order details from BE FAILED with reason: " + reason);
         	
         	//Sanitize the returned HTML first... then use the DOM to strip out the innerHTML pieces
         	//and return that to the caller to do whatever they want with it.
        	deferred.reject(
        			{
        				errorMsg: localPrepareErrorMessage(reason, status, config, null),
        				errorHtml: reason
        			});
        });
       
        return deferred.promise; 
	
	};
	

}]);