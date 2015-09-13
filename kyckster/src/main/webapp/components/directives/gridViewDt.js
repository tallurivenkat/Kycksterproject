app.directive('gridViewDt', function ($window, $compile, $location, $timeout) {
	'use strict';
	
    return {
        restrict: 'A, C',
        replace: true,
        
        //Declare isolate scope so we can use multiple table controls in the same controller
        //and we don't bear the danger of controller scope effecting anything here
        scope: {
        	tableInstance: "=",			//Maps to the object in the controller scope holding definition, api, etc.
        	rowData: "=",				//Maps to the object in the controller scope holding an array of row value arrays
        	optionOverride: "=",				//Maps to options that override DataTable options
        	fireDetail: "&"			//Maps to controller's getDetailsResult(orderType,id) method
        },

        
        link: function (scope, element, attrs) {
        	
        	console.log("===========  NEW gridViewDt directive created: id=" + attrs.id);

    		//External API to redraw the table
        	
    		scope.reDraw = function() {
				if ( $.fn.dataTable.fnIsDataTable(document.getElementById(attrs.id)) ) {
					element.DataTable().draw();
	      		} 
    		};
    		
    		
    		scope.update = function() {
				if ( $.fn.dataTable.fnIsDataTable(document.getElementById(attrs.id)) ) {
					element.DataTable()
					.rows()
					.invalidate()
					.draw();
	      		} 
    		};
    		
    		
    		//External API to see if actual DataTable exists... could be with or without data
    		scope.isTableExist = function() {
    			return $.fn.dataTable.fnIsDataTable(document.getElementById(attrs.id));
    		};

    		
    		//External API to add rows to the table  [ [col, col, col], [col, col, col] ]   format
    		scope.addRows = function(data) {
				if ( $.fn.dataTable.fnIsDataTable(document.getElementById(attrs.id)) ) {
					element.DataTable()
					.rows
					.add(data)
					.draw();
	      		} 
    		};

    		
    		//External API to delete the row identified by the data in this object
    		scope.deleteRows = function(dataSelector) {
				if ( $.fn.dataTable.fnIsDataTable(document.getElementById(attrs.id)) ) {
					
					//Now delete each of these rows, if any
					element.DataTable()
					.rows(convertSelectorToIndexArray(dataSelector))
					.remove()
					.draw();
	      		} 
    		};

    		
    		//External API to update the data represented in rows matching the passed in data
    		//Passed as an array of indexes or and object to match or undefined (whole table)
    		
    		scope.updateRows = function(dataSelector) {
				if ( $.fn.dataTable.fnIsDataTable(document.getElementById(attrs.id)) ) {

					//Now select the rows based on the array of indexes
					element.DataTable()
						.rows(convertSelectorToIndexArray(dataSelector))
						.invalidate()
						.nodes()
						.each( function (rowTR, rowIdx) {
							$compile(rowTR)(scope);
						})
						.draw();
	      		} 
    		};
    		
    		
    		//Setup and API for the controller to call in our directive
    		//https://groups.google.com/forum/#!topic/angular/htKUVVNhi7A
    		
    		scope.tableInstance.API = {
    			reDraw:			scope.reDraw,
    			isTableExist:	scope.isTableExist,
    			addRows:		scope.addRows,
    			deleteRows:		scope.deleteRows,
    			updateRows:		scope.updateRows
			};


			var recalcLayout = function(id) {
				
				//If we've initialized a table, make sure to adjust the column headings
				//since they live in a seperate div and sometimes don't redraw properly

				if ( $.fn.dataTable.fnIsDataTable(document.getElementById(id)) ) {
	
					//Redraw the tables columns since we've resized, but only on tables that are showing
					var dt = element.dataTable();
					
					//Want to assess whether or not the table is hidden in a tab and doesn't need it's columns resized
					//but the dt.lengh > 0 trick doesn't seem to work (since length seems to always be 1)
					dt.fnAdjustColumnSizing();
				}
			};

        	//We need to bind to the window resize so we can tell the table's headers to recalculate
        	//Headers and table rows exist in different tables and don't stay in width sync, unfortunately.
        	//DataTables recommends compensating for this when resizes are needed by manually calculating widths.
        	//The problem ocurrs mainly when using sScrollX and sScrollXInner
        	//http://datatables.net/forums/discussion/13767/sscrollx-and-sscrollxinner-column-alignments/p1
        	//http://datatables.net/forums/discussion/comment/30608
        	
        	//An alternative solution could be to recalcuate every time the table redraws
        	//http://datatables.net/forums/discussion/comment/10385
        	
        	angular.element($window).bind('resize', function() {
        		recalcLayout(attrs.id);
        	});

        	
        	//Have to unbind from the resize event when this directive is destroyed
            scope.$on('$destroy', function() {
//            	console.log("----------- Destroy on table attrs.id=" + attrs.id);
                angular.element($window).unbind('resize');
            });

     
            //Setup an event that's fired when the controller thinks this table needs to re-layout it's columns
            scope.$on('layout', function() {
            	// You might need this timeout to be sure its run after DOM render.
                $timeout(function () {
                	recalcLayout(attrs.id);
                }, 0, false);
            });
            

        	//Setup local storage saving/loading methods so we can keep the state of our filter, columns, etc.
            //We need to override this so we can store our state according to our 3 different table types
            //Don't register these methods if we only want to store one set of parameters... i.e.  if we want
            //the same set of filters and columns to apply to all table searches
            
            var getLocalStorageKey = function() {
  
            	return 'DataTables_' + $location.host() + '_' + attrs.id;
            };
            
        	var saveState = function (oSettings, oData) {
        		
        		//Only try to store the state of the table if loadTrigger isn't zero - indicating a desire
        		//to kill the table
        		
        		console.debug("<<< saveState() called, key=" + getLocalStorageKey() + (scope.tableInstance.loadTrigger == 0 ? ", NOT STORING!" : "") );
    			
        		if ( scope.tableInstance.loadTrigger > 0  ) {
        			//Store the actual table parms the table manages
        			localStorage.setItem( getLocalStorageKey(), angular.toJson(oData) );
        		}
            };
            
            var loadState = function (oSettings) {
        		console.debug(">>> loadState() called, key=" + getLocalStorageKey());
        		return angular.fromJson(localStorage.getItem(getLocalStorageKey()));
            };
            
            

            //This catches our tablelink callbacks and forwards to the controller's method
    		scope.getDetailsResult = function(orderType, id)
    		{
    			scope.fireDetail({'orderType': orderType, 'id': id});
    		};


    		scope.cellEvent = function(data)
    		{
    			console.log('cellEvent fired: data = ' + data);
    		};



    		//We can't build the table in the link function... So wait until angular detects we have
    		//column defs and then attempt to build the table.  Normally these shouldn't change once the table
    		//is created. 
    		
            scope.$watch("tableInstance.columnDefs", function() {

            	console.log("===========  $watch on columnDefs hit");
            	
           		if ( scope.tableInstance.columnDefs !== undefined  && scope.tableInstance.columnDefs.length > 0 ) {
        		
        			//Setup some locals to seperate column from row data 
        			var localColumnDefs = [];

        	    	//Convert the array of 
        	    	for(var n=0; n < scope.tableInstance.columnDefs.length; n++)
    	      		{
        	    		var column = scope.tableInstance.columnDefs[n];
	      				var columnOptions = {
	            	      		"defaultContent": column.defaultContent === undefined ? "" : column.defaultContent,
	      						"title": column.displayName,
	      						"visible": column.visible === undefined ? true : column.visible,
//	      						"dataProp": column.id, 
	      						"targets": n							//can also be an array 
	      				};

	      				//Only if data is defined do we want to tell the table to use this specific 
	      				//property... otherwise it uses the index into the row array
	      				if ( column.data )
	      					columnOptions['data'] = column.data;
	      				
	      				if ( column.width )
	      					columnOptions['width'] = column.width;		//defaults to autoWidth
	
	      				//Only define this if there should be a rendering callback for hyperlinks
	      				//TODO: We need to make a generic template string or function or something!!!
		    			if( column.template )
	    					columnOptions["render"] = { '_': 'data', 'display': column.template };
	    						
	      				localColumnDefs.push(columnOptions);
    	      		}
        	    	
        			//We've just finished creating localColumnDefs (column data only)
        	      	//Proceed to prepare the table for construction
        	      	
        	      	var isExistingTable = scope.isTableExist();
        	      	
        	      	//First see if we have an existing table so we can decide if we need to kill it... 
        	      	if ( isExistingTable  && localColumnDefs.length > 0  ) {
        	      		
        	      		//If a table already exists and we have columns... then we should kill it
        	      		//If a table already exists but there is no key... then the controller wants to kill the table and not regenerate
    	        				
   	      				element.DataTable().clear();
   	      				element.DataTable().destroy();
   	      				$("#"+attrs.id).empty();
   	      			} 

        	      	var options =  !scope.optionOverride ? (!scope.tableInstance.optionOverride ? {} : scope.tableInstance.optionOverride) : scope.optionOverride;
        	      	var dataTable = element.DataTable($.extend(getTableCreateOptions(localColumnDefs), options));
	
       				if ( scope.rowData != undefined )
       					dataTable.rows.add(scope.rowData).draw();
           			
        		}  //if tableDefinition !== undefined
        		
        	});  // watch on columnDefs


            //Select rows in this table instance that match 
            function selectRows(data) {
            	
            }
            
            //Create options for construction of the table... The only variable at this point is the 
            //column definitions
            
            function getTableCreateOptions(columns) {
            	return {
            			jQueryUI: true,
            			dom: "<'row'>t<'row'>",
 						language: {
      					         "emptyTable": 'No records available'
  					    },
            			columnDefs: columns,
            			retrieve: true,
            			
            			//This method is called everytime DataTables adds a row to the table
            			createdRow: function( nRow, aData, iDataIndex ) {
            				//We need to compile the newly added row in case HTML with angular attributes was injected
            				//into the TD's or they won't work
            				$compile(nRow)(scope);
            			},
            			
            			//Controls column smart sizes... no need to specify in column defs, ON by default
	            		autoWidth: true,
	            		
            			scrollX: "100%",
	            		scrollY: "300px",
//	            		scrollCollapse: true,
            			paging: false,
            			
            			//These parameters enable state saving in local storage and register
            			//callbacks so we can modify where they're stored since we have 3 tables
            			bStateSave: false,
            	        stateSaveCallback: saveState,
            	        stateLoadCallback: loadState
        	      	};
            };
            
    		//Take an object whose properties are meant to match properties in our rows
    		//and convert that to a representation of an array of indexes.
    		
    		function convertSelectorToIndexArray(selector) {
    			
    			if ( typeof selector === "object" ) {
					//Make it an array of indexes that match the object
					return element.DataTable().rows().flatten().filter( function (rowIdx) {
								var match = selector || {};
								var rowObject = element.DataTable().row(rowIdx).data();
								for (var prop in match) {
									if ( !rowObject.hasOwnProperty(prop) || rowObject[prop] !== match[prop] )
										return false;
								}
								return true;
							})
							.toArray();
				}

    			//If selector is anything other than the object type... simply return it.
    			//It could already be an array of integers (indexes) or undefinded (for all)
    			//or an integer for a specific index
    			return selector;
    		};
            
            
        }, 	//link method

    };
});

