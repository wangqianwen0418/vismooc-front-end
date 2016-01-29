import communicator from '../service/communicator.js';
export default {
    params: ['config', 'countrycode'],
    bind() {
        this.svg = d3.select(this.el).append("svg");
        //add legend from here
        var margin = {
            left: 50,
            top: 50,
            right: 30,
            buttom: 20,
        }
        var legendWidth = 200;
        var legendHeight = 20;

        var legendGText = this.svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        legendGText.append("text")
            .attr({
                'x': 40,
                'y': -5
            })
            .text("Student's grade");
        legendGText.append("text")
            .attr({
                'x': 450,
                'y': -5
            })
            .text("Student's activeness");
        legendGText.append("text")
            .attr({
                'x': 0,
                'y': legendHeight + 15
            })
            .text("15");
        legendGText.append("text")
            .attr({
                'x': legendWidth - 20,
                'y': legendHeight + 15
            })
            .text("100");
        legendGText.append("text")
            .attr({
                'x': legendWidth + 10,
                'y': legendHeight + 15
            })
            .text("No grade");
        legendGText.append("text")
            .attr({
                'x': 450,
                'y': legendWidth + 15
            })
            .text("less");
        legendGText.append("text")
            .attr({
                'x': 550,
                'y': legendHeight + 15
            })
            .text("more");

        var idGradient = "gradient-id"
        var legendG = this.svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        legendG.append("circle")
            .attr({
                'cx': 460,
                'cy': legendHeight - 10,
                'r': 2,
                'fill': 'red'
            });
        legendG.append("circle")
            .attr({
                'cx': 568,
                'cy': legendHeight - 10,
                'r': 11,
                'fill': 'red'
            });
        legendG.append("rect")
            .attr({
                'fill': '#000',
                'opacity': 0.4,
                'x': legendWidth + 20,
                'y': 0,
                'width': legendHeight,
                'height': legendHeight
            });
        legendG.append("defs")
            .append("linearGradient")
            .attr({
                'id': idGradient,
                'x1': '0%',
                'x2': '100%',
                'y1': '0%',
                'y2': '0%'
            });
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

        var hueStart = 160, hueEnd = 0;
        var numberHues = 35;
        var opacityStart = 1.0, opacityEnd = 1.0;
        var theHue, rgbString, opacity, p;

        var deltaPercent = 1 / (numberHues - 1);
        var deltaHue = (hueEnd - hueStart) / (numberHues - 1);
        var deltaOpacity = (opacityEnd - opacityStart) / (numberHues - 1);

        //kind of out of order, but set up the data here 
        var theData = [];
        for (var i = 0; i < numberHues; i++) {
            theHue = hueStart + deltaHue * i;
            //the second parameter, set to 1 here, is the saturation
            // the third parameter is "lightness"    
            rgbString = d3.hsl(theHue, 1, 0.6).toString();
            opacity = opacityStart + deltaOpacity * i;
            p = 0 + deltaPercent * i;
            theData.push({ "rgb": rgbString, "opacity": opacity, "percent": p });
        }

        //now the d3 magic (imo) ...
        var stops = d3.select('#' + idGradient).selectAll('stop')
            .data(theData);

        stops.enter().append('stop');
        stops.attr('offset', function (d) {
            return d.percent;
        })
            .attr('stop-color', function (d) {
                return d.rgb;
            })
            .attr('stop-opacity', function (d) {
                return d.opacity;
            });

    },
    update(newValue, oldVal) {
        if (!newValue) return;
        var data = newValue;
        var self = this;
        var svg, xScale, yScale, widthScale, rScale, w, h, padding;

        w = this.params.config.width;
        h = this.params.config.height;
        padding = 100;

        var mappedNodes = {};
        data.nodes.forEach(function (d) {
            mappedNodes[d.id] = d;
        })

        this.mappedNodes = mappedNodes;

        xScale = d3.scale.linear()
            .domain(d3.extent(data.nodes, function (d) { return d.x; }))
            .range([padding, w - padding]);
        yScale = d3.scale.linear()
            .domain(xScale.domain())
            .range([padding, h - padding]);
        rScale = d3.scale.linear()
            .domain(d3.extent(data.nodes, function (d) { return d.size; }))
            .range([2, 11]);
        widthScale = d3.scale.linear()
            .domain(d3.extent(data.edges, function (d) { return d.size; }))
            .range([0.1, 4]);

        svg = this.svg ? this.svg : d3.select(this.el).append('svg');
        svg.selectAll('g.social-network').remove();
        svg.attr("width", w)
            .attr("height", h);
        svg = svg.append('g').attr('class', 'social-network');
        svg.selectAll('.edge')
            .data(data.edges).enter()
            .append('path')
            .attr("class", function (d) {
                var code = self.vm.countrycode;
                if (code === '-') return 'edge';
                if (code) {
                    if (mappedNodes[d.source].code3 === code &&
                        mappedNodes[d.target].code3 === code
                        ) return 'edge';

                    return 'opacityedge edge'

                } else {
                    return 'edge';
                }
            })
            .attr('d', function (d) {
                var r = (xScale(mappedNodes[d['target']].x) - xScale(mappedNodes[d['source']].x)) * (xScale(mappedNodes[d['target']].x) - xScale(mappedNodes[d['source']].x));
                r = r + (yScale(mappedNodes[d['target']].y) - yScale(mappedNodes[d['source']].y)) * (yScale(mappedNodes[d['target']].y) - yScale(mappedNodes[d['source']].y));
                r = Math.sqrt(r) * 2;
                var path = "M" + xScale(mappedNodes[d['source']].x) + "," + yScale(mappedNodes[d['source']].y);
                path = path + "A" + r + "," + r + " 0 0 1";
                path = path + xScale(mappedNodes[d['target']].x) + "," + yScale(mappedNodes[d['target']].y);
                return path;
            })
            .style("fill", "none")
            .style("stroke-width", function (d) { return widthScale(d.size) })
            .style("stroke", function (d) { return d.color });

        svg.selectAll(".node")
            .data(data.nodes).enter()
            .append("circle")
            .attr("class", function (d) {
                var code = self.vm.countrycode;
                if (code === '-') return 'node';
                if (code) {
                    if (d.code3 === code) {
                        return 'node';
                    }
                    return 'opacitynode node';
                } else {
                    return 'node';
                }
            })
            .attr("cx", function (d) {
                return xScale(d.x);
            })
            .attr("cy", function (d) {
                return yScale(d.y);
            })
            .attr("r", function (d) {
                return rScale(d.size);
            })
            .attr("fill", function (d) {
                return d.color === '#CCC' ? '#888' : d.color;
            })
            .on("mouseover", function (d) {
                var selectedNodes = [];
                svg.selectAll(".edge")
                    .filter(function (dd) {
                        if (dd.source == d.id || dd.target == d.id) {
                            selectedNodes.push(dd.source);
                            selectedNodes.push(dd.target);
                            return null;
                        } else {
                            return this;
                        }
                    })
                    .attr('opacity', "0.1");

                svg.selectAll(".node")
                    .filter(function (dd) {
                        return selectedNodes.indexOf(dd.id) >= 0 ? null : this;
                    })
                    .attr('opacity', "0.1")

                d3.select(this)
                    .append('svg:title')
                    .append('class', 'hint')
                    .text(function (d) {
                        return d.code3;
                    })
            })
            .on("mouseout", function (d) {
                svg.selectAll(".edge")
                    .attr('opacity', "1");
                svg.selectAll(".node")
                    .attr('opacity', "1");
            })
            .on("click", function (d) {
                communicator(self.vm).emitGraphUsername([d.id, d.username]);
            });
    },
    paramWatchers: {
        countrycode: function (newVal, oldVal) {
            var svg = this.svg;
            if (!svg) return;
            var mappedNodes = this.mappedNodes;

            svg.selectAll('path.edge')
                .attr("class", function (d) {
                    var code = newVal;
                    if (code === '-') return 'edge';
                    if (code) {
                        if (mappedNodes[d.source].code3 === code &&
                            mappedNodes[d.target].code3 === code
                            ) return 'edge';
                        return 'edge opacityedge'

                    } else {
                        return 'edge';
                    }
                })
            ;

            svg.selectAll('circle.node')
                .attr("class", function (d) {
                    var code = newVal;
                    if (code === '-') return 'node';
                    if (code) {
                        if (d.code3 === code) {
                            return 'node';
                        }
                        return 'node opacitynode';
                    } else {
                        return 'node';
                    }
                })
            ;

        }
    }
}