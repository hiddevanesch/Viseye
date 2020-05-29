const svg = d3.select('#svgSelectionMap');

const margin = { top: 0, right: 0, bottom: 0, left: 0 };
const width = +svg.attr('width');
const height = +svg.attr('height');
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

//Defining variables for general access
let data;
let stimulusName;
let allVersions = [];
let dataSelected;
let SquareArray = [];

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
    getCurrentAttributesAsText: function() {
        var attrs = this.getCurrentAttributes();
        return "x1: " + attrs.x1 + " x2: " + attrs.x2 + " y1: " + attrs.y1 + " y2: " + attrs.y2;
    },
    init: function(newX, newY) {
        console.log(newX,newY);
        var rectElement = svg.append("rect")
                .attr('rx',4)
                .attr('ry',4)
                .attr('x',0)
                .attr('y',0)
                .attr('width',0)
                .attr('height',0)
                .attr('class', 'rectangle')
                .classed("selection", true);
        this.setElement(rectElement);
        this.originX = newX;
        this.originY = newY;
        this.update(newX, newY);
    },
    update: function(newX, newY) {
        this.currentX = newX;
        this.currentY = newY;
        this.element
        .attr('x',this.getNewAttributes().x)
        .attr('y',this.getNewAttributes().y)
        .attr('width',this.getNewAttributes().width)
        .attr('height',this.getNewAttributes().height);

        
    },
    focus: function() {
        this.element
            .style("stroke", "#DE695B")
            .style("stroke-width", "2.5");
    },
    remove: function() {
        this.element.remove();
        this.element = null;
    },
    removePrevious: function() {
        if(this.previousElement) {
            this.previousElement.remove();
        }
    }
};
	
	var clickTime = d3.select("#clicktime");
	var attributesText = d3.select("#attributestext");
	
	function dragStart() {
		console.log("dragStart");
		var p = d3.mouse(this);
		selectionRect.init(p[0], p[1]);
	}
	
	function dragMove() {
		console.log("dragMove");
		var p = d3.mouse(this);
		selectionRect.update(p[0], p[1]);
		attributesText
			.text(selectionRect.getCurrentAttributesAsText());
	}
	
	function dragEnd() {
		console.log("dragEnd");
		var finalAttributes = selectionRect.getCurrentAttributes();
		console.dir(finalAttributes);
		if(finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1){
			console.log("range selected");
			// range selected
			d3.event.sourceEvent.preventDefault();
            selectionRect.focus();
            var nextBox = {
                startCoordinateX: selectionRect.originX,
                startCoordinateY: innerHeight - selectionRect.originY,
                endCoordinateX: selectionRect.currentX,
                endCoordinateY: innerHeight - selectionRect.currentY
            }
            SquareArray.push(nextBox);
            console.log(SquareArray);
		} else {
			console.log("single point");
			// single point selected
			selectionRect.remove();
			// trigger click event manually
			clicked();
        }
	}
	
	var dragBehavior = d3.drag()
		.on("drag", dragMove)
		.on("start", dragStart)
		.on("end", dragEnd);
	
	svg.call(dragBehavior);
	
	function clicked() {
		var d = new Date();
		clickTime
			.text("Clicked at " + d.toTimeString().substr(0,8) + ":" + d.getMilliseconds());
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
	const {
		xValue,
		yValue,
		circleRadius,
	} = props;

		dataSelected = data.filter(d => (d.StimuliName == stimulusName));


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
		xValue: d => d.MappedFixationPointX,
	  yValue: d => d.MappedFixationPointY,
	  circleRadius: 10,
    })
	svg.selectAll('.rectangle').remove();
	SquareArray = [];
	console.log(innerHeight,innerWidth)
}

//(RE-)Render the data according to the selection by filter
d3.csv('data.csv')
  .then(loadedData => {
		data = loadedData;
  	data.forEach(d => {
    	d.MappedFixationPointX = +d.MappedFixationPointX;
		d.MappedFixationPointY = +d.MappedFixationPointY;
		d.Timestamp  = +d.Timestamp;
      if (!allVersions.includes(d.StimuliName)) {
				allVersions.push(d.StimuliName);
    	}
	});
	stimulusName = '01_Antwerpen_S1.jpg';
	  render()
});
