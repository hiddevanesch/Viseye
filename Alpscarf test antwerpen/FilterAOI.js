// code for filtering datapoints when selecting AOI's made by Floris
export const FilterAOI = (data) => {
// x1,y1 is first click 
// x2, y2 is second click
    
    AOIlist = ["AOI1", "AOI2", "AOI3", "AOI4", "AOI5", "AOI6", "AOI7", "AOI8", "AOI9", "AOI10"]
    AOIcolorlist = ["#e129b8", "#0166cc", "#f4a8a1", "#a652ec", "#3a1b12", "#49464e", "#72b36a", "#d693bf", "#f4fe76", "#2713ca"]

    data.forEach(function(d) {
        if ((d.MappedFixationPointX < x1 && d.MappedFixationPointX > x2) || (d.MappedFixationPointX > x1 && d.MappedFixationPointX < x2)){
            if((d.MappedFixationPointY < y1 && d.MappedFixationPointY > y2) || (d.MappedFixationPointY > y1 && d.MappedFixationPointy < y2)){
                // above if statements checks if a point is in the created AOI for all points
                // add columns to the data containing the aoi info.
                (d.AOIName = AOIlist[i]);
                (d.AOIcolor = AOIcolorlist[i]);
                (d.AOI_order = i+1);
            }
        }

        //d.MappedFixationPointX = +d.MappedFixationPointX;
        //d["MappedFixationPointY"] = +d["MappedFixationPointY"];
    }
    (i++);
}