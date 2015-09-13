app.controller('UserAdminController', ['$scope', '$state', '$stateParams', '$routeParams', 'JsonGetService', 'JsonPostService',  function ($scope, $state, $stateParams, $routeParams, JsonGetService, JsonPostService) {
	'use strict';
	
	
    init();
    

    function init() {
 
       $scope.name = "User Profile";
       $scope.params = $stateParams;
       
       $scope.userAdmin = {};

    
       console.log("params = " + angular.toJson($scope.params));
   
       
       $scope.spinnerInProgress = true;
       
       getSearchPicklistValues();
       
    }  
    
 
    
    
    
	$scope.userProfileSearch = function() {

    	var postData = {
    			attUid: $scope.userAdmin.uid,
    			//orderActionList: $scope.userAdmin.orderActionList,
    			portSpeed: $scope.userAdmin.portSpeed.name,
				marketSegment: $scope.userAdmin.marketSegment.name,
				accessType: $scope.userAdmin.accessType.name,
				service: $scope.userAdmin.service.name,
				workgroup: $scope.userAdmin.workgroup.name,
				localAccessArrangement: $scope.userAdmin.localAccessArrangement.name,
				bvoipType: $scope.userAdmin.bvoipType.name,
				bvoipSiteType: $scope.userAdmin.bvoipSiteType.name,
				region: $scope.userAdmin.region.name
    	};
    	
  
		console.log("user profile search request ==> " + angular.toJson(postData));
		
		var promise = JsonPostService.getUserProfileSearchResults(postData);
			
		promise.then(function(data) {
			console.log("user profile search results ==> " + angular.toJson(data));
			
		});
		
		/*
		if (searchOrderType === "USRP Sales Order") {
			var value=$scope.orderSearch.lcm.name;
			splitAttid(value);
			var postData= {  
					orderId:$scope.orderSearch.usrpOrderId,
					orderStatus:$scope.orderSearch.usrpOrderStatus.name,
					inJeopardy:$scope.orderSearch.inJeopardy.name,
					uso:$scope.orderSearch.uso,
					customerName:$scope.orderSearch.customerName,
					creationStartDate:orderCreationStartDate.value,
					creationEndDate:orderCreationEndDate.value,
					completionStartDate:orderCompletionStartDate.value,
					completionEndDate:orderCompletionEndDate.value,
					lcmAttUid: $scope.lcmid
			};
			console.log("=============== USRP Search, postData = " + angular.toJson(postData));
			if(postData.completionStartDate=="" &&	postData.completionEndDate=="" &&
					postData.creationStartDate=="" && postData.creationEndDate=="" &&
					postData.customerName==undefined && postData.inJeopardy=="" &&
					postData.lcmAttUid=="" && postData.orderId==undefined  &&
					postData.orderStatus=="" && postData.uso==undefined)
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
				$scope.outstandingSearchRequest.promise.then(function(data) {

					processSearchResult(data, 'USRP');			//turns off spinner, kicks table into gear, ensures tab is open or closed
				});
			}
		*/
		};
    
    
    
    
	function getSearchPicklistValues() {
	       
		var promise = JsonGetService.getSearchPicklistValues();
		
		promise.then(function(data) {
			
			//console.log(" after Search Picklists call ==> " + angular.toJson(data));

			$scope.userAdmin.orderActionList = data.orderActionList;
			$scope.userAdmin.portSpeedList = data.portSpeedList;
			$scope.userAdmin.marketSegmentList = data.marketSegmentList;
			$scope.userAdmin.accessTypeList = data.accessTypeList;
			$scope.userAdmin.serviceList = data.serviceList;
			
			
			$scope.userAdmin.workgroupList = data.workgroupList;
			$scope.userAdmin.localAccessArrangementList = data.localAccessArrangementList;
			$scope.userAdmin.bvoipTypeList = data.bvoipTypeList;
			$scope.userAdmin.bvoipSiteTypeList = data.bvoipSiteTypeList;
			$scope.userAdmin.regionList = data.regionList;
			
			
			$scope.userAdmin.orderAction = $scope.userAdmin.orderActionList[0];
			$scope.userAdmin.portSpeed = $scope.userAdmin.portSpeedList[0];
			$scope.userAdmin.marketSegment = $scope.userAdmin.marketSegmentList[0];
			$scope.userAdmin.accessType = $scope.userAdmin.accessTypeList[0];
			$scope.userAdmin.service = $scope.userAdmin.serviceList[0];
			
			$scope.userAdmin.workgroup = $scope.userAdmin.workgroupList[0];
			$scope.userAdmin.localAccessArrangement = $scope.userAdmin.localAccessArrangementList[0];
			$scope.userAdmin.bvoipType = $scope.userAdmin.bvoipTypeList[0];
			$scope.userAdmin.bvoipSiteType = $scope.userAdmin.bvoipSiteTypeList[0];
			$scope.userAdmin.region = $scope.userAdmin.regionList[0];
			
			
 	        $scope.spinnerInProgress = false; 
		});
	}
    
}]);
