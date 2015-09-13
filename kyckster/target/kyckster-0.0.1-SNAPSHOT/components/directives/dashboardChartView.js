app.directive('dashboardChartView', ['$i18next', function($i18next) {
	'use strict';
	
	return {
		restrict : 'A, E',
		scope:{
			chartData: '=chartdata',
		},
		
		link : function(scope, element, attrs) {
			
			scope.$watch('chartData', function() {
				if (scope.chartData !== undefined) {
				
					var data = new google.visualization.DataTable();
	                data.addColumn('string', 'state');
	                data.addColumn('number', 'count');
	                data.addColumn('string', 'color');
	                
	                var value=scope.chartData;
	                var colorArray = [];
	                
	                angular.forEach(value, function (row) {
	                    data.addRow([row.state,  parseInt(row.count), row.color]);
	                    colorArray.push(row.color);
	                });
	
	                
	                var options = {
	                    legend: 'none',
	                    colors: colorArray,
	                    isStacked: true,
	                    backgroundColor: {fill:'transparent' },
	                    hAxis: {textPosition:'none'},
	    				chartArea : {
	    					width : "80%",
	    					height : "90%"
	    				},
	                };
	                
	                if (attrs.charttype === "piechart") {
	                	
	                	
	                	var data = new google.visualization.DataTable();
	                	data.addColumn('string', 'activity');
	                	data.addColumn('number', 'count');
	                	data.addColumn('string', 'color');
		                
		                var value=scope.chartData;
		                var colorArray = [];
		                
		                angular.forEach(value, function (row) {
		                data.addRow([row.activity,  parseInt(row.count), row.color]);
		                   colorArray.push(row.color);
		                });
	                	
	                	
	                	options = {
	                	    legend: 'none',
		                    backgroundColor: {fill:'transparent' },
	    	                colors: colorArray,
	    	                pieSliceTextStyle:{color: 'black'}
	                	};
	                }
	                
	                var view = new google.visualization.DataView(data);
	                var x = 0;
	                view.setColumns([0, {
	                    type: 'number',
	                    label: 'Value',
	                    calc: function (dt, row) {
	                    	
	                        return (dt.getValue(row, 2) == colorArray[0]) ? dt.getValue(row, 1) : null;
	                    }
	                }, {
	                    type: 'number',
	                    label: 'Value',
	                    calc: function (dt, row) {
	                    	//x++;
	                        return (dt.getValue(row, 2) == colorArray[1]) ? dt.getValue(row, 1) : null;
	                    }
	                }, {
	                    type: 'number',
	                    label: 'Value',
	                    calc: function (dt, row) {
	                    	//x++;
	                        return (dt.getValue(row, 2) == colorArray[2]) ? dt.getValue(row, 1) : null;
	                    }
	                }, {
	                    type: 'number',
	                    label: 'Value',
	                    calc: function (dt, row) {
	                    	//x++;
	                        return (dt.getValue(row, 2) == colorArray[3]) ? dt.getValue(row, 1) : null;
	                    }
	                }, {
	                    type: 'number',
	                    label: 'Value',
	                    calc: function (dt, row) {
	                    	//x++;
	                        return (dt.getValue(row, 2) == colorArray[4]) ? dt.getValue(row, 1) : null;
	                    }
	                }, {
	                    type: 'number',
	                    label: 'Value',
	                    calc: function (dt, row) {
	                    	//x++;
	                        return (dt.getValue(row, 2) == colorArray[5]) ? dt.getValue(row, 1) : null;
	                    }
	                }, {
	                    type: 'number',
	                    label: 'Value',
	                    calc: function (dt, row) {
	                    	//x++;
	                        return (dt.getValue(row, 2) == colorArray[6]) ? dt.getValue(row, 1) : null;
	                    }
	                }, {
	                    type: 'number',
	                    label: 'Value',
	                    calc: function (dt, row) {
	                    	//x++;
	                        return (dt.getValue(row, 2) == colorArray[7]) ? dt.getValue(row, 1) : null;
	                    }
	                }]);
	                
	                var chart;
	
	                if (attrs.charttype === "piechart") {
	                	chart = new google.visualization.PieChart(element[0]);
	                	chart.draw(data,options);
	                }
	                else {
	                	chart = new google.visualization.ColumnChart(element[0]);
	                	chart.draw(view,options);
	                }
	         
	                
	                
				}

			});
			
		}
	};
}]);
