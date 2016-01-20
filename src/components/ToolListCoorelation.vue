<template>

    <div id="coorelation-info-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="coorelation-info-modal-label"
    aria-hidden="true">
        <div class="modal-dialog modal-more-lg" role="document">

            <div class="modal-content">

                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
                    <h3 id="coorelation-info-modal-label" class="modal-title">Glyph Overview</h3>
                </div>

                <div class="modal-body">
                    <div style="width: 100%; height: 500px;">
                        <div class="peak-parrellel">
                            <div class="peak-parrellel-container" id="parrellel-container">

                                <div class="row clearfix" style="height: 15%;" id="parrellel-controller-bar">
                                    <div class="col-md-12 column">
                                        <div class="row clearfix">
                                            <div class="col-md-6 column">
                                                <p>Use this slider to change the darkness. The current value is <strong id="upperBound">0.05</strong>.</p>
                                                <br/>
                                                <input type="range" min="0" max="1" value="0" step="0.01" id="filterUp" />
                                                <br/>
                                                <input id="changemodebutton" type="button" class="btn btn-default" value="Draw line" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="row" style="height: 85%;" id="parrellel-coordinate">
                                    <div class="col-md-12 column" style="height: 100%">
                                        <div id="parcoords" class="parcoords"></div>
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
    <div v-show="courseId!=-1" class="statisitc-icon" data-toggle="modal" data-target="#coorelation-info-modal">
        <span class="fa fa-life-ring"></span>
        <br/>Correlation
    </div>

</template>


