import d3 from 'd3';
import CalHeatmap from 'cal-heatmap';

export default {
    params: ['config', 'start-date', 'end-date'],
    bind() {

        this.parser = function (data) {
            var stats = {};
            for (var i = 0, len = data.length; i < len; ++i) {
                stats[(data[i].date * 0.001)] = data[i].value;
            }
            return stats;
        };

    },
    update(newVal, oldVal) {
        if (!newVal) return;
        var self = this;
        var startDateD = new Date(+this.params.startDate);
        var endDateD = new Date(+this.params.endDate);
        var range = endDateD.getMonth() - startDateD.getMonth() + 1;
        range = Math.max(range, 5);
        var data = this.parser(newVal);

        if(this.cal) this.cal.destroy();
        this.cal = new CalHeatmap();
        this.cal.init({
            data:data,
            itemSelector: this.el,
            start: startDateD,
            range: range,
            domain: "month",
            subDomain: "day",
            cellSize: 19.2,
            onClick: function (date, count) {
                self.vm.filterByDate(date);
            }
        });
    }
}