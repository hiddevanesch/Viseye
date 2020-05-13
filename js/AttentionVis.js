const svg = d3.select('#svgScatter');

const width = +svg.attr('width');
const height = +svg.attr('height');

let data;
let stimulusName;
let allVersions = [];
let dataSelected;
let resData;

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

//plot a scatterplot
const scatterPlot = (selection, props) => {
	const {
		title,
		xValue,
		yValue,
		margin,
	} = props;

	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;
	
	const yAxisLabel = 'Mapped fixation point y';
	const xAxisLabel = 'Mapped fixation point x';

	//Filter the data
	dataSelected = data.filter(d => d.StimuliName == stimulusName);

	//Select the image according to the selected map(version)
	let imageSelected = allVersions.filter(d => d == stimulusName);

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
		.range([0, innerWidth])

	const yScale = d3.scaleLinear()
		.domain([0, imgHeight])
		.range([innerHeight, 0])
		.nice();

	//Create container for scatterplot
	const g = selection.selectAll('.container').data([null]);
 	const gEnter = g
    .enter().append('g')
      .attr('class', 'container');
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

	// Prepare a color palette
	let color = d3.scaleLinear()
	 .domain([0, 1]) // Points per square pixel.
	 .range(["green", "red"]);

	// compute the density data
	let densityData = d3.contourDensity()
		.x(function(d) { return xScale(xValue(d)); })
		.y(function(d) { return yScale(yValue(d)); })
		.size([width, height])
		.bandwidth(20);
		(dataSelected)

	// show the shape!
	svg.insert("g", "g")
	.selectAll("path")
		.data(densityData)
			.enter()
				.append("path")
					.attr("d", d3.geoPath())
					.attr("fill", function(d) { return color(d.value); });
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
	svg.call(scatterPlot, {
		title: 'Scatterplot: Eye tracking data per city',
		xValue: d => d.MappedFixationPointX,
	  	yValue: d => d.MappedFixationPointY,
	  	margin: { top: 50, right: 20, bottom: 80, left: 90 },
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
	stimulusName = allVersions[0];
	render();
});
