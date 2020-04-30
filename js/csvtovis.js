import {
  select,
  csv,
  scaleLinear,
  axisLeft,
  axisBottom,
  max,
  min
} from 'd3';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

//Function render
const render = data => {
	const xValue = d => d.MappedFixationPointX;
  const yValue = d => d.MappedFixationPointY;

  const radius = 2;
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  //Transform the data values into positions
  const xScale = scaleLinear()
  	.domain([min(data, xValue), max(data, xValue)])
    .range([0, innerWidth])
  	.nice();

  const yScale = scaleLinear()
  	.domain([min(data, yValue), max(data, yValue)])
    .range([innerHeight, 0])
		.nice();

  //Translating the visualisation to innerposition
  const g = svg.append('g')
  	.attr('transform', `translate(${margin.left},${margin.top})`);

  const xAxis = axisBottom(xScale)
    .tickFormat(xAxisTickFormat)
    .tickSize(-innerHeight);

  //Creating the axes
  g.append('g').call(axisLeft(yScale));
  g.append('g').call(axisBottom(xScale))
   .attr('transform', `translate(0,${innerHeight})`);

  //Draw circles for each row of the csv file
  g.selectAll('.dot').data(data)
  	.enter().append('circle')
  		.attr('cx', d => xScale(xValue(d)))
  		.attr('cy', d => yScale(yValue(d)))
  		.attr('r', radius)
  		.attr('fill', 'black');
}

console.log(csv('data.csv'));
//Rendering the data
csv('data.csv')
  .then(data => {
  	data.forEach(d => {
    	d.MappedFixationPointX = +d.MappedFixationPointX;
    	d.MappedFixationPointY = +d.MappedFixationPointY;
    });
  	render(data);
});
