/// FROM alpGeneration
//const yValue = d => d.seq_bar_length + d.re_reading_bar_length;
//const xValue = d => d.trial;
//const xValue = d => d.bar_position;
const xWidth = d => d.dwell_duration_log;

const height = document.body.clientHeight - 50;
const width = document.body.clientWidth;
const svg = d3.select('svg')
    .attr('width', width).attr('height', height);

const margin = {top: 200, right: 50, bottom: 50, left: 50};

const alpVizWidth = width - margin.left - margin.right;
let alpVizHeight;
const alpSpacing = 10;

// zooming and panning
const zoomG = svg.append('g')
    .attr('width', width)
    .attr('height', height);
svg.call(d3.zoom().on('zoom', () => {
    zoomG.attr('transform', d3.event.transform);
}));

// create the group for alpscarf and legend respecrtively
// legend doesn't need to be zoomable
const legendG = svg.append('g')
                .attr('transform', `translate(${margin.left}, 25)`);
// group array for alpscarf; one group for each participant
let alpG = [];

// restore state
let data;
let palette;
let pNameList;
loadAndProcessData().then(loadedData => {
    const AOIValue = d => d.AOI;
    const colorValue = d => d.color;

    palette = d3.scaleOrdinal()
        .domain(loadedData[2].map(AOIValue))
        .range(loadedData[2].map(colorValue));

    data = loadedData[1];

    // generate list of unique p_name
    const pName = data.map(d => d.p_name);
    pNameList = [...new Set(pName)];

    alpVizHeight = (height - margin.top - margin.bottom) / pNameList.length;

    pNameList.forEach((d, i) => {
        // alpscarf is zoomable
        alpG[i] = zoomG.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top + alpVizHeight * i})`);
    });

    render();
/*
    // playground for animation
    alpVizHeight = height - margin.top - margin.bottom;
    let pNameListStored = pNameList;

    const interval = 1500;
    let increment = 1;

    //pNameListStored = ['P1', 'P10'];
    pNameListStored.forEach(d => {
        const runner = setTimeout(() => {
            pNameList = [d];
            render();
            clearTimeout(runner);
        }, interval * increment);
        increment++;
    });
*/
});

//let selectedAOI = null;
let selectedAOI = [];
const setSelectedAOI = aoi => {
    /*
    selectedAOI = (!selectedAOI || !selectedAOI.includes(aoi))
        ? aoi
        : null;
    */

    if (selectedAOI.length === 0 || !selectedAOI.includes(aoi)) {
        selectedAOI.push(aoi);
    } else {
        selectedAOI = selectedAOI.filter(item => item !== aoi);
    }

    render();
};

let plot_type = 'alpscarf';
let normalized_view = 'normalized';
let focus_mode = 'transition-focus';

const plot_type_clicked = value => {
    plot_type = value;
    render();
};
const normalized_view_clicked = value => {
    normalized_view = value;
    render();
};
const focus_mode_clicked = value => {
    focus_mode = value;
    render();
};


const render = () => {
    d3.select('#plot_type-menu')
        .call(dropdownMenu, {
            //options: data.columns,
            options: ['alpscarf', 'traditional scarf', 'mountain only', 'valley only'],
            onOptionClicked: plot_type_clicked,
            selectedOption: plot_type
        });

    d3.select('#normalized_view-menu')
        .call(dropdownMenu, {
            //options: data.columns,
            options: ['normalized', 'unnormalized'],
            onOptionClicked: normalized_view_clicked,
            selectedOption: normalized_view
        });

    d3.select('#focus_mode-menu')
        .call(dropdownMenu, {
            //options: data.columns,
            options: ['transition-focus', 'duration-focus'],
            onOptionClicked: focus_mode_clicked,
            selectedOption: focus_mode
        });

    pNameList.forEach((d, i) => {
        alpG[i]
            .call(alpGen, {
                data,
                palette,
                pName: d,
                pNameOffset: 50,
                alpVizWidth,
                alpVizHeight: alpVizHeight - alpSpacing,
                setSelectedAOI,
                selectedAOI,
                //alp_en: plot_type == 'alpscarf',
                plot_type,
                normalized_view: normalized_view == 'normalized',
                transition_focus_mode: focus_mode == 'transition-focus'
            });
    });

    legendG
        .call(colorLegend, {
            colorScale: palette,
            circleRadius: 10,
            spacing: 30,
            textOffset: 30,
            backgroundRectHeight: 180,
            setSelectedAOI,
            selectedAOI
        })
};





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////FORMER loadAndProcessData.js FUNCTION ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const loadAndProcessData = () => {
    var data = this.files
    Promise.all([
        //        d3.csv('aoi_names_pages_seq_sc5.csv'),
        //d3.csv('aoi_names_pages_seq_sc5.repeatAOI.csv'),
        //        d3.csv('eye_movement_data_systhetic_sc5_alp.csv'),
        //d3.csv('eye_movement_data_systhetic_sc5.csv'),
        //        d3.csv('expected_aoi_sequence.csv'),
        //        d3.csv('exchange_cartridge_AOI_Set3_3Participants_alp.csv'),
        //        d3.csv('aoi_order_color.csv'),
        //        d3.csv('alpAllRaw.csv'),
        //        d3.csv('alpAll.csv'),
        //        d3.csv('video_prototype_color.hack.csv'),
        //        d3.csv('alp_video_prototype_eye_movement.hack.csv'),
        //        d3.csv('video_prototype_color.csv'),
        //        d3.csv('alp_video_prototype_eye_movement.csv'),
        //d3.csv('aoi_color_sc5.csv'),
        data_order(data)
        ,
        data_systhetic(data)
        ,
        data_color(data)
    ]).then(loadedData => {

        loadedData[0].forEach(d => {
            d.AOI_order = +d.AOI_order;
        });
        /*
                loadedData[1].forEach(d => {
                    //0: "p_name"
                    //1: "AOI"
                    d.dwell_duration = +d.dwell_duration;
                    d.conformity_score = +d.conformity_score;
                    d.revisiting_score = +d.revisiting_score;
                    d.seq_bar_length = +d.seq_bar_length;
                    d.re_reading_bar_length = +d.re_reading_bar_length;
                    d.trial = +d.trial;
                    d.dwell_duration_log = +d.dwell_duration_log;
                    d.bar_position = +d.bar_position;
                    //10: "dwell_lt_100ms"
                });
        */
        loadedData[1].forEach(d => {
            //AOI
            //d.dwell_duration = +d.dwell_duration;
            d.FixationDuration = +d.FixationDuration;
            //p_name
            //group
        });

        // merge fixations into dwell + calculate width + calculate height
        loadedData[1] = alpscarf_add_height(alpscarf_add_width(merge_sequence(loadedData[1])), loadedData[0]);

        // try to parse data into the data structure in RTG
        //readData(loadedData[1], false);
        // it works!! with some adaptations though :)

        return loadedData;
    });


    //Function for creating loadeddata[0]
    // Made by Simon & Floris
    function data_order(data) {
        var result = []
        data.forEach(function (d) {
            if (result.some(item => item != d.AOIName)) {
                result.push({ AOI_order: d.order, AOI: d.AOIName })
            }
        });
        return result
    }

    function data_systhetic(data) {
        data.forEach(function (d) {
            delete d.AOI_order
            delete d.AOIcolor
        })
    }

    function data_color(data) {
        var result = []
        data.forEach(function (d) {
            if (result.some(item => item != d.AOIName)) {
                result.push({ color: d.AOIcolor, AOI: d.AOIName })
            }
        });
        return result
    }

    function alpscarf_add_height(data, aoi_names_pages_seq) {
        // restore result with height information
        let result = [];

        // parameter settings
        const w = 3;
        const s_min = 2;
        const incr_re_reading_length = 0.3;
        const scale_factor = 0.2;
        const base_factor = 2;
        const height_mode = "linear";

        // generate list of unique p_name
        const pName = data.map(d => d.p_name);
        let pNameList = [...new Set(pName)];

        let dataVis = [];

        pNameList.forEach((a_p_name, i) => {
            // select the data of the participant specified
            dataVis = data.filter(d => d.p_name === a_p_name);

            // left-join dataVis and aoi_expected_visiting_order (AOI_order)
            /*        dataVis = dataVis.map(a_dwell =>
                        aoi_names_pages_seq.some(an_aoi => an_aoi.AOI === a_dwell.AOI)
                            ? aoi_names_pages_seq.filter(an_aoi => an_aoi.AOI === a_dwell.AOI).map(an_aoi => ({...an_aoi, ...a_dwell}))
                            : {...a_dwell})
                        .reduce((a,b) => a.concat(b), []);
            */

            // initialize revisiting and conformity score
            dataVis.forEach(d => {
                d.revisiting_score = 0;
                d.conformity_score = 0;
            });

            const AOI_name = d => d.AOI;
            const AOI_seq = dataVis.map(AOI_name);
            const AOI_order = d => d.AOI_order;
            const AOI_order_seq = dataVis.map(AOI_order);
            const n_AOI_order = aoi_names_pages_seq.map(d => d.AOI_order).length;

            // generate the sequence of interest in string
            const seq_of_interest = aoi_names_pages_seq
                .filter(d => d.AOI_order > 0)
                .sort(function (a, b) { return a.AOI_order - b.AOI_order })
                .map(AOI_name)
                .join("_").concat("_");

            // calculate revisiting score
            for (let i = 0; i < AOI_seq.length; i++) {
                if (i < AOI_seq.length - w + 1) {
                    if (AOI_seq[i] == AOI_seq[i + w - 1]) {
                        for (let j = i; j <= i + w - 1; j++) {
                            dataVis[j].revisiting_score++;
                        }
                    }
                }
            }

            // calculate conformity score
            for (let i = 0; i < AOI_seq.length; i++) {
                if (i < AOI_seq.length - s_min + 1) {
                    for (let s = s_min; s <= Math.min(n_AOI_order, AOI_seq.length - i); s++) {

                        // generate the local sequence to compare (with seq_of_interest)
                        const seq_to_compare = AOI_seq.slice(i, i + s)
                            .join("_").concat("_");

                        // count the frequency of seq_to_compare in seq_of_interest
                        const rgxp = new RegExp(seq_to_compare, "g");
                        const freq_seq = (seq_of_interest.match(rgxp) || []).length;

                        //if (AOI_order_seq[i + s - 1] - AOI_order_seq[i + s - 2] == 1){
                        if (freq_seq >= 1) {
                            for (let j = i; j <= i + s - 1; j++) {
                                //dataVis[j].conformity_score++;
                                dataVis[j].conformity_score += freq_seq;

                            }
                        } else break;
                    }
                }
            }

            // calculate bar length for mountains and valleys
            dataVis.forEach(d => {
                d.seq_bar_length = (height_mode == "linear")
                    ? 1 + scale_factor * d.conformity_score
                    : base_factor ^ (scale_factor * d.conformity_score);
                d.re_reading_bar_length = incr_re_reading_length * d.revisiting_score;
            });

            result.push(...dataVis);
        });

        return result;
    }

    function alpscarf_add_width(data) {
        // restore result with width information
        let result = [];

        // generate list of unique p_name
        const pName = data.map(d => d.p_name);
        let pNameList = [...new Set(pName)];

        let dataVis = [];

        pNameList.forEach((a_p_name, i) => {
            // select the data of the participant specified
            dataVis = data.filter(d => d.p_name === a_p_name);

            // calculate width information
            let sum = 0;
            dataVis.forEach((d, j) => {
                d.trial = j + 1;
                d.dwell_duration_log = 1 + Math.round(Math.log10(d.dwell_duration + 1));
                d.cum_dwell_duration = d.dwell_duration_log + sum;
                d.bar_position = d.cum_dwell_duration - 0.5 * d.dwell_duration_log;
                sum = d.cum_dwell_duration;
            });

            result.push(...dataVis);
        });

        return result;
    }

    function merge_sequence(data) {
        // restore merged result
        let result = [];

        // generate list of unique p_name
        const pName = data.map(d => d.user);
        let pNameList = [...new Set(pName)];

        let dataVis = [];

        pNameList.forEach((a_p_name, i) => {
            // select the data of the participant specified
            dataVis = data.filter(d => d.user === a_p_name);

            // cumulating data
            let sum = 0;
            dataVis.forEach(d => {
                d.cum_duration = d.FixationDuration + sum;
                sum = d.cum_duration;
            });

            const AOI_name = d => d.AOIName;
            const AOI_seq = dataVis.map(AOI_name);
            const cum_duration = d => d.cum_duration;
            const cum_duration_seq = dataVis.map(cum_duration);

            let dwell_duration = 0;
            let incoming_dwell = []; // the most recently read dwell

            // approach similar to run_length
            for (let i = 0; i < AOI_seq.length; i++) {
                let count = 1;
                for (let j = i; j < AOI_seq.length; j++) {
                    if (AOI_seq[i] !== AOI_seq[j + 1]) break;
                    count++;
                    i++;
                }

                dwell_duration = (i < count) ? cum_duration_seq[i] : cum_duration_seq[i] - cum_duration_seq[i - count];
                incoming_dwell = {
                    p_name: a_p_name,
                    AOI: AOI_seq[i],
                    dwell_duration: dwell_duration
                };

                result.push(incoming_dwell);
            }
        });

        return result;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////// FORMER dropdownMenu.js //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const dropdownMenu = (selection, props) => {
    const {
        options,
        onOptionClicked,
        selectedOption
    } =props;

    // create the outer 'select' element
    let select = selection.selectAll('select').data([null]); //null means one 'select' element as we only need one menu
    select = select.enter().append('select')
        .merge(select)
        .on('change', function() {  //https://www.w3schools.com/jsref/event_onchange.asp
            onOptionClicked(this.value);
            //console.log(this.value);
        });

    const option = select.selectAll('option').data(options);
    option.enter().append('option')
        .merge(option)
        .attr('value', d => d)
        .property('selected', d => d === selectedOption)
        .text(d => d);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////// FORMER colorLegend.js //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const colorLegend = (selection, props) => {
    const {
        colorScale,
        circleRadius,
        spacing,
        textOffset,
        backgroundRectHeight,
        setSelectedAOI,
        selectedAOI
    } = props;

    const n = colorScale.domain().length;
    const backgroundRect = selection.selectAll('rect')
        .data([null]);
    backgroundRect.enter().append('rect')
        .merge(backgroundRect)
        .attr('x', -circleRadius * 2)
        .attr('y', -circleRadius * 2)
        .attr('rx', circleRadius * 2)
        .attr('height', backgroundRectHeight)
        .attr('width', spacing * n + circleRadius * 6)
        .attr('fill', 'black')
        .attr('opacity', 0.1);

    const groups = selection.selectAll('g')
        .data(colorScale.domain());

    const groupEnter =
        groups.enter().append('g') // make a function for enter so that circles can re-use
            .attr('class', 'tick');
    groupEnter
        .merge(groups)
            .attr('transform', (d, i) =>
            `translate(${i * spacing}, 0)`)
            .attr('opacity', d =>
                //(!selectedAOI || d === selectedAOI)
                (selectedAOI.length === 0  || selectedAOI.includes(d))
                    ? 1
                    : 0.2
            )
            .on('click', d => setSelectedAOI(d)); // adding event listeners;
    groups.exit().remove();

    groupEnter
        .append('circle')
        .merge(groups.select('circle')) // groups already selectALl groups, so here we only need to select circles out of it
            .attr('fill', colorScale)
            .classed('highlighted', d =>
                selectedAOI && selectedAOI === d
            )
            .attr('r', circleRadius);

    groupEnter
        .append('text')
        .merge(groups.select('text'))
            .text(d => d)
            .attr('y', textOffset)
        .attr('transform', `translate(${circleRadius * 2}, 0) rotate(45)`);
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////// FORMER alpGeneration.js //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const alpGen = (selection, props) => {
    const {
        data,
        palette,
        pName,
        pNameOffset,
        alpVizWidth,
        alpVizHeight,
        setSelectedAOI,
        selectedAOI,
        plot_type,
        normalized_view,
        transition_focus_mode
    } = props;

    // select the data of the participant specified
    const dataVis = data.filter(d => d.p_name === pName);

    // parameter for the canvas of Alpscarf
    //const maxSeqLength = d3.max(dataVis, d => d.seq_bar_length);
    //const maxReReadingLength = d3.max(dataVis, d => d.re_reading_bar_length);
    const maxSeqLength = d3.max(data, d => d.seq_bar_length);
    const maxReReadingLength = d3.max(data, d => d.re_reading_bar_length);

    const yValue = d => (plot_type == 'alpscarf')
            ? d.seq_bar_length + d.re_reading_bar_length
            : (plot_type == "mountain only")
                ? d.seq_bar_length
                : (plot_type == 'valley only')
                    ? d.re_reading_bar_length + 1
                    : 1;

    const yPosition = d => d.seq_bar_length + maxReReadingLength;
    const scarfBarYPosition = d => (plot_type == 'alpscarf' || plot_type == 'mountain only')
            ? yScale(yPosition(d))
            : yScale(maxReReadingLength + 1);
    const scarfBarHeight = d => (plot_type == 'alpscarf' || plot_type == 'mountain only' || plot_type == 'valley only')
            ? alpVizHeight - yScale(yValue(d))
            : alpVizHeight - yScale(1);

    //const xDomain = normalized_view
    //    ? dataVis.map(xValue)
    //    : d3.range(0, d3.max(data, xValue));
    //const xDomain = d3.range(0, d3.max(dataVis, xValue));
    //const xScale = d3.scaleBand()
    //    .domain(xDomain)
    //    .range([0, alpVizWidth])
    //    .padding(0);
    const yScale = d3.scaleLinear()
        .domain([0, maxSeqLength + maxReReadingLength])
        .range([alpVizHeight, 0]);

    const xValue = d => transition_focus_mode
        ? d.trial + 1
        : d.bar_position + d.dwell_duration_log / 2;
    const xValueMax = normalized_view
        ? d3.max(dataVis, xValue)
        : d3.max(data, xValue);
    const xScale = d3.scaleLinear()
        .domain([0, xValueMax])
        .range([0, alpVizWidth]);

    const groups = selection.selectAll('g').data(dataVis);
    const groupEnter =
        groups.enter().append('g')
            .attr('class', 'tick'); // make a function for enter so that circles can re-use
    groupEnter
            .attr('transform', `translate(${pNameOffset}, 0)`)
        .merge(groups)
            //.on('click', d => setSelectedAOI(d.AOI))
        .transition().duration(1000)
            .attr('transform', `translate(${pNameOffset}, 0)`);
    groups.exit()
        .transition().duration(1000)
        .remove();

    // TODO: transition is working; figure out how to avoid creating a new variable groupsRect
    //const groupsRect = groups.select('.bars');
    const groupsRect = selection.selectAll('rect').data(dataVis);
    groupsRect.exit()
        .transition().duration(1000)
        .attr('x', alpVizWidth)
        .remove();

    groupEnter
        .append('rect')
            .attr('class', 'bars')
            // play with animation; from scarf to Alpscarf
            .attr('y', scarfBarYPosition)
            //.attr('y', d =>
            //    (selectedAOI.length > 0  && selectedAOI.includes(d.AOI))
            //        ? yScale(yPosition(d))
            //        : yScale(maxReReadingLength + 1)
            //    )
            .attr('height', scarfBarHeight)
            //.attr('height', d =>
            //    (selectedAOI.length > 0  && selectedAOI.includes(d.AOI))
            //        ? alpVizHeight - yScale(yValue(d))
            //        : alpVizHeight - yScale(1)
            //    )
            //.attr('x', d => xScale(xValue(d)))
            .attr('x', alpVizWidth)
            //.attr('width', xScale.bandwidth())
            .attr('width', d => transition_focus_mode
                ? xScale(1)
                : xScale(xWidth(d)))
            .attr('stroke-width', '2')
        .merge(groups.select('.bars'))
            .on('click', d => setSelectedAOI(d.AOI))
            .classed('highlighted', d =>
                //selectedAOI && selectedAOI === d.AOI
                selectedAOI.length > 0  && selectedAOI.includes(d.AOI)
              )
            .attr('opacity', d =>
                //(!selectedAOI || d.AOI === selectedAOI)
                (selectedAOI.length === 0  || selectedAOI.includes(d.AOI))
                    ? 1
                    : 0.2
                )
        .transition().duration(1000)
            // play with animation; from scarf to Alpscarf
            .attr('y', scarfBarYPosition)
            //.attr('y', d =>
            //    (selectedAOI.length > 0  && selectedAOI.includes(d.AOI))
            //        ? yScale(yPosition(d))
            //        : yScale(maxReReadingLength + 1)
            //    )
            .attr('height', scarfBarHeight)
            //.attr('height', d =>
            //    (selectedAOI.length > 0  && selectedAOI.includes(d.AOI))
            //        ? alpVizHeight - yScale(yValue(d))
            //        : alpVizHeight - yScale(1)
            //    )
            //.attr('width', xScale.bandwidth())
            //.attr('x', d => xScale(xValue(d)))
            .attr('width', d => transition_focus_mode
                    ? xScale(1)
                    : xScale(xWidth(d)))
            .attr('x', d => transition_focus_mode
                    ? xScale(xValue(d) - 1)
                    : xScale(xValue(d) - xWidth(d)))
            .attr('fill', d => palette(d.AOI));

    groupEnter
        .append('title')
        .merge(groups.select('title'))
            .text(d => d.AOI + ': ' + d.dwell_duration + ' ms');

    // print p_name
    const groupText = selection.selectAll('text').data([null]);
    groupText
        .enter()
            .append('text')
            .attr("dy", ".35em")
            .text(pName)
            .attr('x', 10)
            .attr('y', alpVizHeight / 2)
            .style("fill-opacity", 1e-6)
        .merge(groupText)
        .transition().duration(1000)
            .attr('x', 0)
            .style("fill-opacity", 1)
    ;


    // todo: fade-out of text (p_name) doesn't work
    groupText.exit()
        .transition().duration(1000)
        .attr('x', -10)
        .style("fill-opacity", 1e-6)
        .remove();

};