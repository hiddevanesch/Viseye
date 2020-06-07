<template>
  <div>
    <p class="p bmar-small tx-dgray">Please upload your data in the correct file format. We now only support .csv files. For more information about the supported layout of the .csv file, please click here.</p>
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
    },
    openFileBrowse() {
      var vm = this;
      var input = document.getElementById("filebutton");
      if (input.files[0].type != "application/vnd.ms-excel"){
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
            vm.addFiles(jsonData);
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
        }, 100);
      });
    }
  }
}
</script>