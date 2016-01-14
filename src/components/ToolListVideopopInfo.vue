<template>

    <div id="videopop-info-modal" class="modal fade" style="min-width: 40%" tabindex="-1" role="dialog" aria-labelledby="videopop-info-modal-label"
    aria-hidden="true">
        <div class="modal-dialog modal-less-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
                    <h3 id="videopop-info-modal-label" class="modal-title">Video Popularity Information</h3>
                </div>
                
                <div class="modal-body" :style="{height:modalBodyHeight + 'px'}">
                    <svg v-nvd3barchart="chartData" :config="chartConfig"></svg>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Close</button>
                </div>
            </div>
        </div>
    </div>
    
    <!--Button-->
    <div v-show="courseId!=-1" class="statisitc-icon" data-toggle="modal" data-target="#videopop-info-modal">
        <span class="fa fa-bar-chart"></span>
        <br/>Popularity Info
    </div>

</template>


<script>
    //directive
    import NvD3BarChart from '../directive/nvd3BarChart.js';

    //service
    import dataManager from '../service/datamanager.js';
    import communicator from '../service/communicator.js';
    
    export default {
        directives:{
            nvd3barchart:NvD3BarChart
        },
        ready(){
            //select the modal then append it to the last of <body>
            $(this.$el.nextElementSibling).appendTo("body");
            
            communicator(this).onChangeCourse((courseId)=> {
                this.courseId = courseId;

                dataManager.getHotness(courseId, (response)=> {
                    this.courseId = courseId;
                    this.chartData = [{
                        key: "Hotness",
                        values: response.data.map(function (d, i) {
                            return {
                                "label": d.videoId,
                                "value": d.pop,
                                "color": "#428bca"
                            }
                        })
                    }];
                });
            });
            
        },
        data(){
            return{
                courseId:-1,
                chartData:null,
                hotnessData:[],
                modalBodyWidth: 768,
                modalBodyHeight: 330,
                chartConfig:{
                    type: 'discreteBarChart',
                    width: 768,
                    height: 300,
                    margin: {
                        top: 20,
                        right: 20,
                        bottom: 60,
                        left: 65
                    },
                    x: function (d) { return d.label; },
                    y: function (d) { return d.value; },
                    // showValues: true,
                    valueFormat: function (d) {
                        return d3.format(',.1f')(d / 1000) + "k";
                    },
                    duration: 500,
                    xAxis: {
                        axisLabel: 'Video ID'
                        // axisLabelDistance: 1
                    },
                    yAxis: {
                        axisLabel: 'Popularity (#user)',
                        axisLabelDistance: 20
                    }
                }
            };
        },
        methods:{
            
        }
        
    }
    
</script>


<style>
    
    
</style>