const svg = d3.select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

let data;
let stimulusName;
let allVersions = [];
let dataSelected;

//function dropdown menu
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
		circleRadius,
		margin,
	} = props;

	const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

//Filter the data
	dataSelected = data.filter(d => d.StimuliName == stimulusName);

//Select the image according to the selected option
	let imageSelected = allVersions.filter(d => d == stimulusName);

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

	//A color scale: one color per data selection
	const dotColor = d3.scaleOrdinal()
		.domain(allVersions)
		.range(d3.schemeSet2);

	//Transform the data values into positions
	const xScale = d3.scaleLinear()
		.domain([d3.min(dataSelected, xValue), d3.max(dataSelected, xValue)])
		.range([0, innerWidth])
		.nice();

	const yScale = d3.scaleLinear()
		.domain([d3.min(dataSelected, yValue), d3.max(dataSelected, yValue)])
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

	const xAxisG = g.select('.x-axis');
	const xAxisGEnter = gEnter
		.append('g')
				.attr('class', 'x-axis');
	xAxisG
		.merge(xAxisGEnter)
			.attr('transform', `translate(0,${innerHeight})`)
			.call(xAxis)
			.selectAll('.domain').remove();

	const tooltipformat = d => 'User: ' + d['user'] + '<br/>' + 'Coordinates: (' + d['MappedFixationPointX']
	+ ', ' + d['MappedFixationPointY'] + ')' + '<br/>' + 'Fixation duration: ' + d['FixationDuration']
	+ '<br/>' + 'Description: ' + d['description'];

	//Draw circles for each row of the selected data
	const circles = g.merge(gEnter)
		.selectAll('circle').data(dataSelected);
	circles
		.enter().append('circle')
			.on('mouseover', d => {
				d3.select('#tooltip').transition()
						.duration(200)
							.style('opacity', .9)
							.style('left', (d3.event.pageX + 5) + 'px')
							.style('top', (d3.event.pageY + 5) + 'px')
							.style('display', 'block');
				d3.select('#tooltip').html(tooltipformat(d));
			})
			.on('mouseout', d => {
				d3.select('#tooltip')
					.transition().duration(400)
					.style('opacity', 0);
			})
		.merge(circles)
			.attr('cx', innerWidth/2)
			.attr('cy', innerHeight/2)
			.attr('r', 0)
		.transition().duration(2000)
		.delay((d, i) => i)
			.attr('r', circleRadius)
			.attr('cx', d => xScale(xValue(d)))
			.attr('cy', d => yScale(yValue(d)));
		
	circles
		.exit()
			.transition().duration(2000)
				.attr('r', 0)
				.attr('cx', innerWidth/2)
				.attr('cy', innerHeight/2)
			.remove();

	g.append('text')
		.attr('class', 'title')
  	.attr('y', -15)
		.text(title);
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
	  circleRadius: 4,
	  margin: { top: 50, right: 20, bottom: 50, left: 60 },
	})
}

//(RE-)Render the data according to the selection by filter
d3.csv('data.csv')
  .then(loadedData => {
		data = loadedData;
  	data.forEach(d => {
    	d.MappedFixationPointX = +d.MappedFixationPointX;
    	d.MappedFixationPointY = +d.MappedFixationPointY;
      if (!allVersions.includes(d.StimuliName)) {
				allVersions.push(d.StimuliName);
    	}
    });
  	render()
});
