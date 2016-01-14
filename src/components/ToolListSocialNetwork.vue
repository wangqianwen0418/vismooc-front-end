<template>
        <div id="social-netwrok-modal" class="modal fade" style="min-width: 40%" tabindex="-1" role="dialog" 
    aria-labelledby="social-netwrok-modal-label" aria-hidden="true">
    
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" class="close" data-dismiss="modal">&times;</button>
                    <h3 id = "social-netwrok-modal-label" class="modal-title">Forum Social Network</h3>
                </div>

                <!--TODO here directive-->
                <div ng-show="data" class="modal-body" style="width:1600px">
                    <div class="col-md-6" style="height:800px">
                        <div>
                            <button class="btn btn-default col-md-4" ng-click="clearSelection()">Clear Selection</button>
                            <h4 class="col-md-8">{{showInfo}}</h4>
                        </div>
                        <div graphgeo geodata="geodata" id="graphGeoContainer" selected-country = "selectedCountry" style="width: 100%; height:48%"></div>
                        <div wordcloud word-cloud-data = "wordCloudData" style="width: 100%; height:48%"></div>
                    </div>

                    <div class="col-md-6" style="height:800px" >
                        <div class="container" style="height:30px; width:40%">
                            <h5 style="text-align:center">Filter users due to activeness</h5>
                            <div ui-slider min="0" max="4" ng-model="threshold.value" ng-change="changeThreshold()"></div>
                        </div>
                        <div graph data = "data" option = "option" countrycode="countrycode" style="width: 100%" call-me="showTooltip"></div>
                    </div>
                </div>
                <!--TODO here directive-->
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>

    </div>

    <!--Button-->
    <div v-show="data" class="statisitc-icon" data-toggle="modal" data-target="#social-netwrok-modal">
        <span class="fa fa-comments"></span>
        <br/>Social Network
    </div>

</template>


<script>
       //service
    import dataManager from '../service/datamanager.js';
    import communicator from '../service/communicator.js';
    export default {
        ready(){
            this.complexObject = {};
            //select the modal then append it to the last of <body>
            $("#social-netwrok-modal").appendTo("body");
            
            communicator(this).onChangeCourse((courseId)=> {
                if (courseId >= 0) {
                    this.courseId = courseId;
                    var threshold=this.threshold;
                    dataManager.getForumSocialNetwork(courseId, threshold.value,(response)=>{
                        this.datacopy = response.data;
                        this.data = response.data;
                    });
                    dataManager.getDemographicData(this.courseId, (response) => {
                        this.geodata= response.data;
                    });
                }
            });

            communicator(this).onGraphUsername((data)=>{
                var userId=data[0];
                var username=data[1];
                this.showInfo='Selected user: '+username;

                dataManager.getWordCloudData(this.courseId, userId, (response)=>{
                    this.wordCloudData = response.data;
                });
            });  
            
            communicator(this).onCode3((response)=>{
                this.countrycode=response.data;
                this.showInfo='Selected country: '+response.data;

                dataManager.getWordCloudDataByGeo(this.courseId, this.countrycode, (response)=>{
                    this.wordCloudData = response.data;
                });
            });
        },
        data(){
            return{
                option:{
                    'width':1200,
                    'height':600
                },
                courseId:-1,
                threshold:{value:3},
                showInfo:"No selection",
                countrycode:"",
                wordCloudData:[],
                data:null,
                datacopy:null
            };

        },
        methods:{
            clearSelection(){

                this.wordCloudData=[];
                this.showInfo="No selection";
                this.countrycode='-';
            },
            changeThreshold(){
                dataManager.getForumSocialNetwork(this.courseID, this.threshold.value, (response)=>{
                    this.data = response.data;
                    this.datacopy = response.data;
                });
            }
        }
    }
    
</script>>