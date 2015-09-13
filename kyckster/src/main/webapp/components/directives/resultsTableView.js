app.directive('resultsTableView', function () {
	'use strict';
	
	return {
		restrict : 'A, E',
		
		link : function(scope, element, attrs) {
			
			  scope.resultsAvailable = false;
			
	          scope.$watch('tableRows', function (value) {
	        	  
	        	  if (value !== undefined && value.length > 1) {
	        		  
	        	    scope.resultsAvailable = true;
              		  
	        		var tableHeaders = [];
	     
	        		var firstTableRow = scope.tableRows[0];
	                 		           	
	            	var data = new google.visualization.DataTable();
	            	
	            	var viewColumns = new Array(value[0].columnList.length);
	            	// build an array of column headers from JSON data
	          		for(var n=0; n < firstTableRow.columnList.length; n++) {
	          		
	          			tableHeaders.push(firstTableRow.columnList[n].displayName);
	          			data.addColumn('string', firstTableRow.columnList[n].displayName);
	          			viewColumns[n] = n+1;
	          			
	             	}

	              
	          		angular.forEach(scope.tableRows, function (row) {
	          			
	          			var columns = row.columnList;
	
	          			var columnValues = [];
	          			
	          		    angular.forEach(columns, function(column) {
	                     //   console.log("column = " + angular.toJson(column));
	                        
	                        if(column.hyperlink == true) {
	                        	columnValues.push('<a>' +  column.value + '</a>');
	                        } 
	                        else {
	                        	columnValues.push(column.value);
	                        }
	                    });
	          		    
	          		    data.addRow(columnValues);
	 	            });
	          		
	          		
	          	    // create a list of columns for the results table
	          	    var columns = [{
	          	        // this column aggregates all of the data into one column
	          	        // for use with the string filter
	          	        type: 'string',
	          	        calc: function (dt, row) {
	          	            for (var i = 0, vals = [], cols = dt.getNumberOfColumns(); i < cols; i++) {
	          	                vals.push(dt.getFormattedValue(row, i));
	          	            }
	          	            return vals.join('\n');
	          	        }
	          	    }];
	          	    
	          	    for (var i = 0, cols = data.getNumberOfColumns(); i < cols; i++) {
	          	        columns.push(i);
	          	    }
	          	    
	          	    // Define a slider control for the 'Donuts eaten' column
	          	    var filter = new google.visualization.ControlWrapper({
	          	        controlType: 'StringFilter',
	          	        containerId: 'filter_div',
	          	        options: {
	          	            filterColumnIndex: 0,
	          	            matchType: 'any',
	          	            caseSensitive: false,
	          	            ui: {
	          	                label: 'Search table:'
	          	            }
	          	        },
	          	        view: {
	          	            columns: columns
	          	        }
	          	    });
	          	    
	          	  var tableStyle = {headerCell: 'resulsTableHeader', tableCell: 'resulsTableCell'};
	          	    
	          	    // Define a pie chart
	          	    var table = new google.visualization.ChartWrapper({
	          	        chartType: 'Table',
	          	        containerId: 'table_div',
	          	        options: {
		                    title: attrs.title,
		                    height: attrs.height,
		                    width: '100%',
		                    legend: 'bottom',
		                    allowHtml: true,
		                    cssClassNames: tableStyle,
		                    sort: 'enable',
		                    page: 'enable',
		                    pageSize: 2,
		                    pagingSymbols: {
		                        prev: 'prev',
		                        next: 'next'
		                    },
		                    pagingButtonsConfiguration: 'auto'
	          	        },
	          	        view: {
	          	            columns: viewColumns
	          	        }
	          	    });
	          	    

	               

	                var colIndex = null;

	                                            
	                
	                // create event handler for table's 'ready' event
	                google.visualization.events.addListener(table, 'ready', function () {
	                	
	                	$('#table_div').find('table').addClass('responsive');
	                	var switched = false;
	                	if (($(window).width() < 767) && !switched ){
							switched = true;
							$("table.responsive").each(function(i, element) {
								splitTable($(element));
							});
							return true;
                	    }
                	    else if (switched && ($(window).width() > 767)) {
							switched = false;
							$("table.responsive").each(function(i, element) {
								unsplitTable($(element));
							});
	                	}
	                	
	                	
	                	
	                	function splitTable(original)
	                	{
	                		original.wrap("<div class='table-wrapper' />");
	                		
	                		var copy = original.clone();
	                		copy.find("td:not(:first-child), th:not(:first-child)").css("display", "none");
	                		copy.removeClass("responsive");
	                		
	                		original.closest(".table-wrapper").append(copy);
	                		copy.wrap("<div class='pinned' />");
	                		original.wrap("<div class='scrollable' />");

	                    setCellHeights(original, copy);
	                	}
	                	
	                	function unsplitTable(original) {
	                    original.closest(".table-wrapper").find(".pinned").remove();
	                    original.unwrap();
	                    original.unwrap();
	                	}

	                  function setCellHeights(original, copy) {
	                    var tr = original.find('tr'),
	                        tr_copy = copy.find('tr'),
	                        heights = [];

	                    tr.each(function (index) {
	                      var self = $(this),
	                          tx = self.find('th, td');

	                      tx.each(function () {
	                        var height = $(this).outerHeight(true);
	                        heights[index] = heights[index] || 0;
	                        if (height > heights[index]) heights[index] = height;
	                      });

	                    });

	                    tr_copy.each(function (index) {
	                      $(this).height(heights[index]);
	                    });
	                 }
	                	
	                	
	                	
	                	
	                    
	                	// create event listener to get column index
	                    $('#resulsTable').find('td').mouseover(function () {
	                        colIndex = $(this).index();
	                        console.log(colIndex);	                      
	                    });
	                    
	                });
	                
	                google.visualization.events.addListener(table, 'select', function () {
	                	
	                	var selectedData = table.getChart().getSelection();
	                	
	                	var view = table.getDataTable();

	                	
	                	if(selectedData != undefined && selectedData.length > 0)	                	
	                	{
		                	var item = selectedData[0];

	                		var col = colIndex;
		                	
		                    var orderType = '';
		                   	                    
		                    var id = data.getValue(view.getTableRowIndex(item.row), colIndex).substring(data.getValue(view.getTableRowIndex(item.row), colIndex).indexOf(">")+1, data.getValue(view.getTableRowIndex(item.row), colIndex).lastIndexOf("<"));

		                	var headerTitle = data.H[col].label;
			          		
	  	                	if(headerTitle === 'NX-CR-ID'){
	  	                		
	  	                		orderType = 'CR';
	  	                	}
	  	                	else if(headerTitle === 'NX-SR-ID'){
	  	                		
	  	                		orderType = 'SR';
	  	                	}
	  	                	else if(headerTitle === 'USRP Sales Order'){
	  	                		
	  	                		orderType = 'Orders';
	  	                	}
	  	                		           
	  	                	if(id != ""){
	  	                		
		  	                    scope.getDetailsResult(orderType, id);
	  	                	}
	  	                	
	                	}

	                });

	                
	                $(".export").on('click', function (event) {
	                    // CSV
	                	scope.exportToExcel.apply(this, [$('#resulsTable'), 'export.csv']);

	                });
	                
	               // table.draw(data, options);
	                
	          	    var dashboard = new google.visualization.Dashboard(element[0]);
	          	    dashboard.bind([filter], [table]);
	          	    dashboard.draw(data);
	          	    

	        	  }
	        	  
	            });	                
		}
	};
});
