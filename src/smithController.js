(function(Chart) {
	var helpers = Chart.helpers;

	Chart.defaults.smith = {
		scale: {
			type: 'smith'
		},
		tooltips: {
			callbacks: {
				title: function() {
					return null;
				},
				label: function(bodyItem, data) {
					var dataset = data.datasets[bodyItem.datasetIndex];
					var d = dataset.data[bodyItem.index];
					return dataset.label + ": " + d.real + ' + ' + d.imag + 'i';
				}
			}
		}
	};

	Chart.controllers.smith = Chart.controllers.line.extend({
		// Not needed since there is only a single scale
		linkScales: helpers.noop,

		update: function(reset) {
			var line = this.getDataset().metaDataset;
			var points = this.getDataset().metaData;

			// Update Line
			helpers.extend(line, {
				// Utility
				_datasetIndex: this.index,
				// Data
				_children: points,
				// Model
				_model: {
					// Appearance
					tension: line.custom && line.custom.tension ? line.custom.tension : helpers.getValueOrDefault(this.getDataset().tension, this.chart.options.elements.line.tension),
					backgroundColor: line.custom && line.custom.backgroundColor ? line.custom.backgroundColor : (this.getDataset().backgroundColor || this.chart.options.elements.line.backgroundColor),
					borderWidth: line.custom && line.custom.borderWidth ? line.custom.borderWidth : (this.getDataset().borderWidth || this.chart.options.elements.line.borderWidth),
					borderColor: line.custom && line.custom.borderColor ? line.custom.borderColor : (this.getDataset().borderColor || this.chart.options.elements.line.borderColor),
					borderCapStyle: line.custom && line.custom.borderCapStyle ? line.custom.borderCapStyle : (this.getDataset().borderCapStyle || this.chart.options.elements.line.borderCapStyle),
					borderDash: line.custom && line.custom.borderDash ? line.custom.borderDash : (this.getDataset().borderDash || this.chart.options.elements.line.borderDash),
					borderDashOffset: line.custom && line.custom.borderDashOffset ? line.custom.borderDashOffset : (this.getDataset().borderDashOffset || this.chart.options.elements.line.borderDashOffset),
					borderJoinStyle: line.custom && line.custom.borderJoinStyle ? line.custom.borderJoinStyle : (this.getDataset().borderJoinStyle || this.chart.options.elements.line.borderJoinStyle),
					fill: line.custom && line.custom.fill ? line.custom.fill : (this.getDataset().fill !== undefined ? this.getDataset().fill : this.chart.options.elements.line.fill),

					// Scale
					scaleZero: {
						x: this.chart.scale.xCenter,
						y: this.chart.scale.yCenter
					},
				},
			});
			line.pivot();

			// Update Points
			helpers.each(points, function(point, index) {
				this.updateElement(point, index, reset);
			}, this);

			this.updateBezierControlPoints();
		},
		updateElement: function(point, index, reset) {
			var scale = this.chart.scale;

			helpers.extend(point, {
				// Utility
				_chart: this.chart.chart,
				_datasetIndex: this.index,
				_index: index,

				// Desired view properties
				_model: {
					x: reset ? scale.xCenter : this.calculatePointX(index),
					y: reset ? scale.yCenter : this.calculatePointY(index),
					// Appearance
					tension: point.custom && point.custom.tension ? point.custom.tension : helpers.getValueOrDefault(this.getDataset().tension, this.chart.options.elements.line.tension),
					radius: point.custom && point.custom.radius ? point.custom.radius : helpers.getValueAtIndexOrDefault(this.getDataset().radius, index, this.chart.options.elements.point.radius),
					backgroundColor: this.getPointBackgroundColor(point, index),
					borderColor: this.getPointBorderColor(point, index),
					borderWidth: this.getPointBorderWidth(point, index),
					// Tooltip
					hitRadius: point.custom && point.custom.hitRadius ? point.custom.hitRadius : helpers.getValueAtIndexOrDefault(this.getDataset().hitRadius, index, this.chart.options.elements.point.hitRadius),
				},
			});

			point._model.skip = point.custom && point.custom.skip ? point.custom.skip : (isNaN(point._model.x) || isNaN(point._model.y));
		},
		calculatePointX: function(dataIndex) {
			var scale = this.chart.scale;
			var data = this.getDataset().data[dataIndex];
			return scale.getPointPosition(data.real, data.imag).x;
		},
		calculatePointY: function(dataIndex) {
			var scale = this.chart.scale;
			var data = this.getDataset().data[dataIndex];
			return scale.getPointPosition(data.real, data.imag).y;
		}
	});
}).call(this, Chart);