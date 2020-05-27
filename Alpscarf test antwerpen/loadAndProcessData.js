export const loadAndProcessData = () =>
    Promise.all([
//        d3.csv('aoi_names_pages_seq_sc5.csv'),
        d3.csv('aoi_names_pages_seq_sc5.repeatAOI.csv'),
        //d3.csv('eye_movement_data_systhetic_sc5_alp.csv'),
        d3.csv('eye_movement_data_systhetic_sc5.csv'),
//        d3.csv('expected_aoi_sequence.csv'),
//        d3.csv('exchange_cartridge_AOI_Set3_3Participants_alp.csv'),
//        d3.csv('aoi_order_color.csv'),
//        d3.csv('alpAllRaw.csv'),
//        d3.csv('alpAll.csv'),
//        d3.csv('video_prototype_color.hack.csv'),
//        d3.csv('alp_video_prototype_eye_movement.hack.csv'),
//        d3.csv('video_prototype_color.csv'),
//        d3.csv('alp_video_prototype_eye_movement.csv'),
        d3.csv('aoi_color_sc5.csv'),
    ]).then (loadedData => {

        loadedData[0]. forEach(d => {
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

function alpscarf_add_height(data, aoi_names_pages_seq){
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
            .sort(function(a, b){return a.AOI_order - b.AOI_order})
            .map(AOI_name)
            .join("_").concat("_");

        // calculate revisiting score
        for (let i = 0; i < AOI_seq.length; i++) {
            if (i < AOI_seq.length - w + 1){
                if (AOI_seq[i] == AOI_seq[i+w-1]){
                    for (let j = i; j <= i + w - 1; j++){
                        dataVis[j].revisiting_score++;
                    }
                }
            }
        }

        // calculate conformity score
        for (let i = 0; i < AOI_seq.length; i++) {
            if (i < AOI_seq.length- s_min + 1){
                for (let s = s_min; s <= Math.min(n_AOI_order, AOI_seq.length - i); s++){

                    // generate the local sequence to compare (with seq_of_interest)
                    const seq_to_compare = AOI_seq.slice(i, i + s)
                        .join("_").concat("_");

                    // count the frequency of seq_to_compare in seq_of_interest
                    const rgxp = new RegExp(seq_to_compare, "g");
                    const freq_seq = (seq_of_interest.match(rgxp) || []).length;

                    //if (AOI_order_seq[i + s - 1] - AOI_order_seq[i + s - 2] == 1){
                    if (freq_seq >= 1){
                        for (let j = i; j <= i + s - 1; j++){
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

function alpscarf_add_width(data){
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

function merge_sequence(data){
    // restore merged result
    let result = [];

    // generate list of unique p_name
    const pName = data.map(d => d.Participant);
    let pNameList = [...new Set(pName)];

    let dataVis = [];

    pNameList.forEach((a_p_name, i) => {
        // select the data of the participant specified
        dataVis = data.filter(d => d.Participant === a_p_name);

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
                if (AOI_seq[i] !== AOI_seq[j+1]) break;
                count++;
                i++;
            }

            dwell_duration = (i < count) ? cum_duration_seq[i] : cum_duration_seq[i] - cum_duration_seq[i-count];
            incoming_dwell = {
                p_name : a_p_name,
                AOI : AOI_seq[i],
                dwell_duration : dwell_duration
            };

            result.push(incoming_dwell);
        }
    });

    return result;
}
