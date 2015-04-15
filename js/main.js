/*
 *
 * Page behaviour for wonky.js demo
 *
 */

// probability histogram in D3
var histogram = function(element, x_domain, bins) {

    // Display variables
    var parent_element = element;
    var margin = {
        top: 10,
        right: 30,
        bottom: 30,
        left: 30
    }
    var width = element.offsetWidth - margin.left - margin.right;
    var height = element.offsetHeight - margin.top - margin.bottom;

    var bins = bins;
    var domain = x_domain;
    var y_scale = d3.scale.linear().domain([0, 1]).range([height, 0]);
    var x_scale = d3.scale.linear().domain(domain).range([0, width]);

    var bin_data = d3.layout.histogram()
        .bins(x_scale.ticks(bins))
        .frequency(false);

    // svg container, transformed for margins
    d3.select(parent_element).select("svg").remove();
    var container = d3.select(parent_element).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x_axis = d3.svg.axis().scale(x_scale).orient("bottom");

    container.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(x_axis);

    var plot = function(data) {

        container.selectAll(".bar").remove();

        var hist_data = bin_data(data);
        var bar = container.selectAll(".bar").data(hist_data);

        bar.enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x_scale(d.x) + "," + y_scale(d.y) + ")";  });

        bar.append("rect")
            .attr("x", 1)
            .attr("width", x_scale(1) - 1)
            .attr("height", function(d) { return height - y_scale(d.y) });
    }

    return {
        plot: plot
    }
}
