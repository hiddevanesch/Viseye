const svg = d3.select('#svgScatter');
const svgSlider = d3.select('#svgSlider');

const width = +svg.attr('width');
const height = +svg.attr('height');
const widthSlider = +svgSlider.attr('width') - 100;
const heightSlider = +svgSlider.attr('height');

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
let cumulativeFilter = true;
let amountSlider;
let moving = false;
let minTimeSlider;
let maxTimeSlider;
let timelineUpdate = false;
let maxvalueData;

/*
Selects the play button and the checkbox for interactions
If the checkbox is clicked, then the boolean filter will be flipped
*/
let playButton = d3.select('#play-button');
let checkBox = d3.select('#checkBox_id')
	checkBox.on('change', function(){ 
		cumulativeFilter = cumulativeFilter ? false : true;
	});

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
			.attr('value', d => d);
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

	//Filter the data, first it corrects the timeline, then it filters the data
	currentValue = maxvalueData;
	handle.attr('cx', timelineScale(currentValue));
	label
		.attr('x', timelineScale(currentValue))
		.text(Math.round(currentValue/10)/100+ ' sec');
	
	//Filter the data
	dataSelected = data.filter(d => d.StimuliName == stimulusName);

	// update the timeline according to the data if a chart has been selected
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
		slider.selectAll('text')
			.data(timelineScale.ticks(10))
			currentValue = maxTimeSlider;
			handle.attr('cx', timelineScale(currentValue));
			label
				.attr('x', timelineScale(currentValue))
				.text(Math.round(currentValue/10)/100+' sec');

//Select the image according to the selected map(version)
	let imageSelected = allVersions.filter(d => d == stimulusName);

//Select the image resolution according to the selected map
	let citySelected = resData.filter(d => stimulusName.includes(d.city));

	let imgWidth = citySelected[0].width;
	let imgHeight = citySelected[0].height;

