export const colorLegend = (selection, props) => {
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