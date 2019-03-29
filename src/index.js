'use strict';

import Chart from 'chart.js';
import Controller from './controller';
import Scale, {defaults} from './scale';

// Register the Controller and Scale
Chart.controllers.smith = Controller;
Chart.defaults.smith = {
	scale: {
		type: 'smith',
	},
	tooltips: {
		callbacks: {
			title: function() {
				return null;
			},
			label: function(bodyItem, data) {
				var dataset = data.datasets[bodyItem.datasetIndex];
				var d = dataset.data[bodyItem.index];
				return dataset.label + ': ' + d.real + ' + ' + d.imag + 'i';
			}
		}
	}
};
Chart.scaleService.registerScaleType('smith', Scale, defaults);
