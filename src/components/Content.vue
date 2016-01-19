<template>

    <div id="content">
        <div v-show="videoSource.src" style="width:100%; z-index:-1">
            <video id="moocVideo" class="video-js vjs-16-9 vjs-default-skin  vjs-big-play-centered" controls></video>
        </div>
            
        <div v-show="seekData" id="seekline-graph">
            <canvas v-seekline="seekData" 
            style="height: 200px; left:0; z-index:1; width:100% "> </canvas>
        </div>

        <div v-show="chartData" id="stacked-area-graph" >
            <svg v-nvd3stackchart="chartData" :course-id="selectedCourseId" :config="chartConfig" ></svg>
        </div>
    </div>


</template>


<script>
    //CSS
    import 'nvd3/build/nv.d3.min.css';
    import "video.js/dist/video-js.min.css";
    //js
    import videojs from 'video.js';
    import d3 from 'd3';
    //service
    import dataManager from '../service/datamanager.js';
    import communicator from '../service/communicator.js';
    //directives
    import SeekLine from '../directive/seekLine.js' 
    import NvD3StackChart from '../directive/nvd3StackChart.js';
    
    export default {
        directives:{
            seekline:SeekLine,
            nvd3stackchart:NvD3StackChart
        },
        ready() {
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

            //init colors
            this.colors = d3.scale.ordinal()
                .range(['#1f77b4', '#fdae6b', '#2ca02c', '#d62728', '#9467bd','#8c564b'])
                .domain(['seeked','pause','play','stalled','error','ratechange'])
            ;
            
            communicator(this).onChangeVideo((videoInfo) => {
                if (videoInfo) {
                    this.videoID = videoInfo.videoId;
                    this.currentTime = videoInfo.currentTime;
                    this.videoSource['src'] = videoInfo.videoSource;
                    this.setData(videoInfo.videoId);

                    if(!this.player){
                        this.player = videojs('moocVideo',this.videoConfig);
                    }
                    this.player.src(this.videoSource);
                }
            });

            communicator(this).onChangeCourse((courseId) => {
                if (courseId) {
                    this.selectedCourseId = courseId;
                }
            });
            
            communicator(this).onFilterCountry((countryID) => {
                if (countryID) {
                    this.country = countryID;
                    this.setData(this.videoID, { country: countryID });
                }
            });

            communicator(this).onFilterDate((period) => {
                if (period) {
                    this.period = period;
                    this.setData(this.videoID, { startTime: period.startDate,endTime:period.endDate });
                }
            });

        },
        data() {

            return {
                player:null,
                videoSource: {src:null, type: "video/mp4"},
                videoConfig: {
                    controls: true,
                    preload: "none",

                },
                chartConfig:{
                        type: 'stackedAreaChart',
                        height: 300,
                        margin : {
                            top: 60,
                            right: 0,
                            bottom: 40,
                            left: 40
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
                

                selectedCourseId: -1,
                videoID: -1,
                period: {}, //startDate:string,endDate:string
                
                currentTime: 0,
                durationTime: 0,
                
                country: "",    ///???
                selectedFreq: 0,///???
                mouseCount: 0,  //???
                threshold: 30,  ///???

                chartData:null,
                seekData:null,
                weeks:null,
                
                dynamicHeight:0,//???
                
                colors:null,
            }
        },
        

        
        methods: {

            getWeeks(seekData) {
                var ret = {};
                for (var i = 0, len = seekData.length; i < len; i++) {
                    var tempKey = '' + seekData[i].week;
                    if (!ret.hasOwnProperty(tempKey)) {
                        ret[tempKey] = 1;
                    } else {
                        ret[tempKey]++;
                    }
                }
                return ret;
            },
            processData(response) {
                var data = response.data;
                var colors = this.colors;
                if (data.clicks){
                    var data = data.clicks.map(function (dat) {
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
                    this.chartData = data;
                }
            },
            
            addMouseDown() {
                this.isMouseOn = false;
                console.log("mouse down")
            },
            addMouseUp() {
                this.mouseCount++;
                this.isMouseOn = true;
                console.log("mouse up")
            },
            
            processSeekData(response) {
                var barHeight = 40;
                var barMargin = 10;

                this.seekData = response.data;
                this.mouseCount++;

                var weeks = this.getWeeks(this.seekData);
                this.weeks = weeks;
                var textHeight = Object.keys(weeks).length;

                this.dynamicHeight = (barHeight + barMargin) * 2 * (textHeight);
            },
                  
            setData(videoID, filter) {              
                dataManager.getActionCountInfo(this.selectedCourseId,videoID,filter,this.processData);
                dataManager.getSeekInfo(this.selectedCourseId, videoID,filter ,this.processSeekData);
            }

        }
    }

</script>


<style>

/* main view, middle part*/
#content {
	position: absolute;
	width: 94%;
	margin-left: 2%;
}

#seekline-graph {

}

#stacked-area-graph {
    width: calc(100% + 40px);
}

/* video*/
.video-js.vjs-default-skin.vjs-paused .vjs-big-play-button {
    display:block !important;
}

.video-container {
    width: 100%;
    height: 320px;
    margin: auto;
    overflow: hidden;
}

</style>