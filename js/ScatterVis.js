const svg = d3.select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

let data;
let stimulusName;
let allVersions = [];
let dataSelected;
let resData;
let slider;
let timelineScale;
let handle;
let label;
let currentValue;
let targetValue;
var cumulativeFilter = true;
var amountSlider;
var moving = false;
let minTimeSlider;
let maxTimeSlider;
let timelineUpdate = false;
let maxvalueData;

/*
Selects the play button and the checkbox for interactions
If the checkbox is clicked, then the boolean filter will be flipped
*/
var playButton = d3.select('#play-button');
var checkBox = d3.select("#checkBox_id")
	checkBox.on('change', function(){ 
		cumulativeFilter = cumulativeFilter ? false : true;
	});
var tooltip = d3.select("#menus").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

/* 
The timeline slider will be created here
1. The slider consists of three parts, the slider itself
2. The circle in the middle that shows the value
3. The amount of the slider which is  shown above the circle
*/
function createTimeline(){

	/*
	define the axisTimeline for easy access to the timestamps
	define the mintime of the slider, which is the minimal value of the dataset
	define the maxtime of the slider, which is the maximal value of the dataset
	the maximum value of the data  is used later for redrawing
	the targetValue is needed to make the distribution
	*/
	const axisTimeline = data => data.Timestamp;
	minTimeSlider = +d3.min(data, function(d) {return d.Timestamp || Infinity; });
	maxTimeSlider = +d3.max(data,axisTimeline);
	maxvalueData = maxTimeSlider;
	targetValue = maxTimeSlider - minTimeSlider;

	/*
	Make the distribution of the timeline
	the domain is set between the minimum and maximum value of the data
	the range is set to the width of the slider
	*/
	timelineScale = d3.scaleLinear()     
		.domain([minTimeSlider,maxTimeSlider])
		.range([0,widthSlider])
		.clamp(true);

	// The slider is added to its svg and translated to the correct position
	slider = svgSlider.append('g')
		.attr('class', 'slider')
		.attr( 'transform', `translate(25,25)`);

	// The bar of the slider is initialized, and its style is corrected
	sliderLine = slider.append("line")
		.attr("class", "track")
		.attr("x1", timelineScale.range()[0])
		.attr("x2", timelineScale.range()[1])
		.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "track-inset")
		.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "track-overlay");

	// Add the text to the slider
	slider.insert("g", ".track-overlay")
		.attr("class", "ticks")
		.attr("transform", "translate(0," + 18 + ")")
		.selectAll("text")
		.data(timelineScale.ticks(10))
		.enter()
		.append("text")
		.attr("x", timelineScale)
		.attr("y", 10)
		.attr("text-anchor", "middle")
		.text(function(d) { d.Timestamp });


	// Add the circle in the bar at the current value
	handle = slider.insert("circle", ".track-overlay")
		.attr("class", "handle")
		.attr("r", 9);

	// The amount of the slider above the circle
	label = slider.append("text")  
		.attr("class", "label")
		.attr("text-anchor", "middle")
		.text(minTimeSlider/1000)
		.attr("transform", "translate("+0+","+ -13 +")")
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
	
	const yAxisLabel = 'Mapped fixation point y';
	const xAxisLabel = 'Mapped fixation point x';
//Filter the data
	dataSelected = data.filter(d => d.StimuliName == stimulusName);

// update the timeline according to the data if a chart has been selected
if (timelineUpdate){
	const axisTimeline = dataSelected => dataSelected.Timestamp;
	/* 
	update the minimum and maximum value of the selected data
	update the domain of the slider 
	update the value above the slider
	*/
	minTimeSlider = +d3.min(dataSelected, function(d) {return d.Timestamp || Infinity; });
	maxTimeSlider = +d3.max(dataSelected,axisTimeline);
	targetValue = maxTimeSlider - minTimeSlider;
	timelineScale.domain([minTimeSlider,maxTimeSlider]);
	slider.selectAll("text")
		.data(timelineScale.ticks(10))
		currentValue = maxTimeSlider;
		handle.attr("cx", timelineScale(currentValue));
		label
			.attr("x", timelineScale(currentValue))
			.text(Math.round(currentValue/10)/100+' sec');
}

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
		.delay((d, i) => i * 2)
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

	gEnter.append('text')
		.attr('class', 'title')
  		.attr('y', -15)
		.text(title);
	
	// Update the data from the timeline scaler
	function drawPlot(dataDrawPlot) {
		const circles = g.merge(gEnter)
			.selectAll('circle').data(dataDrawPlot);
		circles
			.enter().append('circle')
				.merge(circles)
					.attr('r', circleRadius)
					.attr('cx', d => xScale(xValue(d)))
					.attr('cy', d => yScale(yValue(d)))
					.on("mouseover", function(d) {
						tooltip.transition()
						  .duration(200)
						  .style("opacity", 1);
						tooltip.html("Coordinates :" + d.MappedFixationPointX + "," + d.MappedFixationPointX + "<br/> By user:" + d.user)
						  .style("left", (d3.event.pageX) + "px")
						  .style("top", (d3.event.pageY - 28) + "px");
					})
					.on("mouseout", function(d) {
						tooltip.transition()
						  .duration(500)
						  .style("opacity", 0);
					  });
		circles
			.exit().remove();
		}	
	
	/*
	 Play button on click
	 if the button is on pause, it will change to play
		then the slider will stop moving
		and the interval will be cleared
	 if the button is on play, it will change to pause
		then the slider will start moving
		the command step will be executed every 0.1 seconds
	*/ 
	playButton.on("click", function() {
		var button = d3.select(this);
		if (button.text() == "Pause") {
		moving = false;
		clearInterval(timer);
		button.text("Play");
		} else {
			if (currentValue >= maxTimeSlider){
				currentValue=minTimeSlider;
				update(currentValue);
			}
		moving = true;
		timer = setInterval(step, 250);
		button.text("Pause");
		}
	})

	// Step function for the play button
	function step() {
		update(currentValue);

		const amountOfPoints = data.filter(d => d.StimuliName == stimulusName).length;
		amountSlider = amountOfPoints;
		// Updates the slider by the compensated amount
		currentValue +=  targetValue/amountSlider;
		// If the slider is finished, then don't move it anymore, clear the interval and set the value to its start
		if (currentValue > maxTimeSlider) {
		  moving = false;
		  currentValue = minTimeSlider;
		  clearInterval(timer);
		  // timer = 0;
		  playButton.text("Play");
		}
	  }

	sliderLine.call(d3.drag()
		  .on("start.interrupt", function() { slider.interrupt(); })
		  .on("start drag", function() {
			  currentValue = timelineScale.invert(d3.event.x);
			  update(currentValue); 
			  }
		  )
	  );
		
	// Update button for the new value
	function update(h) {
		// update position and text of label according to slider scale
		handle.attr("cx", timelineScale(h));
		label
		.attr("x", timelineScale(h))
		.text(Math.round(h/10)/100 + ' sec');
		// filter data set and redraw plot
				if(cumulativeFilter){
				dataSelected = data.filter(d => d.StimuliName == stimulusName && d.Timestamp < h);
				}
				else{
					dataSelected = data.filter(d => d.StimuliName == stimulusName && d.Timestamp < h && d.Timestamp>h-500);
				}
    drawPlot(dataSelected);
	}
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
		d.height = +d.height
	})
	stimulusName = allVersions[0];
	render();
});
