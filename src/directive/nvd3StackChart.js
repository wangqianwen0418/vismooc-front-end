import d3 from 'd3';
import nv from 'nvd3';

export default {
    params: ['config','course-id'],
    bind(){
       this.courseChange = false;
       d3.select(this.el)
        .style('margin-left','-40');
    },
    update(newVal, oldVal) {
        if (!newVal) return;

        var config = this.params.config;
        if(!config) return;
        
        var chart = nv.models.stackedAreaChart()
            .height(config.height)
            .margin(config.margin)
            .x(config.x)
            .y(config.y)
            .useVoronoi(config.useVoronoi)
            .clipEdge(config.clipEdge)
            .duration(config.duration)
            .useInteractiveGuideline(config.useInteractiveGuideline)
            .controlLabels({ stacked: "Stacked" })
        ;
        
        chart.xAxis
            .showMaxMin(config.xAxis.showMaxMin || false)
            .tickFormat(config.xAxis.tickFormat)
            ;
        chart.yAxis
            .tickFormat(config.yAxis.tickFormat);
        chart.legend.vers('furious');
        chart.interactiveLayer.tooltip.headerFormatter(function(d,i){
                return nv.models.axis().tickFormat()(d,i);
            });
            
        if(this.changeCourse){
            d3.select(this.el).selectAll('*').remove();
            this.changeCourse = false;
        }
        d3.select(this.el)
            .datum(newVal)
            .transition().duration(1000)
            .call(chart)
        ;
        nv.utils.windowResize(chart.update);
    },
    paramWatchers:{
        'courseId':function(newVal,oldVal){
            if(newVal !== oldVal){
                this.courseId = newVal;
                this.changeCourse = true;
            }
        }
    }
}