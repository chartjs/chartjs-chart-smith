(function() {
	"use strict";
	
	var root = this,
			Chart = root.Chart,
			helpers = Chart.helpers;
			
	var defaultConfig = {
		
		// Boolean - whether grid lines are shown across the chart
		scaleShowGridLines : true,
		
		// String - Colour of the grid lines
		scaleGridLineColor : "rgba(0, 0, 0, 0.5)",
		
		// Number - Width of the grid lines
		scaleGridLineWidth : 1,
		
		//Number - The backdrop padding above & below the label in pixels
		scaleBackdropPaddingY : 2,

		//Number - The backdrop padding to the side of the label in pixels
		scaleBackdropPaddingX : 2,
		
		//Boolean - Whether to show a dot for each point
		pointDot : true,

		//Number - Radius of each point dot in pixels
		pointDotRadius : 4,

		//Number - Pixel width of point dot stroke
		pointDotStrokeWidth : 1,

		//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
		pointHitDetectionRadius : 10,
		
		// String - Template string for single tooltips
		tooltipTemplate: function (element) {
			var str = "real :";
			str += element.value.real;
			str += "\n imag:";
			str += element.value.imag;
			return str;
		},
	};
	
	Chart.Type.extend({
		name: "SmithChart",
		defaults : defaultConfig,
		
		initialize: function(data) {
			var options = this.options; // expose options as a scope variable so that the scale class can access italics
			
			//Declare the extension of the default point, to cater for the options passed in to the constructor
			this.PointClass = Chart.Point.extend({
				strokeWidth : options.pointDotStrokeWidth,
				radius : options.pointDotRadius,
				display: options.pointDot,
				hitDetectionRadius : options.pointHitDetectionRadius,
				ctx : this.chart.ctx,
				inRange : function(mouseX, mouseY){
					var detectRange = Math.pow(this.radius + this.hitDetectionRadius,2);
					return (Math.pow(mouseX - this.x, 2) < detectRange && Math.pow(mouseY - this.y, 2) < detectRange);
				}
			});
			
			// Smith charts use a unique scale. This needs to be written from scratch.
			this.ScaleClass = Chart.Element.extend({
				initialize: function(){
					this.size = helpers.min([this.height, this.width]);
					this.drawingArea = (this.display) ? (this.size / 2) - (this.fontSize / 2 + this.backdropPaddingY) : (this.size / 2);
					this.drawCenterX = (this.display) ? this.backdropPaddingX + (this.drawingArea / 2) : this.drawingArea / 2;
					this.drawCenterY = (this.display) ? this.backdropPaddingY + (this.drawingArea / 2) : this.drawingArea / 2;
				},
				// Method to get the x,y position of a point given it's real and imaginary value
				getPointPosition : function(real, imag) {
					// look for the intersection of the r circle and the x circle that is not the one along the right side of the canvas
					var realRadius = 1 / (1 + real) * (this.drawingArea / 2); // scale for the drawingArea size
					var realCenterX = this.drawCenterX + ((real / (1 + real)) * (this.drawingArea / 2));
					var realCenterY = this.drawCenterY;
					
					var imagRadius = (1 / Math.abs(imag)) * (this.drawingArea / 2);
					var imagCenterX = this.drawCenterX + (this.drawingArea / 2); // far right side of the drawing area
					var imagCenterY = imag > 0 ? this.drawCenterY - imagRadius : this.drawCenterY + imagRadius;
					
					var r0 = Math.sqrt(Math.pow(imagCenterX - realCenterX, 2) + Math.pow(imagCenterY - realCenterY, 2));
					var angle = Math.atan2(realCenterY - imagCenterY, realCenterX - imagCenterX);
					var arccos = Math.acos((Math.pow(imagRadius, 2) - Math.pow(realRadius, 2)) / Math.pow(r0, 2));
					var phi = imag > 0 ? 0.5 * arccos + angle : -0.5 * arccos + angle;
					
					// We have an r and a phi from the point (imagCenterX, imagCenterY)
					// translate to an x and a undefined
					return {
						x : (Math.cos(phi) * imagRadius) + imagCenterX,
						y : (Math.sin(phi) * imagRadius) + imagCenterY
					};
				},
				// Method to actually draw the scale
				draw: function() {
					var ctx = this.ctx;
					ctx.strokeStyle = this.lineColor;
					ctx.lineWidth = this.lineWidth;
			
					if (this.display)
					{
						// How do we draw the circles? From http://care.iitd.ac.in/People/Faculty/bspanwar/crl713/smith_chart_basics.pdf
						// we have that constant resistance circles obey the following
						// Center { r / (1 + r), 0}, Radius = 1 / (1 + r)
						//
						// The center point and radius will need to be scaled based on the size of the canvas
						
						// Hard code for now. Eventually will provide some options to dynamically generate these
						var rCircles = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 3.0, 4.0, 5.0, 10.0, 20.0, 50.0];

						// Draw each of the circles
						helpers.each(rCircles, function(r, rIndex) {
							var radius = 1 / (1 + r) * (this.drawingArea / 2); // scale for the drawingArea size
							var x = this.drawCenterX + ((r / (1 + r)) * (this.drawingArea / 2));
							
							ctx.beginPath();
							ctx.arc(x, this.drawCenterY, radius, 0, 2 * Math.PI);
							ctx.closePath();
							ctx.stroke();
						}, this);
						
						// Now we need to draw the impedance circles.
						// From the same source as above, these have the following properties:
						// Center : { 1, 1 / x}
						// Radius : 1 / x
						//
						// The discontinuity at x === 0 should be noted. This produces a flat line across the middle of the drawing area
						//
						// For each of the xCircles, both the positive and negative versions must be drawn as the reactance can be either positive or negative
						var xCircles = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 3.0, 4.0, 5.0, 10.0, 20.0, 50.0];
						
						// 0 Special case
						ctx.beginPath();
						ctx.moveTo(0, this.drawCenterY);
						ctx.lineTo(this.drawingArea, this.drawCenterY);
						ctx.stroke();
						ctx.closePath();
						
						helpers.each(xCircles, function(x, xIndex) {
							// Draw the positive circle
							var xRadius = (1 / x) * (this.drawingArea / 2);
							var x = this.drawCenterX + (this.drawingArea / 2); // far right side of the drawing area
							var y = this.drawCenterY - xRadius;
							
							// Ok, these circles are a pain. They need to only be drawn in the region that intersects the resistance == 0 circle. This circle has a radius of 0.5 * this.drawingArea and is
							// centered at (0.5 * this.drawingArea, 0.5 * this.drawingArea)
							
							// We will solve the intersection in polar coordinates and define (0, 0) as the center of the xCircle, ie (x, y)
							var r0 = Math.sqrt(Math.pow(x - this.drawCenterX, 2) + Math.pow(y - this.drawCenterY, 2));
							var angle = Math.atan2(this.drawCenterY - y, this.drawCenterX - x);
							
							// A circle at location r0, angle with radius a is defined in polar coordinates by the equation
							// r = r0 * cos(phi - angle) + sqrt(a^2 - ((r0^2) * sin^2(phi - angle)))
							// Our xCircle is defined by r = xRadius because of where we defined the 0,0 point
							// Solving the intersection of these equations yields
							// phi = 0.5 * arccos((xRad^2 - a^2) / (r0^2)) + angle
							var arccos = Math.acos((Math.pow(xRadius, 2) - Math.pow(this.drawingArea / 2, 2)) / Math.pow(r0, 2));
							var phi2 = (0.5 * arccos) + angle;
							
							ctx.beginPath();
							// These lines are always above the horizontal and always begin at 90 degrees
							ctx.arc(x, y, xRadius, Math.PI / 2, phi2, false); // always draw counterclockwise for these arcs
							ctx.stroke();
							ctx.closePath();
						
							// Negative circle
							y = this.drawCenterY + xRadius;
							{
								var r0 = Math.sqrt(Math.pow(x - this.drawCenterX, 2) + Math.pow(y - this.drawCenterY, 2));
								var angle = Math.atan2(this.drawCenterY - y, this.drawCenterX - x); // atan2 should always return an angle in [-PI/2, 0) for these circles
								var arccos = Math.acos((Math.pow(xRadius, 2) - Math.pow(this.drawingArea / 2, 2)) / Math.pow(r0, 2));
								var phi2 = (-0.5 * arccos) + angle;
								
								ctx.beginPath();
								ctx.arc(x, y, xRadius, -1 / 2 * Math.PI, phi2, true);
								ctx.stroke();
								ctx.closePath();
							}
							
							
						}, this);
					}
				},
			});
			
			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activePoints = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];
					this.eachPoints(function(point){
						point.restore(['fillColor', 'strokeColor']);
					});
					helpers.each(activePoints, function(activePoint){
						activePoint.fillColor = activePoint.highlightFill;
						activePoint.strokeColor = activePoint.highlightStroke;
					});
					this.showTooltip(activePoints);
				});
			}
			
			this.datasets = [];
			
			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(data.datasets,function(dataset){

				var datasetObject = {
					label : dataset.label || null,
					fillColor : dataset.fillColor,
					strokeColor : dataset.strokeColor,
					pointColor : dataset.pointColor,
					pointStrokeColor : dataset.pointStrokeColor,
					points : []
				};

				this.datasets.push(datasetObject);

				helpers.each(dataset.data,function(dataPoint,index){
					//Add a new point for each piece of data, passing any required data to draw.
					datasetObject.points.push(new this.PointClass({
						value : dataPoint, // data point is complex here
						//label : data.labels[index],
						datasetLabel: dataset.label,
						strokeColor : dataset.pointStrokeColor,
						fillColor : dataset.pointColor,
						highlightFill : dataset.pointHighlightFill || dataset.pointColor,
						highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
					}));
				},this);

				this.buildScale(data.labels);
			},this);

			this.eachPoints(function(point, index){
				helpers.extend(point, this.scale.getPointPosition(point.value.real, point.value.imag));
				point.save();
			}, this);

			this.render();
		},
		
		// Overridden showTooltip to better work with complex data
		showTooltip : function(ChartElements, forceRedraw){
			// Only redraw the chart if we've actually changed what we're hovering on.
			if (typeof this.activeElements === 'undefined') {
				this.activeElements = [];
			}

			var isChanged = (function(Elements) {
				var changed = false;

				if (Elements.length !== this.activeElements.length){
					changed = true;
					return changed;
				}

				helpers.each(Elements, function(element, index) {
					if (element !== this.activeElements[index]){
						changed = true;
					}
				}, this);
				return changed;
			}).call(this, ChartElements);

			if (!isChanged && !forceRedraw) {
				return;
			}
			else {
				this.activeElements = ChartElements;
			}
			
			this.draw();
			
			if (ChartElements.length > 0) {
				helpers.each(ChartElements, function(Element) {
					var tooltipPosition = Element.tooltipPosition();
					new Chart.Tooltip({
						x: Math.round(tooltipPosition.x),
						y: Math.round(tooltipPosition.y),
						xPadding: this.options.tooltipXPadding,
						yPadding: this.options.tooltipYPadding,
						fillColor: this.options.tooltipFillColor,
						textColor: this.options.tooltipFontColor,
						fontFamily: this.options.tooltipFontFamily,
						fontStyle: this.options.tooltipFontStyle,
						fontSize: this.options.tooltipFontSize,
						caretHeight: this.options.tooltipCaretSize,
						cornerRadius: this.options.tooltipCornerRadius,
						text: helpers.template(this.options.tooltipTemplate, Element),
						chart: this.chart
					}).draw();
				}, this);
			}
			return this;
		},
		update : function(){
			this.scale.update();
			// Reset any highlight colours before updating.
			helpers.each(this.activeElements, function(activeElement){
				activeElement.restore(['fillColor', 'strokeColor']);
			});
			this.eachPoints(function(point){
				point.save();
			});
			this.render();
		},
		eachPoints : function(callback){
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,callback,this);
			},this);
		},
		getPointsAtEvent : function(e){
			var pointsArray = [],
				eventPosition = helpers.getRelativePosition(e);
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,function(point){
					if (point.inRange(eventPosition.x,eventPosition.y)) pointsArray.push(point);
				});
			},this);
			return pointsArray;
		},
		buildScale : function(labels) {
			var self = this;

			var dataTotal = function(){
				var values = [];
				self.eachPoints(function(point){
					values.push(point.value);
				});

				return values;
			};

			var scaleOptions = {
				templateString : this.options.scaleLabel,
				height : this.chart.height,
				width : this.chart.width,
				ctx : this.chart.ctx,
				textColor : this.options.scaleFontColor,
				fontSize : this.options.scaleFontSize,
				fontStyle : this.options.scaleFontStyle,
				fontFamily : this.options.scaleFontFamily,
				//valuesCount : labels.length,
				beginAtZero : this.options.scaleBeginAtZero,
				integersOnly : this.options.scaleIntegersOnly,
				calculateYRange : function(currentHeight){
					var updatedRanges = helpers.calculateScaleRange(
						dataTotal(),
						currentHeight,
						this.fontSize,
						this.beginAtZero,
						this.integersOnly
					);
					helpers.extend(this, updatedRanges);
				},
				xLabels : labels,
				font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
				lineWidth : this.options.scaleLineWidth,
				lineColor : this.options.scaleLineColor,
				gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
				gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
				padding: (this.options.showScale) ? 0 : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
				showLabels : this.options.scaleShowLabels,
				display : this.options.showScale,
				backdropPaddingY : this.options.scaleBackdropPaddingY,
				backdropPaddingX: this.options.scaleBackdropPaddingX,
			};

			if (this.options.scaleOverride){
				helpers.extend(scaleOptions, {
					calculateYRange: helpers.noop,
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				});
			}


			this.scale = new this.ScaleClass(scaleOptions);
		},
		draw : function(ease) {
			var easingDecimal = ease || 1;
			this.clear();
			
			var ctx = this.chart.ctx;
			this.scale.draw();
			
			// helper method
			var hasValue = function(item){
				return item.value !== null;
			},
			previousPoint = function(point, collection, index){
				return helpers.findPreviousWhere(collection, hasValue, index) || point;
			};
			
			// Draw all of the data
			helpers.each(this.datasets,function(dataset){
				var pointsWithValues = helpers.where(dataset.points, hasValue);

				//Transition each point first so that the line and point drawing isn't out of sync
				//We can use this extra loop to calculate the control points of this dataset also in this loop

				helpers.each(dataset.points, function(point, index){
					if (point.x !== null && point.y !== null) {
						point.transition(this.scale.getPointPosition(point.value.real, point.value.imag), easingDecimal);
					}
				},this);

				//Draw the line between all the points
				ctx.lineWidth = this.options.datasetStrokeWidth;
				ctx.strokeStyle = dataset.strokeColor;
				ctx.beginPath();

				helpers.each(pointsWithValues, function(point, index){
					if (index === 0){
						ctx.moveTo(point.x, point.y);
					}
					else {
						var previous = previousPoint(point, pointsWithValues, index);  // need to the old point to see if we arc along real or imaginary
						
						if (previous !== null)
						{
							if (previous.value.real == point.value.real)
							{
								// arc along the constant real circle
								// real arcs should never go along the route that goes to the right side of the canvas. 
								var realRadius = 1 / (1 + point.value.real) * (this.scale.drawingArea / 2); // scale for the drawingArea size
								var realCenterX = this.scale.drawCenterX + ((point.value.real / (1 + point.value.real)) * (this.scale.drawingArea / 2));
								var realCenterY = this.scale.drawCenterY;
								
								var startAngle = Math.atan2(previous.y - realCenterY, previous.x - realCenterX);
								var endAngle = Math.atan2(point.y - realCenterY, point.x - realCenterX);
								
								startAngle += startAngle < 0 ? 2 * Math.PI: 0;
								endAngle += endAngle < 0 ? 2 * Math.PI : 0;
								ctx.arc(realCenterX, realCenterY, realRadius, startAngle, endAngle, startAngle > endAngle);
								ctx.moveTo(point.x, point.y);
							}
							else if (previous.value.imag === point.value.imag) {
								// arc along the constant imaginary circle
								// imaginary arcs should never go outside the graph
								var imagRadius = (1 / Math.abs(point.value.imag)) * (this.scale.drawingArea / 2);
								var imagCenterX = this.scale.drawCenterX + (this.scale.drawingArea / 2); // far right side of the drawing area
								var imagCenterY = point.value.imag > 0 ? this.scale.drawCenterY - imagRadius : this.scale.drawCenterY + imagRadius;
								
								var startAngle = Math.atan2(previous.y - imagCenterY, previous.x - imagCenterX);
								var endAngle = Math.atan2(point.y - imagCenterY, point.x - imagCenterX);
								
								startAngle += startAngle < 0 ? 2 * Math.PI: 0;
								endAngle += endAngle < 0 ? 2 * Math.PI : 0;
								ctx.arc(imagCenterX, imagCenterY, imagRadius, startAngle, endAngle, endAngle < startAngle);
								ctx.moveTo(point.x, point.y);
							}
							else {
								ctx.lineTo(point.x, point.y);
							}
						}
						else {
							ctx.lineTo(point.x,point.y);
						}
					}
				}, this);

				ctx.stroke();

				//Now draw the points over the line
				//A little inefficient double looping, but better than the line
				//lagging behind the point positions
				helpers.each(pointsWithValues,function(point){
					point.draw();
				});
			},this);
		},
	});
}).call(this);