'use strict';

import Chart from 'chart.js';
import Controller from './controller';
import Scale, {defaults} from './scale';

// Register the Controller and Scale
Chart.controllers.smith = Controller;
Chart.defaults.smith = {
	aspectRatio: 1,
	scale: {
		type: 'smith',
	},
	tooltips: {
		callbacks: {
			title: () => null,
			label: (bodyItem, data) => {
				const dataset = data.datasets[bodyItem.datasetIndex];
				const d = dataset.data[bodyItem.index];
				return dataset.label + ': ' + d.real + ' + ' + d.imag + 'i';
			}
		}
	}
};
Chart.scaleService.registerScaleType('smith', Scale, defaults);
