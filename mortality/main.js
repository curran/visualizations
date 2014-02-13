// A visualization of Cause of Death data from the Centers for Disease Control.
//
// Details of the data can be found here:
// https://github.com/curran/data/tree/gh-pages/cdc/mortality
//
// The visualization draws from this D3 example:
// http://bl.ocks.org/mbostock/3885211
//
// Curran Kelleher
// 2/13/2014
//
var dataModuleURL = 'http://curran.github.io/data/cdc/mortality/mortality.js';
require([dataModuleURL], function(data){
  
  // The following code draws from
  // http://bl.ocks.org/mbostock/3885211
  var outerWidth = 800,
      outerHeight = 600,
      margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = outerWidth - margin.left - margin.right,
      height = outerHeight - margin.top - margin.bottom,
      x = d3.time.scale()
        .range([0, width]),
      y = d3.scale.linear()
        .range([height, 0]),
      color = d3.scale.category20(),
      area = d3.svg.area()
        .x(function(d) { return x(d.date); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); }),
      stack = d3.layout.stack()
        .values(function(d) { return d.values; })
        .offset('expand'),
      svg = d3.select('body').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Set the color domain so each color is a cause of death.
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== 'year'; }));

  // Parse years into Date objects for use with D3 time scale.
  data.forEach(function(d) {
    d.date = new Date(d.year, 0);
  });

  // Transform the data for D3's stack layout.
  // see https://github.com/mbostock/d3/wiki/Stack-Layout
  var causes = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, y: clean(d[name])};
      })
    };
  })
  // Sort the layers by the most recent value.
  causes = _.sortBy(causes, function(cause) {
    return cause.values[cause.values.length - 1].y;
  });
  var layers = stack(causes);

  x.domain(d3.extent(data, function(d) { return d.date; }));

  var cause = svg.selectAll('.cause')
    .data(layers)
    .enter().append('g')
    .attr('class', 'cause');

  cause.append('path')
    .attr('class', 'area')
    .attr('d', function(d) { return area(d.values); })
    .style('fill', function(d) { return color(d.name); });
}, function(err){
  // If we are here, the data failed to load.
  console.log(err);
});

// Replace missing data with 0 and parse strings into numbers.
function clean(value){
  return value === '~' ? 0 : parseFloat(value);
}
