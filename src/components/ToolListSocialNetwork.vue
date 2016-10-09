<template>
        <div id="social-netwrok-modal" class="modal fade" tabindex="-1" role="dialog" 
    aria-labelledby="social-netwrok-modal-label" aria-hidden="true">
    
        <div class="modal-dialog modal-more-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal"  aria-label="Close">&times;</button>
                    <h3 id = "social-netwrok-modal-label" class="modal-title">Forum Social Network</h3>
                </div>

                <!--TODO here directive-->
                <div class="modal-body" >
                    <div class="row">
                        <div class="col-md-6">
                            <button class="btn btn-default col-md-4" @click="clearSelection()">Clear Selection</button>
                            <h4 class="col-md-8">{{showInfo}}</h4>
                            <div id="social-netwrok-geomap" ></div>
                            <div id="social-network-wordcloud"></div>
                        </div>

                        <div class="col-md-6">
                            <div class="container" style="height:30px; width:40%">
                                <h5 style="text-align:center">Filter users due to activeness</h5>
                                <div ui-slider min="0" max="4" ng-model="threshold.value" ng-change="changeThreshold()"></div>
                            </div>
                            <div v-social-network="socialNetworkData" :config ="socialNetworkOption" :countrycode="countrycode"></div>
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
    <div v-show="geoData" class="statisitc-icon" @click="createMap()" data-toggle="modal" data-target="#social-netwrok-modal">
        <span class="fa fa-comments"></span>
        <br/>Social Network
    </div>

</template>


<script>
    //thrid party
    import d3 from 'd3';
    import topojson from 'topojson';
    import Wordcloud from 'wordcloud';
    import Datamap from 'datamaps';

    //directives
    import socialNetwork from '../directive/socialNetwork.js';
    
       //service
    import dataManager from '../service/datamanager.js';
    import communicator from '../service/communicator.js';
    export default {
        directives:{
            socialNetwork:socialNetwork
        },
        ready(){
            this.complexObject = {};
            //select the modal then append it to the last of <body>
            $("#social-netwrok-modal").appendTo("body");
            
            communicator(this).onChangeCourse((courseId)=> {
                if (courseId >= 0) {
                    this.courseId = courseId;
                    var threshold=this.threshold;
                    dataManager.getForumSocialNetwork(this.courseId, threshold.value,(response)=>{
                        this.datacopy = response.data;
                        this.socialNetworkData = response.data;
                    });
                    
                    dataManager.getDemographicData(this.courseId, (response) => {
                        this.geoData = response.data;
                    });
                }
            });

            communicator(this).onGraphUsername((data)=>{
                var userId=data[0];
                var username=data[1];
                this.showInfo='Selected user: '+username;

                dataManager.getWordCloudDataByUser(this.courseId, userId, (response)=>{
                    this.wordCloudData = response.data;
                    
                });
            });  
            
            communicator(this).onCode3((code3)=>{
                this.countrycode=code3;
                this.showInfo='Selected country: '+code3

                dataManager.getWordCloudDataByGeo(this.courseId, this.countrycode, (response)=>{
                    this.wordCloudData = response.data;

                });
            });
        },
        data(){
            return{
                socialNetworkOption:{
                    'width':580,
                    'height':599,
                },
                courseId:-1,
                threshold:{value:3},
                showInfo:"No selection",
                countrycode:"",
                wordCloudData:[],
                socialNetworkData:null,
                geoData:null,
                datacopy:null
            };

        },
        complexObject:{
            map:null,
            wordcloud:null
        },
        methods:{
            clearSelection(){
                this.wordCloudData=[];
                this.showInfo="No selection";
                this.countrycode='-';
            },
            changeThreshold(){
                dataManager.getForumSocialNetwork(this.courseID, this.threshold.value, (response)=>{
                    this.socialNetworkData = response.data;
                    this.datacopy = response.data;
                });
            },
            selectedCountry(id){
                communicator(this).emitCode3(id);
            },
            createMap(){
                
                var self = this;
                var datas = this.geoData;
                var color = d3.scale.linear().range(['#edf8b1', '#2c7fb8'])
                    .domain([0, Math.log(d3.max(datas.map(function (d) {return d.count;})))]);

                var geoData = {};
                datas.forEach(function(d){
                    if(d.code3.length != 3) return;
                    geoData[d.code3] = {id:d.code3,count:d.count,fillColor:color(Math.log(d.count))};
                });

                if(!this.complexObject.map){
                    this.complexObject.map = new Datamap({element:document.getElementById('social-netwrok-geomap'),
                        height: 280, width:599,
                        fills: {
                            defaultFill: '#edf8b1' 
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
            },
           createWordcloud(){
                var sizeScale= d3.scale.linear().range([13, 80]);

                if(this.wordCloudData){
                    var min = d3.min(this.wordCloudData,function(d){ return d[1]; });
                    var max = d3.max(this.wordCloudData,function(d){ return d[1]; });
                    sizeScale.domain([min, max])
                    for(let i = 0, len = this.wordCloudData.length;i<len;++i){
                        var ele=this.wordCloudData[i];
                        ele[1]=sizeScale(ele[1])
                    }
                }
                
                if(!this.complexObject.wordcloud){
                    var el = document.getElementById('social-network-wordcloud');
                    var height = 380;
                    var width = el.offsetWidth;

                    this.complexObject.wordcloud = d3.select(el)
                        .append("canvas")
                        .attr('id', 'social-network-wordcloud-canvas')
                        .attr("width",width)
                        .attr("height",height).node();
                }
                
                WordCloud(this.complexObject.wordcloud, { list: this.wordCloudData, clearCanvas:true, shape:'circle'} );
           }
        },
        watch:{
            'wordCloudData':function(newVal, oldVal){
                if(newVal !== oldVal) this.createWordcloud();
            }
        }
    }
    
</script>


<style>
.opacitynode {
	opacity: 0.1;
}
.opacityedge {
	opacity: 0.1;
}
</style>
