import Chart from 'chart.js';
import Scale, {defaults} from '../../src/scale.js';

describe('Smith Scale', () => {
	it('should get the correct value for points', () => {
		// Create a mock scale for now
		const scaleConfig = Chart.helpers.clone(defaults);
		const scale = new Scale({
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
			x: 100,
			y: 200
		});
		expect(scale.getPointPosition(0, -1)).toEqual({
			x: 200,
			y: 300
		});
		expect(scale.getPointPosition(1, -1)).toEqual({
			x: 220,
			y: 240
		});
		expect(scale.getPointPosition(0, 1)).toEqual({
			x: 200,
			y: 100.00000000000001,
		});
		expect(scale.getPointPosition(1, 1)).toEqual({
			x: 220,
			y: 160,
		});
		expect(scale.getPointPosition(1000, 0)).toEqual({
			x: 299.80019980019983,
			y: 200
		});
	});
});
