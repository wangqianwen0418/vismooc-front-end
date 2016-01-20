<template>

    <div id="flowmap-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="flowmap-modal-label" aria-hidden="true">
        <div class="modal-dialog modal-more-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
                    <h3 id="flowmap-modal-label" class="modal-title">Course Information</h3>
                </div>

                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-4 column">
                            <div id="flow-moocVideo-container">
                                <video id="flow-moocVideo" class="video-js vjs-16-9 vjs-default-skin  vjs-big-play-centered" controls></video>
                            </div>
                        </div>

                        <div class="col-md-8 column">
                            <div class="row">
                                <div class="col-md-12 column">
                                    <div class="peak-flowmap-container">
                                        <div id="peak-flowmap"> </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-12 column">
                                    <div id="flow-stacked-area-graph">
                                        <svg v-nvd3stackchart="chartData" :course-id="selectedCourseId" :config="chartConfig"></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Close</button>
                </div>
            </div>
        </div>
    </div>

    <!--Button-->
    <div v-show="courseId!=-1" class="statisitc-icon" @click="RenderStackAreaChart()" data-toggle="modal" data-target="#flowmap-modal">
        <span class="fa fa-bolt"></span>
        <br/>Flowmap
    </div>

</template>


<script>
    //CSS
    import "video.js/dist/video-js.min.css";
    //js
    import videojs from 'video.js';
    import d3 from 'd3';
    import Datamap from 'datamaps';
    //service
    import dataManager from '../service/datamanager.js';
    import communicator from '../service/communicator.js';
    //directives
    import NvD3StackChart from '../directive/nvd3StackChart.js';
    
    export default {
        directives:{
            nvd3stackchart:NvD3StackChart
        },
        ready(){
            this.complexObject = {};
            //select the modal then append it to the last of <body>
            $("#flowmap-modal").appendTo("body");
        
            Array.prototype.aggregate =  function(num){
                var length =  this.length;
                var newArray = [];
                var sum = 0;
                for (var i = 0 ; i < length; i++){
                    sum += this[i];
                    if ((i+1) % num == 0) {
                    newArray.push(sum / num);
                    sum = 0;
                    }
                }
                if (length % num !=0) newArray.push(sum/length%num);
                return newArray;
            };
            
            this.windowHeight = window.innerHeight;

            
            //init colors
            this.colors = d3.scale.ordinal()
                .range(['#1f77b4', '#fdae6b', '#2ca02c', '#d62728', '#9467bd','#8c564b'])
                .domain(['seeked','pause','play','stalled','error','ratechange'])
            ;
            
            communicator(this).onChangeCourse((courseId)=>{
                this.courseId = courseId;
            });
            
            // draw stacked graph over
            communicator(this).onChangeVideo((videoInfo)=>{
                if(videoInfo){
                    this.videoId = videoInfo.videoId;
                    this.videoLength = videoInfo.videoLength + 1;
                    this.videoSource['src'] = videoInfo.videoSource;
                    
                    if(!this.player){
                        this.player = videojs('flow-moocVideo',this.videoConfig);
                    }
                    this.player.src(this.videoSource);
                    
                    this.startTime = 0;
                    this.endTime = this.videoLength;
                    dataManager.getAnimationTest(this.courseId, this.videoId,this.startTime,this.endTime,this.callFunc);
                    dataManager.getActionCountInfo(this.courseId, this.videoId, this.processData);
                }
            });
            
        },
        data(){
            return{
                courseId:-1,
                videoId:-1,
                windowHeight:"",

                startTime:0,
                endTime:3,
                clickAttackData:[],
                
                colors:null,
                chartData:null,
                chartDataCache:null,
                chartConfig:{
                    type: 'stackedAreaChart',
                    height: 300,
                    width:635,
                    margin : {
                        top: 20,
                        right: 0,
                        bottom: 60,
                        left: 80
                    },
                    x: function(d){return d.x;},
                    y: function(d){return d.y;},
                    useVoronoi: false,
                    clipEdge: true,
                    duration: 500,
                    useInteractiveGuideline: true,
                    xAxis: {
                        showMaxMin: false,
                        tickFormat: function(d) {
                            var sec=d%60;
                            var min=Math.floor(d/60);
                            if(sec===0){
                                sec='00';
                            }
                            return d3.time.format(min+'\''+sec+'\"');
                        }                               
                    },
                    yAxis: {
                        tickFormat: function(d){
                            return d;
                        }
                    }
                },
                
                player:null,
                videoSource: {src:null, type: "video/mp4"},
                videoConfig: {
                    controls: true,
                    preload: "none",
                },
                videoLength:0
            };
        },
        complexObject:{
            map:null,
            svg:null,
            flow:null
        },
        methods:{
            createMap(){
                var datas = this.clickAttackData;
     
                var self = this;
                var height = 300,
                    width = 635;
                
                //TODO
                var geoData = {};
                
                var videoLength = datas[0];
                var clickArray = datas[1];
                var max = 0;
                for(var i = 0,len = clickArray.length; i < len; ++i){
                    var countryName = clickArray[i].code3;
                    if(!geoData[countryName]){
                        geoData[countryName] = {id:countryName,count:0,fillColor:""};
                    }
                    geoData[countryName].count += clickArray[i].count;
                    if(geoData[countryName].count > max) max = geoData[countryName].count;
                }

                //set the color range
                var color = d3.scale.linear().range(['#ffffe5', '#41ab5d']).domain([0, Math.log(max+1)]);
                for(var p in geoData){
                    geoData[p].fillColor = color(Math.log(geoData[p].count));
                }
                
                if(!this.complexObject.map){
                    this.complexObject.map = new Datamap({
                        element: document.getElementById('peak-flowmap'),
                        height: height, width: width,
                        fills: {
                            defaultFill: '#ffffe5'
                        },
                        geographyConfig:{ 
                            borderColor: '#dddddd'
                        },
                        data:geoData
                    });
                    this.complexObject.svg = this.complexObject.map.svg;
                }

                if(!this.complexObject.flow){
                    height = 400;
                    this.complexObject.svg.attr('height',height);
                    this.complexObject.flow = this.complexObject.svg.append('g').attr('class','flow-map-flow');
                    
                    var timeaxisScale = d3.time.scale()
                        .domain([new Date(0), new Date(videoLength * 1000)])
                        .rangeRound([0, width]);
                        
                    var brush = d3.svg
                            .brush()
                            .x(timeaxisScale)
                            .on('brushend',function(){
                                var extent = brush.extent();
                                var startTime = Math.round(extent[0].getTime()/1000);
                                var endTime = Math.round(extent[1].getTime()/1000);
                                dataManager.getAnimationTest(self.courseId,self.videoId,startTime,endTime,self.callFunc);
                            });
                    ; 
                    this.complexObject.flow.append("g")
                        .attr("class", "x brush")
                        .call(brush)
                        .selectAll("rect")
                        .attr("y", height - 90)
                        .attr("height", 35);
                            
                    var xAxis = d3.svg.axis()
                        .scale(timeaxisScale)
                        .orient('top')
                        .tickSize(0);

                    var axisSelector =  this.complexObject.flow.append('g')
                        .attr('class', 'axis')
                        .attr('transform', 'translate(0, ' + (height - 60) + ')')
                        .call(xAxis);
                  
                    axisSelector.select('path')
                        .style('fill', 'none')
                        .style('stroke', '#a9a9a9')
                        .style('stroke-width', '2')
                        .style("stroke-dasharray", ("2, 4"))
                        .style('shape-rendering', 'crispEdges');
                }
              
            },
            upDateMapAndFlow(){
                //TODO
                var geoData = {};
                var clickArray = this.clickAttackData[1];
                var max = 0;
                for(var i = 0,len = clickArray.length; i < len; ++i){
                    var countryName = clickArray[i].code3;
                    if(!geoData[countryName]){
                        geoData[countryName] = {id:countryName,count:0,fillColor:""};
                    }
                    geoData[countryName].count += clickArray[i].count;
                    if(geoData[countryName].count > max) max = geoData[countryName].count;
                }

                //set the color range
                var color = d3.scale.linear().range(['#ffffe5', '#41ab5d']).domain([0, Math.log(max+1)]);
                for(var p in geoData){
                    if(geoData.hasOwnProperty(p))
                        geoData[p].fillColor = color(Math.log(geoData[p].count));
                }
                
                this.complexObject.map.updateChoropleth(geoData);
  
                var videoLength = this.clickAttackData[0];
                var flowData = this.clickAttackData[1];
                var height = 300;
                var width = 635;
                
                var svg = this.complexObject.flow;
                
                //clear previous svg
                svg.selectAll("path.flow").remove();
                svg.selectAll("circle.flow").remove();       
                
                var timelinePos = 400  - 60,
                    pathColor = "#FE7E13",
                    pathOpacity = 0.4,
                    pathWidth = 0.5,
                    circleRadius = 1000,
                    outerCircleOpacity = 0.4,
                    innerCircleOpacity = 1,
                    outerCircleColor = "#d73027",
                    innerCircleColor = "#FE7E13";

                var temporalCount = [];
                for (var i = 0; i < videoLength; i++) {
                    temporalCount.push({'click': 0, 'people': 0});
                }

                var geoCoorCalculate = function(longitude, latitude) {
                    var coor = {};
                    coor.x = longitude * width;
                    coor.y = latitude * 250 + 40;
                    return coor;
                }

                var countryTop = ['USA', 'CHN', 'GBR', 'CAN', 'DEU', 'BRA', 'ESP', 'AUS', 'FRA', 'IND', 'RUS'];
                var countryMax = {};
                for (var j = 0; j < countryTop.length; j++) {
                    countryMax[countryTop[j]] = {
                        clickNum: 0,
                        userNum: 0,
                        longitude: 0,
                        latitude: 0
                    };
                }

                for (var i = 0,len = flowData.length; i < len ; i++) {
                    if (countryTop.indexOf(flowData[i].code3) < 0) continue;
                    var radius = Math.log(flowData[i].count * pathWidth);
                    countryMax[flowData[i].code3].clickNum += flowData[i].count;
                    countryMax[flowData[i].code3].userNum++;
                    countryMax[flowData[i].code3].longitude = flowData[i].longitude;
                    countryMax[flowData[i].code3].latitude = flowData[i].latitude;
                    temporalCount[flowData[i].startTime].people++;
                    temporalCount[flowData[i].startTime].click += flowData[i].count;
                    if (radius < 1) radius = 1;

                    var bCurveCo = 0.1;
                    var p1 = geoCoorCalculate(flowData[i].longitude, flowData[i].latitude);
                    var p2 = {x: (flowData[i].startTime) / videoLength * width, y: timelinePos - 4};
                    var p3 = {x: 0.5 * ( p1.x + p2.x), y: height };
                    var cp1 = {x: p1.x, y: bCurveCo * p1.y + (1 - bCurveCo) * p3.y};
                    var cp2 = {x: (1 - bCurveCo) * p1.x + bCurveCo * p3.x, y: p3.y};
                    var cp3 = {x: bCurveCo * p3.x + (1 - bCurveCo) * p2.x, y: p3.y};
                    var cp4 = {x: p2.x, y: (1 - bCurveCo) * p3.y + bCurveCo * p2.y};

                    var pathStr = 'M' + p1.x + ',' + p1.y + ' C'
                                    + cp1.x + ',' + cp1.y + ' '
                                    + cp2.x + ',' + cp2.y + ' '
                                    + p3.x + ',' + p3.y + ' C'
                                    + cp3.x + ',' + cp3.y + ' '
                                    + cp4.x + ',' + cp4.y + ' '
                                    + p2.x + ',' + p2.y;

                    svg.append("path")
                        .attr("class", "flow")
                        .attr("d", pathStr)
                        .style("stroke", pathColor)
                        .style("stroke-width", radius)
                        .style("fill", "none")
                        .style("opacity", pathOpacity);
                }

                for (var i = 0; i < countryTop.length; i++) {
                    var geoCoorTemp = geoCoorCalculate(countryMax[countryTop[i]].longitude, countryMax[countryTop[i]].latitude);
                    radius = Math.log(countryMax[countryTop[i]].clickNum * circleRadius);
                    if (radius < 0.1) radius = 0.1;
                    svg.append("circle")
                        .attr('class','flow')
                        .attr("r", radius)
                        .style("fill", outerCircleColor)
                        .attr("cx", geoCoorTemp.x)
                        .attr("cy", geoCoorTemp.y)
                        .attr("opacity", outerCircleOpacity);

                    radius = Math.log(countryMax[countryTop[i]].userNum * circleRadius);
                    if (radius < 0.1) radius = 0.1;
                    svg.append("circle")
                        .attr('class','flow')
                        .attr("r", radius)
                        .style("fill", innerCircleColor)
                        .attr("cx", geoCoorTemp.x)
                        .attr("cy", geoCoorTemp.y)
                        .attr("opacity", innerCircleOpacity);
                }
                
            },
            callFunc(response){
                this.clickAttackData = [];
                this.clickAttackData.push(this.videoLength);    //1
                this.clickAttackData.push(response.data);       //2
          
                this.createMap();
                this.upDateMapAndFlow();
            },
            processData(response){
                var data = response.data;
                var colors = this.colors;
                if (!data.clicks) return;
                this.chartDataCache = data.clicks.map(function (dat) {
                    var length = dat.data.length;
                    var result = dat.data.slice(3, length - 3)
                        .aggregate(3)
                        .map(function (dd, i) {
                            return {
                                x: i * 3,
                                y: Math.floor(dd)
                            };
                        });
                    return {
                        key: dat.type,
                        values: result,
                        color: colors(dat.type)
                    };
                });
            },
            RenderStackAreaChart(){
                //Can't be render in the right way when some of it's parent's display is none
                var self = this;
                setTimeout(function(){
                    self.chartData = self.chartDataCache;
                },300)
            }
        }
        
    }

</script>


<style>

</style>