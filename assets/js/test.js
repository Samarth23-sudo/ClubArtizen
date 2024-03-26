/*                            CODE FLOW

-->Logic Flow:
1)Initialization:
    Initialize variables slider, year, selectedYear, and output.
    Set the initial value of the output HTML element to the initial value of the slider.
2)Slider Input Event:

A)When the slider input changes:
    Update the year variable with the new slider value.
    Update the output HTML element to display the new slider value.
    Clear the existing data.
    Load new data asynchronously using Promise.all.
3)After data loading is complete:
    Define functions for mouseover, mouseleave, and click events.
    Draw the map and define mouse interaction events for each country.
4)Define the logic for handling mouse events (mouseover, mouseleave, click) on the countries.
    On mouse click:
         The coutry on which the mouse is clicked will show visulaization of that particular country of the particular year

-->Data Flow:
1)Data Loading:

The code loads GeoJSON data for world countries and CSV data for nutritional information.
Nutritional data is filtered based on the selected year.
Data Processing:

2)Mouseover event:
Retrieves the country name and its corresponding nutritional score.
Creates and updates a tooltip to display this information.
Visualization:

3)Renders the map with each country colored based on its nutritional score.
Defines mouse interaction events for each country to show the tooltip on mouseover, hide it on mouseleave, and perform a custom action on click.

*/

// Get the slider element and initialize variables for year selection
// Declare variables to store DOM elements and data
var slider = document.getElementById("yearSlider"); // Reference to the year slider element
var year = "1961"; // Default year value
var selectedYear = 1961; // Store the selected year value
var flag_for_execution = 0; // Flag to control execution flow
var margin = { top: 10, right: 30, bottom: 30, left: 60 }; // Define margins for the SVG
var width_svg = 900 - margin.left - margin.right; // Calculate SVG width
var height_svg = 500 - margin.top - margin.bottom; // Calculate SVG height
var country; // Variable to store the selected country

