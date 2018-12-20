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
            d.month -= 1;
        });
    
        const margin = {top: 75, right: 150, bottom: 0, left: 130}
        ,barWidth = 5
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
        ,monthArr = ['January', 'Februrary', 'March', 'April', 'May', 'June', 'July' ,'August' ,'September' ,'October' ,'November', 'December']
        ,colorArr = ['rgb(0, 100, 250)', 'rgb(0, 150, 250)', 'rgb(0, 200, 250)', 'rgb(0, 250, 250)'
                    ,'rgb(250, 200, 0)', 'rgb(250, 150, 0)', 'rgb(250, 200, 0)', 'rgb(250, 0, 0)'];

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

        let yScale = d3.scaleBand()
            .domain([0,1,2,3,4,5,6,7,8,9,10,11])
            .rangeRound([0, graphHeight]);

        let yAxis = d3.axisLeft()
            .scale(yScale)
            .tickValues(yScale.domain())
            .tickFormat((month) => monthArr[month])
            .tickSize(10, 1);
        
        svg.append('g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .attr('id', 'y-axis')
            .call(yAxis);
        
        svg.append('text')
            .text("Months")
            .attr('transform', `translate(${margin.left / 2}, ${graphHeight / 2}) rotate(-90)`);

        let xScale = d3.scaleBand()
            .domain(data.map((d) => d.year))
            .rangeRound([0, graphWidth]);

        let xAxis = d3.axisBottom()
            .scale(xScale)
            .tickValues(xScale.domain().filter((year) => year % 10 === 0))
            .tickFormat((year) => {
                let date = new Date(0);
                date.setFullYear(year);
                return d3.timeFormat('%Y')(date);
            })
            .tickSize(10, 1);

        svg.append('g')
            .attr('transform', `translate(${margin.left}, ${graphHeight})`)
            .attr('id', 'x-axis')
            .call(xAxis);

        svg.append('text')
            .text('Years')
            .attr('transform', `translate(${graphWidth /2}, ${graphHeight + 60})`)

        let colorScale = d3.scaleQuantile()
            .domain(data.map((d) => d.variance))
            .range(colorArr);

        console.log(`xScale(minYear): ${xScale(minYear)}\nxScale(maxYear): ${xScale(maxYear)}`);
        console.log(`yScale(minMonth): ${yScale(minMonth)}\nyScale(maxMonth): ${yScale(maxMonth)}`);
        console.log(`colorScale(minVariance): ${colorScale(minVariance)}\ncolorScale(maxVariance): ${colorScale(maxVariance)}`);

        svg.selectAll('rect')
            .data(data)
            .enter().append('rect')
            .attr('x', (d) => xScale(d.year))
            .attr('y', (d) => yScale(d.month))
            .attr('width', barWidth)
            .attr('height', barHeight)
            .attr('fill', (d) => colorScale(d.variance))
            .attr('class', 'cell')
            .attr('data-month', (d) => d.month)
            .attr('data-year', (d) => d.year)
            .attr('data-temp', (d) => d.variance)
            .attr('transform', `translate(130, 0)`)
    };
});