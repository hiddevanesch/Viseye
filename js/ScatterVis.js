const svg = d3.select('#svgScatter');

const width = +svg.attr('width');
const height = +svg.attr('height');

let data;
let stimulusName;
let allVersions = [];
let dataSelected;
let resData;
let globalCluster;
let globalIterations;

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
	render(undefined, undefined);
}

//plot a scatterplot
const scatterPlot = (selection, props) => {
	const {
		title,
		xValue,
		yValue,
		margin,
		clusters,
		iterations
	} = props;

	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;
	
	const yAxisLabel = 'Mapped fixation point y';
	const xAxisLabel = 'Mapped fixation point x';

	let circleRadius;

	//Filter the data on the selected stimulus
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
		.range([0, innerWidth])
		.nice();

	const yScaleAxis = d3.scaleLinear()
		.domain([0, imgHeight])
		.range([innerHeight, 0])
		.nice();

	const yScale = d3.scaleLinear()
		.domain([0, imgHeight])
		.range([0, innerHeight])
		.nice();

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

	const yAxis = d3.axisLeft(yScaleAxis)
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

	//Format of tooltip
	let tooltipformat = d => 'User: ' + d['user'] + '<br/>' + 'Coordinates: (' + d['MappedFixationPointX']
		+ ', ' + yScale(d['MappedFixationPointY']) + ')' + '<br/>' + 'Fixation duration: ' + d['FixationDuration']
		+ '<br/>' + 'Description: ' + d['description'];

	//Draw the circles using data join
	const drawScatterPlot = (radius, opacity) => {
		//Draw circles for each row of the selected data
		const circles = g.merge(gEnter)
			.selectAll('circle').data(dataSelected);
		circles
			.enter().append('circle')
			.merge(circles)
				.on('mouseover', d => {
					d3.select('#tooltip').transition()
							.duration(200)
								.style('opacity', .8)
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
				.attr('r', radius)
				.attr('cx', innerWidth/2)
				.attr('cy', innerHeight/2)
				.style('fill', '#333')
				.attr('fill-opacity', opacity)
			.transition().duration(1000)
				.attr('cx', d => {return xScale(xValue(d))})
				.attr('cy', d => {return yScale(yValue(d))});
		circles
			.exit()
				.transition().duration(1000)
					.attr('r', 0)
					.attr('cx', innerWidth/2)
					.attr('cy', innerHeight/2)
				.remove();
	}

	//Update the plot with the selected circle radius
	const updateRadius = (radius, opacity) => {
		//Unclustered format of tooltip
		let tooltipformat = d => 'User: ' + d['user'] + '<br/>' + 'Coordinates: (' + d['MappedFixationPointX']
			+ ', ' + yScale(d['MappedFixationPointY']) + ')' + '<br/>' + 'Fixation duration: ' + d['FixationDuration']
			+ '<br/>' + 'Description: ' + d['description'];

		//Draw circles for each row of the selected data
		const circles = g.merge(gEnter)
			.selectAll('circle').data(dataSelected);
		circles
			.enter().append('circle')
			.merge(circles)
				.on('mouseover', d => {
					d3.select('#tooltip').transition()
							.duration(200)
								.style('opacity', .8)
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
				.attr('r', radius)
				.style('fill', '#333')
				.attr('fill-opacity', opacity)
			.transition().duration(1000)
				.attr('cx', d => {return xScale(xValue(d))})
				.attr('cy', d => {return yScale(yValue(d))});
		circles
			.exit()
				.transition().duration(1000)
					.attr('r', 0)
					.attr('cx', innerWidth/2)
					.attr('cy', innerHeight/2)
				.remove();
	}

	let opacity = +document.getElementById('opacityCircle').value * 0.1;
	circleRadius = +document.getElementById('radiusCircle').value;

	if (globalCluster == undefined && (globalIterations == undefined)) {
		drawScatterPlot(circleRadius, opacity);
		//update circleRadius
		d3.select('#radiusCircle').on('input', function() {
			circleRadius = +this.value;
			updateRadius(circleRadius, opacity);
		});

		//update circleOpacity
		d3.select('#opacityCircle').on('input', function() {
			opacity = +this.value * 0.1;
			updateRadius(circleRadius, opacity);
		});
	};

	const Cluster = (numClusters, maxIter) => {
		//Clone the array of objects without dependencies
		//const clone = require('rfdc')() // Returns the deep copy function

		// the current iteration		
		let iter = 1,
			centroids = [],
			points = [],
			temp = [],
			intervalTime = 50,
			duringIteration,
			maxTempIter = maxIter;

		for (let i = 0; i < dataSelected.length; i++) {
			points.push(Object.assign({}, dataSelected[i]));
			temp.push(Object.assign({}, dataSelected[i]));
		}

		const colors = d3.scaleOrdinal(d3.schemeCategory10);

		//Update iteration text
		const iterationsText = svg.selectAll('.numberIterations').data([null])
		iterationsText
			.enter().append('g')
			.merge(iterationsText)
				.append('text')
					.attr('class', 'numberIterations')
					.attr('transform', `translate(${innerWidth + margin.left - (1/4 * innerWidth)}, ${55 + innerHeight + margin.top})`)
					.text('');

		//Return random centroid points with coloring
		let randomCentroid = (fill) => {
			let r = Math.floor(Math.random()*temp.length);
			let centroid = Object.assign({}, temp[r]);

			temp.splice(r, 1);
			centroid.fill = fill;
			return centroid;
		}
	
		//Gives distinct coloring to all centroid points
		let initializeCentroids = (num) => {
			let allCentroids = [];
			for (let i = 0; i < num; i++) {
				let color = colors(i);
				let centroid = randomCentroid(color);
				centroid.id = 'centroid' + '-' + i + 1;
				centroid.clusterGroup = i + 1 + ' (centroid)'
				allCentroids.push(centroid);
			}
			return allCentroids;
		}
		
		//Computes the euclidian distane
		let euclidianDistance = (a, b) => {
			let dx = b.MappedFixationPointX - a.MappedFixationPointX,
				dy = b.MappedFixationPointY - a.MappedFixationPointY;
			return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
		}

		//Find the closest centroid to the point as argument
		let findClosestCentroid = (point) => {
			let closest = {i: -1, distance: Math.sqrt(Math.pow(innerWidth, 2) + Math.pow(innerHeight, 2))};
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
				d.clusterGroup = closest.clusterGroup.substring(0, 1);
			});
		}
	
		//Computes the center of the cluster by the coordinates
		let computeClusterCenter = (cluster) => {
			return [
				d3.mean(cluster, d => { return d.MappedFixationPointX; }), 
				d3.mean(cluster, d => { return d.MappedFixationPointY; })
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
				d.MappedFixationPointX = center[0];
				d.MappedFixationPointY = center[1];
			});
		}
	
		//updates the plot
		const update = (radius, opacity) => {
			let clusterData = points.concat(centroids);
		
			// The data join
			let circles = g.merge(gEnter)
				.selectAll('circle').data(clusterData);

			//Reformat of tooltip
			tooltipformat = d => 'User: ' + d['user'] + '<br/>' + 'Coordinates: (' + d['MappedFixationPointX']
				+ ', ' + yScale(d['MappedFixationPointY']) + ')' + '<br/>' + 'Fixation duration: ' + d['FixationDuration']
				+ '<br/>' + 'Description: ' + d['description'] + '<br/>' + 'Cluster Group: ' + d['clusterGroup'];

			// Create new elements as needed
			circles
				.enter().append('circle')
				.merge(circles)
					.attr('r', radius)
					.attr('class', d => d.id)
					.attr('fill-opacity', opacity)
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
				// Update old elements as needed
					.transition().delay(intervalTime/20).duration(intervalTime/2)
						.attr('cx', d => {return xScale(xValue(d))})
						.attr('cy', d => {return yScale(yValue(d))})
						.style('fill', d => { return d.fill; });
			// Remove old nodes
			circles
				.exit()
					.remove();
		}

		if (globalCluster != undefined && (globalIterations != undefined)) {
			//update circleRadius
			d3.select('#radiusCircle').on('input', function() {
				circleRadius = +this.value;
				update(circleRadius, opacity);
				if(duringIteration) {
					maxTempIter -= 1;
				}
			});
			//update circleOpacity
			d3.select('#opacityCircle').on('input', function() {
				opacity = +this.value * 0.1;
				console.log('fck');
				update(circleRadius, opacity);
				if(duringIteration) {
					maxTempIter -= 1;
				}
			});
		}
	
		//Update the text in the label
		const setText = (text) => {
			svg.selectAll('.numberIterations').text(text);
		}
		
		//Executes iteration of the algorithm
		const iterate = () => {
			// Update label
			setText('Iteration ' + iter + ' of ' + maxIter);
	
			// Colorize the points
			colorizePoints();
			
			// Move the centroids
			moveCentroids();

			duringIteration = true;
			// Update the scatter plot
			update(circleRadius);
			duringIteration = false;
		}
	
		//Initialization of the algorithm, calls one iteration each 500 ms
		const initialize = () => {
			
			// Initialize random and centroids
			centroids = initializeCentroids(numClusters);

			// initial drawing
			update(circleRadius);
			
			let interval = setInterval(() => {
				if(iter <= maxTempIter) {
					iterate();
					iter++;
				} else {
					clearInterval(interval);
					setText('Done');
				}
			}, intervalTime);
		}

			// Call the main function
			initialize();
	}


	if (clusters != undefined && iterations != undefined) {
		Cluster(clusters, iterations);
	};
}

//Function render
const render = (clusters, iterations) => {
	globalCluster = clusters;
	globalIterations = iterations;
	
	const collapsibleTooltipformat = 'Close the collapsible to obtain the unclustered plot!';

	//Set tooltip to collapsible when k-means clustering has been applied
	if (globalCluster != undefined && (globalIterations != undefined)){
		d3.select('.collapsible')
			.attr('title', collapsibleTooltipformat);
	} else {
		d3.select('.collapsible')
			.attr('title', null);
	}

	//Invoke function to generate drop down menu
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
		clusters: clusters,
		iterations: iterations
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
	stimulusName = allVersions[0];
	render(undefined, undefined);
});

