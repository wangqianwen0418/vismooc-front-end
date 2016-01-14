<template>

    <div id="flowmap-modal" class="modal fade" tabindex="-1" style="width:75%; height:{{windowHeight}}px" role="dialog" aria-labelledby="flowmap-modal-label"
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
                                <videogular vg-player-ready="onPlayerReady($API)" vg-theme="config.theme.url">
                                    <vg-media vg-src="config.sources" vg-tracks="config.tracks"></vg-media>
                                    <vg-controls vg-autohide="config.plugins.controls.autoHide" vg-autohide-time="config.plugins.controls.autoHideTime" style="bottom: 0;">
                                        <vg-scrub-bar>
                                            <vg-scrub-bar-current-time></vg-scrub-bar-current-time>
                                        </vg-scrub-bar>
                                    </vg-controls>
                                    <vg-overlay-play></vg-overlay-play>
                                </videogular>
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
                                    <div id="flow_stacked_id">
                                        <nvd3 options="multiChartOptions" data="multiChartdata"></nvd3>
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
        //service
    import dataManager from '../service/datamanager.js';
    import communicator from '../service/communicator.js';
    
    
    export default {
        ready(){
            //select the modal then append it to the last of <body>
            $(this.$el.nextElementSibling).appendTo("body");
        
            this.mainPath = window.location.pathname;
            //init colors
            this.colors = d3.scale.ordinal()
                .range(['#1f77b4', '#fdae6b', '#2ca02c', '#d62728', '#9467bd','#8c564b'])
                .domain(['seeked','pause','play','stalled','error','ratechange'])
            ;
            
            communicator.onChangeCourse($scope, function(courseID){
                $scope.courseId = courseID;
            });
            
            // draw stacked graph over
            communicator.onChangeVideo($scope, function(videoInfo){
                $scope.videoId = videoInfo.videoId;
                $scope.videoLength = videoInfo.videoLength + 1;
                $scope.$$childHead.videoTime = 0;
                $scope.config.sources = [
                {src: $sce.trustAsResourceUrl(videoInfo.videoSource), type: "video/mp4"},
                {src: $sce.trustAsResourceUrl(videoInfo.videoSource), type: "video/webm"},
                {src: $sce.trustAsResourceUrl(videoInfo.videoSource), type: "video/ogg"}
                ];
                startTime = 0;
                endTime = 3;
                getServerData(videoId, startTime, endTime, callFunc);
                dataManager.getActionCountInfo($scope.courseId, videoInfo.videoId, processData);
            });
            
            
        },
        data(){
            return{
                courseId:-1,
                videoId:-1,
                windowHeight:$(window).height(),
                mainPath:"",
                startTime:0,
                endTime:3,
                brushStart : false,
                isBrush : false,
                isFinished : false,
                getURL:"",
                color:null,
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
                videoConfig:{
                    preload: "none",
                    sources: [
                        {src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.mp4"), type: "video/mp4"},
                        {src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.webm"), type: "video/webm"},
                        {src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.ogg"), type: "video/ogg"}
                    ],
                    theme: {
                        url: "lib/videogular-themes-default/videogular.css"
                    },
                    plugins: {
                        controls: {
                            autoHide: true,
                            autoHideTime: 2000
                        }
                    }
                }
            };
        },
        methods:{
            mouseUpRes(){
                videoId = $scope.videoId;
                endTime = this.videoTime;
                isFinished = true;
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
                getServerData(videoId, startTime, endTime, callFunc);
                isBrush =false;
                brushStart = false;
                console.log(startTime);
                $scope.videogularAPI.seekTime(startTime);
            },
            moveRes(){
                if(brushStart){
                    isBrush = true;
                    endTime = this.videoTime;
                    $scope.ClickAttackData = [];
                    $scope.ClickAttackData.push($scope.courseId);
                    $scope.ClickAttackData.push($scope.videoLength);
                    $scope.ClickAttackData.push(isBrush);
                    $scope.ClickAttackData.push(isFinished);
                    $scope.ClickAttackData.push(startTime);
                    $scope.ClickAttackData.push(endTime);
                }
            },
            mouseDownRes(){
                startTime = this.videoTime;
                isFinished = false;
                brushStart =true;
            },
            callFunc(data){
                $scope.ClickAttackData = [];
                $scope.ClickAttackData.push($scope.courseId);
                $scope.ClickAttackData.push($scope.videoLength);
                $scope.ClickAttackData.push(isBrush);
                $scope.ClickAttackData.push(isFinished);
                $scope.ClickAttackData.push(startTime);
                $scope.ClickAttackData.push(endTime);
                $scope.ClickAttackData.push(data);
            },
            processData(data){
                if (!data.clicks) return;
                $scope.multiChartdata = data.clicks.map(function (dat) {
                    var length = dat.data.length;
                    var result = dat.data.slice(3, length - 3).aggregate(3).map(function (dd, i) {
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
            getServerData(videoId, startTime, endTime, callback){
                getURL = mainPath + 'animationtest?videoId=' + videoId + '&courseId=' + $scope.courseId + '&startTime=' + startTime + '&endTime=' + endTime;
                $http.get(getURL).success(function(data){
                    console.log(getURL);
                        callback(data);
                })
            }
        }
        
    }
</script>