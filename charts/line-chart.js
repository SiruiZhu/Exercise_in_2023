/* global d3 */
(function () {
    var margin = {
        top: 40,
        left: 60,
        right: 20,
        bottom: 40
    }

    var width = 250 - margin.left - margin.right
    var height = 180 - margin.top - margin.bottom
    var container = d3.select('#line-chart')

    // Here are some scales for you
    var xPosition = d3.scalePoint().range([0, width])
    const xPositionScale = d3.scalePoint().range([0, width])
    const yPositionScale = d3
        .scaleLinear()
        .domain([0, 1000])
        .range([height, 0])

    // Create your line generator
    var line_energy = d3
        .line()
        .x(d => xPositionScale(d.date))
        .y(d => yPositionScale(d.value))

    // Create your area generator
    var area = d3
        .area()
        .x(d => xPositionScale(d.date))
        .y1(d => yPositionScale(d.value))
        .y0(d => yPositionScale(0))

    d3.csv('data/energy_burn_2023.csv')
        .then(ready)
        .catch((err) => console.log('Failed on', err))

    function ready(datapoints) {
        console.log('Data is', datapoints)

        var nested = d3
            .nest()
            .key(function (d) {
                return d.exercisemonth
            })
            .entries(datapoints)
        console.log('Nested data look like', nested)

        const months = datapoints.map(function (d) {
            return d.exercisemonth
        })
        xPosition.domain(months)

        var dates = datapoints.map(d => d.date)
        console.log(dates)
        xPositionScale.domain(dates)

        container
            .selectAll('.energy-graph')
            .data(nested)
            .enter()
            .append('svg')
            .attr('class', 'energy-graph')
            .attr('height', height + margin.top + margin.bottom)
            .attr('width', width + margin.left + margin.right)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .each(function (d) {
                var svg = d3.select(this)
                var datapoints = d.values
                console.log('Each data is', datapoints)
                //add area
                svg
                    .append('path')
                    .datum(datapoints)
                    .attr('d', area)
                    .attr('stroke', '#c45a6b')
                    .style('fill', '#c45a6b')
                    .attr('opacity', 0.4)
                //add month
                svg
                    .append('text')
                    .text(d.key)
                    .attr('x', width / 2)
                    .attr('y', 0)
                    .attr('font-size', 14)
                    .attr('font-weight', 'bold')
                    .attr('fill', '#980043')
                    .attr('dy', -15)
                    .attr('text-anchor', 'middle')

                // Add axes for every svg
                var xAxis = d3
                    .axisBottom(xPositionScale)
                    .tickValues([1, 10, 20, 30])
                    // .tickSize(-height)
                    .tickFormat(d3.format('d'))

                svg
                    .append('g')
                    .attr('class', 'axis x-axis')
                    .attr('transform', 'translate(0,' + height + ')')
                    .call(xAxis)

                svg
                    .selectAll('.x-axis line')
                    // .attr('stroke-dasharray', '2 3')
                    // .attr('stroke-linecap', 'round')
                    .attr('fill', '#bdbdbd')

                var yAxis = d3
                    .axisLeft(yPositionScale)
                    .ticks(3)
                    .tickValues([0, 500, 1000])

                svg
                    .append('g')
                    .attr('class', 'axis y-axis')
                    .call(yAxis)

                svg
                    .selectAll('.y-axis line')
                    // .attr('stroke-dasharray', '2 3')
                    // .attr('stroke-linecap', 'round')
                    // .attr('stroke', function(d) {
                    //     if (d === 1000) {
                    //         return 'white'
                    //     } else {
                    //         return '#bdbdbd'
                    //     }
                    // })

                svg.selectAll('.axis').lower()
                svg.selectAll('.domain').remove()

                //add kcal unit 
                // svg
                //     .append('text')
                //     .text(function (d) {
                //         if (d.key === 'Jan') {
                //             console.log(d)
                //             return 'kcal'
                //         }
                //     })
                //     .attr('x', xPositionScale(2))
                //     .attr('y', yPositionScale(1000))
                //     .attr('font-size', 10)
                //     .attr('dy', 3)
                //     .attr('text-anchor', 'middle')

                var ticks = d3.selectAll(".tick text")
                ticks.attr("class", function (d) {
                    // console.log(d)
                    if (d === 1000) {
                        return "add-unit"
                    } else {
                        return ""
                    }
                })
                svg.selectAll('.add-unit')
                    .text(function (d) {
                        return d + ' kcal'
                    })
            })
    }
})()