let code;

//Add event handlers to the form of the cluster collapsible.
const clustersQuantity = () => {
	const userInputForm = document.getElementById('userInputForm');
	let preDefinedClusterQuantity;
	for (let i = 0; i < 5; i++) {
		if(userInputForm.elements[i].checked == true) {
			preDefinedClusterQuantity = +userInputForm.elements[i].id;
			break;
		};
	};
	let customizedClusterQuantity = userInputForm.elements[4].value;
	let preDefinedIterationQuantity;
	for (let i = 5; i < 9; i++) {
		if(userInputForm.elements[i].checked == true) {
			preDefinedIterationQuantity = +userInputForm.elements[i].id;
			break;
		};
	};
	let customizedIterationQuantity = userInputForm.elements[9].value;

	//When user input field is filled in, choose the customized values.
	//When the radio boxes are checked, choose the pre-defined values.
	if (customizedClusterQuantity != '' && (customizedIterationQuantity != '')) {
		if (code != undefined) {
			clearTimeout(code);
			code = render(customizedClusterQuantity, customizedIterationQuantity);
			setTimeout(code, 17000000);
		} else {
			code = render(customizedClusterQuantity, customizedIterationQuantity);
			setTimeout(code, 10000000);
		}
	} else if (preDefinedClusterQuantity != undefined && (preDefinedIterationQuantity != undefined)) {
		if (code != undefined) {
			clearTimeout(code);
			code = render(preDefinedClusterQuantity, preDefinedIterationQuantity);
			setTimeout(code, 10000000);
		} else {
			code = render(preDefinedClusterQuantity, preDefinedIterationQuantity);
			setTimeout(code, 10000000);
		}
	} else if (preDefinedClusterQuantity != undefined && (customizedIterationQuantity != '')) {
		if (code != undefined) {
			clearTimeout(code);
			code = render(preDefinedClusterQuantity, customizedIterationQuantity);
			setTimeout(code, 10000000);
		} else {
			code = render(preDefinedClusterQuantity, customizedIterationQuantity);
			setTimeout(code, 10000000);
		}
	} else if (customizedClusterQuantity != '' && (preDefinedIterationQuantity != undefined)) {
		if (code != undefined) {
			clearTimeout(code);
			code = render(customizedClusterQuantity, preDefinedIterationQuantity);
			setTimeout(code, 10000000);
		} else {
			code = render(customizedClusterQuantity, preDefinedIterationQuantity);
			setTimeout(code, 10000000);
		}
	} else {
		alert('Please select the desired number of iterations and clusters for k-means clustering.');
	}
}

