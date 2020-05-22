const svg = d3.select('#svgAttention');
const svgDensX = d3.select('#svgDensityX');
const svgDensY = d3.select('#svgDensityY');

const width = +svg.attr('width');
const height = +svg.attr('height');
const widthDens = +svgDensX.attr('width');
const heightDens = +svgDensX.attr('height');

let data;
let stimulusName;
let dataSelected;
let resData;
let allVersions = [];

//initialize the position of the svgs
const initialization = (selection, props) => {
	const {maps} = props;

	selection.attr('transform',
	`translate(${heightDens}, 0)`
	);

	stimulusName = maps[0]	
}

//Create dropdown menu
const dropdownMenu = (selection, props) => {
	const {
		options,
		onOptionClicked
	} = props;

	//Create select keyword with click event listener
	let select = selection.selectAll('select').data([null]);
	select = select.enter().append('select')
		.merge(select)
			.on('change', function() {
				onOptionClicked(this.value);
			});

	//Create options inside the dropdown menu with the corresponding value for the displayed text
	const option = select.selectAll('option').data(options);
	option.enter().append('option')
		.merge(option)
			.text(d => d)
			.attr("value", d => d);
}

//Store the selected option
const onStimulusNameClicked = option => {
	stimulusName = option;
	render();
}

//Plot density plot for mapped fixation point x
const densityPlotX = (selection, props) => {
	const {
		data,
		xScale,
		xValue
	} = props;

	const yAxisLabel = 'Density';

	//Set y axis range
	const yScale = d3.scaleLinear()
		.domain(0, 0,1)
		.range(heightDens, 0);

	// Compute kernel density estimation
	let kde = kernelDensityEstimator(kernelEpanechnikov(7), xScale.ticks(40));
	let density =  kde(data.map(xValue));

	//Create container for density plot X
	const g = selection.selectAll('.containerDensX').data([null]);
 	const gEnter = g
    .enter().append('g')
	  .attr('class', 'containerDensX');

	//Customizing the axis
	const xAxis = d3.axisBottom(xScale)
		.tickSize(-heightDens)
		.tickPadding(10);

	const yAxis = d3.axisLeft(yScale)
		.tickSize(-widthDens)
		.tickPadding(10);

	//Creating the axes
	const yAxisG = g.select('.yAxis');
	const yAxisGEnter = gEnter
		.append('g')
			.attr('class', 'yAxis_dens_x');
	yAxisG
		.merge(yAxisGEnter)
			.call(yAxis)

	//Y-axis label
	yAxisGEnter
    	.append('text')
			.attr('class', 'axis-label')
			.attr('y', -60)
			.attr('transform', `rotate(-90)`)
			.attr('text-anchor', 'middle')
    	.merge(yAxisG.select('.axis-label'))
      		.attr('x', -innerHeight / 2)
      		.text(yAxisLabel);

	const xAxisG = g.select('.xAxis');
	const xAxisGEnter = gEnter
		.append('g')
				.attr('class', 'xAxis_dens_x');
	xAxisG
		.merge(xAxisGEnter)
			.call(xAxis)

	//X-axis label
	xAxisGEnter
		.append('text')
			.attr('class', 'axis-label')
			.attr('y', 60)
			.attr('text-anchor', 'middle')
		.merge(xAxisG.select('.axis-label'))
			.attr('x', innerWidth / 2);

	const line = () => {
		d3.line()
			.x(d => {return xScale(d[0]);})
			.y(d => {return yScale(d[1]);})
			.curve(d3.curveBasis);
	}

	// Plot the area
	const path = g.merge(gEnter)
		.selectAll('path').data(density);
	path
		.enter().append('path')
			.merge(path)
			.transition().duration(1000)
				.attr('d',  console.log(line()));

	// Function to compute density
	function kernelDensityEstimator(kernel, X) {
		return function(V) {
	 		return X.map(function(x) {
				return [x, d3.mean(V, function(v) { return kernel(x - v); })];
	  		});
		};
	}
	
  	function kernelEpanechnikov(k) {
		return function(v) {
			  return Math.abs(v /= k) <= 1 
				  ? 0.75 * (1 - v * v) / k 
				  : 0;
		};
	}
  
}
//Plot a attention map
const attentionMap = (selection, props) => {
	const {
		title,
		margin,
		maps
	} = props;

	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;
	
	const yAxisLabel = 'Mapped fixation point y';
	const xAxisLabel = 'Mapped fixation point x';

	//Filter the data
	dataSelected = data.filter(d => d.StimuliName == stimulusName);

	//Select the image according to the selected map(version)
	let imageSelected = maps.filter(d => d == stimulusName);

	//Select the image resolution according to the selected map
	let citySelected = resData.filter(d => stimulusName.includes(d.city));

	let imgWidth = citySelected[0].width;
	let imgHeight = citySelected[0].height;

	//Update image and set background
	let background = 'stimuli/' + imageSelected;

	const img = selection.selectAll('image').data([null]);
	const imgEnter = img.enter().append('image')

	imgEnter
		.merge(img)
			.attr('xlink:href', background)
			.attr('preserveAspectRatio', 'none')
			.attr('width', innerWidth)
			.attr('height', innerHeight)
			.attr('transform',
				`translate(${margin.left},${margin.top})`
			);

	//Transform the image resolution into range and domain of the axes
	const xScale = d3.scaleLinear()
		.domain([0, imgWidth])
		.range([0, innerWidth]);

	const yScale = d3.scaleLinear()
		.domain([0, imgHeight])
		.range([innerHeight, 0]);

	//Create container for attention map
	const g = selection.selectAll('.containerAttention').data([null]);
 	const gEnter = g
    .enter().append('g')
      .attr('class', 'containerAttention');
	//Translating the visualisation to innerposition with the updated data
	gEnter
		.merge(g)
			.attr('transform',
				`translate(${margin.left},${margin.top})`
			);

	//Customizing the axis
	const xAxis = d3.axisBottom(xScale)
		.tickSize(-innerHeight)
		.tickPadding(10);

	const yAxis = d3.axisLeft(yScale)
		.tickSize(-innerWidth)
		.tickPadding(10);

	//Creating the axes
	const yAxisG = g.select('.y-axis');
	const yAxisGEnter = gEnter
		.append('g')
			.attr('class', 'y-axis');
	yAxisG
		.merge(yAxisGEnter)
			.call(yAxis)
			.selectAll('.domain').remove();

	//Y-axis label
	yAxisGEnter
    	.append('text')
			.attr('class', 'axis-label')
			.attr('y', -60)
			.attr('transform', `rotate(-90)`)
			.attr('text-anchor', 'middle')
    	.merge(yAxisG.select('.axis-label'))
      		.attr('x', -innerHeight / 2)
      		.text(yAxisLabel);

	const xAxisG = g.select('.x-axis');
	const xAxisGEnter = gEnter
		.append('g')
				.attr('class', 'x-axis');
	xAxisG
		.merge(xAxisGEnter)
			.attr('transform', `translate(0,${innerHeight})`)
			.call(xAxis)
			.selectAll('.domain').remove();

	//X-axis label
	xAxisGEnter
		.append('text')
			.attr('class', 'axis-label')
			.attr('y', 60)
			.attr('text-anchor', 'middle')
		.merge(xAxisG.select('.axis-label'))
			.attr('x', innerWidth / 2)
			.text(xAxisLabel);

	//Append title to svg figure
	gEnter.append('text')
		.attr('class', 'title')
  		.attr('y', -15)
		.text(title);

	// compute the density data
	const densityData = d3.contourDensity()
		.x(d => { 
			return xScale(d.MappedFixationPointX); 
		})
		.y(d => { 
			return yScale(d.MappedFixationPointY); 
		})
		.size([imgWidth, imgHeight])
		.bandwidth(15);
	
	// Prepare a color palette
	let color = d3.scaleSequential(d3.interpolateMagma).domain(d3.extent(densityData(dataSelected).map(d => d.value))).nice();

	// Plot the attentio map
	const paths = g.merge(gEnter)
		.selectAll('path').data(densityData(dataSelected));
	paths
		.enter().append('path')
		.merge(paths)
			.transition()
				.attr('d', d3.geoPath())
				.attr('fill', d => {
					return color(d.value);
				})
				.attr('opacity', 0.4);
	paths
		.exit().remove();
	
	svgDensX.call(densityPlotX, {
		data: dataSelected,
		xScale: xScale,
		xValue: d => d.MappedFixationPointX
	});
}

//Function render
const render = () => {
//Invoke function dropdownMenu to generate menu
	d3.select('#menus')
		.call(dropdownMenu, {
			options: allVersions,
			onOptionClicked: onStimulusNameClicked
			}
		);

	//Invoke function to generate the scatterplot
	svg.call(attentionMap, {
		title: 'Attentionmap: Eye tracking data per city',
		margin: { top: 50, right: 20, bottom: 80, left: 90 },
		maps: allVersions,
		xValue: d => d.MappedFixationPointX,
		yValue: d => d.MappedFixationPointY,
	})
}

//(RE-)Render the data according to the selection by filter
Promise.all([
	d3.csv('data.csv'),
	d3.csv('stimuli/resolution.csv')
]).then(loadedData => {
	data = loadedData[0];
	resData = loadedData[1];

	data.forEach(d => {
		d.MappedFixationPointX = +d.MappedFixationPointX;
		d.MappedFixationPointY = +d.MappedFixationPointY;
		if (!allVersions.includes(d.StimuliName)) {
			allVersions.push(d.StimuliName);
		}
	});

	resData.forEach(d => {
		d.width = +d.width;
		d.height = +d.height;
	})
	svg.call(initialization, {maps: allVersions});
	render();
});
