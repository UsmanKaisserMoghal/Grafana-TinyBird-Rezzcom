// === Data Processing ===
// Arrays to hold longitude, latitude, and record data
let lngArr = [];
let latArr = [];
let recordArr = [];
let coordinates = [];

// Extracting data from the series and populating arrays
data.series.map((series) => {
  lngArr = series.fields.find((field) => field.name === 'search_lon').values.buffer; // Longitudes
  latArr = series.fields.find((field) => field.name === 'search_lat').values.buffer; // Latitudes
  recordArr = series.fields.find((field) => field.name === 'entry_datetime (count)').values.buffer; // Records
});

// Combine longitude, latitude, and record data into a single array
for (let i = 0; i < lngArr.length; i++) {
  coordinates.push([lngArr[i], latArr[i], recordArr[i]]);
}

// === Map Configuration ===
// Configuration object for the map and scatter series visualization
const mapConfig = {
  backgroundColor: 'transparent', // Transparent background for the map
  amap: {
    viewMode: '3D', // 3D map view
    center: [0, 0], // Placeholder center coordinates; replace with actual values
    zoom: 4, // Default zoom level
    resizeEnable: true, // Enable map resizing
    mapStyle: 'amap://styles/dark', // Dark theme for the map
    renderOnMoving: true, // Re-render during movements
    echartsLayerZIndex: 2000, // Z-index for map layers
    echartsLayerInteractive: true, // Enable interactions with layers
    largeMode: false // Set large mode for performance
  },
  series: [
    {
      type: 'scatter', // Scatter plot for data points
      coordinateSystem: 'amap', // Use Gaode Maps as the coordinate system
      data: coordinates, // Data points to be plotted
      encode: {
        value: 2 // Encode records as value for the scatter plot
      }
    }
  ]
};

// === Loading Animation ===
// Configuration for the loading animation
const loadingConfig = {
  graphic: {
    elements: [
      {
        type: 'group', // Group of elements
        left: 'center',
        top: 'center',
        children: new Array(7).fill(0).map((_, index) => ({
          type: 'rect', // Rectangles for animation
          x: index * 20, // Positioning
          shape: {
            x: 0,
            y: -40,
            width: 10,
            height: 80
          },
          style: {
            fill: '#5470c6' // Rectangle color
          },
          keyframeAnimation: {
            duration: 1000, // Animation duration
            delay: index * 200, // Delayed start for each rectangle
            loop: true, // Loop the animation
            keyframes: [
              {
                percent: 0.5,
                scaleY: 0.3, // Scale down halfway
                easing: 'cubicIn'
              },
              {
                percent: 1,
                scaleY: 1, // Scale up at the end
                easing: 'cubicOut'
              }
            ]
          }
        }))
      }
    ]
  }
};

// === Map Initialization ===
// Function to initialize the map with additional layers and controls
const initializeMap = () => {
  if (!window.AMap) {
    // Retry initialization if the AMap library is not loaded
    return setTimeout(() => initializeMap(), 100);
  }

  notifySuccess(['Gaode Maps', 'Loaded...']); // Notify the user when the map is loaded
  echartsInstance.setOption(mapConfig, (notmerge = true)); // Apply map configuration

  // Retrieve and configure the map instance
  const amapComponent = echartsInstance.getModel().getComponent('amap');
  const amapInstance = amapComponent.getAMap();

  // Add controls for scale and toolbar
  amapInstance.addControl(new AMap.Scale());
  amapInstance.addControl(new AMap.ToolBar());

  // Add satellite and road network layers
  const satelliteLayer = new AMap.TileLayer.Satellite();
  const roadNetLayer = new AMap.TileLayer.RoadNet();
  amapInstance.add([satelliteLayer, roadNetLayer]);

  return;
};

// Delay map initialization to ensure resources are ready
setTimeout(() => initializeMap(), 100);

// === Return Loading Animation ===
// Return the loading animation configuration while the map loads
return loadingConfig;
