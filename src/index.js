import './index.css';
import * as d3 from 'd3';
import * as d3Legend from 'd3-svg-legend';

//Add event listner On page load
document.addEventListener('DOMContentLoaded', function(){
    var req = new XMLHttpRequest();
    req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json", true);
    req.send();
    req.onload = function(){
        let json = JSON.parse(req.responseText);
        let data = json['monthlyVariance'];
        data.map((d) => {
            return d.month -= 1;
        });
    
        const margin = {top: 75, right: 150, bottom: 200, left: 130}
        ,barWidth = 6
        ,barHeight = 33
        ,numberOfBars = Math.ceil(json.monthlyVariance.length/12)
        ,graphWidth = barWidth * numberOfBars
        ,graphHeight = barHeight * 12 //12 months
        ,colorArr = ['rgb(0, 100, 250)', 'rgb(0, 150, 250)', 'rgb(0, 200, 250)', 'rgb(0, 250, 250)'
                    ,'rgb(250, 200, 0)', 'rgb(250, 150, 0)', 'rgb(250, 100, 0)', 'rgb(250, 0, 0)']
        ,monthArr = ['January', 'February', 'March', 'April' ,'May' ,'June' ,'July' ,'August' ,'September' ,'October' ,'November' ,'December'];
        
        let svg = d3.select('#heatMap').append('svg')
            .attr('width', graphWidth + margin.left + margin.right)
            .attr('height', graphHeight + margin.top + margin.bottom)
            .append("g");
        //Define yScale
        let yScale = d3.scaleBand()
            .domain(data.map((d) => d.month))
            .rangeRound([0, graphHeight]);
        //Create yAxis
        let yAxis = d3.axisLeft()
            .scale(yScale)
            .tickValues(yScale.domain())
            .tickFormat((month) => monthArr[month]);
        //Append yAxis to svg
        svg.append('g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .attr('id', 'y-axis')
            .call(yAxis);
        //Append yAxis Label to svg
        svg.append('text')
            .text("Months")
            .attr('transform', `translate(${margin.left / 2}, ${graphHeight / 2}) rotate(-90)`);
        //Define xScale
        let xScale = d3.scaleBand()
            .domain(data.map((d) => d.year))
            .rangeRound([0, graphWidth]);
        //Create xAxis
        let xAxis = d3.axisBottom()
            .scale(xScale)
            .tickValues(xScale.domain().filter((year) => year % 10 === 0));
        //Append xAxis to svg
        svg.append('g')
            .attr('transform', `translate(${margin.left}, ${graphHeight})`)
            .attr('id', 'x-axis')
            .call(xAxis);
        //Append xAxis label to svg
        svg.append('text')
            .text('Years')
            .attr('transform', `translate(${graphWidth/2}, ${graphHeight + 40})`)
        //Create tooltip
        const tooltip = d3.select('#heatMap').append('div')
        .attr('id', 'tooltip')
        .style('opacity', 0);

        //Define color scale for rectangles and legend
        let colorScale = d3.scaleQuantile()
            .domain(data.map((d) => json.baseTemperature + d.variance))
            .range(colorArr); 

        svg.selectAll('rect')
            .data(data)
            .enter().append('rect')
            .attr('x', (d) => xScale(d.year))
            .attr('y', (d) => yScale(d.month))
            .attr('width', (d) => xScale.bandwidth())
            .attr('height', (d) => yScale.bandwidth())
            .attr('fill', (d) => colorScale(json.baseTemperature + d.variance))
            .attr('class', 'cell')
            .attr('data-month', (d) => d.month)
            .attr('data-year', (d) => d.year)
            .attr('data-temp', (d) => json.baseTemperature + d.variance)
            .attr('transform', `translate(${margin.left}, 0)`)
            .on('mouseover', (d) => {
                tooltip.style('opacity', .95)
                    .attr('data-year', d.year)
                    .style("left", xScale(d.year) + 150 + "px")
                    .style("top", yScale(d.month) + "px")
                    .style('z-index', 2)
                    .html(`Year: ${d.year}<br>
                        Month: ${monthArr[d.month]}<br>
                        Temp: ${Math.round((json.baseTemperature + d.variance) * 100) / 100}℃<br>
                        Variance: ${Math.round(d.variance * 100) / 100}℃`);
            })
            .on('mouseout', (d) => {
                    tooltip.style('opacity', '0')
                    .attr('data-year', null)
                    .style('z-index', -1)
            });

        //create legendScale    
        let legendScale = d3.scaleQuantile()
            .domain(data.map((d) => json.baseTemperature + d.variance))
            .range(colorArr);

        //create legend element
        let legend = d3Legend.legendColor()
        .title('Legend')
        .labelFormat(d3.format('.2f'))
        .orient("horizontal")
        .shapeWidth(100)
        .scale(legendScale);

        svg.append('g')
            .attr('class', 'legend')
            .attr('id', 'legend')
            .attr('transform', `translate(100,450)`);

        svg.select('.legend')
            .call(legend);
    };
});