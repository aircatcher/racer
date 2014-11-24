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
        var base = this.findSegmentIndex(this.game.pseudo3DCamera.z),
            maxy = this.game.resolution.y;

        for(var i = 0; i < this.segmentCount - 1; i++) {
            var p1 = this.segments[(base + i) % this.segmentCount],
                p2 = this.segments[(base + i + 1) % this.segmentCount];

            this.project(p1);
            this.project(p2);

            // if(p1.screen.y >= maxy) continue;

            var rw1 = this.rumbleWidth(p1.screen.w),
                rw2 = this.rumbleWidth(p2.screen.w);

            //草地
            this.polygon(this.bitmap.ctx,
                0, p2.screen.y,
                this.game.resolution.x, p2.screen.y,
                this.game.resolution.x, p1.screen.y,
                0, p1.screen.y,
                p1.color.grass
            );

            //公路左边界
            this.polygon(this.bitmap.ctx,
                p1.screen.x - p1.screen.w / 2 - rw1, p1.screen.y,
                p1.screen.x - p1.screen.w / 2, p1.screen.y,
                p2.screen.x - p2.screen.w / 2, p2.screen.y,
                p2.screen.x - p2.screen.w / 2 - rw2, p2.screen.y,
                p1.color.rumble
            );

            //公路右边界
            this.polygon(this.bitmap.ctx,
                p1.screen.x + p1.screen.w / 2 + rw1, p1.screen.y,
                p1.screen.x + p1.screen.w / 2, p1.screen.y,
                p2.screen.x + p2.screen.w / 2, p2.screen.y,
                p2.screen.x + p2.screen.w / 2 + rw2, p2.screen.y,
                p1.color.rumble
            );

            //公路
            this.polygon(this.bitmap.ctx,
                p1.screen.x - p1.screen.w / 2, p1.screen.y,
                p1.screen.x + p1.screen.w / 2, p1.screen.y,
                p2.screen.x + p2.screen.w / 2, p2.screen.y,
                p2.screen.x - p2.screen.w / 2, p2.screen.y,
                p1.color.road
            );

            if(p1.color.lane) {
                var lw1 = this.laneMarkerWidth(p1.screen.w),
                    lw2 = this.laneMarkerWidth(p2.screen.w);
                for(var j = 1; j < this.lanes; j++) {
                    this.polygon(
                        this.bitmap.ctx,
                        p1.screen.x - p1.screen.w / 2 + p1.screen.w / this.lanes * j - lw1 / 2, p1.screen.y,
                        p1.screen.x - p1.screen.w / 2 + p1.screen.w / this.lanes * j + lw1 / 2, p1.screen.y,
                        p2.screen.x - p2.screen.w / 2 + p2.screen.w / this.lanes * j + lw2 / 2, p2.screen.y,
                        p2.screen.x - p2.screen.w / 2 + p2.screen.w / this.lanes * j - lw2 / 2, p2.screen.y,
                        p1.color.lane
                    );
                }
            }

            maxy = p1.screen.y;
        }

        this.bitmap.dirty = true;
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
        var camera = this.game.pseudo3DCamera;
        p.camera = {
            x : p.world.x || 0 - camera.x,
            y : p.world.y || 0 - camera.y,
            z : p.world.z || 0 - (camera.z - p.world.z < camera.z ? this.trackDistance : 0)
        };

        var rate = this.game.cameraDepth / p.camera.z;
        p.screen = {
            x : Math.round(this.game.resolution.x / 2 + rate * p.camera.x),
            y : Math.round(this.game.resolution.y / 2 - rate * p.camera.y),
            w : Math.round(rate * this.width)
        };
    }
};