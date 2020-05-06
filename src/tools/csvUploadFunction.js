// function openfileDrop(evt) {
//     evt.stopPropagation();
//     evt.preventDefault();

//     console.log(overallData.length);

//     var input = evt.dataTransfer; // FileList object.
//     if (input.files[0].type != "application/vnd.ms-excel"){
//       alert("wrong file type. We require a .csv file not a " + input.files[0].type + " file");
//     } else {
//       var reader = new FileReader();
//       var aftertext = "";
//       reader.onload = function(){
//         aftertext = reader.result;
//         tsvJSON(aftertext);
//       };
//       reader.onloadend = function(){
//         console.log("done loading");
//       };
//       reader.readAsText(input.files[0]);
//     }
//   }

//   function handleDragOver(evt) {
//     evt.stopPropagation();
//     evt.preventDefault();
//     evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
//   }

//   // Setup the dnd listeners.
//   var dropZone = document.getElementById('drop_zone');
//   dropZone.addEventListener('dragover', handleDragOver, false);
//   dropZone.addEventListener('drop', openfileDrop, false);

export function openFileBrowse() {
  var input = document.getElementById("filebutton");
  if (input.files[0].type != "application/vnd.ms-excel"){
    alert("You have uploaded a wrong file type. We require a .csv file not a " + input.files[0].type + " file.");
  } else {
    var reader = new FileReader();
    var aftertext = "";
    reader.onload = function(){
      aftertext = reader.result;
      return tsvJSON(aftertext);
    };
    reader.onloadend = function(){
      console.log("loading finished");
    };
    reader.readAsText(input.files[0]);
  }
  return input.files[0];
}

  //from http://techslides.com/convert-csv-to-json-in-javascript
  //var tsv is the TSV file with headers
function tsvJSON(csv){

  var lines=csv.split("\n");

  // NOTE: If your columns contain commas in their values, you'll need
  // to deal with those before doing the next step
  // (you might convert them to &&& or something, then covert them back later)
  // jsfiddle showing the issue https://jsfiddle.net/
  var headers=lines[0].split("	");

  var result = [];
  for(var i=1;i<lines.length;i++){

      var obj = {};
      var currentline=lines[i].split("	");

      for(var j=0;j<headers.length;j++){
          obj[headers[j]] = currentline[j];
      }

      result.push(obj);

  }

  //return result; //JavaScript object
  return JSON.parse(JSON.stringify(result)); //JSON
}
