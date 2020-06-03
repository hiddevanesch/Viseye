const svg = d3.select('#svgSelectionMap');

const margin = { top: 0, right: 0, bottom: 0, left: 0 };
const width = +svg.attr('width');
const height = +svg.attr('height');
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const maxAmountOfAOI = 10;


//Defining variables for general access
let data;
let stimulusName;
let allVersions = [];
let dataSelected;
let SquareArray = [];
let xScale;
let yScale;
let intersectingRectangles = false;
let possibleAoiNames = [];

// Fills the possible AOI numbers into the array, according to the max amount which is given.
for(let k = 0; k<maxAmountOfAOI ;k++){
	possibleAoiNames.push(k);
}

// Makes a rectangle which is selected
// Also defines the previous elements etc.
// Also has a function which returns the attributes of the array
var selectionRect = {
    element			: null,
    previousElement : null,
    currentY		: 0,
    currentX		: 0,
    originX			: 0,
    originY			: 0,
    setElement: function(ele) {
        this.previousElement = this.element;
        this.element = ele;
    },
    getNewAttributes: function() {
        var x = this.currentX<this.originX?this.currentX:this.originX;
        var y = this.currentY<this.originY?this.currentY:this.originY;
        var widthRectangle = Math.abs(this.currentX - this.originX);
        var heightRectangle = Math.abs(this.currentY - this.originY);
        return {
            x       : x,
            y       : y,
            width  	: widthRectangle,
            height  : heightRectangle
        };
    },
    getCurrentAttributes: function() {
		// use plus sign to convert string into number
		// Gives the x, y , width and the height of the triangle once asked for it
        var x = +this.element.attr("x");
        var y = +this.element.attr("y");
        var widthRectangle = +this.element.attr("width");
        var heightRectangle = +this.element.attr("height");
        return {
            x1  : x,
            y1	: y,
            x2  : x + widthRectangle,
            y2  : y + heightRectangle
        };
	},
	// This function makes it able to give a clear attribute in a sentence
    getCurrentAttributesAsText: function() {
        var attrs = this.getCurrentAttributes();
        return "x1: " + attrs.x1 + " x2: " + attrs.x2 + " y1: " + attrs.y1 + " y2: " + attrs.y2;
	},
	// Makes a rectangle once called with the new x and new y.
	// It updates the size, the x, the y, the height and width.
	// If someone double clicked on the rectangle, then it calls the function removelement
    init: function(newX, newY) {
        var rectElement = svg.append("rect")
                .attr('rx',4)
                .attr('ry',4)
                .attr('x',0)
                .attr('y',0)
                .attr('width',0)
                .attr('height',0)
                .attr('class', 'rectangle')
				.classed("selection", true)
				.on("dblclick", removeElement);
        this.setElement(rectElement);
        this.originX = newX;
        this.originY = newY;
        this.update(newX, newY);
	},
	// Updates the new function with the new coordinates.
    update: function(newX, newY) {
        this.currentX = newX;
        this.currentY = newY;
        this.element
        .attr('x',this.getNewAttributes().x)
        .attr('y',this.getNewAttributes().y)
        .attr('width',this.getNewAttributes().width)
        .attr('height',this.getNewAttributes().height);

        
	},
	// Selects the color of the rectangle.
    focus: function() {
        this.element
            .style("stroke", "#DE695B")
            .style("stroke-width", "2.5");
	},
	// If the remove function is called, then it removes the element
    remove: function() {
        this.element.remove();
        this.element = null;
	},
	// This function would make it possible to remove the previous element, but this is not used here in this way.
    removePrevious: function() {
        if(this.previousElement) {
            this.previousElement.remove();
        }
    }
};

function dragStart() {
	if(SquareArray.length<maxAmountOfAOI){
		var p = d3.mouse(this);
		selectionRect.init(p[0], p[1]);
	}
	else{
		console.log('You already have 10 AOIs');
	}
}
 
function dragMove() {
	if(SquareArray.length<maxAmountOfAOI){
		var p = d3.mouse(this);
		selectionRect.update(p[0], p[1]);
		attributesText
			.text(selectionRect.getCurrentAttributesAsText());
	}
}

function dragEnd() {
	if(SquareArray.length<maxAmountOfAOI){
		var finalAttributes = selectionRect.getCurrentAttributes();
		if(finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1){
			// range selected
			d3.event.sourceEvent.preventDefault();
			selectionRect.focus();
			sortArray(possibleAoiNames);
			var nextBox = {
				DatasetStartX : xScale.invert(Math.min(selectionRect.originX,selectionRect.currentX)),
				DatasetStartY : yScale.invert(Math.max(selectionRect.originY,selectionRect.currentY)),
				DatasetEndX : xScale.invert(Math.max(selectionRect.currentX,selectionRect.originX)),
				DatasetEndY : yScale.invert(Math.min(selectionRect.currentY,selectionRect.originY)),
				numberBox : possibleAoiNames[0]
			}
			possibleAoiNames.splice(0,1);
			for (var i=0; i<SquareArray.length;i++){
				if(rectanglesIntersect(SquareArray[i],nextBox)){
					intersectingRectangles = true;
				}
			}
			if(intersectingRectangles){
				selectionRect.remove();
				alert('These rectangles intersect!');
				intersectingRectangles = false;
			} else {	
				FilterAOI(nextBox)
				SquareArray.push(nextBox);
				
			}
			
		} else {
			// single point selected
			selectionRect.remove();
		}
	}
}

