app.controller('DetailsController', ['$scope', '$state', '$stateParams', '$routeParams', 'JsonGetService', '$compile', '$sce', function ($scope, $state, $stateParams, $routeParams, JsonGetService, $compile, $sce) {
	'use strict';
	
	$scope.trustSrc = function(src) {
	    return $sce.trustAsResourceUrl(src);
	  };
	
    init();
    

    function init() {
 
       $scope.name = "Details";
       $scope.params = $stateParams;
       
       $scope.spinnerInProgress = false;
       
       //Initially setup treeview with no data
       $scope.reqconnections_treedata = [];
       $scope.reqconnections = {};
   	
       console.log("params = " + angular.toJson($scope.params));
   
       
       if ($scope.params !== undefined) {
    	   if ($scope.params.orderType === 'Orders') {
    		   getSalesOrderDetails($scope.params.id);
    	   } else if ($scope.params.orderType === 'CR') {
   			   getNxCrOrderDetails($scope.params.id);
   		   } else if ($scope.params.orderType === 'SR') {
   			   getNxSrOrderDetails($scope.params.id);
	       } else if ($scope.params.orderType === 'EFMSCR') {
			   getEfmsCrOrderDetails($scope.params.id);
		   } else if ($scope.params.orderType === 'EFMSSR') {
			   getEfmsSrOrderDetails($scope.params.id);
		   }
   		};
    	   
   		
   		$scope.refreshSubway = function() {
			//Have to do this jquery... since changing the url would force a refresh, but angular is smart enough to know 
			//it didn't actually change if we just do this:
   			//http://stackoverflow.com/questions/6975765/how-to-refresh-an-iframe-automatically
   			//ID of subway iframe is the same across all three detail templates, so no need to track which one we're doing
			$('#ordersSubwayMapIframe').attr("src", $('#ordersSubwayMapIframe').attr("src"));
   		};
    }  
    
   
    
    function getSalesOrderDetails(id) {
    	

        $scope.orderType ="Orders";
        
        $scope.spinnerInProgress = true;
        
    	var promise = JsonGetService.getOrderDetails($scope.orderType, id); //'VS13040076');
              	
        promise.then(function(data) {
        	
        	//We have to examine the contents to see if a failure ocurred and is disguised as success...
			if ( data === undefined || data === null || data.errorStaus != "Success" ) {
				//Assign error message which will show up above the table after digest
				$scope.detailsError = 
					data != undefined && data != null && data.errorMessage != undefined && data.errorMessage != null && data.errorMessage.length > 0 ? 
						data.errorMessage : "Unspecified error from WS call retrieving order detail data";
					
			} else {
        	
	        	$scope.orderDetailsSummary = data.orderDetailsSummary;
	        	$scope.orderProgressSummary = data.orderProgressSummary;
	        	
	         	console.log("subwaymap url for USRP Order = " + $scope.orderDetailsSummary.subwayMapUrl);
	         	
	         	$scope.orderDetailsSummary.subwayMapUrl = "http://d1bas1a1.snt.bst.bls.com:9007/newton/pndExt.html?planId=93B040C0481F4133904A61E79872A78D";
	        	
	        	// populate USO number(s) in USO Information Panel - for display in the container header
	        	var usoTableRows = $scope.orderDetailsSummary.usoTableRows;
	
	            $scope.usoNumbers = [];
	            $scope.efmsLinks = [];
	        	
                $scope.usoInfoList = [];
                
                var usoAttribute = '',
                    usoValue = '';
	        	
	        	for (var i=0; i < usoTableRows.rowValueList.length; i++) {
	        		
	        		var usoInfo = [];
		            	
	            	var cellValues = usoTableRows.rowValueList[i].cellValues;
	            	
	            	for (var j=0; j < usoTableRows.rowMetaData.columnList.length; j++) {

	            		usoAttribute = usoTableRows.rowMetaData.columnList[j].displayName;
	      				usoValue = cellValues[j];
	       		       	
		            	usoInfo.push({name: usoAttribute, value: usoValue});
		            	
		            	// extract usrpActivityId - to be displayed on the USO container header
		            	
		            	var column = usoTableRows.rowMetaData.columnList[j];
			      		
	            		//var usoNumberFound = false;
	            		
	            		/*
	            		if (!usoNumberFound) {
		            		if (column.id === 'usrpActivityId') {
		            		    $scope.usoNumbers.push(cellValues[j]);
        		    
		            		    usoNumberFound = true;
		            		    
		            		    break;
		            		}
		            	}
	            	    */
		            	
		            	if (column.id === 'usoNumber') {
	            		    $scope.usoNumbers.push(cellValues[j]);
    		    		}
		            	
	            		
	            		// the following logic is only valid when uso # is added to the AFF Interface schema
	            		// the BE logic for passing EfmsLink id and the url link value to GUI FE should also be un-commented
	            		var efmsLinkFound = false;
	            		if (!efmsLinkFound) {
		            		if (column.id === 'efmsLink') {
		            		    $scope.efmsLinks.push(cellValues[j]);
		            		    efmsLikFound = true;
		            		    
		            		    break;
		            		}
	            	    }
	          	    }
	            	
	            	$scope.usoInfoList.push(usoInfo);
	 		    }
	     
	                
	            //order, sr, and cr details have the exact save tree data structure so set up the tree
	            //with the values back from the WS call
	            setupOrderProgressTree([$scope.orderProgressSummary.crDto]);
			}
            
        	$scope.spinnerInProgress = false;
            
		}, function(reason) {
			
			//WS call failed for some reason... This is not recoverable until the use reloads the page
			//Most likely the reason is HTML... 
			$scope.spinnerInProgress = false;
			$scope.detailsError = reason.errorMsg;
			$scope.detailsErrorHtml = reason.errorHtml;
      	  
        });
    }
    
	//Setup the tree data, only one primary node
	//Translate only the data we need.. that is, only the data that will
	//be referenced by any of the nodes
	
    function setupOrderProgressTree(list) {
    	
    	$scope.reqconnections_treedata = createChildNodes( list, "progress" );

    	//TODO:  Do we need to unbind anything that might be watching the current node already
    	
        //Bind the tree to the data
        $scope.$watch( 'reqconnections.currentNode', function( newObj, oldObj ) {
            if( $scope.reqconnections && angular.isObject($scope.reqconnections.currentNode) ) {
                console.log( 'Node Selected!! -> ' + $scope.reqconnections.currentNode.id );
            }
        }, false); 

        //Setup the callback for when an internal link on a node link is clicked
		$scope.reqconnections.nodeInternalLinkClicked = function( clickedNode ) {
			
	        //When we're displaying the tree for Orders, the 'progress' type clicks (those at the top level) are CRs...
	        if ( clickedNode.nodeType == 'progress' ) {
	        	//getNxCrOrderDetails(clickedNode.id);
	        	
	        	// only transition to a different state when different id is clicked
	        	if (!($scope.params.orderType === 'CR' && $scope.params.id === clickedNode.id)) 
				    $state.transitionTo('details', {orderType: 'CR', id: clickedNode.id});

	        } else if ( clickedNode.nodeType == 'order' ) {
	        	//getSalesOrderDetails(clickedNode.id);
	        	
	        	// only transition to a different state when different id is clicked
	        	if (!($scope.params.orderType === 'Orders' && $scope.params.id === clickedNode.id)) 
	        	    $state.transitionTo('details', {orderType: 'Orders', id: clickedNode.id});
	        	
	        } else if ( clickedNode.nodeType == 'sr' ) {
	        	//getNxSrOrderDetails(clickedNode.id);
	        	
	        	// only transition to a different state when different id is clicked
	        	if (!($scope.params.orderType === 'SR' && $scope.params.id === clickedNode.id)) 
	        	    $state.transitionTo('details', {orderType: 'SR', id: clickedNode.id});
	        	
	        } 
	        else if ( clickedNode.nodeType == 'efmsCr' ) {
	        	//getNxSrOrderDetails(clickedNode.id);
	        	
	        	// only transition to a different state when different id is clicked
	        	if (!($scope.params.orderType === 'EFMSCR' && $scope.params.id === clickedNode.id)) 
	        	    $state.transitionTo('details', {orderType: 'EFMSCR', id: clickedNode.id});
	        	
	        }else if ( clickedNode.nodeType == 'efmsSr' ) {
	        	//getNxSrOrderDetails(clickedNode.id);
	        	
	        	// only transition to a different state when different id is clicked
	        	if (!($scope.params.orderType === 'EFMSSR' && $scope.params.id === clickedNode.id)) 
	        	    $state.transitionTo('details', {orderType: 'EFMSSR', id: clickedNode.id});
	        	
	        }else {
	        	// uso types are usually external links so this could be included here
		        console.log( 'UNHANDLED internal node click:  nodeType=' + clickedNode.nodeType + ', id=' + clickedNode.id + ', hyperlink=' + clickedNode.hyperlink);
	        }
	    };
    }
    
    
    
    function createProperNodes(node) {
    	if ( node.srList != undefined )
    		return createChildNodes(node.srList, "sr");
    	if ( node.orderList != undefined )
    		return createChildNodes(node.orderList, "order");
    	if ( node.usoList != undefined )
    		return createChildNodes(node.usoList, "uso");
    	
    	if ( node.efmsSrList != undefined )
    		return createChildNodes(node.efmsSrList, "efmsSr");
    	if ( node.efmsCrList != undefined )
    		return createChildNodes(node.efmsCrList, "efmsCr");
    	
    	
    	
    	
    	return [];
    }
    
    
    // [YM] - Adam has updated the schema to include inJeopardy flag in usoHierarchyType
    //        Therefore, no need to extract 'errorId' from USO Information block
    //

    //Looks up a USO ID in the usoTableRows of the order and returns whether or not 
    //the USO is in jeopardy (i.e. the ErrorId value is not empty or null)
    //NOTE:  We can ONLY look up the ErrorId value of USO information, which is returned
    //only in the order details page rows... This is being called from mulitple places
    //i.e. the CR and SR detail pages, in which we have no access to that data
    //TODO:  Look up USO order info in some way?  Rather than just say all is OK?
    
    /*
    function isUSOInJeopardy(usoId) {
    	
    	//If we don't have access to the USO row info... get out with a bogus FALSE
    	//Don't use a try/catch block for the undefined exception since it's fairly expensive
    	
    	if ( $scope.orderDetailsSummary == undefined  ||  $scope.orderDetailsSummary.usoTableRows == undefined )
    		return false;
    	
    	//Scan through each table row, jumping out when we find our usoId (currently, usrpActivityId)
    	for(var i=0; i < $scope.orderDetailsSummary.usoTableRows.length; i++) {
    		
    		//Scan through each column of the usoTableRow[i] object and check for id === 'ErrorId'
      		
    		var usoMatch = {};  
    		for(var k=0; k < $scope.orderDetailsSummary.usoTableRows[i].columnList.length; k++ ) {
    			
      			//If we've found the usoId (currently, usrpActivityId) ... store it if this is a match or else move on
    			// [YM] Adam currently sets UsrpActivityId value on the usoId field - this will be changed later once real uso id is available ...
    			if ( $scope.orderDetailsSummary.usoTableRows[i].columnList[k].id === "usrpActivityId" ) {
    				if ( $scope.orderDetailsSummary.usoTableRows[i].columnList[k].value === usoId ) {
    					
    					//We've found the right usoRow since one of the columns has the right id in the value
    					//now jump out with the hasError value IF we've already encountered that guy
    					//If we haven't encountered the ErrorId yet, just record this uso so 
    					//we can jump out when we DO find the ErrorId later.
    					
    					if ( usoMatch.hasError !== undefined )
    						return usoMatch.hasError;
    					
    					usoMatch.usoId = usoId;
    					
    				} else {
    					//these aren't the uso's you're looking for... move along, move along (to next uso row)
    					break;
    				}
    				
    			} else if (  $scope.orderDetailsSummary.usoTableRows[i].columnList[k].id === "errorId" ) {
    				
    	 			
    				//we've found the ErrorId... jump out with that value only if we've already
    				//discovered that THIS usoRow is the one we want.  If we don't know that yet - as indicated
    				//by the usoId property not being defined in our match object yet, then save the hasError
    				//value for later in case we DO find the uso id match
    				
					// [YM] set usoMatch.hasError flag to true if ErrorId's value is not empty string or null
 	 				if ($scope.orderDetailsSummary.usoTableRows[i].columnList[k].value) {
    					usoMatch.hasError = true;
    				} else {
    					usoMatch.hasError = false;
    				}

    				if ( usoMatch.usoId !== undefined )
    					return usoMatch.hasError;
  
    				
   				}
    		} //k columns 
    	} //i rows
    }
    */
    
    function createChildNodes(list, nodeType) {

    	var i;
    	var nodes = [];
    	
    	if ( list === undefined )
    		return nodes;
    	
    	//For embedded HTML in these nodes, unfortunately we don't have angular active.
    	//Maybe we can compile it first?   Before it gets a second compile?
    	
    	for(i = 0; i < list.length; i++) {
    		
    		//Setup props common to each node type
    		var node =
    			{
        			"displayName": list[i].displayName, 
        			"id" 		 : list[i].cellValue,
        			"hyperlink"  : list[i].hyperlink,
        			"nodeType"   : nodeType,
        			"children"   : createProperNodes(list[i])
    			};
    		
    		//setup custom props for each different node type, if any
    		if ( nodeType === "uso" || nodeType === "order" ) {
    			
    			if (nodeType === "uso" ) {
    			   // node.hasErrors = isUSOInJeopardy(list[i].value);
    				node.hasErrors = (list[i].isJeopardy === 'Yes' ? true : false);
    			}
    			
    			node.efmsLink = list[i].efmsLink;  
    			
    			console.log("+++++ efmsLink = " + node.efmsLink);
    			
     		} else if ( nodeType === "progress" ) {
    			// For the top level list, CR... the id is the id, all others it's the value
    			node.id = list[i].cellValue;  //list[i].id;
    			node.hyperlink = true;			//Also forces a hyperlink internally
    		}
    		
    		nodes.push(node);
    	}
    	
    	return nodes;
    }
    

    function getNxCrOrderDetails(id) {
    	// display order details in Details Porlet by passing the following values to 
    	// the BE rest call :
    	//
    	// orderType
    	// id - cr/sr/oders


        $scope.orderType ="CR";
    	
    	$scope.spinnerInProgress = true;
        
    	var promise = JsonGetService.getOrderDetails($scope.orderType, id); //'13-2002');
              	
        promise.then(function(data) {
       	
        	//We have to examine the contents to see if a failure ocurred and is disguised as success...
			if ( data === undefined || data === null || data.errorStaus != "Success" ) {
				//Assign error message which will show up above the table after digest
				$scope.detailsError = 
					data != undefined && data != null && data.errorMessage != undefined && data.errorMessage != null && data.errorMessage.length > 0 ? 
						data.errorMessage : "Unspecified error from WS call retrieving order detail data";
					
			} else {
        	
	        	$scope.crDetailsSummary = data.crDetailsSummary;
	        	$scope.crProgressSummary = data.crProgressSummary;
	        		        	
	        	//console.log(angular.toJson(data.crProgressSummary.crDto));
	        	
	        	console.log("subwaymap url for CR = " + $scope.crDetailsSummary.subwayMapUrl);
	        	
	          	$scope.crDetailsSummary.subwayMapUrl = "http://d1bas1a1.snt.bst.bls.com:9007/newton/pndExt.html?planId=93B040C0481F4133904A61E79872A78D";
	 	       
	
	            //order, sr, and cr details have the exact save tree data structure so set up the tree
	            //with the values back from the WS call
	            setupOrderProgressTree([$scope.crProgressSummary.crDto]);
			}
        	
        	$scope.spinnerInProgress = false;
        	
		}, function(reason) {
			
			//WS call failed for some reason... This is not recoverable until the use reloads the page
			//Most likely the reason is HTML... 
			$scope.spinnerInProgress = false;
			$scope.detailsError = reason.errorMsg;
			$scope.detailsErrorHtml = reason.errorHtml;
      	  
        });
    }
    
    
    
    function getNxSrOrderDetails(id) {
    	// display order details in Details Porlet by passing the following values to 
    	// the BE rest call :
    	//
    	// orderType
    	// id - cr/sr/oders

        $scope.orderType ="SR";
    	
    	$scope.spinnerInProgress = true;
        
    	var promise = JsonGetService.getOrderDetails($scope.orderType, id);  //'13-2002-01');
              	
        promise.then(function(data) {
        	
        	//We have to examine the contents to see if a failure ocurred and is disguised as success...
			if ( data === undefined || data === null || data.errorStaus != "Success" ) {
				//Assign error message which will show up above the table after digest
				$scope.detailsError = 
					data != undefined && data != null && data.errorMessage != undefined && data.errorMessage != null && data.errorMessage.length > 0 ? 
						data.errorMessage : "Unspecified error from WS call retrieving order detail data";
					
			} else {
        	
	        	$scope.srDetailsSummary = data.srDetailsSummary;
	        	$scope.srProgressSummary = data.srProgressSummary;
	        	
	         	console.log("subwaymap url for SR = " + $scope.srDetailsSummary.subwayMapUrl);
	        	
	          	$scope.srDetailsSummary.subwayMapUrl = "http://d1bas1a1.snt.bst.bls.com:9007/newton/pndExt.html?planId=93B040C0481F4133904A61E79872A78D";
	 	       
	          	
	        	// populate Site Name(s) in Site Information Panel - for display in the container header
	        	var siteInfoTableRows = $scope.srDetailsSummary.siteInfoTableRows;
	       
	        	$scope.siteNames = [];
	        	
	        	$scope.siteInfoList = [];
	                
                var siteAttribute = '',
                    siteValue = '',
                    hyperlink = '';
	        	
	        	for (var i=0; i < siteInfoTableRows.rowValueList.length; i++) {
	        		
	        		var siteInfo = [];
		            	
	            	var cellValues = siteInfoTableRows.rowValueList[i].cellValues;
	            	
	            	for (var j=0; j < siteInfoTableRows.rowMetaData.columnList.length; j++) {

	            		siteAttribute = siteInfoTableRows.rowMetaData.columnList[j].displayName;
	      				hyperlink = siteInfoTableRows.rowMetaData.columnList[j].hyperlink;
	      				siteValue = cellValues[j];
     		       	
		            	siteInfo.push({name: siteAttribute, value: siteValue, hyperlink: hyperlink});
	          	    }
	            	
	            	$scope.siteInfoList.push(siteInfo);
	 		    }

	        	
	            for (var i=0; i < siteInfoTableRows.rowValueList.length; i++) {
	            	
	            	var cellValues = siteInfoTableRows.rowValueList[i].cellValues;
	            	
	            	for (var j=0; j < siteInfoTableRows.rowMetaData.columnList.length; j++) {
	            		
	            		var column = siteInfoTableRows.rowMetaData.columnList[j];
	            			
	            		var siteNameFound = false;
	            		
	            		if (!siteNameFound) {
		            		if (column.id === 'siteName') {
		            		    $scope.siteNames.push(cellValues[j]);
		            		    siteNameFound = true;
		            		    
		            		    break;
		            		}
	            	    }

	            	}
	            }
	        

	            //order, sr, and cr details have the exact save tree data structure so set up the tree
	            //with the values back from the WS call
	            setupOrderProgressTree([$scope.srProgressSummary.crDto]);
			}
        	
        	$scope.spinnerInProgress = false;
          	
		}, function(reason) {
			
			//WS call failed for some reason... This is not recoverable until the use reloads the page
			//Most likely the reason is HTML... 
			$scope.spinnerInProgress = false;
			$scope.detailsError = reason.errorMsg;
			$scope.detailsErrorHtml = reason.errorHtml;
      	  
        });
    }
    
    
    function getEfmsCrOrderDetails(id) {
        
        $scope.orderType ="EFMSCR";
    	
    	$scope.spinnerInProgress = true;
        
    	var promise = JsonGetService.getOrderDetails($scope.orderType, id);  
              	
        promise.then(function(data) {
        	
        	//We have to examine the contents to see if a failure ocurred and is disguised as success...
			if ( data === undefined || data === null || data.errorStaus != "Success" ) {
				//Assign error message which will show up above the table after digest
				$scope.detailsError = 
					data != undefined && data != null && data.errorMessage != undefined && data.errorMessage != null && data.errorMessage.length > 0 ? 
						data.errorMessage : "Unspecified error from WS call retrieving order detail data";
					
			} else {
        	
	        	$scope.efmsCrDetailsSummary = data.efmsCrDetailsSummary;
	        	$scope.efmsCrProgressSummary = data.efmsCrProgressSummary;

	     	
	         	console.log("subwaymap url for EFMS CR = " + $scope.efmsCrDetailsSummary.subwayMapUrl);
	        	
	          	$scope.efmsCrDetailsSummary.subwayMapUrl = "http://d1bas1a1.snt.bst.bls.com:9007/newton/pndExt.html?planId=93B040C0481F4133904A61E79872A78D";
	 	       
	     
	            //order, sr, and cr details have the exact save tree data structure so set up the tree
	            //with the values back from the WS call
	            setupOrderProgressTree([$scope.efmsCrProgressSummary.crDto]);
			}
        	
        	$scope.spinnerInProgress = false;
          	
		}, function(reason) {
			
			//WS call failed for some reason... This is not recoverable until the use reloads the page
			//Most likely the reason is HTML... 
			$scope.spinnerInProgress = false;
			$scope.detailsError = reason.errorMsg;
			$scope.detailsErrorHtml = reason.errorHtml;
      	  
        });
    }
  
    
    
    function getEfmsSrOrderDetails(id) {
    
        $scope.orderType ="EFMSSR";
    	
    	$scope.spinnerInProgress = true;
        
    	var promise = JsonGetService.getOrderDetails($scope.orderType, id);  
              	
        promise.then(function(data) {
        	
        	//We have to examine the contents to see if a failure ocurred and is disguised as success...
			if ( data === undefined || data === null || data.errorStaus != "Success" ) {
				//Assign error message which will show up above the table after digest
				$scope.detailsError = 
					data != undefined && data != null && data.errorMessage != undefined && data.errorMessage != null && data.errorMessage.length > 0 ? 
						data.errorMessage : "Unspecified error from WS call retrieving order detail data";
					
			} else {
        	
	        	$scope.efmsSrDetailsSummary = data.efmsSrDetailsSummary;
	        	$scope.efmsSrProgressSummary = data.efmsSrProgressSummary;
	        	
	         	console.log("subwaymap url for EFMS SR = " + $scope.efmsSrDetailsSummary.subwayMapUrl);
	        	
	          	$scope.efmsSrDetailsSummary.subwayMapUrl = "http://d1bas1a1.snt.bst.bls.com:9007/newton/pndExt.html?planId=93B040C0481F4133904A61E79872A78D";
	 	       
	     
	            //order, sr, and cr details have the exact save tree data structure so set up the tree
	            //with the values back from the WS call
	            setupOrderProgressTree([$scope.efmsSrProgressSummary.crDto]);
			}
        	
        	$scope.spinnerInProgress = false;
          	
		}, function(reason) {
			
			//WS call failed for some reason... This is not recoverable until the use reloads the page
			//Most likely the reason is HTML... 
			$scope.spinnerInProgress = false;
			$scope.detailsError = reason.errorMsg;
			$scope.detailsErrorHtml = reason.errorHtml;
      	  
        });
    }
    
    
    /////////////
    
	$scope.updateSearchArrowIcon = function(e) {
		

		if(e.currentTarget.id == "crCollapsibleSubwayMap"){

			var currentArrow = $('#crCollapsibleSubwayMap span i').attr('class');

			if(currentArrow == "fa fa-arrow-right"){

				$('#crCollapsibleSubwayMap span i').removeClass('fa fa-arrow-right').addClass('fa fa-arrow-down');
			}
			else{

				$('#crCollapsibleSubwayMap span i').removeClass('fa fa-arrow-down').addClass('fa fa-arrow-right');
			}

		}
		else if(e.currentTarget.id == "crCollapsibleOrderDetails"){

			var currentArrow = $('#crCollapsibleOrderDetails span i').attr('class');

			if(currentArrow == "fa fa-arrow-right"){

				$('#crCollapsibleOrderDetails span i').removeClass('fa fa-arrow-right').addClass('fa fa-arrow-down');
			}
			else{

				$('#crCollapsibleOrderDetails span i').removeClass('fa fa-arrow-down').addClass('fa fa-arrow-right');
			}
		}
		else if(e.currentTarget.id == "srCollapsibleSubwayMap"){

			var currentArrow = $('#srCollapsibleSubwayMap span i').attr('class');

			if(currentArrow == "fa fa-arrow-right"){

				$('#srCollapsibleSubwayMap span i').removeClass('fa fa-arrow-right').addClass('fa fa-arrow-down');
			}
			else{

				$('#srCollapsibleSubwayMap span i').removeClass('fa fa-arrow-down').addClass('fa fa-arrow-right');
			}
		}
		else if(e.currentTarget.id == "srCollapsibleOrderDetails"){

			var currentArrow = $('#srCollapsibleOrderDetails span i').attr('class');

			if(currentArrow == "fa fa-arrow-right"){

				$('#srCollapsibleOrderDetails span i').removeClass('fa fa-arrow-right').addClass('fa fa-arrow-down');
			}
			else{

				$('#srCollapsibleOrderDetails span i').removeClass('fa fa-arrow-down').addClass('fa fa-arrow-right');
			}
		}
		else if(e.currentTarget.id == "srCollapsibleSiteName"){

			var currentArrow = $('#srCollapsibleSiteName span i').attr('class');

			if(currentArrow == "fa fa-arrow-right"){

				$('#srCollapsibleSiteName span i').removeClass('fa fa-arrow-right').addClass('fa fa-arrow-down');
			}
			else{

				$('#srCollapsibleSiteName span i').removeClass('fa fa-arrow-down').addClass('fa fa-arrow-right');
			}
		}
		else if(e.currentTarget.id == "orderCollapsibleSubwayMap"){

			var currentArrow = $('#orderCollapsibleSubwayMap span i').attr('class');

			if(currentArrow == "fa fa-arrow-right"){

				$('#orderCollapsibleSubwayMap span i').removeClass('fa fa-arrow-right').addClass('fa fa-arrow-down');
			}
			else{

				$('#orderCollapsibleSubwayMap span i').removeClass('ifa fa-arrow-down').addClass('fa fa-arrow-right');
			}
		}
		else if(e.currentTarget.id == "orderCollapsibleOrderDetails"){

			var currentArrow = $('#orderCollapsibleOrderDetails span i').attr('class');

			if(currentArrow == "fa fa-arrow-right"){

				$('#orderCollapsibleOrderDetails span i').removeClass('fa fa-arrow-right').addClass('fa fa-arrow-down');
			}
			else{

				$('#orderCollapsibleOrderDetails span i').removeClass('fa fa-arrow-down').addClass('fa fa-arrow-right');
			}
		}
		else if(e.currentTarget.id == "orderCollapsibleUSO"){

			var currentArrow = $('#orderCollapsibleUSO span i').attr('class');

			if(currentArrow == "fa fa-arrow-right"){

				$('#orderCollapsibleUSO span i').removeClass('fa fa-arrow-right').addClass('fa fa-arrow-down');
			}
			else{

				$('#orderCollapsibleUSO span i').removeClass('fa fa-arrow-down').addClass('fa fa-arrow-right');
			}
		}
		else{

		}
	};
    
}]);
