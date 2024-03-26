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
var slider = document.getElementById("yearSlider");
var year = "1961";
var selectedYear = 1961;
var output = document.getElementById("selectedYearfordisplay");
output.innerHTML = slider.value;  // Display initial value of the slider

// Update the current slider value (each time you drag the slider handle) ad also update the graph according to changing years
slider.oninput = function () {
  year = this.value;
  console.log(year);
  output.innerHTML = this.value;
  data.clear();

// Load new data asynchronously and update the visualization

  Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("final_nutrition.csv", function (d) {
      if (d.Year == year) { // Filter data by selected year
        data.set(d.Code, +d.Score);  // Store data by country code
        data.set(d.Country, +d.Score);  // Store data by country name
      }
    }),
  ]).then(function (loadData) {
    let topo = loadData[0];
    
    // Function to handle mouseover event on countries
    let mouseOver = function (event, d) {
      // Reduce opacity of all countries and highlight hovered country
      d3.selectAll(".Country").transition().duration(200).style("opacity", 0.5);
      d3.select(this).transition().duration(200).style("opacity", 1).style("stroke", "black");

      // Create tooltip element
      let tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

      // Update tooltip position with mouse movement
      d3.select(window).on("mousemove", function (e) {
        tooltip.style("left", e.pageX + "px").style("top", e.pageY + "px");
      });
       
      let countryName = d.properties.name;
      let countryValue = d.total.toFixed(2); // Assuming 'total' holds the value
      // Populate tooltip with country information
      tooltip.html(`
      <div class="country-and-year"><span class="country"><b>${countryName}</b><br></span><span class="year">${year}</span></div>
      <div class="score"><span class="score-heading">Balanced Diet Index (BDI)</span> <br> <span class="score-value" style="color: ${colorScale(countryValue)};"><b>${countryValue}</b></span></div>
    </div>
      `);

      tooltip.transition().duration(100).style("opacity", 0.9);
    };
    // Function to handle mouseleave event on countries
    let mouseLeave = function (event, d) {
      // Restore opacity of all countries and remove stroke from hovered country
      d3.selectAll(".Country").transition().duration(200).style("opacity", 1);
      d3.select(this).transition().duration(200).style("stroke", "transparent");
      svg.select(".country-label").remove();// Remove country label from the map
      svg.select(".country-label_1").remove();// Remove additional country label from the map

      d3.selectAll(".tooltip").remove();// Remove tooltip elements
    };
    
    // Function to handle click event on countries
    let clickfunc = function (event, d) {
      // Remove existing scatter and chart visualizations
      d3.select("#scatter svg").remove();
      d3.select("#chart svg").remove();
      // Set up margins and dimensions for chart visualization
      let margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
      // Select the div where the chart will be rendered
      // Create an SVG element for scatter plot visualization
      let svg_2 = d3
        .select("#scatter")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Define the country for which data will be visualized
      var country = d.properties.name;

      // Add country name to the top right corner of the svg_2
      svg_2
        .append("text")
        .attr("x", width - 10)
        .attr("y", 20)
        .attr("text-anchor", "end")
        .attr("font-size", "34px")
        .attr("fill", "black")
        .text(country);

      // Add text to show selected year
      let selectedYearText = svg_2
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "black");

      // Load data from CSV and visualize
      d3.csv("final_nutrition.csv").then(function (data) {
        // Parse Year as Date object and Score as number
        data = data.filter((d) => d.Country === country);
        data.forEach(function (d) {
          d.Year = new Date(+d.Year, 0); // Convert year to Date object
          d.Score = +d.Score;
        });

        // Create x scale for time
        let x = d3
          .scaleTime()
          .domain([new Date(1961, 0), new Date(2020, 0)]) // Initial domain from 1961 to 2020
          .range([0, width]);

        // Create y scale for linear values
        let y = d3
          .scaleLinear()
          .domain([d3.min(data, (d) => d.Score) - 1, d3.max(data, (d) => d.Score) + 1]) // Adjusted scale domain
          .range([height, 0]);

        // Add x-axis
        let xAxis = svg_2
          .append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"))); // Format ticks to show only years

        // Add y-axis
        svg_2.append("g").call(d3.axisLeft(y));

        // Add line
        let line = svg_2
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

        // Slider functionality
        d3.select("#yearSlider").on("input", function () {
          selectedYear = +this.value;
          let filteredData = data.filter((d) => d.Year <= new Date(selectedYear, 0)); // Filter data based on selected year
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
      
      //data for the percentage used by each nutrition type visualised
      let OriginalData = [
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
      let svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height);

      //retrieve the country and the year to create visualization of selected country and year
      var requiredCountry = d.properties.name;
      var requiredYear = selectedYear;
      console.log(selectedYear + " " + requiredCountry);
      console.log(requiredCountry, requiredYear);
      let title = svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text(`${requiredCountry} (${requiredYear})`)
        .style("font-size", "18px")
        .style("font-weight", "bold");

      d3.csv("final.csv").then(function (data) {
        // Filter data based on Country and Year
        let filteredData = data.filter((d) => d.Country == requiredCountry && d.Year == requiredYear);

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
        let colorScale = d3.scaleOrdinal().range(["pink", "orange", "red", "brown", "yellow", "skyblue", "green"]);

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
            if (d.data.label === "Daily caloric intake per person from carbohydrates") {
              return radiusScale(d.data.value);
            } else return radiusScale(d.data.value);
          });

        // Group element for the pie chart
        let g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

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
            d3.select(this).attr("opacity", 0.8);
            //create a tooltip 
            let tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
            
            //handle change in position of mouse
            d3.select(window).on("mousemove", function (e) {
              tooltip.style("left", e.pageX + "px").style("top", e.pageY + "px");
            });

            tooltip.transition().duration(200).style("opacity", 0.9);
            //show the nutrient and its value of the one on which mouse is present
            tooltip
              .html(`${d.data.label}: ${d.data.value} kcal`)
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY + 10}px`);
            // Show the label corresponding to the hovered sector
          })
          //handle mouse leaving 
          .on("mouseout", function () {
            d3.select(this).attr("opacity", 1);
            d3.selectAll(".tooltip").remove();
          });
      });
    };
    // Draw the map
    svg
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
      .on("click", clickfunc);
  });
};

// The svg
let svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

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
let colorScale = d3.scaleThreshold().domain([0, 1, 3.5, 4, 5, 6.5, 7, 7.5, 8]).range(d3.schemeBlues[9]);

// Load external data and boot
Promise.all([
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
  d3.csv("final_nutrition.csv", function (d) {
    if (d.Year == year) {
      data.set(d.Code, +d.Score);
      data.set(d.Country, +d.Score);
    }
  }),
]).then(function (loadData) {
  let topo = loadData[0];

  let mouseOver = function (event, d) {
    d3.selectAll(".Country").transition().duration(200).style("opacity", 0.5);
    d3.select(this).transition().duration(200).style("opacity", 1).style("stroke", "black");

    // Create tooltip element
    let tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
    
    //handle changing position on mouse
    d3.select(window).on("mousemove", function (e) {
      tooltip.style("left", e.pageX + "px").style("top", e.pageY + "px");
    });
    //retriving the country name and its index value
    let countryName = d.properties.name;
    let countryValue = d.total.toFixed(2); // Assuming 'total' holds the value
    //showing the value for each hovered country
    tooltip.html(`
    <div class="country-and-year"><span class="country"><b>${countryName}</b><br></span><span class="year">${year}</span></div>
    <div class="score"><span class="score-heading">Balanced Diet Index (BDI)</span> <br> <span class="score-value" style="color: ${colorScale(countryValue)};"><b>${countryValue}</b></span></div>
  </div>
    `);

    tooltip.transition().duration(100).style("opacity", 0.9);
  };
  
  //handle mouse leaving an area
  let mouseLeave = function (event, d) {
    d3.selectAll(".Country").transition().duration(200).style("opacity", 1);
    d3.select(this).transition().duration(200).style("stroke", "transparent");
    svg.select(".country-label").remove();
    svg.select(".country-label_1").remove();

    d3.selectAll(".tooltip").remove();
  };
  
  //handle click on a particular country
  let clickfunc = function (event, d) {
    d3.select("#scatter svg").remove();
    d3.select("#chart svg").remove();

    let margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 900 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
    // Select the div where the chart will be rendered
    let svg_2 = d3
      .select("#scatter")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define the country for which data will be visualized
    var country = d.properties.name;

    // Add country name to the top right corner of the svg_2
    svg_2
      .append("text")
      .attr("x", width - 10)
      .attr("y", 20)
      .attr("text-anchor", "end")
      .attr("font-size", "34px")
      .attr("fill", "black")
      .text(country);

    // Add text to show selected year
    let selectedYearText = svg_2
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "black");

    // Load data from CSV and visualize
    d3.csv("final_nutrition.csv").then(function (data) {
      // Parse Year as Date object and Score as number
      data = data.filter((d) => d.Country === country);
      data.forEach(function (d) {
        d.Year = new Date(+d.Year, 0); // Convert year to Date object
        d.Score = +d.Score;
      });

      // Create x scale for time
      let x = d3
        .scaleTime()
        .domain([new Date(1961, 0), new Date(2020, 0)]) // Initial domain from 1961 to 2020
        .range([0, width]);

      // Create y scale for linear values
      let y = d3
        .scaleLinear()
        .domain([d3.min(data, (d) => d.Score) - 1, d3.max(data, (d) => d.Score) + 1]) // Adjusted scale domain
        .range([height, 0]);

      // Add x-axis
      let xAxis = svg_2
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"))); // Format ticks to show only years

      // Add y-axis
      svg_2.append("g").call(d3.axisLeft(y));

      // Add line
      let line = svg_2
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

      // Slider functionality
      d3.select("#yearSlider").on("input", function () {
        selectedYear = +this.value;
        let filteredData = data.filter((d) => d.Year <= new Date(selectedYear, 0)); // Filter data based on selected year
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

    let OriginalData = [
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
    let svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height);

    // Initialize tooltip
    //let tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
    {
      var requiredCountry = d.properties.name;
      var requiredYear = selectedYear;
      console.log(selectedYear + " " + requiredCountry);
      console.log(requiredCountry, requiredYear);
      let title = svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text(`${requiredCountry} (${requiredYear})`)
        .style("font-size", "18px")
        .style("font-weight", "bold");

      d3.csv("final.csv").then(function (data) {
        // Filter data based on Country and Year
        let filteredData = data.filter((d) => d.Country == requiredCountry && d.Year == requiredYear);

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
        let colorScale = d3.scaleOrdinal().range(["pink", "orange", "red", "brown", "yellow", "skyblue", "green"]);

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
            if (d.data.label === "Daily caloric intake per person from carbohydrates") {
              return radiusScale(d.data.value);
            } else return radiusScale(d.data.value);
          });

        // Group element for the pie chart
        let g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

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
            d3.select(this).attr("opacity", 0.8);
            let tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

            d3.select(window).on("mousemove", function (e) {
              tooltip.style("left", e.pageX + "px").style("top", e.pageY + "px");
            });

            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip
              .html(`${d.data.label}: ${d.data.value} kcal`)
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY + 10}px`);
            // Show the label corresponding to the hovered sector
          })
          .on("mouseout", function () {
            d3.select(this).attr("opacity", 1);
            d3.selectAll(".tooltip").remove();
          });
      });
    }
  };
  // Draw the map
  svg
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
    .on("click", clickfunc);
});
