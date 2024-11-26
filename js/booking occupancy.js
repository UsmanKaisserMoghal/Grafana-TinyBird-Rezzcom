// ** Data Extraction and Mapping **
// Extracts dates and percentages from the provided dataset.
let _d = []; // Dates
let _p = []; // Percentages

data.series.map((s) => {
  _d = s.fields.find((f) => f.name === 'DATE').values.buffer; // Extracts date field values
  _p = s.fields.find((f) => f.name === 'Booked Percentage').values.buffer; // Extracts percentage field values
});

// ** Maximum Value Calculation **
// Calculates the maximum percentage value rounded to the nearest 10 for visualization.
const _max = Math.ceil(Math.round(Math.max(..._p)) / 10) * 10;

// ** Date Range Configuration **
// Establishes the start and end dates for the calendar heatmap based on the first date's year.
const _yr = _d[0].split('-')[0]; // Extracts year from the first date
const _start = +echarts.time.parse(_yr + '-01-01'); // Parses start date (YYYY-01-01)
const _end = +echarts.time.parse(+_yr + 1 + '-01-01'); // Parses end date (next year's start)

// ** Time Configuration **
// Defines the increment for each day in milliseconds.
const _dayMs = 3600 * 24 * 1000; // One day in milliseconds

// ** Data Transformation **
// Prepares the final dataset for the heatmap by matching dates and filling missing entries with 0.
const _data = [];
for (let t = _start; t < _end; t += _dayMs) {
  const _fDate = echarts.time.format(t, '{yyyy}-{MM}-{dd}', false); // Formats the current date
  const _idx = _d.indexOf(_fDate); // Finds the index of the formatted date in the dataset

  if (_idx !== -1) {
    _data.push([_fDate, Math.round(_p[_idx])]); // Adds the date and corresponding percentage
  } else {
    _data.push([_fDate, 0]); // Adds the date with a default value of 0
  }
}

// ** Heatmap Configuration **
// Configures the heatmap with a title, tooltip, visual map, calendar, and series data.
return {
  title: {
    top: 30,
    left: 'center',
    text: 'Booked Percentage Heatmap' // Heatmap title
  },
  tooltip: {}, // Tooltip for interactive data display
  visualMap: {
    min: 0, // Minimum value for visualization
    max: _max, // Maximum value calculated earlier
    type: 'piecewise', // Discrete segmentation of the data range
    orient: 'horizontal',
    left: 'center',
    top: 65,
    pieces: [
      { min: 0, max: 10, color: '#CCE5FF' }, // Define gradient pieces for visual mapping
      { min: 11, max: 20, color: '#99FFFF' },
      { min: 21, max: 30, color: '#66FFFF' },
      { min: 31, max: 40, color: '#33FFFF' },
      { min: 41, max: 50, color: '#00FFFF' },
      { min: 51, max: 60, color: '#3399FF' },
      { min: 61, max: 70, color: '#0080FF' },
      { min: 71, max: 80, color: '#0066CC' },
      { min: 81, max: 90, color: '#3333FF' },
      { min: 91, max: 100, color: '#0000FF' },
      { min: 100, max: _max, color: '#0000CC' } // Catch-all for exceeding max values
    ]
  },
  calendar: {
    top: 120,
    left: 30,
    right: 30,
    cellSize: ['auto', 13], // Dynamic width, fixed height for each cell
    range: _yr, // Calendar range set to the calculated year
    itemStyle: {
      borderWidth: 0.5 // Thin border for calendar cells
    },
    yearLabel: { show: false } // Suppresses year label display
  },
  series: {
    type: 'heatmap', // Sets chart type to heatmap
    coordinateSystem: 'calendar', // Uses the calendar coordinate system
    data: _data // Inserts the transformed data
  }
};