function sortArray(numbers){
	numbers.sort(function(a, b){
		return a - b;
	});
	possibleAoiNames=numbers;
}
function removeElement(d) {
	// need to remove this object from data
	d3.select(this).remove();
	for(let i=0 ; i < SquareArray.length ; i++){
		if(Math.round(xScale(SquareArray[i].DatasetStartX)) == this.x.baseVal.value && 
		  (Math.round(yScale(SquareArray[i].DatasetEndY)) == this.y.baseVal.value || 
		   Math.round(yScale(SquareArray[i].DatasetStartY)) == this.y.baseVal.value) &&
		   SquareArray.length  > 1){
			possibleAoiNames.push(SquareArray[i].numberBox);
			data.forEach(function(d) {
				if (d.MappedFixationPointX > SquareArray[i].DatasetStartX && 
					d.MappedFixationPointX < SquareArray[i].DatasetEndX   &&
					d.MappedFixationPointY > SquareArray[i].DatasetStartY && 
					d.MappedFixationPointY < SquareArray[i].DatasetEndY   ){
					(d.AOIName = "");
					(d.AOIcolor = "");
					(d.AOI_order = "");
				}
			});
			SquareArray.splice(i,1);
		}
		else if(Math.round(xScale(SquareArray[i].DatasetStartX)) == this.x.baseVal.value && SquareArray.length == 1){
			possibleAoiNames.push(SquareArray[i].numberBox);
			SquareArray = [];
		}
	}
}

// code for filtering datapoints when selecting AOI's made by Floris
const FilterAOI = (RectangleBox) => {
	// x1,y1 is first click 
	// x2, y2 is second click
	// max 10 AOI's!
	AOIlist = ["AOI1", "AOI2", "AOI3", "AOI4", "AOI5", "AOI6", "AOI7", "AOI8", "AOI9", "AOI10"];
	AOIcolorlist = ["#e129b8", "#0166cc", "#f4a8a1", "#a652ec", "#3a1b12", "#49464e", "#72b36a", "#d693bf", "#f4fe76", "#2713ca"];
	data.forEach(function(d) {
		if (d.MappedFixationPointX > RectangleBox.DatasetStartX && 
			d.MappedFixationPointX < RectangleBox.DatasetEndX   &&
			d.MappedFixationPointY > RectangleBox.DatasetStartY && 
			d.MappedFixationPointY < RectangleBox.DatasetEndY   ){
			// above if statements checks if a point is in the created AOI for all points
			// add columns to the data containing the aoi info.
			// x1,y1 is left lower corner, x2,y2 is right upper corner
			(d.AOIName = AOIlist[RectangleBox.numberBox]);
			(d.AOIcolor = AOIcolorlist[RectangleBox.numberBox]);
			(d.AOI_order = RectangleBox.numberBox+1);
		}
	});
}

var dragBehavior = d3.drag()
	.on("drag", dragMove)
	.on("start", dragStart)
	.on("end", dragEnd);

svg.call(dragBehavior);

function rectanglesIntersect(rectOne, rectTwo ){
	var maxOneX = Math.max(Math.round(xScale(rectOne.DatasetStartX)),Math.round(xScale(rectOne.DatasetEndX)));
	var minOneX = Math.min(Math.round(xScale(rectOne.DatasetStartX)),Math.round(xScale(rectOne.DatasetEndX)));
	var maxOneY = Math.max(Math.round(yScale(rectOne.DatasetStartY)),Math.round(yScale(rectOne.DatasetEndY)));
	var minOneY = Math.min(Math.round(yScale(rectOne.DatasetStartY)),Math.round(yScale(rectOne.DatasetEndY)));
	var maxTwoX = Math.max(Math.round(xScale(rectTwo.DatasetStartX)),Math.round(xScale(rectTwo.DatasetEndX)));
	var minTwoX = Math.min(Math.round(xScale(rectTwo.DatasetStartX)),Math.round(xScale(rectTwo.DatasetEndX)));
	var maxTwoY = Math.max(Math.round(yScale(rectTwo.DatasetStartY)),Math.round(yScale(rectTwo.DatasetEndY)));
	var minTwoY = Math.min(Math.round(yScale(rectTwo.DatasetStartY)),Math.round(yScale(rectTwo.DatasetEndY)));
	return (maxOneX >= minTwoX && minOneX <= maxTwoX && minOneY <= maxTwoY && maxOneY >= minTwoY);
}

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
		dataSelected = data.filter(d => (d.StimuliName == stimulusName));


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
    xScale = d3.scaleLinear()
        .domain([0, imgWidth])
        .range([0, innerWidth])
    yScale = d3.scaleLinear()
        .domain([0, imgHeight])
        .range([innerHeight, 0])
        .nice();

	//Customizing the axis
	const xAxis = d3.axisBottom(xScale)
		.tickSize(-innerHeight)
		.tickPadding(10);

	const yAxis = d3.axisLeft(yScale)
		.tickSize(-innerWidth)
		.tickPadding(10);
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
	svg.call(scatterPlot)
	svg.selectAll('.rectangle').remove();
	SquareArray = [];
}

Promise.all([
    d3.csv('data.csv'),
    d3.csv('stimuli/resolution.csv')
]).then(loadedData => {
    data = loadedData[0];
    resData = loadedData[1];

    data.forEach(d => {
		d.MappedFixationPointX = +d.MappedFixationPointX;
		d.MappedFixationPointY = +d.MappedFixationPointY;
		d.AOIName = "";
		d.AOIcolor = "";
		d.AOI_order = "";
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

