import { alpGen } from './alpGeneration.js';
import { colorLegend } from './colorLegend.js';
import { loadAndProcessData } from './loadAndProcessData.js';
import {dropdownMenu} from './dropdownMenu.js';

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

