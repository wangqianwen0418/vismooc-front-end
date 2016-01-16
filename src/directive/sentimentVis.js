//service
import communicator from '../service/communicator.js';

export default{
    params: ['config', 'go-back'],
    bind() {
        console.log('init mdschart');
        var svg, xScale, yScale, xAxis, yAxis, padding, xVar, mouseScale;
        var self = this;
        this.sentimentData = null;
        this.init = function () {
            xVar = 'timestamp';
            if (!this.sentimentData[0][xVar]) return false;

            padding = 50;
            svg = d3.select(this.el).select('svg');
            if (svg.length) svg.remove();

            var formatTimeHour = d3.time.format("%H:%M");
            var formatTimeDay = d3.time.format("%B, %d");
            var formatMinutes = function (d) {
                if (this.showGoBack) {
                    return formatTimeHour(new Date(d))
                }
                return formatTimeDay(new Date(d))
            };

            xScale = d3.scale.linear()
                .domain(d3.extent(this.sentimentData, function (d) {
                    return d[xVar];
                }))
                .range([padding, this.params.config.width - 20]);

            yScale = d3.scale.linear()
                .domain([d3.max(this.sentimentData, function (d) {
                    return d.positive;
                }) + 0.1, d3.min(this.sentimentData, function (d) {
                    return d.positive;
                }) - 0.1])
                .range([padding, this.params.config.height - padding]);

            mouseScale = d3.scale.linear()
                .domain(d3.extent(this.sentimentData, function (d) {
                    return d[xVar];
                }))
                .range([padding + 30, this.params.config.width - padding - 250]);

            svg = d3.select(this.el)
                .append("svg")
                .attr("width", this.params.config.width)
                .attr("height", this.params.config.height);

            xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .tickFormat(formatMinutes);

            yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left");

            return true;
        };

        this.extendColorScale = function (positive, neutral) {
            var tempScale = d3.scale.linear();
            if (neutral >= 0.5) {
                tempScale
                    .range(['#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a'])
                    .domain([-0.5, -0.25, 0, 0.25, 0.5]);
                return tempScale(positive);
            } else {
                return positive >= 0 ? "rgba(102,189,99," + (1 - neutral) + ")" : "rgba(244,109,67," + (1 - neutral) + ")";
            }
        };

        this.extendYScale = function (yValue, positive, neutral) {
            var tempScale = d3.scale.linear();

            var middle = this.params.config.height / 2,
                one_third = padding + (this.params.config.height - 2 * padding) / 3,
                two_thirds = this.params.config.height - padding - (this.params.config.height - 2 * padding) / 3;

            if (neutral >= 0.5) {
                tempScale
                    .range([one_third, two_thirds])
                    .domain([padding, this.params.config.height - padding]);
            } else {
                if (positive >= 0) {
                    tempScale
                        .range([padding, one_third])
                        .domain([padding, middle]);
                } else {
                    tempScale
                        .range([two_thirds, this.params.config.height - padding])
                        .domain([middle, this.params.config.height - padding]);
                }
            }

            return tempScale(yValue);
        };

        this.setPlotSummary = function () {

            var summaryColor = function (positive) {
                var tempScale = d3.scale.linear()
                    .range(['rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(217,239,139)', 'rgb(166,217,106)', 'rgb(102,189,99)', 'rgb(26,152,80)'])
                    .domain([-0.4, -0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4]);

                return tempScale(positive);
            };

            var sqrt30 = Math.sqrt(30);
            svg.selectAll("circle")
                .data(self.sentimentData).enter()
                .append("circle")
                .attr({
                    'class': 'sentimentNode',
                    'r': sqrt30,
                    'stroke': '#aaa',
                    'stroke-width': '1px'
                })
                .attr("cx", function (d) {
                    return xScale(d[xVar]);
                })
                .attr("cy", function (d) {
                    return yScale(d.positive);
                })
                .attr("fill", function (d) {
                    return summaryColor(d.positive);
                })
                .on("mouseover", function (d) {
                    d3.select(this).attr("fill", "orange");

                    var mouse = d3.mouse(this);
                    var xPosition = mouseScale(d[xVar]);
                    var yPosition = mouse[1] - 60;
                    //Update the tooltip position and value
                    d3.select("#tooltip")
                        .style("left", xPosition + "px")
                        .style("top", yPosition + "px")
                        .select("#username")
                        .style("font-weight", 900)
                        .style("color", "#CCC")
                        .text(d.username);

                    d3.select("#tooltip")
                        .select("#value")
                        .style("font-weight", 900)
                        .style("color", "red")
                        .text("The date is " + d.date);

                    d3.select("#tooltip")
                        .select("#comment")
                        .text(d.text);
                      
                    //Show the tooltip
                    d3.select("#tooltip").classed("hidden", false);
                })
                .on("mouseout", function (d) {
                    d3.select(this)
                        .attr("fill", function (d) {
                            return summaryColor(d.positive)
                        });
                    d3.select("#tooltip").classed("hidden", true);
                })
                .on('click', function (d) {
                    communicator(self.vm).emitSentiment(d)
                })

            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + (this.params.config.height - padding) + ")")
                .call(xAxis);
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + padding + ", 0 )")
                .call(yAxis);

            var textG = svg.append("g")
                .attr("class", "axisText")

            textG.append("text")
                .attr({
                    'x': this.params.config.width / 2 - 100,
                    'y': 50
                })
                .style("font-size", "30px")
                .text("Sentiment trend")
            ;

            textG.append("text")
                .attr({
                    'x': this.params.config.width / 2 - 120,
                    'y': this.params.config.height - 2
                })
                .style("font-size", "20px")
                .text("Date from the course started")
            ;

            var margin = {
                left: 670,
                top: 0
            }
            var legendWidth = 160;
            var legendHeight = 20;

            var idGradient = "gradient-summary"
            var legendG = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            legendG.append("text")
                .attr({
                    'x': -30,
                    'y': legendHeight + 20
                })
                .text("negative")
            ;
            legendG.append("text")
                .attr({
                    'x': legendWidth - 20,
                    'y': legendHeight + 20
                })
                .text("positive")
            ;

            legendG.append("defs")
                .append("linearGradient")
                .attr({
                    'id': idGradient,
                    'x1': '0%',
                    'x2': '100%',
                    'y1': '0%',
                    'y2': '0%'
                });

            var gradientStopData = ['rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(217,239,139)', 'rgb(166,217,106)', 'rgb(102,189,99)', 'rgb(26,152,80)'];
            d3.select('#' + idGradient)
                .selectAll('stop')
                .data(gradientStopData).enter()
                .append('stop')
                .attr('offset', function (d, i) {
                    return i * 0.125;
                })
                .attr('stop-color', function (d) {
                    return d;
                })
            ;

            legendG.append("rect")
                .attr({
                    'fill': 'url("#"' + idGradient + ')',
                    'x': 0,
                    'y': 0,
                    'width': legendWidth,
                    'height': legendHeight,
                    'rx': 2,
                    'ry': 2
                });

        };

        this.setPlotDetail = function () {

            var middle = this.params.config.height / 2,
                one_third = (this.params.config.height - 2 * padding) / 3,
                two_thirds = this.params.config.height - padding - (this.params.config.height - 2 * padding) / 3;

            svg.append('rect')
                .attr({
                    'x': padding,
                    'y': padding,
                    'width': this.params.config.width - 2 * padding,
                    'height': one_third,
                    'fill': 'rgba(204,235,197, 0.5)'
                })
            ;

            svg.append('rect')
                .attr({
                    'x': padding,
                    'y': one_third + padding,
                    'width': this.params.config.width - 2 * padding,
                    'height': one_third,
                    'fill': 'rgba(255,255,204, 0.5)'
                })
            ;
            svg.append('rect')
                .attr({
                    'x': padding,
                    'y': one_third + padding + one_third,
                    'width': this.params.config.width - 2 * padding,
                    'height': one_third,
                    'fill': 'rgba(253,218,236, 0.5)'
                })
            ;

            var sqrt30 = Math.sqrt(30);
            svg.selectAll("circle")
                .data(self.sentimentData).enter()
                .append("circle")
                .attr({
                    'class': 'sentimentNode',
                    'r': sqrt30,
                    'stroke': '#aaa',
                    'stroke-width': '1px'
                })
                .attr("cx", function (d) {
                    return xScale(d[xVar]);
                })
                .attr("cy", function (d) {
                    return self.extendYScale(yScale(d.positive), d.positive, d.neutral);
                })
                .attr("fill", function (d) {
                    if (d.grade) {
                        if (d.grade === '#CCC')
                            return '#888';
                        return d.grade;
                    }
                    return self.extendColorScale(d.positive, d.neutral)
                })
                .on("mouseover", function (d) {
                    d3.select(this).attr("fill", "orange");

                    var mouse = d3.mouse(this);
                    var xPosition = mouseScale(d[xVar]);
                    var yPosition = mouse[1] - 60;
                    //Update the tooltip position and value
                    d3.select("#tooltip")
                        .style("left", xPosition + "px")
                        .style("top", yPosition + "px")
                        .select("#username")
                        .style("font-weight", 900)
                        .style("color", "#CCC")
                        .text(d.username);

                    d3.select("#tooltip")
                        .select("#value")
                        .style("font-weight", 900)
                        .style("color", "red")
                        .text("The date is " + d.date);

                    d3.select("#tooltip")
                        .select("#comment")
                        .text(d.text);
                      
                    //Show the tooltip
                    d3.select("#tooltip").classed("hidden", false);
                })
                .on("mouseout", function (d) {
                    d3.select(this)
                        .attr("fill", function (d) {
                            if (d.grade) {
                                return d.grade === '#CCC' ? '#888' : d.grade;
                            }
                            return self.extendColorScale(d.positive, d.neutral)
                        });
                    d3.select("#tooltip").classed("hidden", true);
                })
                .on('click', function (d) {
                    if (!this.showGoBack) {
                        communicator(self.vm).emitSentiment(d);
                    }
                })

            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + (this.params.config.height - padding) + ")")
                .call(xAxis);

            var textG = svg.append("g")
                .attr("class", "axisText")

            textG.append("text")
                .attr({
                    'class': 'goBackLink',
                    'x': 50,
                    'y': 50
                })
                .append('tspan')
                .attr('text-decoration', 'underline')
                .text('Go Back To Summary')
                .on('click', function () {
                    communicator(self.vm).emitSentiment('delete');
                })
            ;

            textG.append("text")
                .attr({
                    'x': this.params.config.width / 2 - 70,
                    'y': this.params.config.height - 50
                })
                .style("font-size", "20px")
                .text("Time of a day")
            ;
            //y text
            textG.append("text")
                .attr({
                    'y': 70,
                    'x': -200,
                    'dy': '.31em',
                    'transform': 'rotate(-90)'
                })
                .text("Appreciation");

            textG.append("text")
                .attr({
                    'y': 70,
                    'x': -320,
                    'dy': '.31em',
                    'transform': 'rotate(-90)'
                })
                .text("Neutral");

            textG.append("text")
                .attr({
                    'x': -460,
                    'y': 70,
                    'dy': '.31em',
                    'transform': 'rotate(-90)'
                })
                .text("Questions");

            //add legend from here
            var margin = {
                left: 670,
                top: 0
            }
            var legendWidth = 160;
            var legendHeight = 20;

            var idGradient = "gradient-detail"
            var legendG = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            legendG.append("text")
                .attr({
                    'x': 40,
                    'y': -5
                })
                .text("Student's grade");

            legendG.append("text")
                .attr({
                    'x': 0,
                    'y': legendHeight + 15
                })
                .text("15");
            legendG.append("text")
                .attr({
                    'x': legendWidth - 20,
                    'y': legendHeight + 15
                })
                .text("100");
            legendG.append("text")
                .attr({
                    'x': legendWidth + 10,
                    'y': legendHeight + 15
                })
                .text("No grade");

            legendG.append("defs")
                .append("linearGradient")
                .attr({
                    'id': idGradient,
                    'x1': '0%',
                    'x2': '100%',
                    'y1': '0%',
                    'y2': '0%'
                });

            var gradientStopData = ['rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(217,239,139)', 'rgb(166,217,106)', 'rgb(102,189,99)', 'rgb(26,152,80)'];
            d3.select('#' + idGradient)
                .selectAll('stop')
                .data(gradientStopData).enter()
                .append('stop')
                .attr('offset', function (d, i) {
                    return i * 0.125;
                })
                .attr('stop-color', function (d) {
                    return d;
                })
            ;

            legendG.append("rect")
                .attr({
                    'fill': 'url("#"' + idGradient + ')',
                    'x': 0,
                    'y': 0,
                    'width': legendWidth,
                    'height': legendHeight,
                    'rx': 2,
                    'ry': 2
                });

            legendG.append("rect")
                .attr({
                    'fill': 'black',
                    'opacity': 0.4,
                    'x': legendWidth + 20,
                    'y': 0,
                    'width': legendWidth,
                    'height': legendHeight
                });
        };

    },
    update(newVal, oldVal) {
        if (!newVal) return;
        this.sentimentData = newVal;

        if (!this.init()) return;
        if (this.showGoBack) {
            this.setPlotDetail();
        } else {
            this.setPlotSummary();
        }
    }
}