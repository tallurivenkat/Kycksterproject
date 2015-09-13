app.service('ChartUtilService', ['$resource', function ($resource) {
	'use strict';
	
    // Create PIE chart 
    this.drawPieChart = function(data, title, container) {

		var wrapper = new google.visualization.ChartWrapper({
			chartType : 'PieChart',
			dataTable : data,
			options : {
				title : title,
				width : 500,
				height : 300,
				is3D : true,
				backgroundColor:'#f5f5f5',
				sliceVisibilityThreshold : 0,
				chartArea : {
					left : 10,
					top : 20,
					width : "100%",
					height : "100%"
				}
			},
			containerId : container
		});
		
		// Everything is loaded; draw the chart here...	
		wrapper.draw();

    };


    // Create Stacked Column chart
    this.drawColumnChart = function(data, title, container, stacked) {

		var wrapper = new google.visualization.ChartWrapper({
			chartType : 'ColumnChart',
			dataTable : data,
			options : {
				title : title,
				width : 500,
				height : 300,
				legend : 'bottom',
				isStacked : stacked,
				backgroundColor:'#f5f5f5',
				chartArea : {
					left : 30,
					top : 20,
					width : "80%",
					height : "70%"
				},
				colors : [ '#8acf58', '#f3686b', '#4f81bc', '#c0504e',
						'#9bbb58', '#8064a1' ]
			},
			containerId : container
		});
		// Everything is loaded; draw the chart here...	
		wrapper.draw();

    };

    /* Create table data */

    this.tableWrapper = function(tabledata, tableid) {

		var table = new google.visualization.Table(tableid);
	
		google.visualization.events.addListener(table, 'ready', function() {
	
			var tableHeaderStyle = {
				border : "solid 1px #b9b9b9",
				width : '25%'
			};
			$('.google-visualization-table-th').css(tableHeaderStyle);
	
			var tableRowStyle = {
				border : "solid 1px #b9b9b9",
				padding : "4px"
			};
			$('.google-visualization-table-td').css(tableRowStyle);
	
		});
	
		var cssClassNames = {
			headerRow : 'bandit-e2e-tableChartHeaderRow',
			tableCell : 'customTableCellStyle'
		};
	
		var options = {
			'allowHtml' : true,
			alternatingRowStyle : false,showRowNumber: false, width:680, height: 400,
			cssClassNames : cssClassNames
		};
	
		table.draw(tabledata, options);

    };

}]);
