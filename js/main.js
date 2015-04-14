/*
 *
 * Page behaviour for wonky.js demo
 *
 */

// probability histogram in D3
var histogram = function(element) {

    var parent_element = element;
    var bins = 20;

    var margin = {
        top: 10,
        right: 30,
        bottom: 30,
        left: 30
    }

    var width = element.offsetWidth - margin.left - margin.right;
    var height = element.offsetHeight - margin.top - margin.bottom;

    this.plot = function(data, x_domain) {

        var x_scale = d3.scale.linear().domain(x_domain).range([0, width]);
        var y_scale = d3.scale.linear().domain([0, 1]).range([height, 0]);
        var binned_data = d3.layout.histogram()
            .bins(x_scale.ticks(bins))
            .frequency(false)(data);

        var container = d3.select(parent_element).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var bar = container.selectAll(".bar").data(binned_data);
        bar.exit().remove();
        bar.enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x_scale(d.x) + "," + y_scale(d.y) + ")";  });

        bar.append("rect")
            .attr("x", 1)
            .attr("width", x_scale(binned_data[0].dx) - 1)
            .attr("height", function(d) { return height - y_scale(d.y) });

        x_axis = d3.svg.axis().scale(x_scale).orient("bottom");
        container.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis);
    }

    return {
        plot: plot
    }
}