//Update image and set background
	let background = 'stimuli/' + imageSelected;

	const img = selection.selectAll('image').data([null]);
	const imgEnter = img.enter().append('image');

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

	//Create container for scatterplot
	const g = selection.selectAll('.containerScatter').data([null]);
 	const gEnter = g
    .enter().append('g')
      .attr('class', 'containerScatter');
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

	gEnter.append('text')
		.attr('class', 'title')
  		.attr('y', -15)
		.text(title);
	
	const tooltipformat = d => 'User: ' + d['user'] + '<br/>' + 'Coordinates: (' + d['MappedFixationPointX']
		+ ', ' + d['MappedFixationPointY'] + ')' + '<br/>' + 'Fixation duration: ' + d['FixationDuration']
		+ '<br/>' + 'Description: ' + d['description'];

	// Update the data from the timeline scaler
	function drawPlot(dataDrawPlot) {
		//Draw circles for each row of the selected data
		const circles = g.merge(gEnter)
			.selectAll('circle').data(dataDrawPlot);
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
			.transition().duration(1000)
			.delay((d, i) => i * 2)
				.attr('r', circleRadius)
				.attr('cx', d => xScale(xValue(d)))
				.attr('cy', d => yScale(yValue(d)));
		circles
			.exit()
				.transition().duration(1000)
					.attr('r', 0)
					.attr('cx', innerWidth/2)
					.attr('cy', innerHeight/2)
				.remove();
	}
	
	function timeSlider() {
		/*
		Play button on click
		if the button is on pause, it will change to play
			then the slider will stop moving
			and the interval will be cleared
		if the button is on play, it will change to pause
			then the slider will start moving
			the command step will be executed every 0.1 seconds
		*/ 
		playButton.on('click', function() {
			let button = d3.select(this);
			if (button.text() == 'Pause') {
			moving = false;
			clearInterval(timer);
			button.text('Play');
			} else {
				if (currentValue >= maxTimeSlider){
					currentValue=minTimeSlider;
					update(currentValue);
				}
			moving = true;
			timer = setInterval(step, 250);
			button.text('Pause');
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
			playButton.text('Play');
			}

			sliderLine.call(d3.drag()
				.on('start.interrupt', function() { slider.interrupt(); })
				.on('start drag', function() {
					currentValue = timelineScale.invert(d3.event.x);
					update(currentValue); 
					}
				)
			);
				
			// Update button for the new value
			function update(h) {
				// update position and text of label according to slider scale
				handle.attr('cx', timelineScale(h));
				label
				.attr('x', timelineScale(h))
				.text(Math.round(h/10)/100 + ' sec');
				// filter data set and redraw plot
						if(cumulativeFilter){
						dataSelected = data.filter(d => d.StimuliName == stimulusName && d.Timestamp < h);
						}
						else {
							dataSelected = data.filter(d => d.StimuliName == stimulusName && d.Timestamp < h && d.Timestamp>h-500);
						}
			drawPlot(dataSelected);
			}
		}
	}
	
	timeSlider();

	const Cluster = (numClusters, maxIter) => {
		// the current iteration
		let iter = 1,
			centroids = [],
			points = dataSelected;

		const colors = d3.scaleOrdinal(d3.schemeCategory10);

		//Return random centroid points with coloring
		let randomCentroid = (fill) => {
			let r = Math.floor(Math.random()*points.length);
			let centroid = points[r];

			//points.splice(r, 1);
			centroid.fill = fill;
			return centroid;
		}
	
		//Gives distinct coloring to all centroid points
		let initializeCentroids = (num) => {
			let allCentroids = [];
			for (let i = 0; i < num; i++) {
				let color = colors(i);
				let centroid = randomCentroid(color);
				centroid.id = 'centroid' + '-' + i;
				allCentroids.push(centroid);
			}
			return allCentroids;
		}
		
		//Computes the euclidian distane
		let euclidianDistance = (a, b) => {
			let dx = b.x - a.x,
				dy = b.y - a.y;
			return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
		}

		//Find the closest centroid to the point as argument
		let findClosestCentroid = (point) => {
			let closest = {i: -1, distance: innerWidth};
			centroids.forEach((d, i) => {
				let distance = euclidianDistance(d, point);
				// Only update when the centroid is closer
				if (distance < closest.distance) {
					closest.i = i;
					closest.distance = distance;
				}
			});
			return (centroids[closest.i]); 
		}
		
		//All points close to the centroid get the according coloring
		const colorizePoints = () => {
			points.forEach(d => {
				let closest = findClosestCentroid(d);
				d.fill = closest.fill;
			});
		}
	
		//Computes the center of the cluster by the coordinates
		let computeClusterCenter = (cluster) => {
			return [
				d3.mean(cluster, d => { return d.x; }), 
				d3.mean(cluster, d => { return d.y; })
			];
		}
		
		//Move the centroids to the center of cluster
		const moveCentroids = () => {
			centroids.forEach(d => {
				// Get clusters based on their coloring
				let cluster = points.filter((points) => {
					return points.fill === d.fill;
				});
				// Compute the cluster centers
				let center = computeClusterCenter(cluster);
				// Move the centroid
				d.x = center[0];
				d.y = center[1];
			});
		}
	
		//updates the plot
		const update = () => {
			let data = points;

			// The data join
			const circles = g.merge(gEnter)
				.selectAll('circle').data(data);
				
			// Create new elements as needed
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
				// Update old elements as needed
				.transition().duration(1000)
				.delay((i) => i * 2)
					.attr('r', circleRadius)
					.attr('cx', d => xScale(d.x))
					.attr('cy', d => yScale(d.y))
					.style('fill', d => { return d.fill; });	
			// Remove old nodes
			circles
				.exit()
					.transition().duration(1000)
						.attr('r', 0)
						.attr('cx', innerWidth/2)
						.attr('cy', innerHeight/2)
					.remove();
		}
	
		//Update the text in the label
		const setText = (text) => {
			svg.selectAll('.label').text(text);
		}
		
		//Executes iteration of the algorithm
		const iterate = () => {
			
			// Update label
			setText('Iteration ' + iter + ' of ' + maxIter);
	
			// Colorize the points
			colorizePoints();
			
			// Move the centroids
			moveCentroids();
			
			// Update the chart
			update();
		}
	
		//Initialization of the algorithm, calls one iteration each 500 ms
		const initialize = () => {
			
			// Initialize random and centroids
			centroids = initializeCentroids(numClusters);

			// initial drawing
			update();
			
			let interval = setInterval(() => {
				if(iter < maxIter + 1) {
					iterate();
					iter++;
				} else {
					clearInterval(interval);
					setText('Done');
				}
			}, 500);
		}
	
		// Call the main function
		initialize();
	}

	Cluster(3, 10);

	const zoom = () => {
		const main_svg = d3.select('#scatterPlot svg.aperture').attr('class', 'zoom')
		, mini_svg   = d3.select('#mini svg').append('g').attr('class', 'zoom')
		, viewbox = main_svg.attr('viewBox').split(' ').map(d => +d)
		// store the image's initial viewBox
		, extent_1 = [
			[viewbox[0], viewbox[1]]
		, [(viewbox[2] - viewbox[0]), (viewbox[3] - viewbox[1])]
		]
		, brush  = d3.brush()
			.extent(extent_1)
			.on('brush', brushed)
		, zoom = d3.zoom()
			.scaleExtent([0.2, 1])
			.extent(extent_1)
			.on('zoom', zoomed)
		;

		// Apply the brush to the minimap, and also apply the zoom behavior here
		mini_svg
			.call(brush)
			.call(brush.move, brush.extent())
			.call(zoom)
		;
		// Apply the zoom behavior to the main svg
		main_svg
			.call(zoom)
		;

		function brushed() {
			// Ignore brush-via-zoom
			if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;
			
			let sel = d3.event.selection
			, vb = sel
					? [sel[0][0], sel[0][1], (sel[1][0] - sel[0][0]), (sel[1][1] - sel[0][1])]
					: viewbox
			, k = vb[3] / viewbox[3]
			, t = d3.zoomIdentity.translate(vb[0], vb[1]).scale(k)
			;

			mini_svg
				.property('__zoom', t)
			;
			main_svg
				.attr('viewBox', vb.join(' '))
				.property('__zoom', t)
			;
		} // brushed()
		
		function zoomed() {
			// If the zoom input was on the minimap, forward it to the main SVG
			if(this === mini_svg.node()) {
				return main_svg.call(zoom.transform, d3.event.transform);
			}

			// Disable panning on main_svg
			if(d3.event.sourceEvent.type === 'mousemove') return;
			// Ignore zoom via brush
			if(!d3.event.sourceEvent || d3.event.sourceEvent.type === 'brush') return;
		
			// Process the zoom event on the main SVG
			let t = d3.event.transform;
			
			t.x = t.x < viewbox[0] ? viewbox[0] : t.x;
			t.x = t.x > viewbox[2] ? viewbox[2] : t.x;
			t.y = t.y < viewbox[1] ? viewbox[1] : t.y;
			t.y = t.y > viewbox[3] ? viewbox[3] : t.y;
			
			if(t.k === 1) t.x = t.y = 0;
		
			const vb = [t.x, t.y, viewbox[2] * t.k, viewbox[3] * t.k];
		
			main_svg.attr('viewBox', vb.join(' '));
			mini_svg
				.property('__zoom', t)
				.call(
					brush.move
					, [[t.x, t.y], [t.x + vb[2], t.y + vb[3]]]
				)
			;
		} // zoomed()
	}
	zoom();
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
	  	margin: { top: 50, right: 20, bottom: 80, left: 90 }
	});
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
	});
	createTimeline();
	stimulusName = allVersions[0];
	render();
});