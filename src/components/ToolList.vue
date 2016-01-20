<template>

    <div class="dash-category-label">
        <hr>Course
        <hr>
    </div>
        
    <tl-course-info></tl-course-info>
    <tl-videopop-info></tl-videopop-info>
    <tl-demographic-info></tl-demographic-info>
    
    <!-- video -->
    <div class="dash-category-label">
        <hr> Video
        <hr>
    </div>
    
    <tl-temporal-info></tl-temporal-info>
    


    <!-- forum -->
    <div class="dash-category-label">
        <hr> Forum
        <hr>
    </div>

    <tl-sentiment></tl-sentiment>
    <tl-social-network></tl-social-network>

    <!-- peak analysis -->
    <div class="dash-category-label">
        <hr> Peak
        <hr>
    </div>
    
    <tl-flowmap></tl-flowmap>
    <tl-mds-glyph></tl-mds-glyph>
    <tl-coorelation></tl-coorelation>
    
</template>

<script>
    //Components
    import ToolListCourseInfo from './ToolListCourseInfo.vue';
    import ToolListDemographicInfo from './ToolListDemographicInfo.vue';
    import ToolListVideopopInfo from './ToolListVideopopInfo.vue';
    import ToolListTemporalInfo from './ToolListTemporalInfo.vue';
    import ToolListSentiment from './ToolListSentiment.vue';
    import ToolListSocialNetwork from './ToolListSocialNetwork.vue';
    import ToolListFlowmap from './ToolListFlowmap.vue';
    import ToolListCoorelation from './ToolListCoorelation.vue';
    import ToolListMdsGlyph from './ToolListMdsGlyph.vue';
    
    export default {
        components:{
            tlCourseInfo:ToolListCourseInfo,
            tlDemographicInfo:ToolListDemographicInfo,
            tlVideopopInfo:ToolListVideopopInfo,
            tlTemporalInfo:ToolListTemporalInfo,
            tlSentiment:ToolListSentiment,
            tlSocialNetwork:ToolListSocialNetwork,
            tlCoorelation:ToolListCoorelation,
            tlMdsGlyph:ToolListMdsGlyph,
            tlFlowmap:ToolListFlowmap
        }
    }


</script>

<style>
    
.vistoolkit {
	text-align: center;
	padding-right: 0px; 
	padding-left: 0px; 
	padding-top: 0px;
}    
    

.statisitc-icon{
    cursor:hand;
    color: #aaaaaa;
    width: 100%;
    padding-top: 10px;
    padding-bottom: 10px;
    margin: 10px auto;
    text-align: center;
    font-size: 12px;
}

.statisitc-icon > span{
    font-size: 40px;
}

.statisitc-icon:hover{
    color: #ffffff;
    background-color: #428bca;
}    
    
.dash-category-label{
    color: #ffffff;
    margin-top: -6px;
    background: #aaaaaa;

}

.dash-category-label > hr{
    margin-top: 5px;
    margin-bottom: 5px;
}

    .modal-less-lg {
        width: 800px;
    }
    
    .modal-more-lg {
        width: 1200px;
    }
    
.brush .extent {
    stroke: #fff;
    fill-opacity: .125;
    shape-rendering: crispEdges;
}
</style>