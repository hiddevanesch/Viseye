//const yValue = d => d.seq_bar_length + d.re_reading_bar_length;
//const xValue = d => d.trial;
//const xValue = d => d.bar_position;
const xWidth = d => d.dwell_duration_log;

export const alpGen = (selection, props) => {
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