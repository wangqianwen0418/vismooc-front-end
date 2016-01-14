import THREE from 'three';

export default {
    bind() {
        this.renderer = null;
        this.camera = null;
        this.scene = null;
        this.height = 0;
        this.width = 0;
        this.videoLength = 0;
        var self = this;

        this.initData = function (data) {

            var toUse = {
                forward: [],
                backward: [],
            };
            var toUseTemp = data;
            for (var i = 0; i < toUseTemp.length; i++) {
                var temp = toUseTemp[i];
                if (temp.currentTime > temp.prevTime) {
                    toUse.forward.push(temp);
                } else {
                    toUse.backward.push(temp);
                }
            }
            return toUse;
        };

        this.drawAll = function (data) {
            var toUse = self.initData(data);
            self.clearCanvas("line");

            for (var key in toUse) {
                if (toUse.hasOwnProperty(key)) {
                    if (toUse[key].length > 0) {
                        self.drawLine(toUse[key]);
                    }
                }
            }

        };
        
        this.clearCanvas = function (name) {
            var count = self.scene.children.length;
            for (var i = count - 1; i >= 0; i--) {
                if (self.scene.children[i].name === name)
                    self.scene.remove(self.scene.children[i]);
            }
            self.renderer.clear();
        };
        
        this.drawLine = function (dataToDraw) {

            var lines = new THREE.Geometry();
            for (var i = 0; i < dataToDraw.length; i++) {
                var temp = dataToDraw[i];
                var x1 = temp.prevTime / self.videoLength * self.width - self.width / 2;
                var x2 = temp.currentTime / self.videoLength * self.width - self.width / 2;
                var y1 = (temp.prevTime > temp.currentTime) ? 0 : self.height / 2;
                var y2 = (temp.prevTime > temp.currentTime) ? - self.height / 2 : 0;
                lines.vertices.push(new THREE.Vector3(x1, y1, 0));
                lines.vertices.push(new THREE.Vector3(x2, y2, 0));
            }

            var line = new THREE.Line(lines, self.defineMaterial(dataToDraw[0]), THREE.LinePieces);
            line.name = "line";
            self.scene.add(line);
            self.renderer.render(self.scene, self.camera);
        };
        
        this.defineMaterial = function (seek) {
            var material;
            if ((seek.currentTime - seek.prevTime) > 0) {  
                material = new THREE.LineBasicMaterial({
                    color: 0xff7800,
                    linewidth: 0.6,
                    opacity: 0.1
                });
                material.transparent = true;
            } else {

                material = new THREE.LineBasicMaterial({
                    color: 0x133cac,
                    linewidth: 1,
                    opacity: 0.1
                });
                material.transparent = true;
            }
            return material;
        };
        
    },
    update(newVal, oldVal) {
        if(!newVal) return;
        if (this.height === 0) {
            this.height = this.el.offsetHeight;
            this.width = this.el.offsetWidth;
            this.renderer = new THREE.WebGLRenderer({ canvas: this.el, alpha: true, antialias: true })
            this.renderer.setSize(this.width, this.height);
            this.renderer.autoClear = true;
            this.camera = new THREE.OrthographicCamera(this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 1, 1000);
            this.camera.position.z = 10;
            this.camera.lookAt(new THREE.Vector3(-0, -0, 0));
            this.scene = new THREE.Scene();
            this.clearCanvas();
        } 
        var maxLength = 0;
        newVal.forEach(function(d){
            if(d.prevTime > maxLength) maxLength = d.prevTime;
        });
        this.videoLength = maxLength;
        // refresh: freshData,
        this.drawAll(newVal);
    }
    
};