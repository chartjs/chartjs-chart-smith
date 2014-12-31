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
	};
	
	Chart.Type.extend({
		name: "SmithChart",
		defaults : defaultConfig,
		
		initialize: function(data) {
			var options = this.options; // expose options as a scope variable so that the scale class can access italics
			
			// Smith charts use a unique scale. This needs to be written from scratch.
			this.ScaleClass = Chart.Element.extend({
				initialize: function(){
					this.size = helpers.min([this.height, this.width]);
					this.drawingArea = (this.display) ? (this.size / 2) - (this.fontSize / 2 + this.backdropPaddingY) : (this.size / 2);
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
						var rCircles = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 2.0, 3.0, 4.0, 5.0, 10.0, 20.0, 50.0];
						
						// Center point of the canvas area we will use. This becomes the 1.0, 1.0 intersection
						var centerX = this.drawingArea / 2,
							centerY = centerX;
						// Draw each of the circles
						helpers.each(rCircles, function(r, rIndex) {
							var radius = 1 / (1 + r) * (this.drawingArea / 2); // scale for the drawingArea size
							var x = centerX + ((r / (1 + r)) * (this.drawingArea / 2));
							
							ctx.beginPath();
							ctx.arc(x, centerY, radius, 0, 2 * Math.PI);
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
						ctx.moveTo(0, centerY);
						ctx.lineTo(this.drawingArea, centerY);
						ctx.stroke();
						ctx.closePath();
						
						helpers.each(xCircles, function(x, xIndex) {
							// Draw the positive circle
							var xRadius = 1 / x * this.drawingArea / 2;
							var x = this.drawingArea; // far right side of the canvas
							var y = centerY - xRadius;
							
							// Ok, these circles are a pain. They need to only be drawn in the region that intersects the resistance == 0 circle. This circle has a radius of 0.5 * this.drawingArea and is
							// centered at (0.5 * this.drawingArea, 0.5 * this.drawingArea)
							
							// We will solve the intersection in polar coordinates and define (0, 0) as the center of the xCircle, ie (x, y)
							var r0 = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
							var angle = Math.atan2(centerY - y, centerX - x);
							
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
							y = centerY + xRadius;
							{
								var r0 = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
								var angle = Math.atan2(centerY - y, centerX - x); // atan2 should always return an angle in [-PI/2, 0) for these circles
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
			
			this.buildScale(data.labels);
		},
		update : function(){
			this.scale.update();
			this.render();
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
				valuesCount : labels.length,
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
		},
	});
}).call(this);