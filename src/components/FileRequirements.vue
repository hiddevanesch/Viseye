<template>
  <div>
    <p class="p bmar-small tx-dgray">The dataset given by the user must be in a tab-separated .csv file. The columns in this file should be: 'Timestamp', 'StimuliName', 'FixationIndex', 'FixationDuration', 'MappedFixationPointX', 'MappedFixationPointY', 'user', and 'description'.</p>
    <p class="p bmar-small tx-dgray">If you do not have a dataset in the correct format, you can download the example .csv by pressing the button below.</p>
    <a href="static/csv/example_dataset.csv" download>
      <button type="button" class="button button-blue">download example .csv</button>
    </a>
  </div>
</template>

<script>
export default {
}
</script>