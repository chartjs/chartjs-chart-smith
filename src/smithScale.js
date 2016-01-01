/*
 * Defines the scale for the smith chart.
 * When built, Chart will be passed via the UMD header
 */
(function (Chart) {
	var helpers = Chart.helpers;

	var defaultConfig = {
		position: 'chartArea',
		display: true,
		ticks: {
			rCallback: function(tick) {
				return tick.toString();
			},
			xCallback: function(tick) {
				return tick.toString();
			}
		}
	};

	var SmithScale = Chart.Scale.extend({
		setDimensions: function() {
			this.height = this.maxHeight;
			this.width = this.maxWidth;
			this.xCenter = Math.round(this.width / 2);
			this.yCenter = Math.round(this.height / 2);
		},

		buildTicks: function() {
			this.rTicks = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 3.0, 4.0, 5.0, 10.0, 20.0, 50.0];
			this.xTicks = [-50.0, -20.0, -10.0, -5.0, -4.0, -3.0, -2.0, -1.0, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0, 2.0, 3.0, 4.0, 5.0, 10.0, 20.0, 50.0];
		},

		convertTicksToLabels: function() {
			this.rLabels = this.rTicks.map(function(tick, index, ticks) {
				return this.options.ticks.rCallback.apply(this, [tick, index, ticks]);
			}, this);

			this.xLabels = this.rTicks.map(function(tick, index, ticks) {
				return this.options.ticks.xCallback.apply(this, [tick, index, ticks]);
			}, this);
		},

		calculateTickRotation: helpers.noop,

		// fit function similar to the radial linear scale
		fit: function() {
			this.xCenter = (this.left + this.right) / 2;
			this.yCenter = (this.top + this.bottom) / 2;
			this.minDimension = Math.min(this.right - this.left, this.bottom - this.top);
		},

		// Need a custom draw function here
		draw: function() {
			if (this.options.display) {
				// How do we draw the circles? From http://care.iitd.ac.in/People/Faculty/bspanwar/crl713/smith_chart_basics.pdf
				// we have that constant resistance circles obey the following
				// Center { r / (1 + r), 0}, Radius = 1 / (1 + r)
				//
				// The center point and radius will need to be scaled based on the size of the canvas

				// Draw each of the circles
				helpers.each(this.rTicks, function(r, rIndex) {
					var radius = 1 / (1 + r) * (this.minDimension / 2); // scale for the min dimension
					var x = this.xCenter + ((r / (1 + r)) * (this.minDimension / 2));

					this.ctx.beginPath();
					this.ctx.arc(x, this.yCenter, radius, 0, 2 * Math.PI);
					this.ctx.closePath();
					this.ctx.stroke();
				}, this);

				// Now we need to draw the impedance circles.
				// From the same source as above, these have the following properties:
				// Center : { 1, 1 / x}
				// Radius : 1 / x
				//
				// The discontinuity at x === 0 should be noted. This produces a flat line across the middle of the drawing area
				//
				// For each of the xCircles, both the positive and negative versions must be drawn as the reactance can be either positive or negative
				/*var xCircles = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 3.0, 4.0, 5.0, 10.0, 20.0, 50.0];

				// 0 Special case
				ctx.beginPath();
				ctx.moveTo(this.drawCenterX - (this.drawingArea / 2), this.drawCenterY);
				ctx.lineTo(this.drawCenterX + (this.drawingArea / 2), this.drawCenterY);
				ctx.stroke();
				ctx.closePath();

				helpers.each(xCircles, function(x, xIndex) {
					// Draw the positive circle
					var xRadius = (1 / x) * (this.drawingArea / 2);
					var xCoord = this.drawCenterX + (this.drawingArea / 2); // far right side of the drawing area
					var yCoord = this.drawCenterY - xRadius;

					// Ok, these circles are a pain. They need to only be drawn in the region that intersects the resistance == 0 circle. This circle has a radius of 0.5 * this.drawingArea and is
					// centered at (drawCenterX, drawCenterY)

					// We will solve the intersection in polar coordinates and define the center of our coordinate system as the center of the xCircle, ie (xCoord, yCoord)
					var r0 = Math.sqrt(Math.pow(xCoord - this.drawCenterX, 2) + Math.pow(yCoord - this.drawCenterY, 2));
					var phi0 = Math.atan2(this.drawCenterY - yCoord, this.drawCenterX - xCoord);

					// A circle with center location r0,phi0 with radius a is defined in polar coordinates by the equation
					// r = r0 * cos(phi - phi0) + sqrt(a^2 - ((r0^2) * sin^2(phi - phi0)))
					// Our xCircle is defined by r = xRadius because of where we defined the 0,0 point
					// Solving the intersection of these equations yields
					// phi = 0.5 * arccos((xRadius^2 - a^2) / (r0^2)) + phi0
					var arccos = Math.acos((Math.pow(xRadius, 2) - Math.pow(this.drawingArea / 2, 2)) / Math.pow(r0, 2));
					var phi2 = (0.5 * arccos) + phi0;

					ctx.beginPath();
					// These lines are always above the horizontal and always begin at 90 degrees
					ctx.arc(xCoord, yCoord, xRadius, Math.PI / 2, phi2, false); // always draw counterclockwise for these arcs
					ctx.stroke();
					ctx.closePath();

					if (this.showLabels) {
						this.xLabels.push({
							x: xCoord + (Math.cos(phi2) * xRadius),
							y: yCoord + (Math.sin(phi2) * xRadius),
							text: x
						});
					}

					// Negative circle
					yCoord = this.drawCenterY + xRadius;
					r0 = Math.sqrt(Math.pow(xCoord - this.drawCenterX, 2) + Math.pow(yCoord - this.drawCenterY, 2));
					phi0 = Math.atan2(this.drawCenterY - yCoord, this.drawCenterX - xCoord); // atan2 should always return an angle in [-PI/2, 0) for these circles
					arccos = Math.acos((Math.pow(xRadius, 2) - Math.pow(this.drawingArea / 2, 2)) / Math.pow(r0, 2));
					phi2 = (-0.5 * arccos) + phi0;

					ctx.beginPath();
					ctx.arc(xCoord, yCoord, xRadius, -1 / 2 * Math.PI, phi2, true);
					ctx.stroke();
					ctx.closePath();

					if (this.showLabels) {
						this.xLabels.push({
							x: xCoord + (Math.cos(phi2) * xRadius),
							y: yCoord + (Math.sin(phi2) * xRadius),
							text: x
						});
					}
				}, this);

				ctx.fillStyle = this.textColor;
				ctx.font = this.font;

				// Rotate canvas so that text is draw in correct orientation

				var prevX = 0;
				var prevY = 0;
				helpers.each(this.rLabels, function(label, labelIndex) {
					ctx.save();
					ctx.translate(label.x, label.y);
					ctx.rotate(-0.5 * Math.PI);
					ctx.textBaseline = 'middle';
					ctx.textAlign = "center";
					ctx.fillText(label.text, 0, 0);
					prevX = label.x;
					prevY = label.y;
					ctx.restore();
				}, this);

				helpers.each(this.xLabels, function(label, labelIndex) {
					var ang = Math.atan2(label.y - this.drawCenterY, label.x - this.drawCenterX);

					ctx.save();
					ctx.translate(label.x, label.y);
					ctx.rotate(ang);
					ctx.textBaseline = 'middle';
					ctx.textAlign = "left";
					ctx.fillText(label.text, 2, 0);
					ctx.restore();
				}, this);*/
			}
		},
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
	});

	Chart.scaleService.registerScaleType("smith", SmithScale, defaultConfig);
}).call(this, Chart);