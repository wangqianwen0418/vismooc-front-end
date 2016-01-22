<template>

    <div id="mds-glyph-modal" class="modal fade" tabindex="-1"  role="dialog" aria-labelledby="mds-glyph-modal-label"
    aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">

            <div class="modal-content">

                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
                    <h3 id="mds-glyph-modal-label" class="modal-title">Glyph Overview</h3>
                </div>

                <div class="modal-body">
                    <div class="peak-graphmds-container">
                        <svg v-mds-glyph="graphData" :config="mdsConfig"></svg>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Close</button>
                </div>

            </div>
        </div>
    </div>


    <!--Button-->
    <div v-show="courseId!=-1" class="statisitc-icon" data-toggle="modal" data-target="#mds-glyph-modal">
        <span class="fa fa-spinner"></span>
        <br/>Overview
    </div>

</template>

<script>
    //js
    import d3 from 'd3';
    
    //directive
    import MDSGlyph from '../directive/mdsglyph.js';
    //service
    import MDS from '../service/mds.js';
    import dataManager from '../service/datamanager.js';
    import communicator from '../service/communicator.js';
    
    export default {
        directives:{
            mdsGlyph:MDSGlyph
        },
        ready(){
            
            //select the modal then append it to the last of <body>
            $("#mds-glyph-modal").appendTo("body");
                    
            var w = d3.scale.linear().range([30, 60]);
            var h = d3.scale.linear().range([30, 45]);
            var self = this;
            communicator(this).onChangeCourse((courseId)=>{
                this.courseId = courseId;

                // get videoList
                var videoList;
                var videoListHash = {};
                dataManager.getVideoList(courseId,(response)=>{
                    videoList = response.data;
                    videoList.forEach(function(d){
                        d.videos.forEach(function(dd){
                            videoListHash[dd.videoId] = dd;
                        });
                    });
                    self.videoListHash = videoListHash;
                });

                var weekNum = (courseId == 4) ? 10 : 4;
                dataManager.getGlyphInfo(courseId,(response)=>{

                        var colors = [],
                            usedcolors = 0;
                        // get nodes
                        var nodes = [];	
                        var data = response.data;				
                        data.forEach(function(d){
                            var tmpNode = {};
                            var tmpcolor = self.getMyColor(d.videoId, colors);

                            if (tmpcolor != null){
                                tmpNode['group'] = tmpcolor;
                            } else{
                                usedcolors++;
                                colors.push({
                                    'videoId': d.videoId,
                                    'color': usedcolors
                                });
                                tmpNode['group'] = usedcolors;
                            }
                            nodes.push(tmpNode);
                        });

                        // get links,    there are links for those whose similarity >=0.5
                        var links = [];
                        var linkCount = [];
                        for(let i = 0,len = data.length; i < len; ++i ){
                            linkCount.push(0);
                        }

                        var simMatrix = [];
                        d3.range(data.length).forEach(function(){
                            simMatrix.push(d3.range(data.length));
                        });
                        var minSim = 1, maxSim = 0;
                        for (var i = 0, obj1; obj1 = data[i]; i++){
                            var simTh = 0.2;
                            simMatrix[i][i] = 1;
                            for (var j = i + 1, obj2; obj2 = data[j]; j++) {
                                var sim = self.getSimilarity(obj1.peopleInfo, obj2.peopleInfo);
                                simMatrix[i][j] = simMatrix[j][i] = sim;
                                if (minSim > sim)
                                    minSim = sim;
                                if (maxSim < sim)
                                    maxSim = sim;

                                if (sim >= simTh){
                                    var tmpLink = {};
                                    tmpLink['source'] = i;
                                    tmpLink['target'] = j;
                                    tmpLink['strength'] = sim;
                                    links.push(tmpLink);
                                }
                            }
                        }
                        var fs = d3.scale.linear().range([1, 0]).domain([minSim, maxSim]).clamp(true);
                        d3.range(data.length).forEach(function(row){
                            d3.range(data.length).forEach(function(column){
                                simMatrix[row][column] = fs(simMatrix[row][column]);
                            });
                        });
                        var coordinate = MDS.mds(simMatrix);


                        w.domain(d3.extent(data, function(d){ return d.peakWidth }));
                        h.domain(d3.extent(data, function(d){ return d.actionNum }));

                        var peaks = data.map(function(d){
                            var actionWidth = w(d.peakWidth) + 20;
                            var actionHeight = h(d.actionNum) + 20;
                            var actionPosition = d.currentTime/d.videoLength;
                            var videoWeekPosition = d.week / ( weekNum + 1);
                            var line1Position = 1 - d.peopleInfo.length / d.actionNum;

                            var peopleInfo = d.peopleInfo.sort(function(a, b){ return b.Count - a.Count; });
                            var nowCount = 0;
                            var upLimit = Math.floor(d.actionNum*0.9);
                            for (var i = 0, count; count = peopleInfo[i].Count; i++){
                                if (nowCount >= upLimit)
                                    break;
                                nowCount += count;
                            }

                            var line2Position = i / d.peopleInfo.length;

                            //calculate the distribution
                            var countArr = [];
                            var sum = 0;
                            var std = 0;
                            var anomaly = 0;
                            for(var i = 0; i < d.peopleInfo.length; i++){
                                countArr.push(d.peopleInfo[i].Count);
                                sum += d.peopleInfo[i].Count;
                                if(d.peopleInfo[i].Count > 10)  anomaly += d.peopleInfo[i].Count;
                            }
                            anomaly /= sum;
                            var average = sum/d.peopleInfo.length;
                            for(var i = 0; i < d.peopleInfo.length; i++){
                                std += Math.sqrt((average - d.peopleInfo[i].Count) * (average - d.peopleInfo[i].Count));
                            }
                            std /= d.peopleInfo.length;

                            return {
                                'actionWidth': actionWidth,
                                'actionHeight': actionHeight,
                                'actionPosition': actionPosition,
                                'videoWeekPosition': videoWeekPosition,
                                'line1Position': line1Position,
                                'line2Position': line2Position,
                                //'grade': grade,
                                'index': data.indexOf(d),
                                'ave': average,
                                'std': std,
                                'anomaly': anomaly
                            }
                        });

                        for(var i = 0; i < peaks.length; i++){
                            var sum = data[i].grade.reduce(function(pv, cv) { return pv + cv; }, 0);
                            var w1 = d3.scale.linear().range([(peaks[i].actionWidth - 20) * 0.3, (peaks[i].actionWidth - 20) * 1]);
                            var h1 = d3.scale.linear().range([(20-peaks[i].actionWidth), (peaks[i].actionWidth - 20)]);
                            w1.domain(d3.extent(peaks, function(d){ return d.ave }));
                            h1.domain(d3.extent(peaks, function(d){ return d.std }));
                            peaks[i].distrAve = w1(peaks[i].ave);
                            peaks[i].distrStd = h1(peaks[i].std);
                            peaks[i].grade = [];
                            for(var j = 0; j < data[i].grade.length; j++){
                                peaks[i].grade.push(data[i].grade[j]/sum);
                            }
                        }

                        var finalData = {
                            'nodes': nodes,
                            'links': links,
                            'peaks': peaks,
                            'coordinate': coordinate,
                            'peakBasicInfo': data
                        };
                        self.peaks = peaks;
                        self.graphData = finalData;
                    });
            });
            
            
        },
        data(){
            return{
              courseId:-1,
              videoListHash:null,
              peaks:null,
              graphData:null,
              mdsConfig:{
                  width:880,
                  height:500
              }
            };
        },
        methods:{
            mdsGlyphChangeVideo(videoInfo){
                communicator(this).emitChangeVideo(videoInfo);
            },
            intersect(a, b) {
                var t;
                if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
                return a.filter(function (e) {
                    for (var i = 0, len = b.length; i < len; i++){
                        if (e.name == b[i].name)
                            return true;
                    }
                    return false;
                });
            },

            union (a, b){
                a.concat(b);
                var lena = a.length;
                for (var i = 0; i < lena; i++){
                    for (var j = i+1; j<lena; j++){
                        if (a[i] === a[j])
                            a.splice(j--, 1);
                    }
                }	
            },

            getSimilarity(arr1, arr2){
                var length = this.intersect(arr1, arr2).length;
                return length / (arr1.length + arr2.length - length);
            },

            getMyColor(_videoId, ColorArr){

                // if (ColorArr.length == 0) { return null; }
                for(var i = 0, nowObj; nowObj = ColorArr[i]; i++){
                    if (_videoId == nowObj.videoId)
                        return nowObj.color;
                }
                return null;
            }

        }
    }

</script>

<style>

.graphnode {
    stroke: #fff;
    stroke-width: 2px;
    cursor: pointer;
}
</style>