// Define a debounce function to limit the frequency of execution of a function
function debounce(func, delay) {
  let timer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timer); // Clear previous timeout
    timer = setTimeout(() => {
      func.apply(context, args); // Execute the function after the delay
    }, delay);
  };
}
// Define a function to handle click events on countries in the map
var clickfunc = function (event, d) {
  // Remove existing SVG elements to clear the chart area
  d3.select("#scatter svg").remove(); // Remove scatter plot SVG
  d3.select("#chart svg").remove();// Remove circular bar plot SVG

  // Select the div where the scatter plot will be rendered and append an SVG element
  let svg_2 = d3
    .select("#scatter")
    .append("svg")
    .attr("width", width_svg + margin.left + margin.right)
    .attr("height", height_svg + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define the country for which data will be visualized
  country = d.properties.name;

  // Add country name to the top right corner of the svg_2
  svg_2
    .append("text")
    .attr("x", width_svg - 10)
    .attr("y", 20)
    .attr("text-anchor", "end")
    .attr("font-size", "34px")
    .attr("fill", "black")
    .text(country);

  // Add text to show selected year
  let selectedYearText = svg_2
    .append("text")
    .attr("x", width_svg / 2)
    .attr("y", height_svg + 50)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "black");

  var x, y, xAxis, yAxis, line;

  // Load data from CSV and visualize
  d3.csv("final_nutrition.csv").then(function (data) {
    // Parse Year as Date object and Score as number
    data = data.filter((d) => d.Country === country);
    data.forEach(function (d) {
      d.Year = new Date(+d.Year, 0); // Convert year to Date object
      d.Score = +d.Score;
    });

    // Create x scale for time
    x = d3
      .scaleTime()
      .domain([new Date(1961, 0), new Date(2020, 0)]) // Initial domain from 1961 to 2020
      .range([0, width_svg]);

    // Create y scale for linear values
    y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.Score) - 1,
        d3.max(data, (d) => d.Score) + 1,
      ]) // Adjusted scale domain
      .range([height_svg, 0]);

    // Add x-axis
    xAxis = svg_2
      .append("g")
      .attr("transform", "translate(0," + height_svg + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"))); // Format ticks to show only years

    // Add y-axis
    svg_2.append("g").call(d3.axisLeft(y));

    // Add line
    line = svg_2
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(d.Year))
          .y((d) => y(d.Score))
      );

    // Add data points
    svg_2
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.Year))
      .attr("cy", (d) => y(d.Score))
      .attr("r", 5)
      .attr("fill", "#69b3a2");

    // Event listener for slider input changes
    d3.selectAll("#yearSlider").on("input", function () {
      flag_for_execution = 1;// Set flag to control execution flow
      console.log("Enterd 2nd onSlide function for scatter");
      selectedYear = +this.value;// Get the selected year from the slider
      let filteredData = data.filter(
        (d) => d.Year <= new Date(selectedYear, 0)
      ); // Filter data based on selected year
      x.domain([new Date(1961, 0), new Date(selectedYear, 0)]); // Update x domain
      xAxis.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"))); // Format ticks to show only years

      // Update line
      line
        .datum(filteredData) // Update data for the line
        .attr(
          "d",
          d3
            .line()
            .x((d) => x(d.Year))
            .y((d) => y(d.Score))
        );

      // Update data points
      svg_2
        .selectAll("circle")
        .data(filteredData, (d) => d.Year) // Update data for the circles
        .join(
          (enter) =>
            enter
              .append("circle")
              .attr("cx", (d) => x(d.Year))
              .attr("cy", (d) => y(d.Score))
              .attr("r", 5)
              .attr("fill", "#69b3a2"),
          (update) => update.attr("cx", (d) => x(d.Year)),
          (exit) => exit.remove() // Remove excess circles
        );

      // Update selected year text
      selectedYearText.text(selectedYear);
    });
  });

  // Load data for the circular bar plot
  const OriginalData = [
    {
      label: "Daily caloric intake per person that comes from animal protein",
      percentage: 6,
    },
    {
      label: "Daily caloric intake per person that comes from vegetal protein",
      percentage: 6,
    },
    { label: "Daily caloric intake per person from fat", percentage: 23 },
    {
      label: "Daily caloric intake per person from carbohydrates",
      percentage: 52.5,
    },
    {
      label: "Daily caloric intake per person from Sugar & Sweeteners",
      percentage: 7.5,
    },
    {
      label: "Daily caloric intake per person that comes from Fruit",
      percentage: 2.5,
    },
    {
      label: "Daily caloric intake per person that comes from Vegetables",
      percentage: 2.5,
    },
  ];

  // Set up SVG container
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width / 2)
    .attr("height", height / 2);

  // Initialize tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Load data from CSV
  function loadData(year) {
    let title = svg.selectAll("text").remove();// Remove existing text elements
    d3.select("#chart").selectAll("g").remove();// Remove existing group elements
    
    // svg.selectAll("#chart").remove();
    title = svg
      .append("text")
      .attr("x", width / 4)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text(`${country} (${year})`)
      .style("font-size", "18px")
      .style("font-weight", "bold");
    var p2 = year;// Assign the selected year to a variable
    d3.csv("final.csv").then(function (data) {
      // Filter data based on Country and Year
      let filteredData = data.filter(
        (d) => d.Country == country && d.Year == p2
      );
      // Extract labels and values from filtered data
      if (filteredData.length == 0) {
        svg.selectAll("g").remove();
        svg
          .append("image")
          .attr("xlink:href", "../assets/no-data-found.avif")
          .attr("width", 400)
          .attr("height", 400)
          .attr("x", width / 32)
          .attr("y", height / 8);
        return;
      }
      // Extract labels and values from filtered data
      let pieData = Object.keys(filteredData[0])
        .slice(3)
        .map((label, index) => ({
          label: label,
          value: +filteredData[0][label],
          percentage: OriginalData[index].percentage,
        }));

      // Compute maximum value for scaling
      let maxValue = d3.max(pieData, (d) => d.value);

      // Scale for radius
      let radiusScale = d3.scaleLinear().range([50, 200]).domain([0, maxValue]);

      // Color scale
      let colorScale = d3
        .scaleOrdinal()
        .range([
          "pink",
          "orange",
          "red",
          "brown",
          "yellow",
          "skyblue",
          "green",
        ]);

      // Pie chart layout
      let pie = d3
        .pie()
        .value((d) => d.percentage)
        .sort(null);

      // Arc generator
      let arc = d3
        .arc()
        .innerRadius(0)
        .outerRadius(function (d) {
          return radiusScale(d.data.value);
        });

      // Group element for the pie chart
      let g = svg
        .append("g")
        .attr("transform", `translate(${width / 4}, ${height / 4})`);

      // Path elements for the arcs
      let paths = g
        .selectAll("path")
        .data(pie(pieData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d) => colorScale(d.data.label))
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .on("mouseover", function (event, d) {
          d3.select(this).attr("opacity", 0.8); //change the visblity of hovered element
          tooltip.transition().duration(200).style("opacity", 0.9); //make tooltip visible
          tooltip
            .html(`${d.data.label}: ${d.data.value} kcal`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`);
          // Show the label corresponding to the hovered sector
        })
        .on("mouseout", function () { //function to handle mouse over
          d3.select(this).attr("opacity", 1);  //increase visiblity of hovered element
          tooltip.transition().duration(200).style("opacity", 0); //decrease the visiblity of tooltip to 0
        })
        .transition() // Add transition for smoother animation
        .duration(750)
        .attrTween("d", function (d) {
          let interpolate = d3.interpolate(this._current, arc(d));// Interpolate between the current path (this._current) and the new path (arc(d))
          this._current = interpolate;// Update the current path for the next transition
          return interpolate;// Return the interpolated value for the transition
        });

      paths.transition().duration(100).attr("d", arc);
    });
  }

  // Initial load
  loadData("2020");

  // Slider event handler
  const slider = document.getElementById("yearSlider");
  slider.addEventListener(
    "input",
    debounce(function () {
      // Add event listener for input event on the yearSlider
      // Call the debounce function to limit the frequency of loadData function calls
      // Pass the current value of the slider to the loadData function
      loadData(this.value);
    }, 500)// Set a debounce delay of 500 milliseconds
  );
};

var tooltip_map = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
// Define mouseOver function
var mouseOver = function (event, d) {
  d3.selectAll(".Country").transition().duration(200).style("opacity", 0.5);// Reduce opacity of all elements with class "Country"
  d3.select(this)// Highlight the hovered element
    .transition()
    .duration(200)
    .style("opacity", 1)// Make the hovered element fully visible
    .style("stroke", "black")// Add a black stroke around the element
    .style("cursor", "pointer");// Change cursor to pointer when hovering over the element

  // Update tooltip content
  let countryName = d.properties.name;
  let countryValue = d.total.toFixed(2);
  tooltip_map.html(`
  <div class="country-and-year"><span class="country"><b>${countryName}</b><br></span><span class="year">${year}</span></div>
  <div class="score"><span class="score-heading">Balanced Diet Index (BDI)</span> <br> <span class="score-value" style="color: ${colorScale(
    countryValue
  )};"><b>${countryValue}</b></span></div>
  </div>`);

  // Show tooltip
  tooltip_map.transition().duration(100).style("opacity", 0.9);

  // Set tooltip position
  tooltip_map
    .style("left", event.pageX + "px")
    .style("top", event.pageY + "px");
};

var mouseLeave = function (event, d) {
  d3.selectAll(".Country").transition().duration(200).style("opacity", 1);  // Restore opacity of all elements with class "Country"
  d3.select(this)  // Reset styles for the hovered element
    .transition()
    .duration(200)
    .style("stroke", "transparent")// Remove stroke
    .style("cursor", "default"); // Reset cursor style

  // Hide tooltip
  tooltip_map.transition().duration(200).style("opacity", 0);
};

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function () {
  year = this.value;
  console.log(year);

  data.clear();

  // Create SVG for legends
  const legendSvg = d3
    .select("svg")
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(20,20)"); // Adjust the position of the legend as needed

  // Define color scale domain for legend
  const legendDomain = [0, 1, 3.5, 4, 5, 6.5, 7, 7.5, 8];
  const legendColors = d3.schemeBlues[9];

  // Create legend color scale
  const legendColorScale = d3
    .scaleLinear()
    .domain(legendDomain)
    .range(legendColors);

  // Calculate legend block width
  const legendBlockWidth = 20; // Adjust the width of legend blocks as needed

  // Append rectangles for legend
  legendSvg
    .selectAll("rect")
    .data(legendColors)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * legendBlockWidth)
    .attr("y", 0)
    .attr("width", legendBlockWidth)
    .attr("height", 10) // Adjust the height of legend blocks as needed
    .style("fill", (d, i) => legendColors[i]);

  // Append text labels for legend
  legendSvg
    .selectAll("text")
    .data(legendDomain)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * legendBlockWidth)
    .attr("y", 25) // Adjust the y position of legend labels as needed
    .text((d) => d)
    .style("font-size", "10px");

  // Append legend title
  legendSvg
    .append("text")
    .attr("x", 0)
    .attr("y", -5)
    .text("Legend")
    .style("font-size", "12px")
    .style("font-weight", "bold");

  Promise.all([
    d3.json(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"  // Load world geojson data
    ),
    d3.csv("final_nutrition.csv", function (d) {  // Load nutrition data from CSV file
      if (d.Year == year) {    // Filter data based on the selected year
        data.set(d.Code, +d.Score);// Store score by country code
        data.set(d.Country, +d.Score);// Store score by country name
      }
    }),
  ]).then(function (loadData) {
    let topo = loadData[0];// Geojson data
    // Draw the map
    svg_map
      .append("g")
      .selectAll("path")
      .data(topo.features)
      .join("path")
      // draw each country
      .attr("d", d3.geoPath().projection(projection))
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;// Get score for the country
        return colorScale(d.total);// Apply color scale based on the score
      })
      .style("opacity", 0.8)// Set opacity
      .on("mouseover", mouseOver)// Event handler for mouseover
      .on("mouseleave", mouseLeave)// Event handler for mouseLeave  
      .on("click", clickfunc);// Event handler for click
  });
};

// The svg
let svg_map = d3.select("svg"),
  width = +svg_map.attr("width"),
  height = +svg_map.attr("height");

// Map and projection
let path = d3.geoPath();
let projection = d3
  .geoMercator()
  .scale(140)
  .center([0, 20])
  .translate([width / 2, height / 2]);

// Data and color scale
let data = new Map();
// console.log(d3.schemeBlues);
let colorScale = d3
  .scaleThreshold()
  .domain([0, 1, 3.5, 4, 5, 6.5, 7, 7.5, 8])
  .range(d3.schemeBlues[9]);

// Load external data and boot
Promise.all([
  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
  ),
  d3.csv("final_nutrition.csv", function (d) {
    if (d.Year == year) {
      data.set(d.Code, +d.Score);
      data.set(d.Country, +d.Score);
    }
  }),
]).then(function (loadData) {
  let topo = loadData[0];

  // Draw the map
  svg_map
    .append("g")
    .selectAll("path")
    .data(topo.features)
    .join("path")
    // draw each country
    .attr("d", d3.geoPath().projection(projection))
    // set the color of each country
    .attr("fill", function (d) {
      d.total = data.get(d.id) || 0;
      return colorScale(d.total);
    })
    .style("opacity", 0.8)
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave)
    .on("mousemove", function (event) {
      tooltip_map
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + 10 + "px");
    })
    .on("click", clickfunc);
});
