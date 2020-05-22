---
id: index
title: Smith Charts with Chart.js
---

To create a Smith Chart, include `chartjs-chart-smith.js` after `Chart.js` and then create the chart by setting the `type` attribute to `'smith'`. 

```javascript
var mySmithChart = new Chart({
	type: 'smith',
	data: dataObject
});
```

### Data Representation

The smith chart can graph multiple datasets at once. The data for each dataset is in the form of complex numbers.

```javascript
var smithChartData = {
	datasets: [{
		label: 'Dataset 1',
		data: [{
			real: 0,
			imag: 1
		}, {
			real: 1,
			imag: 1
		}]
	}]	
};
```

### Scale Configuration
The smith chart scale can be configured by placing options into the config that is passed to the chart upon creation.

```javascript
new Chart({
	config: {
		scale: {
			display: true, // setting false will hide the scale
			gridLines: {
				// setting false will hide the grid lines
				display: true, 

				// the color of the grid lines
				color: rgba(0, 0, 0, 0.1), 

				// thickness of grid lines
				lineWidth: 1, 
			},
			ticks: {
				// The color of the scale label text
				fontColor: 'black',

				// The font family used to render labels
				fontFamily: 'Helvetica',

				// The font size in px
				fontSize: 12,

				// Style of font
				fontStyle: 'normal'

				// Function used to convert real valued ticks to strings
				rCallback: function(tick, index, ticks) {}

				// Function used to convert imaginary valued ticks to strings
				xCallback: function(tick, index, ticks) {}
			}
		}
	}
});
```

### Dataset Configuration

The datasets for smith charts support many of the same options as the line chart

```javascript
{
	// Bezier Curve tension. Set to 0 for straight lines
	tension: 0,

	// Fill color for dataset
	backgroundColor: 'rgba(0, 0, 0, 0.1)',

	// Width of line
	borderWidth: 1,

	// Line color
	borderColor: 'rgba(0, 0, 0, 0.1)',

	// Line ending style
	borderCapStyle: 'butt',

	// Line dash style
	borderDash: [],

	// Dash offset. Used in conjunction with borderDash property
	borderDashOffset: 0,

	// Line join style
	borderJoinStyle: 'miter',

	// Do we fill the line?
	fill: true,

	// Point radius
	radius: 3,

	// Point style (circle, cross, etc)
	pointStyle: 'circle',

	// Point fill color
	pointBackgroundColor: 'rgba(0, 0, 0, 0.1)',

	// Point stroke color
	pointBorderColor: 'rgba(0, 0, 0, 0.1)',

	// Point stroke width
	pointBorderWidth: 1,

	// Used for hit detection
	hitRadius: 3
}
```

## License

chartjs-chart-smith is available under the [MIT license](http://opensource.org/licenses/MIT).

## Bugs & issues

When reporting bugs or issues, if you could include a link to a simple [jsbin](http://jsbin.com) or similar demonstrating the issue, that would be really helpful.