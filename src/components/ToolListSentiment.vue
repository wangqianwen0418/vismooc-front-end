<template>
    <!--Modal-->
    <div id="sentiment-modal" style="width: 1200px; height:600px" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="sentiment-modal-label"
    aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
                    <h3 id="sentiment-modal-label" class="modal-title">Forum Sentiment analysis</h3>
                </div>

                <div ng-show="sentimentData" class="modal-body">
                    <div v-sentiment-vis="sentimentData" hide-me="hideMe" :go-back="showGoBack" option="option" style="height: 600px"></div>
                    <div v-sentiment-vis="sentimentData2" class="ng-hide" ng-show="sentimentData2" show-data="showData"  :go-back="showGoBack"
                    style="top:0px; left:0px; height: 100%; width:100%; position:absolute; background-color:white; margin:20px"></div>
                </div>

            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Close</button>
            </div>

            <div id="tooltip" class="hidden" style="width:100px">
                <p><strong></strong></p>
                <p><span id="username">100</span></p>
                <p><span id="value">100</span></p>
                <p><span id="comment">100</span></p>
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
                $(this.$el.nextElementSibling).appendTo("body");
                
                communicator(this).onChangeCourse((courseId) =>{
                    if (courseId >= 0) {
                        this.courseId = courseId;

                        dataManager.getSentiment(courseId, (response)=>{
                            this.sentimentData = response.data;
                            this.sentimentData2 = undefined;
                            this.showGoBack = false;
                        });
                    }
                });
                
                
                communicator(this).onSentiment((response)=>{
                    var data = response.data;
                    if(data === 'delete'){
                        this.showGoBack = false;
                        this.sentimentData2 = undefined;
                    }else{
                        this.showGoBack = true;
                        dataManager.getSentimentDetails(this.courseID, data.days,(response)=>{
                            this.sentimentData2 = data;
                        });
                    }
                });
                                
            },
            data(){
                return {
                    courseId:-1,
                    option:{
                        width:1200,
                        height:600
                    },
                    sentimentData:true,
                    sentimentData2:null,
                    showGoBack:false,
                };
            },
            methods:{
                clickFunc(){
                    this.sentimentData2 = undefined;
                }
            }
    }

</script>