import d3 from 'd3';
import nv from 'nvd3';

export default {
    params: ['config'],
    update(newVal, oldVal) {
        if (!newVal) return;

        var config = this.params.config;
        if (!config) return;

        var chart = nv.models.discreteBarChart()
            .width(config.width)
            .height(config.height)
            .margin(config.margin)
            .x(config.x)    //Specify the data accessors.
            .y(config.y)
            .valueFormat(config.valueFormat)
            .duration(config.duration)
            .showXAxis(newVal[0].values.length > 100 ? false: true)
        ;
        
        chart.xAxis.axisLabel(config.xAxis.axisLabel);
        chart.yAxis.axisLabel(config.yAxis.axisLabel)
            .axisLabelDistance(config.yAxis.axisLabelDistance)
        ;
        
        d3.select(this.el)
            .selectAll("*")
            .remove()
        ;
        
        d3.select(this.el)
            .datum(newVal)
            .transition().duration(1000)
            .call(chart)
        ;
        
        nv.utils.windowResize(chart.update);

    }
}