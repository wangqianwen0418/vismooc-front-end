import d3 from 'd3';

export default {
    params: ['config'],
    bind() {

    },
    update(newVal, oldVal) {
        if (!newVal) return;
        var graph = newVal;
        var self = this;
        var outerWidth = this.params.config.width;
        var outerHeight = this.params.config.height;
        var margin = { top: 50, right: 50, bottom: 50, left: 50 };
        var width = outerWidth - margin.left - margin.right,
            height = outerHeight - margin.top - margin.bottom;

        var svg = d3.select(this.el)
            .attr('width', outerWidth)
            .attr('height', outerHeight)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var coordinate = graph.coordinate;
        var nodes = graph.nodes;
        var peakBasicInfo = graph.peakBasicInfo;
        var videoListHash = this.vm.videoListHash;
        var peaks = graph.peaks;

        var xdomain = d3.extent(coordinate, function (d) { return d[0]; });
        var ydomain = d3.extent(coordinate, function (d) { return d[1]; });

        var x = d3.scale.linear().range([0, width]).domain(xdomain);
        var y = d3.scale.linear().range([0, height]).domain(ydomain);

        coordinate.forEach(function (d) {
            d[0] = x(d[0]);
            d[1] = y(d[1]);
        });


        var preventOverlap = function (coordinate, radius, times, rate) {
            var t = times == undefined ? 3 : times;
            var r = rate == undefined ? 1 : rate;
            var overlaps = 0;
            var items = coordinate;
            var count = 0;
            while (count < t) {
                for (var i = 0; i < items.length - 1; i++) {

                    for (var j = i + 1; j < items.length; j++) {
                        var dx = items[i][0] - items[j][0];
                        var dy = items[i][1] - items[j][1];
                        var dd = Math.sqrt(dx * dx + dy * dy);
                        if (dd < (2 * radius)) {
                            overlaps++;
                            var l = radius - dd / 2;
                            var xx = l * (dx / dd);
                            var yy = l * (dy / dd);

                            items[i][0] = items[i][0] + xx;
                            items[i][1] = items[i][1] + yy;
                            items[j][0] = items[j][0] - xx;
                            items[j][1] = items[j][1] - yy;

                            overlaps++;
                        }
                    }
                }
                count++;
            }
        };

        var glyph = function (svg) {
            console.log(this);
            console.log(svg);
            svg.append("title")
            .text(function (d, i) { return i; })
            var peak = peaks[peak];
            var rbWidth = 20,
                rbHeight = 20,
                plotSize = 5,
                barOffset = 5,
                width = peak.actionWidth,
                height = peak.actionHeight,
                rightBarRectPosition = peak.videoWeekPosition,
                bottomBarRectPosition = peak.actionPosition,
                grade = peak.grade,
                anomaly = peak.anomaly;

            var color = d3.scale.linear().range(['#fff7fb', '#014636']);
            color.domain([0, 1]);

            var svg = d3.select([0])
                .attr('width', width)
                .attr('height', height);

            // drawRect
            var rectWidth = width - rbWidth,
                rectHeight = height - rbHeight;

            var rect = svg.append('g')
                .attr('transform', 'translate(1, 1)');

            rect.append('rect')
                .attr('width', rectWidth)
                .attr('height', rectHeight)
                .attr('x', -rectWidth / 2)
                .attr('y', -rectHeight / 2)
                .style('stroke', '#251818')
                .style('stroke-width', 1)
                .style('fill', 'none');

            //draw grade
            var h = 0;
            var gradeColor = ["#2DA464", "#9CCF70", "#DBE697", "#FAE195", "#F6986A", "#DB453D"];
            for (var i = 0; i < grade.length; i++) {
                h += grade[i] * rectWidth;
                rect.append("rect")
                    .attr('x', rectWidth / 2 - h)
                    .attr('y', -rectHeight / 2)
                    .attr('width', grade[i] * rectWidth)
                    .attr('height', rectHeight)
                    .style("fill", gradeColor[i])
                    .style('stroke-width', 0);
            }

            //draw anomaly line
            rect.append('line')
                .attr('x1', 0 - rectWidth / 2)
                .attr('y1', -anomaly * rectHeight + rectHeight / 2)
                .attr('x2', rectWidth / 2)
                .attr('y2', -anomaly * rectHeight + rectHeight / 2)
                .style('stroke', '#000000')
            //.style('stroke', '#3E3838')
                .style('stoke-width', 1);

            // drawrightBar
            var rightBar = svg.append('g')
                .attr('transform', 'translate(1, 1)');

            rightBar.append('line')
                .attr('x1', rectWidth / 2 + barOffset)
                .attr('y1', -rectHeight / 2)
                .attr('x2', rectWidth / 2 + barOffset)
                .attr('y2', rectHeight / 2)
                .style('stroke', 'rgb(99,99,99)')
                .style('stoke-width', 1);

            rightBar.append('rect')
                .attr('x', rectWidth / 2 + barOffset - plotSize / 2)
                .attr('y', rightBarRectPosition * rectHeight - rectWidth / 2)
                .attr('width', plotSize)
                .attr('height', plotSize)
                .style('fill', 'blue')
                .style('stroke-width', 0)
                .style('fill-opacity', 0.8);

            // drawtbottomBar
            var bottomBar = svg.append('g')
                .attr('transform', 'translate(1,1)');

            bottomBar.append('line')
                .attr('x1', -rectWidth / 2)
                .attr('y1', rectHeight / 2 + barOffset)
                .attr('x2', rectWidth / 2)
                .attr('y2', rectHeight / 2 + barOffset)
                .style('stroke', 'rgb(99,99,99)')
                .style('stoke-width', 1);

            bottomBar.append('rect')
                .attr('x', bottomBarRectPosition * rectWidth - rectWidth / 2)
                .attr('y', rectHeight / 2 + barOffset - plotSize / 2)
                .attr('width', plotSize)
                .attr('height', plotSize)
                .style('fill', 'blue')
                .style('stroke-width', 0)
                .style('fill-opacity', 0.8);
        };


      

        preventOverlap(coordinate, 35, 30);

        var selection = svg.append('g').selectAll(".graphnode")
            .data(peaks)
            .enter().append("g")
            .attr('transform', function (d, i) { return 'translate(' + coordinate[i][0] + ', ' + coordinate[i][1] + ')'; })
            .attr("class", function (d, i) { return "graphnode peak" + i; })
            .on("click", function (d, i) {
                videoListHash[peakBasicInfo[i].videoId].currentTime = peakBasicInfo[i].currentTime;
                self.vm.mdsGlyphChangeVideo(videoListHash[peakBasicInfo[i].videoId]);
            })
            .call(glyph);
       

    }

}