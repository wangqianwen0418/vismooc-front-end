<template>

    <!--Modal-->
    <div id="demographic-info-modal" class="modal fade"  tabindex="-1" role="dialog" 
    aria-labelledby="demographic-info-modal-label" aria-hidden="true">
        <div class="modal-dialog modal-less-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
                    <h3 id="demographic-info-modal-label" class="modal-title">Demographic Distribution Information</h3>
                </div>

                <div class="modal-body">
                    <div id="demographic-info-modal-body" :style="{height:modalBodyHeight}"></div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <!--Button-->
    <div v-show="courseId!=-1" class="statisitc-icon" @click="createMap()" data-toggle="modal" data-target="#demographic-info-modal">
        <span class="fa fa-globe"></span>
        <br/>Demographic Info
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
            $(this.$el.nextElementSibling).appendTo("body");
            
            communicator(this).onChangeCourse((courseId)=>{
                if(courseId >= 0){
                    this.courseId = courseId;
                    dataManager.getDemographicData(courseId,(response)=>{
                        this.demographicInfo = response.data;
                    });
        
                }
            });
        },
        data(){
            return{
                courseId:-1,
                demographicInfo:null,
                modalBodyWidth: 768,
                modalBodyHeight: 300
            };
        },
        //map data
        complexObject:{
            map:null
        },
        methods:{
            filterByCountry(countryID){
                console.log(this);
                communicator(this).emitFilterCountry(countryID);
            },
            createMap(){

                var self = this;
                var datas = this.demographicInfo;
                var color = d3.scale.linear().range(['#edf8b1', '#2c7fb8']);
                color.domain([0, Math.log(d3.max(datas.map(function (d) {return d.count;})))]);

                var geoData = {};
                datas.forEach(function(d){
                    if(d.code3.length != 3) return;
                    geoData[d.code3] = {id:d.code3,count:d.count,fillColor:color(Math.log(d.count))};
                });

                if(!this.complexObject.map){
                    this.complexObject.map = new Datamap({element:document.getElementById('demographic-info-modal-body'),
                        height: this.modalBodyHeight, width:this.modalBodyWidth,
                        fills: {
                            defaultFill: '#edf8b1' //any hex, color name or rgb/rgba value
                        },
                        data:geoData,
                        geographyConfig:{ 
                            popupTemplate: function (geo, data) {
                                return ['<div class="hoverinfo"><strong>',
                                    geo.properties.name + ' : ' + data.count,
                                    '</strong></div>'].join('');
                            }
                        }
                    });
                    
                    d3.select("#demographic-info-modal-body")
                        .selectAll('.datamaps-subunit')
                        .style('stroke', '#dddddd')
                        .on('click', function (d) {
                            console.log(d.id);
                            self.filterByCountry(d.id);
                        });
                } else{
                    this.complexObject.map.updateChoropleth(geoData);
                }
            }
        }
        
    }

</script>


<style>

</style>