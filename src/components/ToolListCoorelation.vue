<template>
    
    <div id="coorelation-info-modal" class="modal fade"  tabindex="-1" style = "min-width:40%" role="dialog" aria-labelledby="coorelation-info-modal-label" aria-hidden="true">
        <div class="modal-dialog"  role="document">
   
            <div class="modal-content">

                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
                    <h3 id="coorelation-info-modal-label" class="modal-title">Glyph Overview</h3>
                </div>

                <div class="modal-body">
                    <div style="width: 100%; height: 500px;">
                        <div class="peak_parrellel">
                            <div class="peak_parrellel_container" id="parrellel_container">

                                <div class="row clearfix" style="height: 15%;" id="parrellel_controller_bar">
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

                                <div class="row clearfix" style="height: 85%;" id="parrellel_coordinate">
                                    <div class="col-md-12 column" style="height: 100%">
                                        <div pcoords class="parcoords" data="PCData"></div>
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
    //service
    import dataManager from '../service/datamanager.js';
    import communicator from '../service/communicator.js';
    
    export default {
        ready(){
            
            //select the modal then append it to the last of <body>
            $(this.$el.nextElementSibling).appendTo("body");
        
            this.mainPath = window.location.pathname;
            communicator(this).onChangeCourse((courseId)=>{
                this.courseId = courseId;
                getServerData(callFunc);
            });
        },
        data(){
            return{
                courseId:-1,
                mainPath:"",
                getURL:"",
                PCData:[]
            };
        },
        methods:{
            getServerData(callback){
                    
                this.getURL = mainPath + 'ParallelCoor?courseId=' + this.courseId;

                this.$http.get(getURL).then(function(data){
                    callback(data);
                })
            },
            callFunc(data){
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
                this.PCData.push(this.courseId);
                this.PCData.push(peakNum);
                this.PCData.push(arr);
            }
        }
        
    }

        
</script>