//uncheck the radio buttons, when something is writen in the user input field for number of clusters
const uncheckButtonsClusters = () => {
	const userInputClusters = document.getElementById('userInputClusters');
	const userInputForm = document.getElementById('userInputForm');
	if (userInputClusters.value != '') {
		for (let i = 0; i < 4; i++) {
			if(userInputForm.elements[i].checked == true) {
				userInputForm.elements[i].checked = false;
				break;
			};
		};
	}
}

//uncheck the radio buttons, when something is writen in the user input field for number of iterations
const uncheckButtonsIterations = () => {
	const userInputIteration = document.getElementById('userInputIteration');
	const userInputForm = document.getElementById('userInputForm');

	if (userInputIteration.value != '') {
		for (let i = 5; i < 9; i++) {
			if(userInputForm.elements[i].checked == true) {
				userInputForm.elements[i].checked = false;
				break;
			};
		};
	}
}

//clear the user input field for number of clusters, when the according radio button is selected
const clearInputFieldClusters = () => {
	const userInputForm = document.getElementById('userInputForm');
	const userInputClusters = document.getElementById('userInputClusters');
	for (let i = 0; i < 4; i++){
		if (userInputForm.elements[i].checked == true) {
			userInputClusters.value = '';
			break;
		}
	}
}

