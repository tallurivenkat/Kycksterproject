app.controller('UserProfileController', ['$scope', '$rootScope', '$timeout', '$state', '$stateParams', '$routeParams', '$filter', 'JsonGetService', 'Cache',
                                         function ($scope, $rootScope, $timeout, $state, $stateParams, $routeParams, $filter, JsonGetService, Cache) {
	'use strict';
	
    //Setup some common table values for headers, style, callbacks, etc.
	//These are vars since they're shared by multiple tables.  They need to be set up before the directives initialize
	
    var commonOptionOverride = {
			ordering: false,
			rowCallback: function( row, data ) {
			    	row.style.fontWeight = data && isDefaultSearch(data.type, data.id) ? "bold" : "";
			}
		};
    
    
    var commonColumnDefs = [
         {
        	 "id" : "searchName",
        	 "displayName" : "Saved Search",
        	 "data": "name",
       		 "template": function ( cellData, type, rowData )
   	 				{	
   		 				//TODO: also need to only show up delete and sharable changeability IF
       			 		//TODO: Can't detete if we don't own this so check created by before showing button
       			 		//TODO: Can't alter shared if we don't own this so check created before making checkable (but still display)
       			 		var createdOn = new Date(rowData.createdOn);
       			 		
       			 		var html = [];
       			 		if ( rowData.isInvalidCriteria )
       			 			html.push("<span title=\"This search contains invalid criteria\" class=\"icon\"><i class=\"fa fa-ban\"></i></span>&nbsp;");
       			 		else {
       			 			if ( isDefaultSearch(rowData.type, rowData.id) )
       			 				html.push("<a title=\"Remove any search defaults\"><span class=\"icon\" ng-click=\"$parent.savedSearchMakeDefault('" + rowData.type + "', '" + rowData.id + "')\"><i class=\"fa fa-star\"></i></span></a>&nbsp;");
       			 			else
       			 				html.push("<a title=\"Make this search the default search\"><span  style=\"opacity:0.3;\" class=\"icon\" ng-click=\"$parent.savedSearchMakeDefault('" + rowData.type + "', '" + rowData.id + "')\"><i class=\"fa fa-star-o\"></i></span></a>&nbsp;");
       			 		}
       			 		
       			 		html.push("<span popover=\"Created or updated on " +
    	 						$filter('date')(createdOn, "MM/dd/yyyy h:mm:ssa") + 
    	 						" by " + rowData.attIdCreatedBy + "\" popover-trigger=\"mouseenter\" popover-popup-delay=\"500\">" + 
    	 						cellData + "</span>");
       			 		
	 					if ( isMatchingOwner(rowData.attIdCreatedBy) ) {
	 						html.push("<div style=\"float: right;\">");
	 						if ( rowData.shared )
	 							html.push("<a title=\"Stop sharing this search\" ");
	 						else
	 							html.push("<a title=\"Share this search\" style=\"opacity:0.3;\" ");
	 						html.push("ng-click=\"$parent.savedSearchShareChange('" + rowData.type + "', '" + rowData.id + "')\"><span class=\"icon\"><i class=\"fa fa-share-square-o\"></i></span></a>&nbsp;" +
	 								"<a title=\"Delete this search\"><span class=\"icon\"ng-click=\"$parent.savedSearchDelete('" + rowData.type + "', '" + rowData.id + "')\"><i class=\"fa fa-times\"></i></span></a>" +
 									"</div>");
	 					}
	 					
	 					return html.join("");
				} 

/*       			 
   		 				return  "<span popover=\"Created or updated on " +
   		 						$filter('date')(createdOn, "MM/dd/yyyy h:mm:ssa") + 
   		 						" by " + rowData.attIdCreatedBy + "\" popover-trigger=\"mouseenter\" popover-popup-delay=\"500\">" +
   		 						cellData +
   		 						"</span>" + 
   		 						"<div style=\"float: right;\">" +
   		 						( rowData.isInvalidCriteria ? "<span title=\"This search contains invalid criteria\" class=\"icon\"><i class=\"fa fa-ban\"></i></span>&nbsp;" : "") +
   		 						( isMatchingOwner(rowData.attIdCreatedBy) ?
   		 								(( rowData.shared ?	"<a title=\"Stop sharing this search\" " :	"<a title=\"Share this search\" style=\"opacity:0.3;\" ") + 
   		 										"ng-click=\"$parent.savedSearchShareChange('" + rowData.type + "', '" + rowData.id + "')\"><span class=\"icon\"><i class=\"fa fa-share-square-o\"></i></span></a>&nbsp;") :
	 							  		"<span class=\"icon\"><i class=\"fa fa-share-square-o\"></i></span></a>&nbsp;" ) +
		 						( isDefaultSearch(rowData.type, rowData.id) ?
		 								("<a title=\"Remove any search defaults\"><span class=\"icon\" ng-click=\"$parent.savedSearchMakeDefault('" + rowData.type + "', '" + rowData.id + "')\"><i class=\"fa fa-star\"></i></span></a>&nbsp;") : 
		 								("<a title=\"Make this search the default search\"><span class=\"icon\" ng-click=\"$parent.savedSearchMakeDefault('" + rowData.type + "', '" + rowData.id + "')\"><i class=\"fa fa-star-o\"></i></span></a>&nbsp;")) +
		 						( isMatchingOwner(rowData.attIdCreatedBy)  ?
		 								("<a title=\"Delete this search\"><span class=\"icon\"ng-click=\"$parent.savedSearchDelete('" + rowData.type + "', '" + rowData.id + "')\"><i class=\"fa fa-times\"></i></span></a>" )  :
		 								"<span title=\"Created by AT&T ID " + rowData.attIdCreatedBy + "\" class=\"icon\"><i class=\"fa fa-user\"></i></span>" ) + 
		 						"</div>"; 
//		 						"<a class=\"btn ui-button btn-xs\"><span class=\"icon\" ng-click=\"$parent.savedSearchMakeDefault('" + rowData.type + "', '" + rowData.id + "')\"><i class=\"fa fa-check-circle\"></i></span></a>&nbsp;" +
//		 						"<a class=\"btn ui-button btn-xs\"><span class=\"icon\"ng-click=\"$parent.savedSearchDelete('" + rowData.type + "', '" + rowData.id + "')\"><i class=\"fa fa-times\"></i></span></a></div>";
	 				}
*/	 				 
         }];

	
	
    init();
    
    //This method sets up callbacks for when the mouse passes over a row in the saved search tables.
	function setupSavedSearchTableButtons(idTable) {
	    jQuery(idTable).on('mouseover', 'tr', function() {
	    	
	    	//Find the first div in the entire row.. it should be the collection of buttons
	    	//Show it when the mouse passes into the row
//	    	jQuery(this).find('div:first').show();
	    	jQuery(this).find('div:first').css({'font-size': '16px'});
	    	
	    }).on('mouseout', 'tr', function() {
	    	
	    	//Now hide the same div when mouse passes out
//	    	jQuery(this).find('div:first').hide();
	    	jQuery(this).find('div:first').css({'font-size': ''});
	    });
	}



    function init() {
 
       $scope.name = "User Profile";
       $scope.params = $stateParams;
       console.log("params = " + angular.toJson($scope.params));

       //Table instance data
       $scope.savedSearchTables = {
    		   USRP: {	optionOverride: commonOptionOverride, columnDefs: commonColumnDefs },
    		   CR:	 {	optionOverride: commonOptionOverride, columnDefs: commonColumnDefs },
    		   SR: 	 {	optionOverride: commonOptionOverride, columnDefs: commonColumnDefs }
       };

       //We need some search types from the global picklist values loaded in app.js
       $rootScope.$watch('picklists', function () {
    	   if ($rootScope.picklists !== undefined) 
    		   populatePicklistData();
       });
    		   

       //TODO:  does it make sense to cache the user profile?  Not sure yet.
       $scope.userProfile = Cache.get('userprofile') || {};
        

    	$scope.savedSearchMakeDefault = function (type, id) {
    		//TODO: Find the old default and unset it, make this id the default
    		//then make server call to save the entire userCustomizedPageSettings object for this user
    		//TODO: Alternatively, make the call on controller destroy... which has it's own set of problems
    		console.log("Saved Search Callback: savedSearchMakeDefault(): id = [" + type + "], id = [" + id + "]");
    		setDefaultSearch(type, id);
    		$scope.savedSearchTables[type].API.updateRows();		//updates entire table since we probably have to update two and it's not a big deal
    	};
    	

    	$scope.savedSearchShareChange = function (type, id) {
    		//TODO: Change the shared setting on this particular saved search
    		//then make server call to upload the saved search
    		console.log("Saved Search Callback: savedSearchShareChange(): id = [" + type + "], id = [" + id + "]");
    		var search = $filter('filter')($scope.userProfile.savedSearchRowData[type], {'id':id }, true);
    		if ( search && search.length > 0 ) {
    			search[0].shared = !search[0].shared;
    			$scope.savedSearchTables[type].API.updateRows( {'id': id} );
    		}
    	};

    	
    	$scope.savedSearchDelete = function (type, id) {
    		//TODO: We need to somehome figure out if this search can be deleted... the button
    		//should not have even been set (hence we couldn't get here) if the user that created this 
    		//isn't us... So that should be good at least.
    		//TODO: Issue server call to delete this guy then pull him out of the table
    		//impact for this is that other users might be using this search
    		console.log("Saved Search Callback: savedSearchDelete(): id = [" + type + "], id = [" + id + "]");
    		var search = $filter('filter')($scope.userProfile.savedSearchRowData[type], {'id':id }, true);
    		if ( search && search.length > 0 )
    			$scope.savedSearchTables[type].API.deleteRows( {'id':id});
    	};

    	
    	$scope.defaultTabChanged = function() {
    		//TODO:  Make server call to save userCustomizedPageSettings... userProfile.searchOrderTypeDefault should already be set
    		//TODO: Alternatively, make the call on controller destroy... which has it's own set of problems
    		console.log("Default tab changed to: " + $scope.userProfile.searchOrderTypeDefault);
    	};
    	
    	$scope.dashboardSearchDefaultChanged = function() {
    		//TODO: The value in userProfile.dashboardSearchTypeDefault has changed... value for that is probably not ok
    		//but we need to write the value anyway to server by 
    		//making server call to save userCustomizedPageSettings... 
    		//TODO: Alternatively, make the call on controller destroy... which has it's own set of problems
    		console.log("Default dashboard type changed:  searchOrderTypeDefault = " + $scope.userProfile.searchOrderTypeDefault +
    				", dashboardSearchValue = " + $scope.userProfile.dashboardSearchValue[$scope.userProfile.searchOrderTypeDefault]);
    	};
    	

    	$scope.dashboardSearchValueChanged = function() {
    		//TODO: Alter HTML to each control type calls this method
    		//then make server server call to save userCustomizedPageSettings... 
    		//TODO: Alternatively, make the call on controller destroy... which has it's own set of problems
    		console.log("Default dashboard type changed:  searchOrderTypeDefault = " + $scope.userProfile.searchOrderTypeDefault +
    				", dashboardSearchValue = " + $scope.userProfile.dashboardSearchValue[$scope.userProfile.searchOrderTypeDefault]);
    	};
    	
    	
   
       $rootScope.$watch('attUid', function () {
    	   if ($rootScope.attUid  &&  !$scope.userProfile.isCached ) {
    		   
    	       $scope.spinnerInProgress = true; 
               getUserProfile();
           };
       });

       
       //Watch when team indicator changes...
       //TODO: we have to do something with this but I don't know what yet, perhaps get more roles, etc.?
       //Not sure what we should be doing here, or even if this checkbox should be here
       
       $rootScope.$watch('lcmTeamIndicator', function(newValue, oldValue) {
    	   if ( $rootScope.lcmTeamIndicator !== undefined &&  $scope.userProfile.lcmFlag !== undefined ) {
    		   $scope.userProfile.lcmFlag = $rootScope.lcmTeamIndicator; 
    		   console.log("lcmTeamIndicator watch fired! newValue = " + newValue + ", oldValue = " + oldValue + ", assigned lcmFlag");
    	   }
       });

       
       //When this controller goes out of scope, cache the user profile object
       $scope.$on( "$destroy", function( event ) {
    	   $scope.userProfile.isCached = true;
    	   Cache.put('userprofile', $scope.userProfile);
    	   
    	   //TODO: Now update userCustomizedPageSettings to server... Don't worry about actual saved search
    	   //changes because updates to those searches (deletes, share changes) have already been made
       });

       
       //We have to delay calls to jquery since we need to let the dom initialize
       $timeout(function () {
    	   //TODO: Maybe adjust the size here? instead of invisibility?
    	   setupSavedSearchTableButtons('#savedSearchTableUSRP');
    	   setupSavedSearchTableButtons('#savedSearchTableCR');
    	   setupSavedSearchTableButtons('#savedSearchTableSR');
//		setupSavedSearchTableButtons('#savedSearchTable');
       }, 0, false);

       
       //Not sure why we need to define this... the spinner directive must set it to true or something
       //If we need it to get user profile, that method turns it on (or the watch on the user, anyway)
       $scope.spinnerInProgress = false;
    }  
    
 
    //Assign various values to local scope
    function populatePicklistData() {
    	console.log("Picklist data arrived");
    	
    	//Array of objects with name property
    	$scope.searchOrderTypes  = $rootScope.picklists.orderTypeList;
        $scope.dashboardSearchTypes = $rootScope.picklists.searchTypeList;
        
        $scope.workgroupList = $rootScope.picklists.workgroupList;
        $scope.agentList = $rootScope.picklists.agentList;
    }
    
    
    function getUserProfile() {

    	$scope.userProfileError = null;

        var promise = JsonGetService.getUserProfile($rootScope.attUid);

 	    promise.then(function(data) {
 			
            console.log("just retrieved user profile => " + angular.toJson(data));
            
            //Assign data from UserDTO
            $scope.userProfile.attUid = data.attUid;
            $scope.userProfile.firstName = data.firstName;
            $scope.userProfile.middleName = data.middleName;
            $scope.userProfile.lastName = data.lastName;
            $scope.userProfile.phone = data.tn;
            $scope.userProfile.email = data.email;
            $scope.userProfile.lcmFlag = data.lcmFlag;
            
            //Assign data from UserCustomizedPageSettingsDTO
            $scope.userProfile.searchOrderTypeDefault = data.userCustomizedPageSettings.tabName;
            $scope.userProfile.dashboardSearchTypeDefault = data.userCustomizedPageSettings.searchType;
            
            //Create a temporary object that holds a current value (in a name property) for each type
            //of dashboard search types as properties
            $scope.userProfile.dashboardSearchValue = {};
            for( var i=0; i<$scope.dashboardSearchTypes.length; i++)
                $scope.userProfile.dashboardSearchValue[$scope.dashboardSearchTypes[i].name] = { name: "" };
            
            //Now assign the actual value
            $scope.userProfile.dashboardSearchValue[$scope.userProfile.dashboardSearchTypeDefault].name = data.userCustomizedPageSettings.searchValue;
            
            //Extract the default IDs
            $scope.userProfile.defaultCrId = data.userCustomizedPageSettings.defaultCrId;
            $scope.userProfile.defaultSrId = data.userCustomizedPageSettings.defaultSrId;
            $scope.userProfile.defaultUsrpId = data.userCustomizedPageSettings.defaultUsrpId;
            
            $scope.userProfile.workgroupList = data.userAssociation.workgroupList["Workgroup(s)"];
            $scope.userProfile.roleList = data.userAssociation.roleList["Roles"];
            $scope.userProfile.strataList = data.userAssociation.customerStrataList["Strata"];
            
            //Map with USRP, CR, SR as keys to arrays of saved searches
    		$scope.userProfile.savedSearchRowData = data.savedSearches;

    		//Alter the data a bit by validating it against what we know to be OK criteria... Maybe this would best be
    		//done on the server?
    		validateCriteria($scope.userProfile.savedSearchRowData.USRP);
    		validateCriteria($scope.userProfile.savedSearchRowData.SR);
    		validateCriteria($scope.userProfile.savedSearchRowData.CR);
    		
    		// pump the data into the tables
    		$scope.savedSearchTables.USRP.API.addRows($scope.userProfile.savedSearchRowData.USRP);
    		$scope.savedSearchTables.SR.API.addRows($scope.userProfile.savedSearchRowData.SR);
    		$scope.savedSearchTables.CR.API.addRows($scope.userProfile.savedSearchRowData.CR);
    		
            $scope.spinnerInProgress = false;
            
		}, function(reason) {
			
			//WS call failed for some reason... This is not recoverable until the use reloads the page
			//Most likely the reason is HTML... 
			$scope.spinnerInProgress = false;
			$scope.userProfileError = reason.errorMsg;
			$scope.userProfileErrorHtml = reason.errorHtml;
      	  
		});
    };

    
    //Go through each saved search and check its criteria against a search types picklist values
    //mark anything strange, out of date, or otherwise WRONG properties as isValidCriteria=false
    
    function validateCriteria(savedSearches) {
    	
    	//TODO: Seriously build the real validation calls... fake it for now
    	for(var i=0; i<savedSearches.length; i++) {
    		savedSearches[i].isInvalidCriteria = savedSearches[i].name == "Saved Search 2" || savedSearches[i].name == "Final Search for CR";
    	}
    	
    	return savedSearches;
    }
    
    
    function isMatchingOwner(attUid) {
    	return $rootScope.attUid == attUid;
    }
    
    
    function isDefaultSearch(type, id) {
    	if ( type === "CR" )
    		return $scope.userProfile.defaultCrId === id;
    	if ( type === "USRP" )
    		return $scope.userProfile.defaultUsrpId === id;
    	if ( type === "SR" )
    		return $scope.userProfile.defaultSrId === id;
    	
    	return false;
    }
    
    
    function setDefaultSearch(type, id) {
    	if ( type === "CR" ) 
    		$scope.userProfile.defaultCrId = ($scope.userProfile.defaultCrId === id ? '' : id);
    	if ( type === "USRP" )
    		$scope.userProfile.defaultUsrpId = ($scope.userProfile.defaultUsrpId === id ? '' : id);
    	if ( type === "SR" )
    		$scope.userProfile.defaultSrId = ($scope.userProfile.defaultSrId === id ? '' : id);
    }
    

	
//============================  Store this table code for a while in case we want to go back to a full table with expanding sections

/*

		//TODO: Have to init this here for table in it's current form, which will change
		$scope.userProfile.savedSearchRowData = [
		    		                             [0, "USRP Orders", "", ""],
		    		                             [1000, "Service Requests", "", ""],
		    		                             [2000, "Customer Requests", "", ""]
		    		                             ];
		

    	$scope.rowExpandCollapse = function (data) {
    		console.log("YEAH!  userProfileController.rowExpandCollapse hit with data = " + data);
    		if ( data === 0 )
        		$scope.savedSearchTable.API.addRows(makeBigTableData(data, $scope.userProfile.savedSearchRowDataUSRP));
    		else if ( data === 1000 )
        		$scope.savedSearchTable.API.addRows(makeBigTableData(data, $scope.userProfile.savedSearchRowDataSR));
    		else if ( data === 2000 )
        		$scope.savedSearchTable.API.addRows(makeBigTableData(data, $scope.userProfile.savedSearchRowDataCR));
    	}

	function makeBigTableData(startIndex, values) {
		var tableRows = [];
		for(var i=0; i<values.length;i++)
			tableRows.push([startIndex + i + 1, values[i], "Description here", "name='bogus', etc."]);
		return tableRows;
	}
	
		//TODO: This will hold the column structure for the saved search tables
		$scope.savedSearchTable = {
//				optionOverride: {
//					ordering: false
//				},
				columnDefs: [
				             {
				            	 "id" : "id",
				            	 "displayName" : "",
				            	 "visible": false,
				            	 "orderable": true
				             }, {
				            	 "id" : "searchId",
				            	 "orderable": false,
				            	 "displayName" : "Search Name", 
				            	 "template": function ( cellData, type, rowValueArray )
		            	 				{	
				            		 		if ( rowValueArray[0] ===  0 || rowValueArray[0] == 1000 || rowValueArray[0] === 2000 )
				            		 			return  "<a style=\"cursor: pointer;\" ng-click=\"$parent.rowExpandCollapse(" + rowValueArray[0] + ")\"><span class=\"icon\"><i class=\"fa fa-plus-circle\"></i></span></a>&nbsp;" + cellData;
				            		 		return "&nbsp;&nbsp;&nbsp;&nbsp;" + cellData; 
		            	 				} 
				             }, {
				            	 "id" : "searchDesc",
				            	 "orderable": false,
				            	 "displayName" : "Description"
				             }, {
				            	 "id" : "searchParams",
				            	 "orderable": false,
				            	 "displayName" : "Parameters",
				            	 "template": function ( cellData, type, rowValueArray )
				            	 				{	
				            		 				if ( rowValueArray[0] ===  0 || rowValueArray[0] == 1000 || rowValueArray[0] === 2000 )
				            		 					return cellData;
				            		 				return cellData + "<div style=\"float: right;\">" + 
				            		 				"<a class=\"btn ui-button btn-xs\"><span style=\"margin-left:-5px; margin-right:5px;\" class=\"icon\"><i class=\"fa fa-check-circle\"></i></span>Set Default</a>&nbsp;" +
				            		 				"<a class=\"btn ui-button btn-xs\"><span style=\"margin-left:-5px; margin-right:5px;\" class=\"icon\"><i class=\"fa fa-times\"></i></span>Delete</a></div>";
				            	 				} 
				             }]
		};

	 * 
	 */
    
    
}]);
