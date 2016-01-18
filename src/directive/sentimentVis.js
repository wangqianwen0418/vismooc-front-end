//service
import communicator from '../service/communicator.js';

export default{
    params: ['config', 'go-back'],
    bind() {
        this.sentimentData = null;
        var self = this,
            xVar = 'timestamp',
            sqrt30 = Math.sqrt(30),
            padding = {
                left: 50,
                right: 20,
                top: 50,
                buttom: 50
            };

        var xScale = d3.scale.linear()
            .range([padding.left, this.params.config.width - padding.right]);

        var yScale = d3.scale.linear()
            .range([padding.top, this.params.config.height - padding.buttom]);

        var mouseScale = d3.scale.linear()
            .range([padding.left + 30, this.params.config.width - padding.left - 250]);

        var svg = d3.select(this.el)
            .append("svg")
            .attr("width", this.params.config.width)
            .attr("height", this.params.config.height);

        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom");
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");
        var xAxisSvg = svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (this.params.config.height - padding.top) + ")");
        var yAxisSvg = svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + padding.left + ", 0 )");

        var summaryColor = d3.scale.linear()
            .range(['rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(217,239,139)', 'rgb(166,217,106)', 'rgb(102,189,99)', 'rgb(26,152,80)'])
            .domain([-0.4, -0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4]);

        //legend here
        var idGradient = "gradient-sentiment-vis";
        var legendMargin = {
            left: 650,
            top: 0
        }
        var legendWidth = 140;
        var legendHeight = 20;

        var legendG = svg.append("g")
            .attr("transform", "translate(" + legendMargin.left + "," + legendMargin.top + ")");
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
        legendG.select('#' + idGradient)
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
                'fill': 'url(#' + idGradient + ')',
                'x': 0,
                'y': 0,
                'width': legendWidth,
                'height': legendHeight,
                'rx': 2,
                'ry': 2
            });
        //legend isDetail
        legendG.append("text")
            .attr({
                'class': 'isDetail',
                'x': 40,
                'y': -5
            })
            .text("Student's grade");
        legendG.append("text")
            .attr({
                'class': 'isDetail',
                'x': 0,
                'y': legendHeight + 15
            })
            .text("15");
        legendG.append("text")
            .attr({
                'class': 'isDetail',
                'x': legendWidth - 20,
                'y': legendHeight + 15
            })
            .text("100");
        legendG.append("text")
            .attr({
                'class': 'isDetail',
                'x': legendWidth + 10,
                'y': legendHeight + 15
            })
            .text("No grade");
        legendG.append("rect")
            .attr({
                'class': 'isDetail',
                'fill': 'black',
                'opacity': 0.4,
                'x': legendWidth + 25,
                'y': 0,
                'width': 20,
                'height': legendHeight
            });
        //legend isSummary
        legendG.append("text")
            .attr({
                'class': 'isSummary',
                'x': -30,
                'y': legendHeight + 15
            })
            .text("negative")
        ;
        legendG.append("text")
            .attr({
                'class': 'isSummary',
                'x': legendWidth - 20,
                'y': legendHeight + 15
            })
            .text("positive")
        ;

        var textG = svg.append("g")
            .attr("class", "axisText");
        //text isDetail
        textG.append("text")
            .attr({
                'class': 'goBackLink isDetail',
                'x': 50,
                'y': 50
            })
            .on('click', this.clickSummaryPoint)
            .append('tspan')
            .attr('text-decoration', 'underline')
            .text('Go Back To Summary')

        ;

        textG.append("text")
            .attr({
                'class': 'isDetail',
                'y': 70,
                'x': -200,
                'dy': '.31em',
                'transform': 'rotate(-90)'
            })
            .text("Appreciation");

        textG.append("text")
            .attr({
                'class': 'isDetail',
                'y': 70,
                'x': -320,
                'dy': '.31em',
                'transform': 'rotate(-90)'
            })
            .text("Neutral");

        textG.append("text")
            .attr({
                'class': 'isDetail',
                'x': -460,
                'y': 70,
                'dy': '.31em',
                'transform': 'rotate(-90)'
            })
            .text("Questions");

        var title = textG.append("text")
            .attr({
                'x': this.params.config.width / 2 - 80,
                'y': this.params.config.height - 2
            })
            .style("font-size", "20px")
        ;

        textG.append("text")
            .attr({
                'x': this.params.config.width / 2 - 100,
                'y': 50
            })
            .style("font-size", "30px")
            .text("Sentiment trend")
        ;

        var one_third = (this.params.config.height - padding.top - padding.buttom) / 3;
        //detail back ground
        svg.append('rect')
            .attr({
                'class': 'isDetail',
                'x': padding.left,
                'y': padding.top,
                'width': this.params.config.width - padding.left - padding.right,
                'height': one_third,
                'fill': 'rgba(204,235,197, 0.5)'
            })
        ;

        svg.append('rect')
            .attr({
                'class': 'isDetail',
                'x': padding.left,
                'y': one_third + padding.top,
                'width': this.params.config.width - padding.left - padding.right,
                'height': one_third,
                'fill': 'rgba(255,255,204, 0.5)'
            })
        ;
        svg.append('rect')
            .attr({
                'class': 'isDetail',
                'x': padding.left,
                'y': one_third + padding.top + one_third,
                'width': this.params.config.width - padding.left - padding.right,
                'height': one_third,
                'fill': 'rgba(253,218,236, 0.5)'
            })
        ;

        var extendColorScale = function (positive, neutral) {
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

        var extendYScale = function (yValue, positive, neutral) {
            var tempScale = d3.scale.linear();

            var middle = self.params.config.height / 2,
                one_third = padding.left + (self.params.config.height - 2 * padding.left) / 3,
                two_thirds = self.params.config.height - padding.left - (self.params.config.height - 2 * padding.left) / 3;

            if (neutral >= 0.5) {
                tempScale
                    .range([one_third, two_thirds])
                    .domain([padding.left, self.params.config.height - padding.left]);
            } else {
                if (positive >= 0) {
                    tempScale
                        .range([padding.left, one_third])
                        .domain([padding.left, middle]);
                } else {
                    tempScale
                        .range([two_thirds, self.params.config.height - padding.left])
                        .domain([middle, self.params.config.height - padding.left]);
                }
            }

            return tempScale(yValue);
        };

        this.setPlotSummary = function () {
            if (!this.sentimentData[0][xVar]) return false;
            
            if (this.params.config.isDetail) {
                svg.selectAll('.isDetail').classed('hide', false);
                svg.selectAll('.isSummary').classed('hide', true);
            } else {
                svg.selectAll('.isDetail').classed('hide', true);
                svg.selectAll('.isSummary').classed('hide', false);
            }

            xScale.domain(d3.extent(this.sentimentData, function (d) {
                return d[xVar];
            }));
            yScale.domain([d3.max(this.sentimentData, function (d) {
                return d.positive;
            }) + 0.1, d3.min(this.sentimentData, function (d) {
                return d.positive;
            }) - 0.1]);
            mouseScale.domain(d3.extent(this.sentimentData, function (d) {
                return d[xVar];
            }));

            var formatMinutes = function (d) {
                return self.params.config.isDetail ?
                    d3.time.format("%H:%M")(new Date(d)) :
                    d3.time.format("%B, %d")(new Date(d))
            };
            xAxis.tickFormat(formatMinutes);
            xAxisSvg.transition().duration(500).call(xAxis);
            yAxisSvg.transition().duration(500).call(yAxis);

            var circles = svg.selectAll("circle")
                .data(self.sentimentData, function (d) { return d._id; })
                ;

            circles.exit()
                .transition().duration(500)
                .attr('r', 0)
                .remove();

            circles.enter()
                .append("circle")
                .attr({
                    'class': 'sentimentNode',
                    'r': 1,
                    'stroke': '#aaa',
                    'stroke-width': '1px'
                })
                .attr("cx", function (d) {
                    return xScale(d[xVar]);
                })
                .attr("cy", function (d) {
                    return self.params.config.isDetail ?
                        extendYScale(yScale(d.positive), d.positive, d.neutral) :
                        yScale(d.positive);
                })
                .attr("fill", function (d) {
                    if (self.params.config.isDetail) {
                        if (d.grade) {
                            if (d.grade === '#CCC')
                                return '#888';
                            return d.grade;
                        }
                        return extendColorScale(d.positive, d.neutral)
                    } else {
                        return summaryColor(d.positive);
                    }
                })
                .on("mouseover", function (d) {
                    d3.select(this).attr("fill", "orange");

                    var mouse = d3.mouse(this);
                    var xPosition = 60 + mouseScale(d[xVar]);
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
                            if (self.params.config.isDetail) {
                                if (d.grade) {
                                    if (d.grade === '#CCC')
                                        return '#888';
                                    return d.grade;
                                }
                                return extendColorScale(d.positive, d.neutral)
                            } else {
                                return summaryColor(d.positive);
                            }
                        });
                    //hide the tooltip
                    d3.select("#tooltip").classed("hidden", true);
                })
                .on('click', this.clickSummaryPoint)
                .transition().duration(500)
                .attr('r', sqrt30)
            ;

            title.text(function () {
                return self.params.config.isDetail ? "Time of a day" : "Date from the course started";
            });
        };

        this.clickSummaryPoint = function (d) {
            d3.select("#tooltip").classed("hidden", true);
            if(self.params.config.isDetail){
                communicator(self.vm).emitSentiment('delete');
            }else{
                communicator(self.vm).emitSentiment(d);
            }
        }

    },
    update(newVal, oldVal) {
        console.log(newVal);
        if (!newVal) return;
        this.sentimentData = newVal;

        this.setPlotSummary();
    }
}