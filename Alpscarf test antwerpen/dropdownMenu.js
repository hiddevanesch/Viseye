// from https://www.w3schools.com/tags/tag_select.asp
/*
<select>
    <option value="volvo">Volvo</option>
    <option value="saab">Saab</option>
    <option value="opel">Opel</option>
    <option value="audi">Audi</option>
</select>
*/
export const dropdownMenu = (selection, props) => {
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