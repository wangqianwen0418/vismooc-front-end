<template>
    <!--Modal-->
    <div id="sentiment-modal"  class="modal fade" tabindex="-1" role="dialog" aria-labelledby="sentiment-modal-label"
    aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
        
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
                    <h3 id="sentiment-modal-label" class="modal-title">Forum Sentiment analysis</h3>
                </div>

                <div v-show="sentimentData" class="modal-body">
                    <div v-sentiment-vis="sentimentData" :go-back="showGoBack" :config="mdsChartConfig" ></div>

                    <div id="tooltip" class="hidden sentiment-modal-tooltip">
                        <p><span id="username">100</span></p>
                        <p><span id="value">100</span></p>
                        <p><span id="comment">100</span></p>
                    </div>
    
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Close</button>
                </div>
                
            </div>
        </div>
    </div>

    <!--Button-->
    <div v-show="sentimentData" class="statisitc-icon" data-toggle="modal" data-target="#sentiment-modal">
        <span class="fa fa-heart-o"></span>
        <br/>Sentiment Analysis
    </div>
</template>

<script>
    //directive
    import SentimentVis from '../directive/sentimentVis.js';
    
    //service
    import dataManager from '../service/datamanager.js';
    import communicator from '../service/communicator.js';
    
    export default {
            directives:{
                sentimentVis:SentimentVis
            },
            ready(){
                //select the modal then append it to the last of <body>
                $("#sentiment-modal").appendTo("body");

                communicator(this).onChangeCourse((courseId) =>{
                    if (courseId >= 0) {
                        this.courseId = courseId;

                        dataManager.getSentiment(courseId, (response)=>{
                            this.sentimentData = response.data;
                            this.sentimentDataCache = this.sentimentData;
                            //this.sentimentData2 = undefined;
                            this.showGoBack = false;
                        });
                    }
                });
                
                
                communicator(this).onSentiment((flag)=>{
                    if(flag === 'delete'){
                        this.mdsChartConfig.isDetail = false;
                        this.sentimentData = this.sentimentDataCache;
                    }else{
                        this.mdsChartConfig.isDetail = true;
                        dataManager.getSentimentDetails(this.courseId, flag.days,(response)=>{
                            this.sentimentData = response.data;
                        });
                    }
                });
                                
            },
            data(){
                return {
                    courseId:-1,
                    mdsChartConfig:{
                        isDetail:false,
                        width:868,
                        height:600
                    },
                    sentimentData:null,
                    sentimentDataCache:null
                };
            },
            methods:{

            }
    }

</script>

<style>

.sentiment-modal-tooltip{
    position:absolute;
    border-radius: 10px;
    box-shadow: 4px 4px 10px rgba(0,0,0,.4);
    pointer-events: none;
    width: 300px;
    height: auto;
    padding: 10px;
    background-color: #fff;
}
.axis line,
.axis path {
    fill: none;
    stroke: grey;
    stroke-width: 2;
    shape-rendering: crispEdges;
}
.axis text {
    font-family: sans-serif;
    font-size: 11px;
}

.goBackLink {
    cursor: pointer;
}
.goBackLink:hover{
    
    color:red;
}
</style>