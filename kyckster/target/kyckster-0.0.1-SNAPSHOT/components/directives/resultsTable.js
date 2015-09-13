app.directive('searchResultTable', function ($window,$filter, $compile, $location, $timeout) {
	'use strict';

	return {
		restrict: 'E, A, C',

		//Declare isolate scope so we can use multiple table controls in the same controller
		//and we don't bear the danger of controller scope effecting anything here
		scope: {
			tableData: "=",			//Maps to the object in the controller scope holding rows, etc.
			fireDetail: "&"			//Maps to controller's getDetailsResult(orderType,id) method
		},


		link: function (scope, element, attrs, controller) {

//			console.log("===========  NEW resultsTable directive created: id=" + attrs.id);

			var recalcLayout = function(id) {

				//If we've initialized a table, make sure to adjust the column headings
				//since they live in a seperate div and sometimes don't redraw properly

				if ( $.fn.dataTable.fnIsDataTable(document.getElementById(id)) ) {

					//Redraw the tables columns since we've resized, but only on tables that are showing
					var dt = element.dataTable();

					//Want to assess whether or not the table is hidden in a tab and doesn't need it's columns resized
					//but the dt.lengh > 0 trick doesn't seem to work (since length seems to always be 1)
//					if ( dt.length > 0 ) {
//					console.log("----------- Resize on table attrs.id=" + attrs.id);
					dt.fnAdjustColumnSizing();
//					}

					//If we're using a FixedColumn plugin, it will need to recalc the first column
					//	var oSettings = dt.fnSettings();
					//	if ( oSettings.oFixedColumns != undefined )
					//		oSettings.oFixedColumns.fnRedrawLayout();
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
//				console.log("----------- Destroy on table attrs.id=" + attrs.id);
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

//				console.debug("<<< saveState() called, key=" + getLocalStorageKey() + (scope.tableData.loadTrigger == 0 ? ", NOT STORING!" : "") );

				if ( scope.tableData.loadTrigger > 0  ) {
					//Store the actual table parms the table manages
					localStorage.setItem( getLocalStorageKey(), angular.toJson(oData) );
					//now try to store the last rendered column defs in case we need them upon next generation 
					//across a different session when we get no rows or columns back from a search and we'll want to 
					//do a decent guess at what the columns WOULD be had there been any row data
					if ( scope.lastColumnDefs != undefined )
						localStorage.setItem( getLocalStorageKey() + "_COL", angular.toJson(scope.lastColumnDefs));
				}
			};

			var loadState = function (oSettings) {
//				console.debug(">>> loadState() called, key=" + getLocalStorageKey());
				return angular.fromJson(localStorage.getItem(getLocalStorageKey()));
			};


			//Called to load the last columns returned from a prior session... Can't do this in the loadState
			//since that's called during the actual table construction and we need the column defs as a last resort
			//before the table is constructed
			//must return null if not found

			function getStoredLastColumnDefs() {
//				console.debug(">>> getStoredLastColumnDefs() called, key=" + getLocalStorageKey()+"_COL");
				var columns = localStorage.getItem(getLocalStorageKey()+"_COL");
				return columns == null  ||  columns == "" ? null : angular.fromJson(columns);
			}


			//Setup local storage parameters adjustement methods 
			//To enable these callbacks for storage of extra info in each table... uncomment
			//their function pointers in the initialization of the table

			var saveStateExtraParams = function (oSettings, oData) {
				console.log("<<< saveStateExtraParams() called");
			};

			var loadStateExtraParams = function(oSettings) {
				console.log(">>> loadStateExtraParams() called");
			}

			//Setup a column mapping for rendering callbacks to our scope... we'll translate later
			//to our controller's parent scope either through events or callbacks, etc.

			var renderDataLinks = {
					'orderId': function ( data, type, full ) {

						return type !== 'display' ? data :
							('<a id="tablelinks" ng-click="getDetailsResult(\'Orders\',\'' +  data + '\');">' + data + '</a>');
					},
					'serviceOrderId': function ( data, type, full ) {

						return type !== 'display' ? data :
							('<a id="tablelinks" ng-click="getDetailsResult(\'Orders\',\'' +  data + '\');">' + data + '</a>');
					},


					'nxCrId':  		function ( data, type, full ) {

						return type !== 'display' ? data :
							('<a id="tablelinks" ng-click="getDetailsResult(\'CR\',\'' +  data + '\');">' + data + '</a>');
					},

					'nxSrId':  		function ( data, type, full ) {

						return type !== 'display' ? data :
							('<a id="tablelinks" ng-click="getDetailsResult(\'SR\',\'' +  data + '\');">' + data + '</a>');
					},
					
					'ocxCrId':  		function ( data, type, full ) {

						return type !== 'display' ? data :
							('<a id="tablelinks" ng-click="getDetailsResult(\'CR\',\'' +  data + '\');">' + data + '</a>');
					},

					'ocxSrId':  		function ( data, type, full ) {

						return type !== 'display' ? data :
							('<a id="tablelinks" ng-click="getDetailsResult(\'SR\',\'' +  data + '\');">' + data + '</a>');
					},

					'efmsCrId':  		function ( data, type, full ) {

						return type !== 'display' ? data :
							('<a id="tablelinks" ng-click="getDetailsResult(\'EFMSCR\',\'' +  data + '\');">' + data + '</a>');
					},

					'efmsSrId':  		function ( data, type, full ) {

						return type !== 'display' ? data :
							('<a id="tablelinks" ng-click="getDetailsResult(\'EFMSSR\',\'' +  data + '\');">' + data + '</a>');
					},				

					'usoList':  		function ( data, type, full ) {

						return type !== 'display' || data.indexOf(",") < 0 ? data : 
							(
								//Extract only the first USO... indicated by everything to the left of the comma 
								//in a comma seperated list
								//Show the full list in the balloon popover but we have to replace commas with a comma and a space since
								//there are no spaces in the data returned.
								"<span popover=\"Multiple USOs: " + data.replace(/,/g, ", ") + "\" popover-trigger=\"mouseenter\" popover-popup-delay=\"500\">" +
								data.substr(0, data.indexOf(",")) + "..." +
								"</span>"
							);
						
					},				

					'createdDate': function ( data, type, full ) {

						return type !== 'display' ? data :$filter('date')(data, "MM-dd-yyyy");
					},

					'completedDate': function ( data, type, full ) {

						return type !== 'display' ? data :$filter('date')(data, "MM-dd-yyyy");
					},
					'cpdd': function ( data, type, full ) {

						return type !== 'display' ? data :$filter('date')(data, "MM-dd-yyyy");
					},
					'crdd': function ( data, type, full ) {

						return type !== 'display' ? data :$filter('date')(data, "MM-dd-yyyy");
					},
					'nxSrIdCreatationDate': function ( data, type, full ) {

						return type !== 'display' ? data :$filter('date')(data, "MM-dd-yyyy");
					},

					'nxSrIdCompletionDate': function ( data, type, full ) {

						return type !== 'display' ? data :$filter('date')(data, "MM-dd-yyyy");
					},
					'efmsSrIdCreatationDate': function ( data, type, full ) {

						return type !== 'display' ? data :$filter('date')(data, "MM-dd-yyyy");
					},
					'efmsSrIdCompletionDate': function ( data, type, full ) {

						return type !== 'display' ? data :$filter('date')(data, "MM-dd-yyyy");
					},
					'nxCrIdCreatationDate': function ( data, type, full ) {

						return type !== 'display' ? data :$filter('date')(data, "MM-dd-yyyy");
					},
					'nxCrIdCompletionDate': function ( data, type, full ) {

						return type !== 'display' ? data :$filter('date')(data, "MM-dd-yyyy");
					},
					'efmsCrIdCreatationDate': function ( data, type, full ) {

						return type !== 'display' ? data :$filter('date')(data, "MM-dd-yyyy");
					},
					'efmsCrIdCompletionDate': function ( data, type, full ) {

						return type !== 'display' ? data :$filter('date')(data, "MM-dd-yyyy");
					}
			};

			//Had some trouble with $watch and $watchCollection on the array since it only does a shallow
			//element check and couldn't handle going to empty... So we move to a trigger value
			//which tells our table to regenerate and reload.
			//Zero also tells us to reload... but destroy the table if it existed and don't regenerate
			//Usually this is under an error condition where no table should be shown at all, not to be 
			//confused with an empty record situation, where the table should still be shown

			if ( scope.tableData.loadTrigger === undefined )
				scope.tableData.loadTrigger = 0;

			//This catches our tablelink callbacks and forwards to the controller's method
			scope.getDetailsResult = function(orderType, id)
			{
				scope.fireDetail({'orderType': orderType, 'id': id});
			};


			//External API to redraw the table
			scope.reDraw = function() {
				if ( $.fn.dataTable.fnIsDataTable(document.getElementById(attrs.id)) ) {
					element.dataTable().api().draw();
				} 
			};


			//External API to see if actual DataTable exists... could be with or without data
			scope.isTableExist = function() {
				return $.fn.dataTable.fnIsDataTable(document.getElementById(attrs.id));
			};


			//Setup and API for the controller to call in our directive
			//https://groups.google.com/forum/#!topic/angular/htKUVVNhi7A

			scope.tableData.API = {
					reDraw:			scope.reDraw,
					isTableExist:	scope.isTableExist
			};


			//Setup the watch which gets kicked off to regenerate and/or delete the table
			scope.$watch("tableData.loadTrigger", function(newTriggerVal, oldTriggerVal) {

				//This watch is called once during init.. indicated by newVal and oldVal don't match AND the data is undefined 
//				console.log("===========  $watch on loadTrigger hit: newTriggerVal=" + newTriggerVal + ", oldTriggerVal=" + oldTriggerVal + ", tableDefinition.length=" + (scope.tableData.tableDefinition === undefined ? "UNDEFINED" : scope.tableData.tableDefinition.length));
//				if (newTriggerVal !== oldTriggerVal && scope.tableData.tableDefinition !== undefined ) {

				if ( scope.tableData.tableDefinition !== undefined ) {

					//Setup some locals to seperate column from row data 
					var localColumnDefs = [];
					var localRowData = [];

					//Extract the column headers
					//MAD refactored for column data, need to account for when no column data exists because either an error
					//ocurred and we still need to run through the table setup (to eventually destroy and not recreate), or when
					//no row data is returned - which will also not include column metadata
					var item = scope.tableData.tableDefinition.rowMetaData || { columnList: []};

					for(var n=0; n < item.columnList.length; n++)
					{
						//May need to insert spans into titles with extra padding that was removed from the th padding so DataTable
						//can calculate column headers correctly.
						//http://stackoverflow.com/questions/16054584/fixed-column-header-width-does-not-match-body-column-widths
						//scope.localColumnDefs.push({"sTitle": "<span>" + item.columnList[n].displayName + "</span>",

						var columnOptions = {
								//Need to override this value (it's "" in the library) so that null will work as data
								"sDefaultContent": "",
								"sTitle": item.columnList[n].displayName, 
								"mDataProp": item.columnList[n].id, 
								"aTargets": [n], 
								"mData": item.columnList[n].id
						};
						//Only define this if there should be a rendering callback for hyperlinks
						if( renderDataLinks[item.columnList[n].id] !== undefined ) {
							columnOptions["mRender"] = renderDataLinks[item.columnList[n].id];
						}

						localColumnDefs.push(columnOptions);
					}



					//Extract the column data
					//Must account for case where no rows are returned, which may include an error
					//If it's defined, it'll have all of the proper fields in it

					if ( scope.tableData.tableDefinition.rowValueList != undefined ) {
						for (var i=0; i < scope.tableData.tableDefinition.rowValueList.length; i++) {

							var rowValue = scope.tableData.tableDefinition.rowValueList[i];
							var obj = {};

							for(var n=0; n < rowValue.cellValues.length; n++) {
								// create Id and value pair for each column
								obj[scope.tableData.tableDefinition.rowMetaData.columnList[n].id] = rowValue.cellValues[n];   

							}	

							localRowData.push(obj);   
						}
					}

					//We've just finished extracting localColumnDefs (column data only) from localRowData (row data only)
					//Either both will be an empty array or neither will be an empty array
					//Proceed to prepare the table for construction


					var dataTable = null;
					var isExistingTable = scope.isTableExist();

					//First see if we have an existing table so we can decide if we need to kill it... 
					if ( isExistingTable  && (localColumnDefs.length > 0  || newTriggerVal == 0) ) {

						//If a table already exists and we have columns... then we should kill it
						//If a table already exists but there is no key... then the controller wants to kill the table and not regenerate
						//TODO: Here we could compare the new columns to old ones and NOT kill the table if they're the same

						element.dataTable().fnClearTable();
						element.dataTable().fnDestroy();
						$("#"+attrs.id).empty();
					} 

					//If the controller doesn't want to regenerate a table... get out
					if ( newTriggerVal > 0 ) {

						//if our columns are empty it means there are no rows either... so load up the last set of columns if we had
						//any just so the table will display "no data" with a set of columns

						if( localColumnDefs.length == 0 )
						{
							//No current columns so load some old ones if any, and if none of the last search's,
							//see if we can get some from a prior session (stored), and if not, make up some bogus ones
							localColumnDefs = scope.lastColumnDefs;
							if ( localColumnDefs == undefined )
								localColumnDefs = getStoredLastColumnDefs();
							if ( localColumnDefs == undefined || localColumnDefs == null ) 
								localColumnDefs =  [{
									"sTitle": "Data",
									"mData": "id",
									"mDataProp": "id",
									"sDefaultContent": "",
									"aTargets": [0]
								}];

							//See if we can get back the existing table
							if ( isExistingTable )
								dataTable = element.dataTable();
						}

						//If we aren't using the old table... build it
						if ( dataTable == null ) {

							dataTable = element.dataTable(getTableCreateOptions(localColumnDefs));

							//New table is created... add classes to the search field so bootstrap
							//	does it's thing.. Should be fixed in newer 1.10 DT/BS
							var field = dataTable.closest('.dataTables_wrapper').find('div[id$=_filter] input');
							field.addClass('form-control');

							// LENGTH - Inline-Form control
							field = dataTable.closest('.dataTables_wrapper').find('div[id$=_length] select');
							field.addClass('form-control');
						}

						//Now store the old columns... Do it before loading rows in case it kicks off a table store
						scope.lastColumnDefs = localColumnDefs;

						//One way or another we have a table with columns in it... Now load the data.  It might be empty.
						if ( localRowData == undefined || localRowData.length == 0 )
							dataTable.fnClearTable();
						else
							dataTable.fnAddData(localRowData);

					}	//regeneration conditional (newTriggerVal > 0)

					/* Experimental stuff for FixedColumns when we add that back in	        		
		            		var fc = new FixedColumns( dataTable );

	            			dataTable.fnAdjustColumnSizing();

	            			//Needed in angular, not straight jq for some reason
	            			//If not present, the first column will overextend to the right about the width of a scrollbar.
	            			fc.fnRedrawLayout();

	            			//Need to compile the entire dom created by the table?,  No... handled on each row
	            			$compile(element);
					 */	            			
				}  //if tableDefinition !== undefined

			});  // watch on tableDefinition...

			
			
			
			//Create options for construction of the table... The only variable at this point is the 
			//column definitions

			function getTableCreateOptions(columns) {
				return {
					bJQueryUI: true,
					sDom: "<'row'Cf>t<'row'iplT>",
//					sPaginationType: "bootstrap",				//Normal numbers pagination... no need to have it be bootstrap
					oLanguage: {
						"sSearch": 'Filter Results:',
						"sEmptyTable": 'No records found matching search criteria'
					},
					oTableTools: {
						"aButtons": [{
							"sExtends": "xls",
							"sButtonText": "Export",
							"mColumns": "visible"
						}],
						"sSwfPath": "assets/images/copy_csv_xls_pdf.swf"            				            	 
					},
					oColVis: {
//						"activate": "mouseover",							Leave as click
						"buttonText": '<i class="fa fa-columns" title="Adjust column visibility (show/hide)"></i>',
						"sAlign": "right",
						"sSize": "css",
						"iOverlayFade": 300,   	//milliseconds
						"exclude": [0]			//exclude column zero from visibility selection
					},
					aoColumnDefs: columns,
					bRetrieve: true,
					bDestroy: true,
					//This method is called everytime DataTables adds a row to the table
					fnCreatedRow: function( nRow, aData, iDataIndex ) {
						//We need to compile the newly added row in case HTML with angular attributes was injected
						//into the TD's or they won't work
						$compile(nRow)(scope);
					},
					sScrollX: "100%",
					// Save filters, pagination, length and columns in a cookie
					paging: true,					//bPaginate: true,    Changed to 'paging' when we went to 1.10

					//These parameters enable state saving in local storage and register
					//callbacks so we can modify where they're stored since we have 3 tables
					bStateSave: true,
					//TODO:  If we only want ONE set of parameters stored (columns, sorting filters, etc)
					//for each of our table types, then elminiate the 2 specialized callbacks below
					fnStateSaveCallback: saveState,
					fnStateLoadCallback: loadState
					//TODO: Only expose the extra param methods if we need to store more than the default
					//state with our tables
//					fnStateSaveParams: saveStateExtraParams,
//					fnStateLoadParams: loadStateExtraParams

//					sScrollY: "300px",
//					bAutoWidth: true,
					//sScrollXInner usage not recommended by author of DT, may be beneficial in combination with FixedColumns
					//to compensate for that plugin's problems
//					sScrollXInner: "120%",
//					bScrollCollapse: true,
				};
			};

		}, 	//link method

	};
});

