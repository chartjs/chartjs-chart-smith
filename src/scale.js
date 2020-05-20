/*
 * Defines the scale for the smith chart.
 * When built, Chart will be passed via the UMD header
 */
import Chart from 'chart.js';
const helpers = Chart.helpers;

const defaults = {
	position: 'chartArea',
	display: true,
	ticks: {
		padding: 5,
		rCallback: (tick) => tick.toString(),
		xCallback: (tick) => tick.toString() + 'i',
	}
};

class SmithScale extends Chart.Scale {
	setDimensions() {
		this.height = this.maxHeight;
		this.width = this.maxWidth;
		this.xCenter = this.left + Math.round(this.width / 2);
		this.yCenter = this.top + Math.round(this.height / 2);

		this.paddingLeft = 0;
		this.paddingTop = 0;
		this.paddingRight = 0;
		this.paddingBottom = 0;
	}

	buildTicks() {
		this.rTicks = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 3.0, 4.0, 5.0, 10.0, 20.0, 50.0];
		this.xTicks = [-50.0, -20.0, -10.0, -5.0, -4.0, -3.0, -2.0, -1.0, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0, 2.0, 3.0, 4.0, 5.0, 10.0, 20.0, 50.0];

		// Need to do this to make the core scale work
		return [];
	}

	convertTicksToLabels() {
		this.rLabels = this.rTicks.map(function(tick, index, ticks) {
			return this.options.ticks.rCallback.apply(this, [tick, index, ticks]);
		}, this);

		this.xLabels = this.xTicks.map(function(tick, index, ticks) {
			return this.options.ticks.xCallback.apply(this, [tick, index, ticks]);
		}, this);

		// Need to do this to make the core scale work
		return [];
	}

	// There is no tick rotation to calculate, so this needs to be overridden
	// eslint-disable-next-line class-methods-use-this, no-empty-function
	calculateTickRotation() {}

	// fit function similar to the radial linear scale
	fit() {
		const me = this;
		me.xCenter = (me.left + me.right) / 2;
		me.yCenter = (me.top + me.bottom) / 2;
		const fontSize = helpers.getValueOrDefault(me.options.ticks.fontSize, Chart.defaults.global.defaultFontSize);

		if (me.options.ticks.display) {
			const fontStyle = helpers.getValueOrDefault(me.options.ticks.fontStyle, Chart.defaults.global.defaultFontStyle);
			const fontFamily = helpers.getValueOrDefault(me.options.ticks.fontFamily, Chart.defaults.global.defaultFontFamily);
			const labelFont = helpers.fontString(fontSize, fontStyle, fontFamily);
			me.ctx.font = labelFont;

			const xLabelLengths = me.xLabels.map((tick) => me.ctx.measureText(tick).width);

			// Figure out where these points will go, and assuming they are drawn there, how much will it go outside of the chart area.
			// We use that to determine how much padding we nede on each side
			me.minDimension = Math.min(me.right - me.left, me.bottom - me.top);

			helpers.each(me.xTicks, (xTick, index) => {
				if (xTick !== 0) {
					const halfDimension = me.minDimension / 2;
					const labelStart = me.getPointPosition(0, xTick);
					const cosPhi = (labelStart.x - me.xCenter) / halfDimension;
					const sinPhi = (labelStart.y - me.yCenter) / halfDimension;
					const labelWidth = xLabelLengths[index] + me.options.ticks.padding;
					const pts = [{
						x: labelStart.x + (cosPhi * labelWidth) + (sinPhi * fontSize),
						y: labelStart.y + (sinPhi * labelWidth) - (cosPhi * fontSize)
					}, {
						x: labelStart.x + (cosPhi * labelWidth) - (sinPhi * fontSize),
						y: labelStart.y + (sinPhi * labelWidth) + (cosPhi * fontSize)
					}];

					helpers.each(pts, pt => {
						me.paddingLeft = Math.max(me.paddingLeft, me.left - pt.x);
						me.paddingTop = Math.max(me.paddingTop, me.top - pt.y);
						me.paddingRight = Math.max(me.paddingRight, pt.x - me.right);
						me.paddingBottom = Math.max(me.paddingBottom, pt.y - me.bottom);
					});
				}
			});
		}

		me.minDimension = Math.min(me.right - me.left - me.paddingLeft - me.paddingRight, me.bottom - me.top - me.paddingBottom - me.paddingTop);

		// Store data about the arcs that we will draw
		me.arcs = [];
		me.rLabelPoints = [];
		me.xLabelPoints = [];

		// How do we draw the circles? From http://care.iitd.ac.in/People/Faculty/bspanwar/crl713/smith_chart_basics.pdf
		// we have that constant resistance circles obey the following
		// Center { r / (1 + r), 0}, Radius = 1 / (1 + r)
		//
		// The center point and radius will need to be scaled based on the size of the canvas
		// Draw each of the circles
		helpers.each(me.rTicks, r => {
			const radius = 1 / (1 + r) * (me.minDimension / 2); // scale for the min dimension
			const x = me.xCenter + ((r / (1 + r)) * (me.minDimension / 2));

			me.arcs.push({
				x,
				y: me.yCenter,
				r: radius,
				s: 0,
				e: 2 * Math.PI,
				cc: false
			});

			me.rLabelPoints.push({
				x: x - radius,
				y: me.yCenter
			});
		});

		helpers.each(me.xTicks, x => {
			if (x !== 0) {
				const xRadius = (1 / Math.abs(x)) * (me.minDimension / 2);
				const xCoord = me.xCenter + (me.minDimension / 2); // far right side of the drawing area
				const yCoord = x > 0 ? me.yCenter - xRadius : me.yCenter + xRadius;

				// Ok, these circles are a pain. They need to only be drawn in the region that intersects the
				// resistance == 0 circle. This circle has a radius of 0.5 * this.minDimension and is centered
				// at (xCenter, yCenter). We will solve the intersection in polar coordinates and define the
				// center of our coordinate system as the center of the xCircle, ie (xCoord, yCoord)

				const r0 = Math.sqrt(Math.pow(xCoord - me.xCenter, 2) + Math.pow(yCoord - me.yCenter, 2));
				const phi0 = Math.atan2(me.yCenter - yCoord, me.xCenter - xCoord);

				// A circle with center location r0,phi0 with radius a is defined in polar coordinates by the equation
				// r = r0 * cos(phi - phi0) + sqrt(a^2 - ((r0^2) * sin^2(phi - phi0)))
				// Our xCircle is defined by r = xRadius because of where we defined the 0,0 point
				// Solving the intersection of these equations yields
				// phi = 0.5 * arccos((xRadius^2 - a^2) / (r0^2)) + phi0
				const arccos = Math.acos((Math.pow(xRadius, 2) - Math.pow(me.minDimension / 2, 2)) / Math.pow(r0, 2));
				const phi2 = ((x > 0 ? 0.5 : -0.5) * arccos) + phi0;
				const startAngle = x > 0 ? 0.5 * Math.PI : -0.5 * Math.PI;

				me.arcs.push({
					x: xCoord,
					y: yCoord,
					r: xRadius,
					s: startAngle,
					e: phi2,
					cc: x <= 0
				});

				me.xLabelPoints.push({
					x: xCoord + (Math.cos(phi2) * xRadius),
					y: yCoord + (Math.sin(phi2) * xRadius),
				});
			} else {
				me.xLabelPoints.push(null);
			}
		});
	}

	// Need a custom draw function here
	draw() {
		const me = this;

		if (me.options.display) {
			if (me.options.gridLines.display) {
				me.ctx.strokeStyle = me.options.gridLines.color;
				me.ctx.lineWidth = me.options.gridLines.lineWidth;

				// Draw horizontal line for x === 0
				me.ctx.beginPath();
				me.ctx.moveTo(me.xCenter - (me.minDimension / 2), me.yCenter);
				me.ctx.lineTo(me.xCenter + (me.minDimension / 2), me.yCenter);
				me.ctx.stroke();

				// Draw each of the arcs
				helpers.each(me.arcs, arc => {
					me.ctx.beginPath();
					me.ctx.arc(arc.x, arc.y, arc.r, arc.s, arc.e, arc.cc);
					me.ctx.stroke();
				});
			} else {
				// Simply draw a border line
				me.ctx.strokeStyle = me.options.gridLines.color;
				me.ctx.lineWidth = me.options.gridLines.lineWidth;
				me.ctx.beginPath();
				me.ctx.arc(me.xCenter, me.yCenter, me.minDimension / 2, 0, 2 * Math.PI, false);
				me.ctx.stroke();
			}

			if (me.options.ticks.display) {
				const fontSize = helpers.getValueOrDefault(me.options.ticks.fontSize, Chart.defaults.global.defaultFontSize);
				const fontStyle = helpers.getValueOrDefault(me.options.ticks.fontStyle, Chart.defaults.global.defaultFontStyle);
				const fontFamily = helpers.getValueOrDefault(me.options.ticks.fontFamily, Chart.defaults.global.defaultFontFamily);

				const labelFont = helpers.fontString(fontSize, fontStyle, fontFamily);
				me.ctx.font = labelFont;

				me.ctx.fillStyle = helpers.getValueOrDefault(me.options.ticks.fontColor, Chart.defaults.global.defaultFontColor);

				helpers.each(me.rLabels, (rLabel, index) => {
					const pt = me.rLabelPoints[index];

					me.ctx.save();
					me.ctx.translate(pt.x, pt.y);
					me.ctx.rotate(-0.5 * Math.PI);
					me.ctx.textBaseline = 'middle';
					me.ctx.textAlign = 'center';
					me.ctx.fillText(rLabel, 0, 0);
					me.ctx.restore();
				});

				helpers.each(me.xLabels, (xLabel, index) => {
					const pt = me.xLabelPoints[index];

					if (pt) {
						let align = 'left';
						let ang = Math.atan2(pt.y - me.yCenter, pt.x - me.xCenter);
						let textPadding = me.options.ticks.padding;

						if (pt.x < me.xCenter) {
							ang += Math.PI;
							align = 'right';
							textPadding *= -1;
						}

						me.ctx.save();
						me.ctx.translate(pt.x, pt.y);
						me.ctx.rotate(ang);
						me.ctx.textBaseline = 'middle';
						me.ctx.textAlign = align;
						me.ctx.fillText(xLabel, textPadding, 0);
						me.ctx.restore();
					}
				});
			}
		}
	}
	getPointPosition(real, imag) {
		// look for the intersection of the r circle and the x circle that is not the one along the right side of the canvas
		const realRadius = 1 / (1 + real) * (this.minDimension / 2); // scale for the minDimension size
		const realCenterX = this.xCenter + ((real / (1 + real)) * (this.minDimension / 2));
		const realCenterY = this.yCenter;

		const imagRadius = (1 / Math.abs(imag)) * (this.minDimension / 2);
		const imagCenterX = this.xCenter + (this.minDimension / 2); // far right side of the drawing area
		const imagCenterY = imag > 0 ? this.yCenter - imagRadius : this.yCenter + imagRadius;

		const r0 = Math.sqrt(Math.pow(imagCenterX - realCenterX, 2) + Math.pow(imagCenterY - realCenterY, 2));
		const angle = Math.atan2(realCenterY - imagCenterY, realCenterX - imagCenterX);
		const arccos = Math.acos((Math.pow(imagRadius, 2) - Math.pow(realRadius, 2)) / Math.pow(r0, 2));
		const phi = imag > 0 ? 0.5 * arccos + angle : -0.5 * arccos + angle;

		// We have an r and a phi from the point (imagCenterX, imagCenterY)
		// translate to an x and a undefined
		return {
			x: imag === 0 ? realCenterX - realRadius : (Math.cos(phi) * imagRadius) + imagCenterX,
			y: imag === 0 ? this.yCenter : (Math.sin(phi) * imagRadius) + imagCenterY
		};
	}
	getLabelForIndex(index, datasetIndex) {
		const d = this.chart.data.datasets[datasetIndex].data[index];
		return d.real + ' + ' + d.imag + 'i';
	}
}

export {defaults};
export default SmithScale;
