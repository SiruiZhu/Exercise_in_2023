/* global d3 */
(function () {
  var margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }

  var width = 250 - margin.left - margin.right
  var height = 250 - margin.top - margin.bottom
  var container = d3.select('#arc-chart')
  let radius = 110

  // Here are some scales for you
  var radiusScale = d3
    .scaleLinear()
    .range([0, radius])

  var angleScale = d3
    .scaleBand()
    .range([0, Math.PI * 2])

  var arc = d3
    .arc()
    .innerRadius(d => radiusScale(20))
    .outerRadius(d => radiusScale(20) + radiusScale(d.value))
    .startAngle(d => angleScale(d.date))
    .endAngle(d => angleScale(d.date) + angleScale.bandwidth())

  // var line = d3
  //   .radialArea()
  //   .innerRadius(radiusScale(0))
  //   .outerRadius(d => radiusScale(d.value))
  //   .angle(d => angleScale(d.date))

  var colorScale = d3
    .scaleLinear()
    // .range(['#3494E6', '#EC6EAD'])
    .range(['#cbad6d', '#d53369'])

  var xPositionScale = d3.scalePoint().range([0, width])

  var div = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)

  d3.csv('data/exerciese_duration_2023.csv')
    .then(ready)
    .catch((err) => console.log('Failed on', err))

  function ready(datapoints) {
    // console.log('Data is', datapoints)

    var months = datapoints.map(d => d.exercisedate)
    // console.log(months)

    var dates = datapoints.map(d => d.date)
    // console.log(dates)

    xPositionScale.domain(months).padding(0.4)
    angleScale.domain(dates)

    var valueMin = d3.min(datapoints, d=> +d.value)
    var valueMax = d3.max(datapoints, d=> +d.value)
    colorScale.domain([valueMin, valueMax])
    radiusScale.domain([valueMin, valueMax])

    var nested = d3
      .nest()
      .key(function (d) {
        return d.exercisemonth
      })
      .entries(datapoints)

    container
      .selectAll('.arc-chart')
      .data(nested)
      .enter()
      .append('svg')
      .attr('class', 'arc-graph')
      .attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.left + margin.right)
      .append('g')
      .attr('class', 'graph-group')
      .attr('transform', function (d) {
        // console.log(d)
        return 'translate(' + width / 2 + ',' + height / 2 + ')'
      })
      .each(function (d) {
        //  console.log(d)
        var svg = d3.select(this)
        var datapoints = d.values
        datapoints.push(datapoints[0])
        // console.log('g data look like', datapoints)
        // add graph
        svg
          .selectAll('.exercise-graph')
          .data(datapoints)
          .enter()
          .append('path')
          .attr('fill', d => colorScale(d.value))
          .attr('d', function (d) {
            return arc(d)
          })
          .attr('id', function (d, i) {
            return 'date' + i
          })
          .on('mouseover', function (d, i) {
            div.transition().style('opacity', 0.9)
            div
              .html('Date: ' + d.exercisedate + '<br>' + 'Duration: ' + d.value + ' mins')
              .style('left', d3.event.pageX + 'px')
              .style('top', d3.event.pageY - 28 + 'px')
    
            d3.select('#date' + i)
              .transition()
              .style('fill', '#4cc1fc')
          })
          .on('mouseout', function (d, i) {
            div.transition().style('opacity', 0)
            d3.select('#date' + i)
              .transition()
              .style('fill', '#b379ce')
          })

        // add 60mins circle
        svg
          .append('circle')
          .attr('r', d =>radiusScale(20) + radiusScale(60))
          .attr('fill', 'none')
          .attr('stroke', 'lightgray')
          .attr('stroke-dasharray', 3)
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('class', '60-mins')

        //add 60-mins label
        svg
          .append('text')
          .text(function(d) {
            if (d.key === 'Jan') {
              return '60 mins'
            } 
          })
          .attr('x', 0)
          .attr('y', - radiusScale(90))
          .attr('font-size', 10)
          .attr('fill', 'gray')
          .attr('dy', 5)
          .attr('text-anchor', 'middle')


        // add text
        svg
          .append('text')
          .text(d.key)
          .attr('x', 0)
          .attr('y', 0)
          .attr('font-size', 12)
          .attr('font-weight', 'bold')
          .attr('fill', '#980043')
          .attr('dy', 5)
          .attr('text-anchor', 'middle')
      })

  }
})()