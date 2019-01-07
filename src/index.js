import './index.css';
import * as d3 from 'd3';

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
    
        const margin = {top: 75, right: 150, bottom: 0, left: 130}
        ,barWidth = 6
        ,barHeight = 33
        ,numberOfBars = Math.ceil(json.monthlyVariance.length/12)
        ,graphWidth = barWidth * numberOfBars
        ,graphHeight = barHeight * 12 //12 months
        ,minYear = d3.min(data, (d) => d.year)
        ,maxYear = d3.max(data, (d) => d.year)
        ,minMonth = d3.min(data, (d) => d.month)
        ,maxMonth = d3.max(data, (d) => d.month)
        ,minVariance = d3.min(data, (d) => d.variance)
        ,maxVariance = d3.max(data, (d) => d.variance)
        ,colorArr = ['rgb(0, 100, 250)', 'rgb(0, 150, 250)', 'rgb(0, 200, 250)', 'rgb(0, 250, 250)'
                    ,'rgb(250, 200, 0)', 'rgb(250, 150, 0)', 'rgb(250, 100, 0)', 'rgb(250, 0, 0)']
        ,monthArr = ['January', 'February', 'March', 'April' ,'May' ,'June' ,'July' ,'August' ,'September' ,'October' ,'November' ,'December'];

        console.log(`data.length: ${data.length}`);
        console.log(`baseTemperature: ${json.baseTemperature}`);
        console.log(`numberOfBars: ${numberOfBars}`);
        console.log(`data[0]: ${JSON.stringify(data[0])}`);
        console.log(`data[last]: ${JSON.stringify(data[data.length -1])}`);
        console.log(`minYear: ${minYear}\nmaxYear: ${maxYear}\nminMonth: ${minMonth}\nmaxMonth: ${maxMonth}`);
        console.log(`minVariance: ${minVariance}\nmaxVariance: ${maxVariance}`);
        
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
            .tickFormat((month) => {
                let date = new Date(0);
                date.setMonth(month);
                return d3.timeFormat('%B')(date);
            });
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
            .tickValues(xScale.domain().filter((year) => year % 10 === 0))
            .tickFormat((year) => {
                let date = new Date(0);
                date.setFullYear(year);
                return d3.timeFormat('%Y')(date);
            });
        //Append xAxis to svg
        svg.append('g')
            .attr('transform', `translate(${margin.left}, ${graphHeight})`)
            .attr('id', 'x-axis')
            .call(xAxis);
        //Append xAxis label to svg
        svg.append('text')
            .text('Years')
            .attr('transform', `translate(${graphWidth /2}, ${graphHeight + 60})`)
        //Define color scale for rectangles and legend
        let colorScale = d3.scaleQuantile()
            .domain(data.map((d) => json.baseTemperature + d.variance))
            .range(colorArr);
        //Create tooltip
        const tooltip = d3.select('#heatMap').append('div')
        .attr('id', 'tooltip')
        .style('opacity', 0);

        console.log(`colorScale.quantiles().map((d) => d - json.baseTemperature):${colorScale.quantiles().map((d) => d - json.baseTemperature)}`);    

        let colorLegend = svg.selectAll('.legend')
            .data(colorScale.quantiles().map((d) => d - json.baseTemperature));
        
        colorLegend.enter().append('g')
            .attr('class', 'legend')
            .attr('id', 'legend');
        
        colorLegend.append('rect')
            .attr('x', (d,i) => 20 * i)
            .attr('y', graphHeight + 120)
            .attr('width', 20)
            .attr('height', 20)
            .style('fill', (d, i) => colorArr[i]);

        colorLegend.append('text')
            .text((d) => d)
            .attr('x', (d, i) => 10 * i)
            .attr('y', graphHeight + barHeight);
           
    
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
                        Variance: ${d.variance}`);
            })
            .on('mouseout', (d) => {
                    tooltip.style('opacity', '0')
                    .attr('data-year', null)
                    .style('z-index', -1)
            });
    };
});