//clear the user input field for number of iterations, when the accroding radio button is selected
const clearInputFieldIterations = () => {
	const userInputForm = document.getElementById('userInputForm');
	const userInputIteration = document.getElementById('userInputIteration');
	for (let i = 0; i < 4; i++){
		if (userInputForm.elements[i].checked == true) {
			userInputIteration.value = '';
			break;
		}
	}
}

//Create collapsible
//When closing collapsible while having clustered, the original data set without clustering will be plotted
const collapsible = () => {
	let coll = document.getElementsByClassName('collapsible');
	let i;

	for (i = 0; i < coll.length; i++) {
		  coll[i].addEventListener('click', function() {
			this.classList.toggle('active');
			let content = this.nextElementSibling;
			if (content.style.display === 'block') {
				if (globalCluster != undefined && (globalIterations != undefined)){
					render(undefined, undefined);
				}
				content.style.display = 'none';
			} else {
				content.style.display = 'block';
			}
		});
	}
};

collapsible();

//zoom function, the design of zooming and panning and the logic behind it taken over from https://bl.ocks.org/seemantk/80613e25e9804934608ac42440562168
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
		.scaleExtent([0.05, 1])
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


//Tooltip for the slider
const sliderBubble = () => {
	//const rangeSlider = document.querySelector('.rangeSlider');
	const rangeRadius = document.getElementById('radiusCircle');
	const opacityCircle = document.getElementById('opacityCircle');
	const bubbleOpacity = document.querySelector('.bubbleOpacity');
	const bubbleRadius = document.querySelector('.bubbleRadius');

	//event handler for the bubble when the slider moves.
	rangeRadius.addEventListener('input', () => {
		setBubbleR(rangeRadius, bubbleRadius);
	});

	opacityCircle.addEventListener('input', () => {
		setBubbleO(opacityCircle, bubbleOpacity);
	});

	setBubbleR(rangeRadius, bubbleRadius);
	setBubbleO(opacityCircle, bubbleOpacity);

	function setBubbleR(range, bubble) {
		const val = range.value;
		const min = range.min;
		const max = range.max;
		const newVal = ((val - min) * 100) / (max - min);
		bubble.innerHTML = val;

		//Get the bubble line up better
		const offset = -18;

		//Calculation of the tooltip's positioning
		bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15 + offset}px))`;
		bubble.style.top  = '170px';
	}

	function setBubbleO(range, bubble) {
		const val = range.value * 0.1;
		const min = range.min * 0.1;
		const max = range.max * 0.1;
		const newVal = ((val - min) * 100) / (max - min);
		bubble.innerHTML = val;

		//Get the bubble line up better
		const offset = -18;

		//Calculation of the tooltip's positioning
		bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15 + offset}px))`;
		bubble.style.top  = '47px';
	}
};

sliderBubble();