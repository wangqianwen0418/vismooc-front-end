<template>
        <div id="social-netwrok-modal" class="modal fade" tabindex="-1" role="dialog" 
    aria-labelledby="social-netwrok-modal-label" aria-hidden="true">
    
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal"  aria-label="Close">&times;</button>
                    <h3 id = "social-netwrok-modal-label" class="modal-title">Forum Social Network</h3>
                </div>

                <!--TODO here directive-->
                <div class="modal-body" >
                    <div class="row">
                        <div class="col-md-6" style="height:800px">
                            <button class="btn btn-default col-md-4" @click="clearSelection()">Clear Selection</button>
                            <h4 class="col-md-8">{{showInfo}}</h4>
                            <div id="social-netwrok-geomap" ></div>
                            <div wordcloud word-cloud-data = "wordCloudData" style="width: 100%; height:48%"></div>
                        </div>

                        <div class="col-md-6" style="height:800px" >
                            <div class="container" style="height:30px; width:40%">
                                <h5 style="text-align:center">Filter users due to activeness</h5>
                                <div ui-slider min="0" max="4" ng-model="threshold.value" ng-change="changeThreshold()"></div>
                            </div>
                            <div graph data = "data" option = "option" countrycode="countrycode" style="width: 100%"></div>
                        </div>                        
                    </div>
                </div>
                <!--TODO here directive-->
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal" aria-label="Close">Close</button>
                </div>
            </div>
        </div>
    </div>

    <!--Button-->
    <div v-show="data" class="statisitc-icon" @click="createMap()" data-toggle="modal" data-target="#social-netwrok-modal">
        <span class="fa fa-comments"></span>
        <br/>Social Network
    </div>

</template>


<script>
    //thrid party
    import d3 from 'd3';
    import topojson from 'topojson';
    import Datamap from 'datamaps';

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
                geodata:null,
                datacopy:null
            };

        },
        complexObject:{
            map:null
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
            },
            selectedCountry(id){
                communicator(this).emitCode3(id);
            },
            createMap(){
                
                var self = this;
                var datas = this.geodata;
                var color = d3.scale.linear().range(['#edf8b1', '#2c7fb8'])
                    .domain([0, Math.log(d3.max(datas.map(function (d) {return d.count;})))]);

                var geoData = {};
                datas.forEach(function(d){
                    if(d.code3.length != 3) return;
                    geoData[d.code3] = {id:d.code3,count:d.count,fillColor:color(Math.log(d.count))};
                });

                if(!this.complexObject.map){
                    this.complexObject.map = new Datamap({element:document.getElementById('social-netwrok-geomap'),
                        height: 380, width:400,
                        fills: {
                            defaultFill: '#edf8b1' //any hex, color name or rgb/rgba value
                        },
                        data:geoData,
                        geographyConfig:{ 
                            borderColor: '#dddddd',
                            popupTemplate: function (geo, data) {
                                return ['<div class="hoverinfo"><strong>',
                                    geo.properties.name + ' : ' + data.count,
                                    '</strong></div>'].join('');
                            }
                        },
                        done: function(datamap) {
                            datamap.svg.selectAll('.datamaps-subunit').on('click', function(d) {
                                self.selectedCountry(d.id);
                            });
                        }
                    });
                } else{
                    this.complexObject.map.updateChoropleth(geoData);
                }
            }
        }
    }
    
</script>>