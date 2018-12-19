import './index.css';
import * as d3 from 'd3';

//Add event listner On page load
document.addEventListener('DOMContentLoaded', function(){
    var req = new XMLHttpRequest();
    req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json", true);
    req.send();
    req.onload = function(){
        let json = JSON.parse(req.responseText);
        let dataset = json['monthlyVariance'];
    
        const margin = {top: 0, right: 0, bottom: 60, left: 60}
        ,barWidth = 5
        ,barHeight = 33
        ,w = barWidth * Math.ceil(json.monthlyVariance.length/12) 
        ,h = barHeight * 12 //12 months
        ,minYear = d3.min(dataset, (d) => d.year)
        ,maxYear = d3.max(dataset, (d) => d.year)
        ,minMonth = d3.min(dataset, (d) => d.month)
        ,maxMonth = d3.max(dataset, (d) => d.month)
        ,minVariance = d3.min(dataset, (d) => d.variance)
        ,maxVariance = d3.max(dataset, (d) => d.variance)
        ,monthArr = ['January', 'Februrary', 'March', 'April', 'May', 'June', 'July' ,'August' ,'September' ,'October' ,'November', 'December']
        ,colorArr = ['rgb(0, 100, 250)', 'rgb(0, 150, 250)', 'rgb(0, 200, 250)', 'rgb(0, 250, 250)'
                    ,'rgb(250, 200, 0)', 'rgb(250, 150, 0)', 'rgb(250, 200, 0)', 'rgb(250, 0, 0)'];

        console.log(`dataset.length: ${dataset.length}`);
        console.log(`baseTemperature: ${json.baseTemperature}`);
        console.log(`dataset[0]: ${JSON.stringify(dataset[0])}`);
        console.log(`dataset[last]: ${JSON.stringify(dataset[dataset.length -1])}`);
        console.log(`minYear: ${minYear}\nmaxYear: ${maxYear}\nminMonth: ${minMonth}\nmaxMonth: ${maxMonth}`);
        console.log(`minVariance: ${minVariance}\nmaxVariance: ${maxVariance}`);
        
        let svg = d3.select('#heatMap').append('svg')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let xScale = d3.scaleLinear()
            .domain([minYear, maxYear])
            .range([margin.left, w]);

        let yScale = d3.scaleLinear()
            .domain([minMonth, maxMonth])
            .range([margin.bottom, h]);

        let colorScale = d3.scaleQuantile()
            .domain(dataset.map((d) => d.variance))
            .range(colorArr);

        console.log(`xScale(minYear): ${xScale(minYear)}\nxScale(maxYear): ${xScale(maxYear)}`);
        console.log(`yScale(minMonth): ${yScale(minMonth)}\nyScale(maxMonth): ${yScale(maxMonth)}`);
        console.log(`colorScale(minVariance): ${colorScale(minVariance)}\ncolorScale(maxVariance): ${colorScale(maxVariance)}`);

        svg.selectAll('rect')
            .data(dataset)
            .enter().append('rect')
            .attr('x', (d) => xScale(d.year))
            .attr('y', (d) => yScale(d.month))
            .attr('width', barWidth)
            .attr('height', barHeight)
            .attr('fill', (d) => colorScale(d.variance))
            .attr('class', 'cell');

        let xAxis = d3.axisBottom()
            .scale(xScale)
            .tickValues(dataset.map((d) => d.year%10 === 0))
            .tickFormat((d) => {
                let date = new Date(0);
                date.setFullYear(d.year);
                return d3.timeFormat('%Y')(date);
            })
            .tickSize(10, 1);

        svg.append('g')
            .attr('transform', `translate(0, ${h + 40})`)
            .call(d3.axisBottom(xScale));
    };
});