<script>
    //css
    import '../lib/d3.parcoords/d3.parcoords.css';
    
    //js/
    import d3parcoords from '../lib/d3.parcoords/d3.parcoords.js';
    
    //service
    import dataManager from '../service/datamanager.js';
    import communicator from '../service/communicator.js';
    
    export default {
        ready(){
            
            //select the modal then append it to the last of <body>
            $("#coorelation-info-modal").appendTo("body");

            communicator(this).onChangeCourse((courseId)=>{
                this.courseId = courseId;
                dataManager.getParallelCoor(this.courseId,this.processData);
            });
        },
        data(){
            return{
                courseId:-1,
                PCData:[]
            };
        },
        methods:{
            processData(response){
                var data = response.data;
                var arr = [];
                var axisKeys = Object.keys(data[0]);
                var peakNum = data[0].peaks.length;

                for(var i = 0; i < data.length; i++){
                    var obj = {};
                    for(var j = 0; j < axisKeys.length; j++){
                        if(axisKeys[j] == 'peaks' || axisKeys[j] == 'userId')  continue;
                        obj[axisKeys[j]] = data[i][axisKeys[j]];
                    }
                    for(var j = 0; j < peakNum; j++){
                        obj['Peak' + j] = data[i]['peaks'][j];
                    }
                    var numDistr = [];
                    var sum = 0;
                    for(var j = 0; j < peakNum; j++){
                        var keyName = 'Peak' + j;
                        if(obj[keyName] > 0){
                            numDistr.push(obj[keyName]);
                            sum += obj[keyName];
                        }
                    }
                    if(sum > 10){
                        obj['activeness']  = sum/numDistr.length;
                    }
                    else obj['activeness']   = 0;
                    arr.push(obj);
                }
                this.PCData = [];
                this.PCData.push(peakNum);
                this.PCData.push(arr);
                this.createParcoords();
            },
            createParcoords(){
                var width = $("#parcoords").width();
                var height = 400;
                if (this.PCData) {
                    var data = this.PCData;
                    var isDrawline = false;
                    var peakNum = data[0];
                    var dataTmp = data[1];
                    var dataSub = [];
                    var dataFiltered = [];
                    var fidelityUp = 20;
                    var fidelityLow = 0;
                    var displayNum = 20;

                    var countryNames = ["ARG", "AUS", "BRA", "CAN", "CHN", "COL", "FRA", "DEU", "GRC", "HKG", "IND", 
                    "ITA", "MEX", "NLD", "PHL", "POL", "ROU", "RUS", "SGP", "ESP", "UKR", "GBR", "USA"];

                    for (var i = 0; i < dataTmp.length; i++) {
                        var obj = {};
                        var seekCount = 0;
                        var peakCount = 0;
                        obj['country'] = dataTmp[i].country;
                        if (countryNames.indexOf(obj['country']) < 0) continue;
                        
                        obj['grade'] = dataTmp[i].grade;
                        obj['droptime'] = dataTmp[i].dropTime;
                        obj['posts'] = dataTmp[i].forumPosts;
                        if ([obj['posts']] > 100) obj['posts'] = 100;
                        obj['loyalty'] = 0;
                        obj['review'] = dataTmp[i].review;
                        obj['delay'] = dataTmp[i].delay;
                        if (obj['delay'] < 0) obj['delay'] = 0;
                        obj['activeness'] = dataTmp[i].activeness;
                        if (obj['activeness'] > 10) obj['activeness'] = 10;
                        for (var j = 0; j < peakNum; j++) {
                            peakCount++;
                            var axisKey = 'Peak' + j;
                            if (dataTmp[i][axisKey] > 0) {
                                seekCount++;
                            }
                            if (j > displayNum)  continue;
                            if (dataTmp[i][axisKey] < 20) {
                                obj[axisKey] = dataTmp[i][axisKey];
                            } else {
                                obj[axisKey] = 20;
                            }
                        }
                        obj['loyalty'] = seekCount;
                        dataSub.push(obj);
                    }

                    var pc = d3.parcoords()("#parcoords")
                        .data(dataSub)
                        .bundlingStrength(0)
                        .smoothness(0)
                        .width(width)
                        .height(height)
                        .color("#FE7E13")
                        .alpha(0.05)
                        .margin({top: 24, left: 20, bottom: 12, right: 0})
                        .mode("queue")
                        .isDrawline(isDrawline)
                        .render();

                    var axisKeys = Object.keys(pc.yscale);
                    var attrAxesNum = 8;
                    for (var i = attrAxesNum; i < axisKeys.length; i++) {
                        pc.yscale[axisKeys[i]] = d3.scale.linear()
                            .domain([20.5, 0.5])
                            .range([0, height - 35]);
                    }

                    pc.render()
                        .createAxes()
                        .shadows()
                        .reorderable()
                        .brushMode("1D-axes");

                    d3.select("#filterLow")
                    .on("change", function () {
                        fidelityLow = this.value;
                        d3.select("#lowerBound").text(this.value);

                        dataFiltered = [];
                        var axisKeys = Object.keys(pc.yscale);
                        for (var i = 0; i < dataSub.length; i++) {
                            var obj = {};
                            for (var j = 0; j < 7 + fidelityLow; j++) {
                                obj[axisKeys[j]] = dataSub[i][axisKeys[j]];
                            }
                            dataFiltered.push(obj);
                        }

                        d3.select("#total").text(dataFiltered.length);

                        console.log(dataFiltered);
                        pc.data(dataFiltered)
                            .createAxes()
                            //.shadows()
                            .reorderable()
                            .brushMode("1D-axes")
                            .render();
                    });

                    //change opacity
                    d3.select("#filterUp")
                    .on("change", function () {
                        var opacity = this.value;
                        d3.select("#upperBound").text(this.value);
                        pc.alpha(opacity)
                            .render();
                    });

                    //change drawing mode
                    d3.select("#changemodebutton")
                    .on("click", function () {
                        console.log(isDrawline);
                        isDrawline = !isDrawline;
                        pc.isDrawline(isDrawline)
                            .render();
                    });

                    d3.selectAll('path.domain')
                        .attr('fill', 'none')
                        .attr('stroke', '#222')
                        .attr('stroke-width', 1);

                    d3.selectAll('.dimension .brush rect')
                        .attr('fill', 'transparent')
                        .attr('stroke', 'none')
                        .attr('stroke-width', 0);

                    d3.selectAll('.dimension .brush .extent')
                        .attr('fill', 'transparent')
                        .attr('stroke', '#9E9E9E')
                        .attr('stroke-width', 4);
                }
            }
        }
        
    }

</script>


<style>
    
</style>