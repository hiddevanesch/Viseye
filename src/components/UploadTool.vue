<template>
  <div>
    <p class="p bmar-small tx-dgray">Please upload your data in the correct file format. We now only support .csv files. For more information about the supported layout of the .csv file, or to download the example dataset, please <router-link to="/requirements">click here.</router-link></p>
    <input type="file" class="uploadbutton" accept=".csv" id="filebutton" name="filein" @change="openFileBrowse()"/>
    <label for="filebutton" class="button button-green inline-block">select file</label>
    <div class="load-bg bg-dgray hidden visuallyhidden" id="loadBox">
      <div class="load-container">
        <div class="load-box">
          <loader />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import router from '../router';
import Loader from '../components/Loader.vue'

export default {
  components: {
    Loader
  },
  data() {
    return {
    }
  },
  methods: {
    ...mapMutations([
      'addFiles'
    ]),
    tsvJSON(csv) {
      var lines=csv.split("\n");
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
    },
    openFileBrowse() {
      var vm = this;
      var input = document.getElementById("filebutton");
      if ((input.files[0].type != "application/vnd.ms-excel") &&(input.files[0].type != ".csv")){
      alert("You have uploaded a wrong file type. We require a .csv file not a " + input.files[0].type + " file.");
      } else {
        //Start loadscreen
        vm.loadingAnimation().then(function () {
          //Start reading data
          var reader = new FileReader();
          var csvData = "";
          var jsonData;
          var iconv = require('iconv-lite');
          reader.onload = function(){
            csvData = iconv.decode(reader.result, 'latin1');
            jsonData = vm.tsvJSON(csvData);
            for (let i = 0; i < jsonData.length; i++) {
              if (jsonData[i].StimuliName.includes("ý")) {
                jsonData[i].StimuliName = jsonData[i].StimuliName.replace("Kýln", "Köln").replace("Brýssel", "Brüssel")
                .replace("Gýteborg", "Göteborg").replace("Dýsseldorf", "Düsseldorf").replace("Zýrich", "Zürich");
              }
            }
            //Function to remove outliers
            function cleanData(d) {
              const xMin = d.MappedFixationPointX >= 0;
              var xMax;
              if (d.StimuliName.includes("Antwerpen") || d.StimuliName.includes("Hamburg")) {
                xMax = d.MappedFixationPointX <= 1651;
              } else if (d.StimuliName.includes("Riga") || d.StimuliName.includes("Bologne") 
              || d.StimuliName.includes("Brüssel") || d.StimuliName.includes("Göteborg")
              || d.StimuliName.includes("Paris") || d.StimuliName.includes("Venedig")
              || d.StimuliName.includes("Warschau")) {
                xMax = d.MappedFixationPointX <= 1650;
              } else if (d.StimuliName.includes("Berlin") || d.StimuliName.includes("Moskau")
              || d.StimuliName.includes("Hong") || d.StimuliName.includes("Antwerpen")) {
                xMax = d.MappedFixationPointX <= 1648;
              } else if (d.StimuliName.includes("Krakau") || d.StimuliName.includes("New")
              || d.StimuliName.includes("Zürich")) {
                xMax = d.MappedFixationPointX <= 1649;
              } else if (d.StimuliName.includes("Bordeaux")) {
                xMax = d.MappedFixationPointX <= 1692;
              } else if (d.StimuliName.includes("Köln")) {
                xMax = d.MappedFixationPointX <= 1894;
              } else if (d.StimuliName.includes("Frankfurt")) {
                xMax = d.MappedFixationPointX <= 1892;
              } else if (d.StimuliName.includes("Tokyo")) {
                xMax = d.MappedFixationPointX <= 1630;
              } else if (d.StimuliName.includes("Barcelona") || d.StimuliName.includes("Ljub")) {
                xMax = d.MappedFixationPointX <= 1652;
              } else if (d.StimuliName.includes("Budapest")) {
                xMax = d.MappedFixationPointX <= 1645;
              } else if (d.StimuliName.includes("Düsseldorf")) {
                xMax = d.MappedFixationPointX <= 872;
              } else if (d.StimuliName.includes("Pisa")) {
                xMax = d.MappedFixationPointX <= 871;
              }
              const yMin = d.MappedFixationPointY >= 0;
              const yMax = d.MappedFixationPointY <= 1200;
              return xMin && xMax && yMin && yMax;
            }
            vm.addFiles(jsonData.filter(cleanData));
          };
          reader.onloadend = function(){
            //Go to visualization page
            router.push({ name: 'Visualization' });
          };
        reader.readAsText(input.files[0]);
        });
      }
    },
    loadingAnimation() {
      return new Promise(resolve => {
        //Make loading screen visible with animation
        var target = document.getElementById('loadBox');
        target.classList.remove('hidden')
        setTimeout(function () {
          target.classList.remove('visuallyhidden');
          resolve();
        }, 500);
      });
    }
  }
}
</script>