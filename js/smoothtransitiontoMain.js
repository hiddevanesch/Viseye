var startTransition = function(event){
  var landingbox = document.getElementById("landingbox");
  var visEyeTitle = document.getElementById("h1 landingbox");
  var elements = [document.getElementById("p1 landingbox"),
                          document.getElementById("p2 landingbox"),
                          document.getElementById("b1 landingbox"),
                          document.getElementById("p3 landingbox")];
  var startcolors = [];
  var endcolors = [];
  var time_steps = [10];
  var step_amount = 255;
  for (var i = 0; i < elements.length; i++ ){
    startcolors.push([0,0,0]);
    endcolors.push([255,255,255]);
  }

  //timer parameters
  var stepcount = 0;

  //fade out element parameters
  var red_changes = [];
  var green_changes = [];
  var blue_changes = [];
  elements.forEach((item, i) => {
    red_changes.push((startcolors[i][0] - endcolors[i][0]) / step_amount);
    green_changes.push((startcolors[i][1] - endcolors[i][1]) / step_amount);
    blue_changes.push((startcolors[i][2] - endcolors[i][2]) / step_amount);
  });
  var currentcolors = startcolors;

  //landingbox parameters
  var startpadding_left = 100;
  var startpadding_right = 100;
  var startpadding_top = 80;
  var startpadding_bottom = 80;

  var endpadding_left = 4;//in pixels
  var endpadding_right = 4;
  var endpadding_top = 4;
  var endpadding_bottom = 4;

  var padding_left_change = (startpadding_left - endpadding_left) / step_amount;
  var padding_right_change = (startpadding_right - endpadding_right) / step_amount;
  var padding_top_change = (startpadding_top - endpadding_top) / step_amount;
  var padding_bottom_change = (startpadding_bottom - endpadding_bottom) / step_amount;

  var startmargin_left = 100;
  var startmargin_right = 100;
  var startmargin_top = 80;
  var startmargin_bottom = 80;

  var endmargin_left = 4;//in pixels
  var endmargin_right = 4;
  var endmargin_top = 4;
  var endmargin_bottom = 4;

  var margin_left_change = (startmargin_left - endmargin_left) / step_amount;
  var margin_right_change = (startmargin_right - endmargin_right) / step_amount;
  var margin_top_change = (startmargin_top - endmargin_top) / step_amount;
  var margin_bottom_change = (startmargin_bottom - endmargin_bottom) / step_amount;


  var timer = setInterval(function(){

    elements.forEach((element, i) => {
      currentcolors[i][0] = currentcolors[i][0] - red_changes[i];
      currentcolors[i][1] = currentcolors[i][1] - green_changes[i];
      currentcolors[i][2] = currentcolors[i][2] - blue_changes[i];
      element.style.color = 'rgb(' + parseInt(currentcolors[i]).toString() + ')';
    });

    startpadding_left = startpadding_left - padding_left_change;
    startpadding_right = startpadding_right - padding_right_change;
    startpadding_top = startpadding_top - padding_top_change;
    startpadding_bottom = startpadding_bottom- padding_bottom_change;
    landingbox.style.paddingLeft = parseInt(startpadding_left) + "px";
    landingbox.style.paddingRight = parseInt(startpadding_right) + "px";
    landingbox.style.paddingTop = parseInt(startpadding_top) + "px";
    landingbox.style.paddingBottom = parseInt(startpadding_bottom) + "px";

    startmargin_left = startmargin_left - margin_left_change;
    startmargin_right = startmargin_right - margin_right_change;
    startmargin_top = startmargin_top - margin_top_change;
    startmargin_bottom = startmargin_bottom- margin_bottom_change;
    landingbox.style.marginLeft = parseInt(startmargin_left) + "px";
    landingbox.style.marginRight = parseInt(startmargin_right) + "px";
    landingbox.style.marginTop = parseInt(startmargin_top) + "px";
    landingbox.style.marginBottom = parseInt(startmargin_bottom) + "px";

    stepcount += 1;
    if (stepcount >= step_amount) {
      elements.forEach((element, i) => {
        element.style.color = 'rgb(' + endcolors[i].toString() + ')';
        element.hidden = "hidden";
      });
      landingbox.style.paddingLeft = parseInt(endpadding_left) + "px";
      landingbox.style.paddingRight = parseInt(endpadding_right) + "px";
      landingbox.style.paddingTop = parseInt(endpadding_top) + "px";
      landingbox.style.paddingBottom = parseInt(endpadding_bottom) + "px";

      landingbox.style.marginLeft = parseInt(endmargin_left) + "px";
      landingbox.style.marginRight = parseInt(endmargin_right) + "px";
      landingbox.style.marginTop = parseInt(endmargin_top) + "px";
      landingbox.style.marginBottom = parseInt(endmargin_bottom) + "px";
      clearInterval(timer);
    }
  }, time_steps);
}
