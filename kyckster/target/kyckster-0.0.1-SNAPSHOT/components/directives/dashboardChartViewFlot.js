app.directive('dashboardChartViewFlot', ['$i18next','$location', function($i18next, $location) {
	'use strict';
	
	return {
		restrict : 'A, E',
		scope:{
			chartData: '=chartdata',
			dashboardMaxValue:'=dashboardMaxValue'
		},
		
		link : function(scope, element, attrs) {
	
			//TODO: Resize needs to be trapped here and re-drawn to prevent labels and axis from
			//drawing outside of bounds.
			
			scope.$watch('chartData', function() {
				if (scope.chartData !== undefined) {
					
					//Sizing for this canvas is a bit strange... Setting in markup doesn't seem to work
					//Google chart adjusted to container size, it seemed, but ChartJS needs to be bounded and I'm 
					//not sure how that was done.  Setting h/w in element style only seemed to work programmatically
					//We need to figure out a way to set the height in markup, not here
					element.css({ height:'200px'});
					
				    var value = scope.chartData;
	                
	                //Use this version for multiple series but each series has a single bar for 
	                //different colors
	                
				    if (attrs.charttype === "piechart") {
				    	var index;
						var data = new Array();
		                for (index = 0; index < value.length; index++ ) {
							
							data.push({
								label: value[index].activity,
								data: [[index, parseInt(value[index].count)]],
						        bars: {
						            show: true, 
						            barWidth: 0.4, 
						            order: index,
						            fillColor: value[index].color
						        },
						        color: value[index].color
						    });
		                }
				    }
				    else if (attrs.charttype === "stackedbarchart") {
				    	
				    	var index;
				    	var stackedData = [];
				    	var stackColor = "";
				    	for (index = 0; index < value.length; index++ ) {
				    		var index2;
				    		var insideData = new Array();
				    		var seriesData = new Array();
				    		var tempArray = new Array();
				    		var position = 0;
				    		var countFlag = 0;

				    		insideData = value[index];

				    		for (index2= 0; index2 <insideData.length; index2++ ) {
				    			//logic to group 4 bars
				    			if(countFlag==4) {
				    				position = position + 1.5;
				    				countFlag=0;
				    			}
				    			else {
				    				position = position + 0.5;
				    				countFlag++;
				    			}
					    		
				    			tempArray = new Array();

				    			tempArray.push(position);
				    			tempArray.push(parseInt(insideData[index2].count));
				    			tempArray.push(insideData[index2].count+" "+insideData[index2].state);
				    			tempArray.push({color:insideData[index2].color});

				    			seriesData.push(tempArray);
				    		}
				    		
				    		if(index===0)
				    			stackColor= "#6E4EDA";
				    		else if(index===1)
				    			stackColor= "#8B2626";
				    		else if(index===2)
				    			stackColor= "#2B8B26";
				    		//Color coding from UAT - can use 'stackColor' to set the color for each series.
				    		//Cancelled - "#6E4EDA"
				    		//Completed - "#89B7E9"
				    		//In Progress - "#1D919E"
				    		//In Progress With Jeopardy - #FA738A

				    		stackedData.push({
				    			data: seriesData,
				    			color: stackColor,
				    			label: "Series "+parseInt(index)
				    		});
				    	}
				    	
				    }
				    else if (attrs.charttype === "barchart") {
				    	var index;
				    	var bardata = new Array();
				    	var position = 0;
				    	var countFlag = 0;
				    	var status='';
				    	
				    	for (index = 0; index < value.length; index++ ) {
				    		//logic to group 4 bars 
				    		if(countFlag==4) {
			    				position = position + 1.5;
			    				countFlag=1;
			    			}
			    			else {
			    				position = position + 0.5;
			    				countFlag++;
			    			}
				    		
				    		if(index<4)
				    			status=value[index].region + ' In Progress';
				    		else if(index>=4 && index<8)
				    			status=value[index].region + ' Completed';
				    		else if(index>=8)
				    			status=value[index].region + ' Cancelled';

				    		bardata.push({
				    			label: status,
				    			data: [[position, parseInt(value[index].count)]],
				    			bars: {
				    				show: true, 
				    				barWidth: 0.4, 
				    				order: index,
				    				fillColor: value[index].color
				    			},
				    			color: value[index].color
				    		});
				    	}
				    }
				    else if (attrs.charttype === "barchartwithJ") {
				    	var index;
				    	var bardata = new Array();
				    	var position = 0;
				    	var countFlag = 0;
				    	var status='';
				    	
				    	for (index = 0; index < value.length; index++ ) {
				    		//logic to group 4 bars 
				    		if(countFlag==4) {
			    				position = position + 1.5;
			    				countFlag=1;
			    			}
			    			else {
			    				position = position + 0.5;
			    				countFlag++;
			    			}
				    		
				    		if(index<4)
				    			status=value[index].region + ' In Progress';
				    		else if(index>=4 && index<8)
				    			status=value[index].region + ' In Progress with Jeopardy';
				    		else if(index>=8 && index<12)
				    			status=value[index].region + ' Completed';
				    		else if(index>=12)
				    			status=value[index].region + ' Cancelled';

				    		bardata.push({
				    			label: status,
				    			data: [[position, parseInt(value[index].count)]],
				    			bars: {
				    				show: true, 
				    				barWidth: 0.4, 
				    				order: index,
				    				fillColor: value[index].color
				    			},
				    			color: value[index].color
				    		});
				    	}
				    }
				    else if (attrs.charttype === "orderbarchart") {
				    	var index;
				    	var bardata = new Array();
				    	var position = 0;
				    	var countFlag = 0;
				    	var status='';
				    	
				    	for (index = 0; index < value.length; index++ ) {
				    		//logic to group 3 bars 
				    		if(countFlag==3) {
			    				position = position + 1.5;
			    				countFlag=1;
			    			}
			    			else {
			    				position = position + 0.5;
			    				countFlag++;
			    			}
				    		
				    		if(index<3)
				    			status=value[index].strataType + ' In Progress';
				    		else if(index>=3 && index<6)
				    			status=value[index].strataType + ' Completed';
				    		else if(index>=6)
				    			status=value[index].strataType + ' Cancelled';

				    		bardata.push({
				    			label: status,
				    			data: [[position, parseInt(value[index].count)]],
				    			bars: {
				    				show: true, 
				    				barWidth: 0.4, 
				    				order: index,
				    				fillColor: value[index].color
				    			},
				    			color: value[index].color
				    		});
				    	}
				    }
	                //TODO: Need to add all of the interactivity for labels and selections

	                //TODO: Decide how to re-create plot on resize
	                //Not sure what happens here when data changes... Does the old object that was attached to the context
	                //destroy?  Memory leak?  Need to test this out.
	                
	                //TODO: Need to make this much prettier...
	                //Proper padding around bars and grid edge
	                //Grid labels, xaxis underline
	                //proper spacing between bars (series in flot's case)
	                //highlights, balloons, click response
				    
				    var legendContainer,
				        orderType,
				        chart;
				    
				    
				    if (attrs.chartlegend === "customerRequests") {
				    	legendContainer="#customerRequestsLegendContainer";
				    	orderType = "CR";
        			} else if(attrs.chartlegend === "serviceRequests") {
        				legendContainer="#serviceRequestsLegendContainer";
        				orderType = "SR";
        			} else if(attrs.chartlegend === "efmsCustomerRequests") {
        				legendContainer="#efmsCustomerRequestsLegendContainer";
        				orderType = "EfmsCR"; //new type Efms CR
        			} else if(attrs.chartlegend === "efmsServiceRequests") {
        				legendContainer="#efmsServiceRequestsLegendContainer";
        				orderType = "EfmsSR"; //new type Efms SR
        			} else if(attrs.chartlegend === "ordersByStatus") {
        				legendContainer="#ordersByStatusLegendContainer";
        				orderType = "orderByStatus";
        			}

	                
	                if (attrs.charttype === "piechart") {
	                	chart = $.plot(element, data, {
	                		series: {
	        					pie: {
	        						show: true,
	        						  label: {
	        				                show: false
	        				            }
	        					}
	        				},
	        				legend: {
	        					container:$("#ordersByActivityLegendContainer"),
	        				},
	        				grid: { hoverable: true},
        					tooltip: true,
        					tooltipOpts: {
        						content: "%p.2%, %s", // show percentages, rounding to 2 decimal places
        						shifts: {
        							x: 20,
        							y: 0
        						},
        						defaultTheme: false
        					}
	                	});
	                } 
	                else if (attrs.charttype === "stackedbarchart") {
	                	
	                	var stackOptions = {

//	                			legend: {
//	                				container:$(legendContainer),
//	                			},
	                			legend:false,
	                			tooltip: false,
	                			xaxis: { show: false },

	                			grid: { borderColor: "#eeeeee", borderWidth: 1, color: "#AAAAAA", hoverable: true, clickable: true },
//	                			tooltipOpts: {
//	                				content : function (label, x, y) {
//	                					return y + " " + label; 
//	                				},
//	                				shifts: {
//	                					x: 10,
//	                					y: 20
//	                				}
//	                			},

	                			series: {
	                				bars: {
	                					show: true,
	                					barWidth: .4,
	                					align: "center",
	                					fill: 1
	                				},
	                				stack: true
	                			}
	                	};

	                	chart = $.plot(element, stackedData, stackOptions);

	                }
	                else if (attrs.charttype === "barchart"){
	                	chart = $.plot(element, bardata, {
	                		legend: {
	                			container:$(legendContainer),
	        				},
	                		grid: { borderColor: "#eeeeee", borderWidth: 1, color: "#AAAAAA", hoverable: true, clickable: true },
	                		xaxis: { show: true,
	                			ticks:[[1.5,"In Progress"],[4.5, "Completed"],[7.5, "Cancelled"]],
	                			},
	                		tooltip: true,
	                		
	                		tooltipOpts: {
								content : function (label, x, y) {
									return y + " " + label; 
								},
//								shifts: {
//									x: 5,
//									y: 20
//								}
	                		}
	                		
	                	});
	                }
	                else if (attrs.charttype === "barchartwithJ"){
	                	chart = $.plot(element, bardata, {
	                		legend: {
	                			container:$(legendContainer),
	        				},
	                		grid: { borderColor: "#eeeeee", borderWidth: 1, color: "#AAAAAA", hoverable: true, clickable: true },
	                		xaxis: { show: true,
	                			ticks:[[1.5,"In Progress"],[4.5, "In Progress with Jeopardy"],[7.5, "Completed"],[10.5, 'Cancelled']],
	                			},
	                		tooltip: true,
	                		
	                		tooltipOpts: {
								content : function (label, x, y) {
									return y + " " + label; 
								},
//								shifts: {
//									x: 5,
//									y: 20
//								}
	                		}
	                		
	                	});
	                }
	                else if (attrs.charttype === "orderbarchart"){
	                	chart = $.plot(element, bardata, {
	                		legend: {
	                			container:$(legendContainer),
	        				},
	                		grid: { borderColor: "#eeeeee", borderWidth: 1, color: "#AAAAAA", hoverable: true, clickable: true },
	                		xaxis: { show: true,
	                			ticks:[[1.2,"In Progress"],[3.7, "Completed"],[6.2, "Cancelled"]],
	                			},
	                		tooltip: true,
	                		
	                		tooltipOpts: {
								content : function (label, x, y) {
									return y + " " + label; 
								},
//								shifts: {
//									x: 5,
//									y: 20
//								}
	                		}
	                		
	                	});
	                }
	                
	                $(element).bind("plothover", function (event, pos, item) {
	                    $("#tooltip").remove();
	                   
	                    if (item && item.series.data.length>1) {
	                        var tooltip = item.series.data[item.dataIndex][2];
	                        
	                        $('<div id="tooltip">' + tooltip + '</div>')
	                            .css({
	                                position: 'absolute',
	                                display: 'none',
	                                top: item.pageY + 5,
	                                left: item.pageX + 5,
	                                border: '1px solid #111',
	                                'border-radius': '0.5em',
	                                'font-size': '0.8em',
	                                padding: '0.4em 0.6em',
	                                'background-color': '#fff',
	                                'white-space': 'nowrap',
	                                opacity: 0.80 })
	                            .appendTo("body").fadeIn(200);
	                        //showTooltip(item.pageX, item.pageY, tooltip);
	                    }
	                });
	                
	              
	                $(element).bind("plotclick", function (event, pos, item) {
	                    if (item) { 
	                        //alert(item.series.label);
	                    	var jeopardy = '';
	                    	
	                    	if (item.series.label.toLowerCase().indexOf('jeopardy') >= 0) {
	                    		jeopardy = 'Yes';
	                    	}
	                    	
	                    	// No support for SR in Jeopardy for Feb release 
	                    	if(!(jeopardy && orderType === 'SR')){
	                    		// [YM] the following flotTip removal is not working for some reason - call it again in resultsController
		                    	$("#flotTip").remove();
		                    	scope.$parent.getDashboardResults(orderType, item.series.label, jeopardy);
	                    	}
	                    }
	                });
				}

			});
			
		}
	};
}]);
