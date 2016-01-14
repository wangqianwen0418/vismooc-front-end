<template>

    <div id="temporal-info-modal" class="modal fade" style="min-width: 40%" tabindex="-1" role="dialog" aria-labelledby="temporal-info-modal-label"
    aria-hidden="true">
        <div class="modal-dialog " role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
                    <h3 id="temporal-info-modal-label" class="modal-title">Video Temporal Hotness</h3>
                </div>

                <div class="modal-body">
                    <div v-cal-heatmap="hotnessData.hotness" 
                    :start-date="hotnessData.startDate" 
                    :end-date="hotnessData.endDate"
                    style="width:100%; height: 250px; ">
                    </div>

                    <hr>
                    
                    <!--TODO here, privide the filter of byWeek and byAny days-->
                    <div>
                        <div class="sliderExample">
                            <a name="ex1"></a>
                            <strong>week {{vals.week}}</strong>
                            <div ui-slider="slider.optionsWeek" min="1" max="{{weekRange}}" ng-model="vals.week" style="margin-top:15px"></div>
                        </div>

                        <hr>

                        <div class="sliderExample">
                            <a name="ex6"></a>
                            <strong style="margin-bottom: 15px">from day {{vals.range[0]}} to day {{vals.range[1]}}</strong>
                            <div ui-slider="slider.optionsRange" min="1" max="{{dayRange}}" ng-model="vals.range" style="margin-top:15px"></div>
                        </div>
                    </div>
                    <!--TODO above, privide the filter of byWeek and byAny days-->
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Close</button>
                </div>
            </div>
        </div>
    </div>



</template>


<script>
    import 'cal-heatmap/cal-heatmap.css';
    
    //directive
    import CalHeatmap from '../directive/calHeatmap.js';
    
    //service
    import dataManager from '../service/datamanager.js';
    import communicator from '../service/communicator.js';
    
    export default {
        directives:{
          calHeatmap:CalHeatmap  
        },
        ready(){
            //select the modal then append it to the last of <body>
            $(this.$el.nextElementSibling).appendTo("body");
            
            communicator(this).onChangeCourse((courseId)=>{
                this.courseId = courseId;
            });
            communicator(this).onChangeVideo((videoInfo)=>{
                this.videoId = videoInfo.videoId;
                dataManager.getDailyHotnessByVideo(this.courseId, this.videoId, (response)=>{
                    this.hotnessData = response.data;
                    this.dayRange = Math.ceil((this.hotnessData.endDate - this.hotnessData.startDate)/1000/3600/24 + 1);
                    this.weekRange = Math.ceil((this.hotnessData.endDate - this.hotnessData.startDate)/1000/3600/24/7 + 1);
            });
    });  
            
        },
        data(){
            return {
                videoId:-1,
                courseId:-1,
                hotnessData:{
                    startDate:"",
                    endDate:"",
                    hotness:null
                },
                sliderConfig:{
                    'optionsRange': {
                        start: function (event, ui) { },
                        stop: function (event, ui) { 
                            communicator(this).emitFilterDate({
                                startDate: this.hotnessData.startDate + 24*3600*1000*this.vals.range[0],
                                endDate: this.hotnessData.startDate + 24*3600*1000*this.vals.range[1]
                            });
                        },
                        range: 'max'
                    },
                    'optionsWeek': {
                        start: function (event, ui) { },
                        stop: function (event, ui) { 
                            communicator(this).emitFilterDate({
                                startDate: this.hotnessData.startDate + 7*24*3600*1000*(this.vals.week-1),
                                endDate: this.hotnessData.startDate + 7*24*3600*1000*this.vals.week
                            });
                        },
                    }
                },
                vals:{
                    range:[1,1],
                    week:1
                }
            };
        },
        methods:{
            filterByDate(date){
                communicator(this).emitFilterDate({
                    startDate: date.getTime(),
                    endDate: date.getTime()+24*3600*1000
                });
            }
        }
    }

</script>