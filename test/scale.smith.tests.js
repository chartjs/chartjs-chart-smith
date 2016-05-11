describe('Smith Scale', function() {

	it('Should register the constructor with the scale service', function() {
		var Constructor = Chart.scaleService.getScaleConstructor('smith');
		expect(Constructor).not.toBe(undefined);
		expect(typeof Constructor).toBe('function');
	});

	it('Should have the correct default config', function() {
		var defaultConfig = Chart.scaleService.getScaleDefaults('smith');

		expect(defaultConfig).toEqual({
			display: true,
			gridLines: {
				color: "rgba(0, 0, 0, 0.1)",
				display: true,
				drawOnChartArea: true,
				drawTicks: true, // draw ticks extending towards the label
				lineWidth: 1,
				offsetGridLines: false,
				tickMarkLength: 10,
				zeroLineColor: "rgba(0,0,0,0.25)",
				zeroLineWidth: 1,
			},
			position: 'chartArea',
			scaleLabel: {
				labelString: '',
				display: false,
			},
			ticks: {
				beginAtZero: false,
				maxRotation: 50,
				mirror: false,
				padding: 5,
				reverse: false,
				display: true,
				callback: jasmine.any(Function),
				rCallback: jasmine.any(Function),
				xCallback: jasmine.any(Function),
				autoSkip: true,
				autoSkipPadding: 0
			}
		});

		expect(defaultConfig.ticks.callback).toEqual(jasmine.any(Function));
	});

	it('should get the correct value for points', function() {
		var mockContext = window.createMockContext();

		// Create a mock scale for now
		var ScaleConstructor = Chart.scaleService.getScaleConstructor('smith');
		var scaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('smith'));
		var scale = new ScaleConstructor({
			ctx: mockContext,
			options: scaleConfig,
		});

		scale.left = 100;
		scale.right = 300;
		scale.top = 100;
		scale.bottom = 300;
		scale.update(200, 200);

		expect(scale.getPointPosition(1, 0)).toEqual({
			x: 200,
			y: 200
		});
		expect(scale.getPointPosition(0, 0)).toEqual({
			x: 148.9756097560976,
			y: 200
		});
		expect(scale.getPointPosition(0, -1)).toEqual({
			x: 200,
			y: 251.0243902439024
		});
		expect(scale.getPointPosition(1, -1)).toEqual({
			x: 210.20487804878047,
			y: 220.40975609756097
		});
		expect(scale.getPointPosition(0, 1)).toEqual({
			x: 200,
			y: 148.9756097560976
		});
		expect(scale.getPointPosition(1, 1)).toEqual({
			x: 210.20487804878047,
			y: 179.59024390243903
		});
		expect(scale.getPointPosition(1000, 0)).toEqual({
			x: 250.92244341024823,
			y: 200
		});
	});

	it('should draw correctly when not displaying', function() {
		var mockContext = window.createMockContext();

		// Create a mock scale for now
		var ScaleConstructor = Chart.scaleService.getScaleConstructor('smith');
		var scaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('smith'));
		scaleConfig.display = false;
		var scale = new ScaleConstructor({
			ctx: mockContext,
			options: scaleConfig,
		});

		scale.left = 100;
		scale.right = 300;
		scale.top = 100;
		scale.bottom = 300;
		scale.update(200, 200);

		mockContext.resetCalls();
		scale.draw();
		expect(mockContext.getCalls()).toEqual([]);
	});

	it('should draw correctly with no gridlines or ticks', function() {
		var mockContext = window.createMockContext();

		// Create a mock scale for now
		var ScaleConstructor = Chart.scaleService.getScaleConstructor('smith');
		var scaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('smith'));
		scaleConfig.gridLines.display = false;
		scaleConfig.ticks.display = false;
		var scale = new ScaleConstructor({
			ctx: mockContext,
			options: scaleConfig,
		});

		scale.left = 100;
		scale.right = 300;
		scale.top = 100;
		scale.bottom = 300;
		scale.update(200, 200);

		mockContext.resetCalls();
		scale.draw();
		expect(mockContext.getCalls()).toEqual([{
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [200, 200, 100, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}]);
	});

	it('should draw correctly', function() {
		var mockContext = window.createMockContext();

		// Create a mock scale for now
		var ScaleConstructor = Chart.scaleService.getScaleConstructor('smith');
		var scaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('smith'));
		var scale = new ScaleConstructor({
			ctx: mockContext,
			options: scaleConfig,
		});

		scale.left = 100;
		scale.right = 300;
		scale.top = 100;
		scale.bottom = 300;
		scale.update(200, 200);

		scale.draw();
		expect(mockContext.getCalls()).toEqual([{
			"name": "measureText",
			"args": ["-50i"]
		}, {
			"name": "measureText",
			"args": ["-20i"]
		}, {
			"name": "measureText",
			"args": ["-10i"]
		}, {
			"name": "measureText",
			"args": ["-5i"]
		}, {
			"name": "measureText",
			"args": ["-4i"]
		}, {
			"name": "measureText",
			"args": ["-3i"]
		}, {
			"name": "measureText",
			"args": ["-2i"]
		}, {
			"name": "measureText",
			"args": ["-1i"]
		}, {
			"name": "measureText",
			"args": ["-0.8i"]
		}, {
			"name": "measureText",
			"args": ["-0.6i"]
		}, {
			"name": "measureText",
			"args": ["-0.4i"]
		}, {
			"name": "measureText",
			"args": ["-0.2i"]
		}, {
			"name": "measureText",
			"args": ["0i"]
		}, {
			"name": "measureText",
			"args": ["0.2i"]
		}, {
			"name": "measureText",
			"args": ["0.4i"]
		}, {
			"name": "measureText",
			"args": ["0.6i"]
		}, {
			"name": "measureText",
			"args": ["0.8i"]
		}, {
			"name": "measureText",
			"args": ["1i"]
		}, {
			"name": "measureText",
			"args": ["2i"]
		}, {
			"name": "measureText",
			"args": ["3i"]
		}, {
			"name": "measureText",
			"args": ["4i"]
		}, {
			"name": "measureText",
			"args": ["5i"]
		}, {
			"name": "measureText",
			"args": ["10i"]
		}, {
			"name": "measureText",
			"args": ["20i"]
		}, {
			"name": "measureText",
			"args": ["50i"]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [148.9756097560976, 200]
		}, {
			"name": "lineTo",
			"args": [251.0243902439024, 200]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [200, 200, 51.02439024390238, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [204.63858093126385, 200, 46.38580931263853, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [208.5040650406504, 200, 42.520325203251986, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [211.7748592870544, 200, 39.249530956847984, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [214.57839721254354, 200, 36.445993031358846, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [217.0081300813008, 200, 34.01626016260158, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [219.13414634146338, 200, 31.89024390243899, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [221.01004304160688, 200, 30.014347202295518, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [222.67750677506774, 200, 28.34688346883466, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [224.16944801026955, 200, 26.85494223363283, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [225.51219512195118, 200, 25.51219512195119, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [227.8314855875831, 200, 23.192904656319264, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [229.76422764227638, 200, 21.260162601625993, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [231.3996247654784, 200, 19.624765478423992, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [232.80139372822296, 200, 18.222996515679423, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [234.01626016260158, 200, 17.00813008130079, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [238.26829268292678, 200, 12.756097560975595, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [240.81951219512192, 200, 10.204878048780477, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [242.52032520325199, 200, 8.504065040650396, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [246.38580931263851, 200, 4.638580931263853, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [248.59465737514512, 200, 2.429732868757256, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [250.02391200382587, 200, 1.0004782400765173, 0, 6.283185307179586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 201.02048780487806, 1.0204878048780477, -1.5707963267948966, -4.67239431243838, true]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 202.55121951219513, 2.5512195121951193, -1.5707963267948966, -4.612472188940802, true]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 205.10243902439024, 5.102439024390239, -1.5707963267948966, -4.513051675402365, true]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 210.20487804878047, 10.204878048780477, -1.5707963267948966, -4.317597860684929, true]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 212.7560975609756, 12.756097560975595, -1.5707963267948966, -4.222431654130961, true]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 217.0081300813008, 17.00813008130079, -1.5707963267948966, -4.068887871591405, true]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 225.51219512195118, 25.51219512195119, -1.5707963267948966, -3.785093762383078, true]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 251.0243902439024, 51.02439024390238, -1.5707963267948966, -3.141592653589793, true]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 263.78048780487796, 63.78048780487798, -1.5707963267948966, -2.9202782112420023, true]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 285.04065040650397, 85.04065040650397, -1.5707963267948966, -2.6516353273360647, true]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 327.5609756097559, 127.56097560975596, -1.5707963267948966, -2.3318090810196264, true]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 455.1219512195119, 255.1219512195119, -1.5707963267948966, -1.9655874464946586, true]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, -55.121951219511914, 255.1219512195119, 1.5707963267948966, 1.9655874464946586, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 72.43902439024404, 127.56097560975596, 1.5707963267948966, 2.3318090810196264, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 114.95934959349603, 85.04065040650397, 1.5707963267948966, 2.6516353273360647, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 136.21951219512204, 63.78048780487798, 1.5707963267948966, 2.9202782112420023, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 148.9756097560976, 51.02439024390238, 1.5707963267948966, 3.141592653589793, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 174.48780487804882, 25.51219512195119, 1.5707963267948966, 3.785093762383078, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 182.9918699186992, 17.00813008130079, 1.5707963267948966, 4.068887871591405, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 187.2439024390244, 12.756097560975595, 1.5707963267948966, 4.222431654130961, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 189.79512195121953, 10.204878048780477, 1.5707963267948966, 4.317597860684929, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 194.89756097560976, 5.102439024390239, 1.5707963267948966, 4.513051675402365, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 197.44878048780487, 2.5512195121951193, 1.5707963267948966, 4.612472188940802, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [251.0243902439024, 198.97951219512194, 1.0204878048780477, 1.5707963267948966, 4.67239431243838, false]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [148.9756097560976, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["0", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [158.25277161862533, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["0.1", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [165.98373983739842, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["0.2", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [172.5253283302064, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["0.3", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [178.13240418118468, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["0.4", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [182.99186991869922, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["0.5", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [187.2439024390244, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["0.6", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [190.99569583931137, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["0.7", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [194.3306233062331, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["0.8", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [197.3145057766367, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["0.9", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [200, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["1", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [204.63858093126385, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["1.2", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [208.5040650406504, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["1.4", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [211.7748592870544, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["1.6", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [214.57839721254354, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["1.8", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [217.0081300813008, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["2", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [225.51219512195118, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["3", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [230.61463414634144, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["4", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [234.01626016260158, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["5", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [241.74722838137467, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["10", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [246.16492450638788, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["20", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [249.02343376374935, 200]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["50", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [250.98358705298364, 202.04015954593774]
		}, {
			"name": "rotate",
			"args": [0.03999466794630145]
		}, {
			"name": "fillText",
			"args": ["-50i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [250.76990450702507, 205.0897147375464]
		}, {
			"name": "rotate",
			"args": [0.0999167914438858]
		}, {
			"name": "fillText",
			"args": ["-20i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [250.0140062786766, 210.1038396522579]
		}, {
			"name": "rotate",
			"args": [0.1993373049823242]
		}, {
			"name": "fillText",
			"args": ["-10i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [247.0994371482176, 219.624765478424]
		}, {
			"name": "rotate",
			"args": [0.3947911196997615]
		}, {
			"name": "fillText",
			"args": ["-5i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [245.02152080344328, 224.01147776183643]
		}, {
			"name": "rotate",
			"args": [0.48995732625372856]
		}, {
			"name": "fillText",
			"args": ["-4i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [240.81951219512192, 230.61463414634144]
		}, {
			"name": "rotate",
			"args": [0.6435011087932845]
		}, {
			"name": "fillText",
			"args": ["-3i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [230.61463414634144, 240.8195121951219]
		}, {
			"name": "rotate",
			"args": [0.9272952180016117]
		}, {
			"name": "fillText",
			"args": ["-2i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [200, 251.0243902439024]
		}, {
			"name": "rotate",
			"args": [1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["-1i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [188.7995240928019, 249.77989292088037]
		}, {
			"name": "rotate",
			"args": [4.933703422732481]
		}, {
			"name": "fillText",
			"args": ["-0.8i", -5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [175.9885222381636, 245.02152080344325]
		}, {
			"name": "rotate",
			"args": [5.202346306638418]
		}, {
			"name": "fillText",
			"args": ["-0.6i", -5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [163.0513036164845, 235.18923465096714]
		}, {
			"name": "rotate",
			"args": [5.522172552954856]
		}, {
			"name": "fillText",
			"args": ["-0.4i", -5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [152.9005628517823, 219.62476547842402]
		}, {
			"name": "rotate",
			"args": [5.888394187479825]
		}, {
			"name": "fillText",
			"args": ["-0.2i", -5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [152.9005628517823, 180.37523452157598]
		}, {
			"name": "rotate",
			"args": [0.3947911196997609]
		}, {
			"name": "fillText",
			"args": ["0.2i", -5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [163.0513036164845, 164.81076534903283]
		}, {
			"name": "rotate",
			"args": [0.7610127542247298]
		}, {
			"name": "fillText",
			"args": ["0.4i", -5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [175.9885222381636, 154.97847919655675]
		}, {
			"name": "rotate",
			"args": [1.080839000541168]
		}, {
			"name": "fillText",
			"args": ["0.6i", -5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [188.7995240928019, 150.22010707911963]
		}, {
			"name": "rotate",
			"args": [1.349481884447105]
		}, {
			"name": "fillText",
			"args": ["0.8i", -5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [200, 148.9756097560976]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "fillText",
			"args": ["1i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [230.61463414634144, 159.1804878048781]
		}, {
			"name": "rotate",
			"args": [-0.9272952180016117]
		}, {
			"name": "fillText",
			"args": ["2i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [240.81951219512192, 169.38536585365856]
		}, {
			"name": "rotate",
			"args": [-0.6435011087932845]
		}, {
			"name": "fillText",
			"args": ["3i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [245.02152080344328, 175.98852223816357]
		}, {
			"name": "rotate",
			"args": [-0.48995732625372856]
		}, {
			"name": "fillText",
			"args": ["4i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [247.0994371482176, 180.375234521576]
		}, {
			"name": "rotate",
			"args": [-0.3947911196997615]
		}, {
			"name": "fillText",
			"args": ["5i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [250.0140062786766, 189.8961603477421]
		}, {
			"name": "rotate",
			"args": [-0.1993373049823242]
		}, {
			"name": "fillText",
			"args": ["10i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [250.76990450702507, 194.9102852624536]
		}, {
			"name": "rotate",
			"args": [-0.0999167914438858]
		}, {
			"name": "fillText",
			"args": ["20i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [250.98358705298364, 197.95984045406226]
		}, {
			"name": "rotate",
			"args": [-0.03999466794630145]
		}, {
			"name": "fillText",
			"args": ["50i", 5, 0]
		}, {
			"name": "restore",
			"args": []
		}]);
	});
});