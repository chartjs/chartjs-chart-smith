// Test the smith controller
describe('Smith controller tests', function() {
	it('Should be constructed', function() {
		var chart = {
			data: {
				datasets: [{
					data: []
				}]
			},
			getDatasetMeta: function(datasetIndex) {
				this.data.datasets[datasetIndex].meta = this.data.datasets[datasetIndex].meta || {
					data: [],
					dataset: null
				};
				return this.data.datasets[datasetIndex].meta;
			},
		};

		var controller = new Chart.controllers.smith(chart, 0);
		expect(controller).not.toBe(undefined);
		expect(controller.index).toBe(0);

		var meta = chart.getDatasetMeta(0);
		expect(meta.data).toEqual([]);

		controller.updateIndex(1);
		expect(controller.index).toBe(1);
	});

	it('Should create line elements and point elements for each data item during initialization', function() {
		var chart = {
			data: {
				datasets: [{
					data: [{
						real: 0,
						imag: 0,
					}, {
						real: 1,
						imag: 0
					}, {
						real: 1,
						imag: 1,
					}, {
						real: 1,
						imag: -1
					}]
				}]
			},
			getDatasetMeta: function(datasetIndex) {
				this.data.datasets[datasetIndex].meta = this.data.datasets[datasetIndex].meta || {
					data: [],
					dataset: null
				};
				return this.data.datasets[datasetIndex].meta;
			},
			config: {
				type: 'smith'
			},
		};

		var controller = new Chart.controllers.smith(chart, 0);

		var meta = chart.getDatasetMeta(0);
		expect(meta.data.length).toBe(4); // 4 points created
		expect(meta.data[0] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[2] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[3] instanceof Chart.elements.Point).toBe(true);
		expect(meta.dataset instanceof Chart.elements.Line).toBe(true); // 1 line element
	});

	it('should update elements', function() {
		var data = {
			datasets: [{
				data: [{
					real: 0,
					imag: 0,
				}, {
					real: 1,
					imag: 0
				}, {
					real: 1,
					imag: 1,
				}, {
					real: 1,
					imag: -1
				}]
			}]
		};
		var mockContext = window.createMockContext();

		// Create a mock scale for now
		var ScaleConstructor = Chart.scaleService.getScaleConstructor('smith');
		var scaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('smith'));
		var scale = new ScaleConstructor({
			ctx: mockContext,
			options: scaleConfig,
			chart: {
				data: data,
			}
		});

		scale.left = 100;
		scale.right = 300;
		scale.top = 100;
		scale.bottom = 300;
		scale.update(200, 200);

		var chart = {
			chartArea: {
				bottom: 300,
				left: 100,
				right: 300,
				top: 100
			},
			data: data,
			config: {
				type: 'smith'
			},
			options: {
				showLines: true,
				elements: {
					line: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderCapStyle: 'round',
						borderColor: 'rgb(0, 255, 0)',
						borderDash: [],
						borderDashOffset: 0.1,
						borderJoinStyle: 'bevel',
						borderWidth: 1.2,
						fill: true,
						tension: 0.1,
					},
					point: {
						backgroundColor: Chart.defaults.global.defaultColor,
						borderWidth: 1,
						borderColor: Chart.defaults.global.defaultColor,
						hitRadius: 1,
						hoverRadius: 4,
						hoverBorderWidth: 1,
						radius: 3,
						pointStyle: 'circle'
					}
				},
			},
			scale: scale,
			getDatasetMeta: function(datasetIndex) {
				this.data.datasets[datasetIndex].meta = this.data.datasets[datasetIndex].meta || {
					data: [],
					dataset: null
				};
				return this.data.datasets[datasetIndex].meta;
			},
		};

		var controller = new Chart.controllers.smith(chart, 0);
		controller.update();

		var meta = chart.getDatasetMeta(0);

		// Line element
		expect(meta.dataset._model).toEqual({
			backgroundColor: 'rgb(255, 0, 0)',
			borderCapStyle: 'round',
			borderColor: 'rgb(0, 255, 0)',
			borderDash: [],
			borderDashOffset: 0.1,
			borderJoinStyle: 'bevel',
			borderWidth: 1.2,
			fill: true,
			tension: 0.1,

			scaleZero: {
				x: 200,
				y: 200
			},
		});

		expect(meta.data[0]._model).toEqual({
			backgroundColor: Chart.defaults.global.defaultColor,
			borderWidth: 1,
			borderColor: Chart.defaults.global.defaultColor,
			hitRadius: 1,
			radius: 3,
			pointStyle: 'circle',
			skip: false,
			tension: 0.1,

			// Point
			x: 149,
			y: 200,

			// Control points
			controlPointPreviousX: 149,
			controlPointPreviousY: 200,
			controlPointNextX: 154.1,
			controlPointNextY: 200
		});

		expect(meta.data[1]._model).toEqual({
			x: 200,
			y: 200,
			tension: 0.1,
			radius: 3,
			pointStyle: 'circle',
			backgroundColor: 'rgba(0,0,0,0.1)',
			borderColor: 'rgba(0,0,0,0.1)',
			borderWidth: 1,
			hitRadius: 1,
			skip: false,
			controlPointPreviousX: 195.8,
			controlPointPreviousY: 201.4,
			controlPointNextX: 201.9,
			controlPointNextY: 199.4
		});

		expect(meta.data[2]._model).toEqual({
			x: 210.2,
			y: 179.6,
			tension: 0.1,
			radius: 3,
			pointStyle: 'circle',
			backgroundColor: 'rgba(0,0,0,0.1)',
			borderColor: 'rgba(0,0,0,0.1)',
			borderWidth: 1,
			hitRadius: 1,
			skip: false,
			controlPointPreviousX: 209.8,
			controlPointPreviousY: 178.9,
			controlPointNextX: 210.9,
			controlPointNextY: 180.9
		});

		expect(meta.data[3]._model).toEqual({
			backgroundColor: Chart.defaults.global.defaultColor,
			borderWidth: 1,
			borderColor: Chart.defaults.global.defaultColor,
			hitRadius: 1,
			radius: 3,
			pointStyle: 'circle',
			skip: false,
			tension: 0.1,

			// Point
			x: 210.2,
			y: 220.4,

			// Control points
			controlPointPreviousX: 210.2,
			controlPointPreviousY: 216.3,
			controlPointNextX: 210.2,
			controlPointNextY: 220.4,
		});

		// Use dataset level styles for lines & points
		chart.data.datasets[0].tension = 0;
		chart.data.datasets[0].backgroundColor = 'rgb(98, 98, 98)';
		chart.data.datasets[0].borderColor = 'rgb(8, 8, 8)';
		chart.data.datasets[0].borderWidth = 0.55;
		chart.data.datasets[0].borderCapStyle = 'butt';
		chart.data.datasets[0].borderDash = [2, 3];
		chart.data.datasets[0].borderDashOffset = 7;
		chart.data.datasets[0].borderJoinStyle = 'miter';
		chart.data.datasets[0].fill = false;

		// point styles
		chart.data.datasets[0].radius = 22;
		chart.data.datasets[0].hitRadius = 3.3;
		chart.data.datasets[0].pointBackgroundColor = 'rgb(128, 129, 130)';
		chart.data.datasets[0].pointBorderColor = 'rgb(56, 57, 58)';
		chart.data.datasets[0].pointBorderWidth = 1.123;

		controller.update();

		expect(meta.dataset._model).toEqual({
			backgroundColor: 'rgb(98, 98, 98)',
			borderCapStyle: 'butt',
			borderColor: 'rgb(8, 8, 8)',
			borderDash: [2, 3],
			borderDashOffset: 7,
			borderJoinStyle: 'miter',
			borderWidth: 0.55,
			fill: false,
			tension: 0,

			scaleZero: {
				x: 200,
				y: 200
			},
		});

		expect(meta.data[0]._model).toEqual({
			tension: 0,
			radius: 22,
			pointStyle: 'circle',
			backgroundColor: 'rgb(128, 129, 130)',
			borderColor: 'rgb(56, 57, 58)',
			borderWidth: 1.123,
			hitRadius: 3.3,
			skip: false,
			
			// Point
			x: 149,
			y: 200,

			// Control points
			controlPointPreviousX: 149,
			controlPointPreviousY: 200,
			controlPointNextX: 149,
			controlPointNextY: 200
		});

		expect(meta.data[1]._model).toEqual({
			x: 200,
			y: 200,
			tension: 0,
			radius: 22,
			pointStyle: 'circle',
			backgroundColor: 'rgb(128, 129, 130)',
			borderColor: 'rgb(56, 57, 58)',
			borderWidth: 1.123,
			hitRadius: 3.3,
			skip: false,
			controlPointPreviousX: 200,
			controlPointPreviousY: 200,
			controlPointNextX: 200,
			controlPointNextY: 200
		});

		expect(meta.data[2]._model).toEqual({
			backgroundColor: 'rgb(128, 129, 130)',
			borderWidth: 1.123,
			borderColor: 'rgb(56, 57, 58)',
			hitRadius: 3.3,
			radius: 22,
			pointStyle: 'circle',
			skip: false,
			tension: 0,

			// Point
			x: 210.2,
			y: 179.6,

			// Control points
			controlPointPreviousX: 210.2,
			controlPointPreviousY: 179.6,
			controlPointNextX: 210.2,
			controlPointNextY: 179.6,
		});

		expect(meta.data[3]._model).toEqual({
			backgroundColor: 'rgb(128, 129, 130)',
			borderWidth: 1.123,
			borderColor: 'rgb(56, 57, 58)',
			hitRadius: 3.3,
			radius: 22,
			pointStyle: 'circle',
			skip: false,
			tension: 0,

			// Point
			x: 210.2,
			y: 220.4,

			// Control points
			controlPointPreviousX: 210.2,
			controlPointPreviousY: 220.4,
			controlPointNextX: 210.2,
			controlPointNextY: 220.4,
		});

		// Use custom styles for lines & first point
		meta.dataset.custom = {
			tension: 0.25,
			backgroundColor: 'rgb(55, 55, 54)',
			borderColor: 'rgb(8, 7, 6)',
			borderWidth: 0.3,
			borderCapStyle: 'square',
			borderDash: [4, 3],
			borderDashOffset: 4.4,
			borderJoinStyle: 'round',
			fill: true,
		};

		// point styles
		meta.data[0].custom = {
			radius: 2.2,
			backgroundColor: 'rgb(0, 1, 3)',
			borderColor: 'rgb(4, 6, 8)',
			borderWidth: 0.787,
			tension: 0.15,
			skip: true,
			hitRadius: 5,
		};

		controller.update();

		expect(meta.dataset._model).toEqual({
			backgroundColor: 'rgb(55, 55, 54)',
			borderCapStyle: 'square',
			borderColor: 'rgb(8, 7, 6)',
			borderDash: [4, 3],
			borderDashOffset: 4.4,
			borderJoinStyle: 'round',
			borderWidth: 0.3,
			fill: true,
			tension: 0.25,

			scaleZero: {
				x: 200,
				y: 200
			},
		});

		expect(meta.data[0]._model).toEqual({
			x: 149,
			y: 200,
			tension: 0.15,
			radius: 2.2,
			pointStyle: 'circle',
			backgroundColor: 'rgb(0, 1, 3)',
			borderColor: 'rgb(4, 6, 8)',
			borderWidth: 0.787,
			hitRadius: 5,
			skip: true,
			controlPointPreviousX: 149,
			controlPointPreviousY: 200,
			controlPointNextX: 161.8,
			controlPointNextY: 200
		});
	});
});
