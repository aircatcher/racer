var Road = function(game) {
    this.game = game;
    // 道路宽度（3d world）
    this.width = 4000;
    // 道路分段
    this.segments = [];
    // 道路分段数量
    this.segmentCount = 500;
    // 道路分段间距
    this.segmentGap = 200;
    // 总长度
    this.trackDistance = this.segmentCount * this.segmentGap;
    // 每3条分段使用相同配色
    this.stripLength = 3;
    // 车道数量
    this.lanes = 3;
    // 道路颜色
    this.colors = {
        light : {road : '#6B6B6B', grass : '#10AA10', rumble : '#555555', lane : '#CCCCCC'},
        dark : {road : '#696969', grass : '#009A00', rumble : '#BBBBBB'}
    };

    // 初始化道路分段
    for(var i = 0; i < this.segmentCount; i++) {
        this.segments.push({
            world : {z : this.segmentGap * i},
            camera : null,
            screen : null,
            color : Math.floor(i / this.stripLength) % 2 ? this.colors.dark : this.colors.light
        });
    }
};

Road.prototype = {
    init : function() {
        this.bitmap = this.game.engine.add.bitmapData(
            this.game.resolution.x,
            this.game.resolution.y
        );
        this.game.engine.add.image(0, 0, this.bitmap);
    },

    render : function() {
        var base = this.findSegmentIndex(this.game.camera.z);
        for(var i = 0; i < this.segmentCount; i++) {
            var p1 = this.segments[(base + i) % this.segmentCount],
                p2 = this.segments[(base + i + 1) % this.segmentCount];

            this.project(p1);
            this.project(p2);

            var rw1 = this.rumbleWidth(p1.screen.w),
                rw2 = this.rumbleWidth(p2.screen.w);

            this.polygon(this.bitmap.ctx,
                p1.screen.x - p1.screen.w / 2 - rw1, p1.screen.y,
                p1.screen.x - p1.screen.w / 2, p1.screen.y,
                p2.screen.x - p2.screen.w / 2, p2.screen.y,
                p2.screen.x - p2.screen.w / 2 - rw2, p2.screen.y
            );

            this.polygon(this.bitmap.ctx,
                p1.screen.x + p1.screen.w / 2 + rw1, p1.screen.y,
                p1.screen.x + p1.screen.w / 2, p1.screen.y,
                p2.screen.x + p2.screen.w / 2, p2.screen.y,
                p2.screen.x + p2.screen.w / 2 + rw2, p2.screen.y
            );

            this.polygon(this.bitmap.ctx,
                p1.screen.x - p1.screen.w / 2, p1.screen.y,
                p1.screen.x + p1.screen.w / 2, p1.screen.y,
                p2.screen.x + p2.screen.w / 2, p2.screen.y,
                p2.screen.x - p2.screen.w / 2, p2.screen.y
            );
        }
    },

    findSegmentIndex : function(z) {
        return Math.floor(z / this.segmentGap) % this.segmentCount;
    },

    findSegment : function(z) {
        return this.segments[this.findSegmentIndex(z)];
    },

    rumbleWidth : function(projectedRoadWidth) {
        return projectedRoadWidth / Math.max(6,  2 * this.lanes);
    },

    laneMarkerWidth: function(projectedRoadWidth) {
        return projectedRoadWidth / Math.max(32, 8 * this.lanes);
    },

    polygon : function(ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
        ctx.closePath();
        ctx.fill();
    },

    project : function(p) {
        if(!p.camera) {
            p.camera = {
                x : p.x || 0 - this.game.camera.x,
                y : p.y || 0 - this.game.camera.y,
                z : p.z || 0 - this.game.camera.z
            };
        }

        if(!p.screen) {
            var rate = this.game.cameraDepth / p.camera.z;
            p.screen = {
                x : Math.round(this.game.resolution.x / 2 + rate * p.camera.x),
                y : Math.round(this.game.resolution.y / 2 - rate * p.camera.y),
                w : Math.round(rate * this.width)
            };
        }
    }
};