import Chart from 'chart.js';

const helpers = Chart.helpers;
const resolve = helpers.options.resolve;
const valueOrDefault = helpers.valueOrDefault;

class Controller extends Chart.controllers.line {
	// Not needed since there is only a single scale
	// eslint-disable-next-line class-methods-use-this, no-empty-function
	linkScales() {}

	updateElement(point, index) {
		const me = this;
		const meta = me.getMeta();
		const custom = point.custom || {};
		const datasetIndex = me.index;
		const yScale = me.getScaleForId(meta.yAxisID);
		const xScale = me.getScaleForId(meta.xAxisID);
		const lineModel = meta.dataset._model;

		const options = me._resolvePointOptions(point, index);
		const {x, y} = me.calculatePointPosition(index);

		// Utility
		point._xScale = xScale;
		point._yScale = yScale;
		point._options = options;
		point._datasetIndex = datasetIndex;
		point._index = index;

		// Desired view properties
		point._model = {
			x,
			y,
			skip: custom.skip || isNaN(x) || isNaN(y),
			// Appearance
			radius: options.radius,
			pointStyle: options.pointStyle,
			rotation: options.rotation,
			backgroundColor: options.backgroundColor,
			borderColor: options.borderColor,
			borderWidth: options.borderWidth,
			tension: valueOrDefault(custom.tension, lineModel ? lineModel.tension : 0),
			steppedLine: lineModel ? lineModel.steppedLine : false,
			// Tooltip
			hitRadius: options.hitRadius
		};
	}

	/**
	 * @private
	 */
	_resolvePointOptions(element, index) {
		const me = this;
		const chart = me.chart;
		const dataset = chart.data.datasets[me.index];
		const custom = element.custom || {};
		const options = chart.options.elements.point;
		const values = {};
		let i, ilen, key;

		// Scriptable options
		const context = {
			chart,
			dataIndex: index,
			dataset,
			datasetIndex: me.index
		};

		const ELEMENT_OPTIONS = {
			backgroundColor: 'pointBackgroundColor',
			borderColor: 'pointBorderColor',
			borderWidth: 'pointBorderWidth',
			hitRadius: 'pointHitRadius',
			hoverBackgroundColor: 'pointHoverBackgroundColor',
			hoverBorderColor: 'pointHoverBorderColor',
			hoverBorderWidth: 'pointHoverBorderWidth',
			hoverRadius: 'pointHoverRadius',
			pointStyle: 'pointStyle',
			radius: 'pointRadius',
			rotation: 'pointRotation'
		};
		const keys = Object.keys(ELEMENT_OPTIONS);

		for (i = 0, ilen = keys.length; i < ilen; ++i) {
			key = keys[i];
			values[key] = resolve([
				custom[key],
				dataset[ELEMENT_OPTIONS[key]],
				dataset[key],
				options[key]
			], context, index);
		}

		return values;
	}

	calculatePointPosition(dataIndex) {
		const scale = this.chart.scale;
		const data = this.getDataset().data[dataIndex];
		return scale.getPointPosition(data.real, data.imag);
	}
}

export default Controller;
