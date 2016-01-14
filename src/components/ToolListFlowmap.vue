<template>

    <div id="flowmap-modal" class="modal fade" tabindex="-1" :style="{height:windowHeight+'px'}" role="dialog" aria-labelledby="flowmap-modal-label"
    aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
                    <h3 id="flowmap-modal-label" class="modal-title">Course Information</h3></div>
                <div class="modal-body">

                    <div class="row clearfix">
                        <div class="col-md-4 column">
                            <div id="videoflow" class="videogular-container" style="margin: 0 5% 0 5%; width: 90%; height: 200px">
                                 <video id="flow-moocVideo" class="video-js vjs-16-9 vjs-default-skin  vjs-big-play-centered" controls></video>
                            </div>
                        </div>
                        <div class="col-md-8 column">
                            <div class="row clearfix">
                                <div class="col-md-12 column">
                                    <div class="peak_flowmap">
                                        <div class="peak_flowmap_container" id="flowmap_container">
                                            <div style="width: 100%; height:100%" id="flowmap_whole">
                                                <div class="peak_flowmap_map">
                                                    <div map data="ClickAttackData"></div>
                                                </div>
                                                <div class="peak_flowmap_flow">
                                                    <div staticmap data="ClickAttackData"></div>
                                                </div>
                                                <div class="flowmapin">
                                                    <input id="flowmapInput" type="range" min="0" max="{{videoLength}}" step="3" value="0" class="ng-valid ng-dirty" ng-model="videoTime"
                                                    ng-mousemove="moveRes()" ng-mousedown="mouseDownRes()" ng-mouseup="mouseUpRes()">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row clearfix">
                                <div class="col-md-12 column">
                                    <div v-show="chartData" id="flow-stacked-area-graph" >
                                        <svg v-nvd3stackchart="chartData" :course-id="selectedCourseId" :config="chartConfig" ></svg>
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
    <div v-show="courseId!=-1" class="statisitc-icon" data-toggle="modal" data-target="#flowmap-modal">
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
                    this.startTime = 0;
                    this.endTime = 3;
                    //this.$$childHead.videoTime = 0;
                    dataManager.getAnimationTest(this.videoId,this.startTime,this.endTime,this.callFunc);
                    dataManager.getActionCountInfo(this.courseId, this.videoId, this.processData);
                }
            });
            
            
        },
        data(){
            return{
                courseId:-1,
                videoId:-1,
                windowHeight:"",

                brushStart : false,
                isBrush : false,
                isFinished : false,
                startTime:0,
                endTime:3,
                ClickAttackData:[],
                
                color:null,
                chartData:null,
                chartConfig:{
                    type: 'stackedAreaChart',
                    height: 300,
                    width: 794.3,
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
                    transitionDuration: 500,
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
                
                videoSource: {src:null, type: "video/mp4"},
                videoConfig: {
                    controls: true,
                    preload: "none",

                },
            };
        },
        methods:{
            mouseUpRes(){
                var endTime = this.videoTime;
                var startTime;
                this.isFinished = true;
                if(!isBrush){
                    startTime = endTime;
                    endTime = (+startTime) + 3;
                }
                if((+endTime) < (+startTime)){
                    var temp = endTime;
                    endTime = startTime;
                    startTime = temp;
                }
                if((+endTime) < (+startTime) + 3) endTime = (+startTime) + 3;
                
                dataManager.getAnimationTest(this.videoId,startTime,endTime,this.callFunc);
                this.isBrush =false;
                this.brushStart = false;
                
                //TODO video API
                //this.videogularAPI.seekTime(startTime);
            },
            moveRes(){
                if(brushStart){
                    this.isBrush = true;
                    this.endTime = this.videoTime;
                    this.ClickAttackData = [];
                    this.ClickAttackData.push(this.courseId);
                    this.ClickAttackData.push(this.videoLength);
                    this.ClickAttackData.push(this.isBrush);
                    this.ClickAttackData.push(this.isFinished);
                    this.ClickAttackData.push(this.startTime);
                    this.ClickAttackData.push(this.endTime);
                }
            },
            mouseDownRes(){
                this.startTime = this.videoTime;
                this.isFinished = false;
                this.brushStart =true;
            },
            callFunc(response){
                this.ClickAttackData = [];
                this.ClickAttackData.push(this.courseId);
                this.ClickAttackData.push(this.videoLength);
                this.ClickAttackData.push(this.isBrush);
                this.ClickAttackData.push(this.isFinished);
                this.ClickAttackData.push(this.startTime);
                this.ClickAttackData.push(this.endTime);
                this.ClickAttackData.push(response.data);
            },
            processData(response){
                var data = response.data;
                var colors = this.colors;
                if (!data.clicks) return;
                this.chartData = data.clicks.map(function (dat) {
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
            }
        }
        
    }
</script>