var Road = function(game) {
    this.game = game;
    // 道路宽度（3d world）
    this.width = 4000;
    // 道路分段
    this.segments = [];
    // 道路分段数量
    // this.segments.length = 500;
    // 道路分段间距
    this.segmentGap = 200;
    // 总长度
    // this.trackDistance = this.segments.length * this.segmentGap;
    // 每3条分段使用相同配色
    this.stripLength = 3;
    // 车道数量
    this.lanes = 3;
    // 道路颜色
    this.colors = {
        light : {road : '#6B6B6B', grass : '#10AA10', rumble : '#555555', lane : '#CCCCCC'},
        dark : {road : '#696969', grass : '#009A00', rumble : '#BBBBBB'}
    };

    this.setRoad();
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
        this.bitmap.ctx.clearRect(0, 0, this.game.resolution.x, this.game.resolution.y);

        var base = this.findSegmentIndex(this.game.pseudo3DCamera.z + this.game.car.mileage),
            maxy = this.game.resolution.y,
            pseudo3DCamera = this.game.pseudo3DCamera,
            car = this.game.car;

        for(var i = 0; i < this.segments.length; i++) {
            var cur = (base + i) % this.segments.length,
                segment = this.segments[cur],
                p1 = segment.p1,
                p2 = segment.p2,
                looped = cur < base;

            this.project(p1, pseudo3DCamera.x + car.offsetX, pseudo3DCamera.y + car.offsetY,
                pseudo3DCamera.z + (looped ? car.mileage - this.trackDistance : car.mileage));
            this.project(p2, pseudo3DCamera.x + car.offsetX, pseudo3DCamera.y + car.offsetY,
                pseudo3DCamera.z + (looped ? car.mileage - this.trackDistance : car.mileage));

            if(p2.screen.y >= maxy) continue;

            var rw1 = this.rumbleWidth(p1.screen.w),
                rw2 = this.rumbleWidth(p2.screen.w);

            //草地
            this.polygon(this.bitmap.ctx,
                0, p2.screen.y,
                this.game.resolution.x, p2.screen.y,
                this.game.resolution.x, p1.screen.y,
                0, p1.screen.y,
                segment.color.grass
            );

            //公路左边界
            this.polygon(this.bitmap.ctx,
                p1.screen.x - p1.screen.w / 2 - rw1, p1.screen.y,
                p1.screen.x - p1.screen.w / 2, p1.screen.y,
                p2.screen.x - p2.screen.w / 2, p2.screen.y,
                p2.screen.x - p2.screen.w / 2 - rw2, p2.screen.y,
                segment.color.rumble
            );

            //公路右边界
            this.polygon(this.bitmap.ctx,
                p1.screen.x + p1.screen.w / 2 + rw1, p1.screen.y,
                p1.screen.x + p1.screen.w / 2, p1.screen.y,
                p2.screen.x + p2.screen.w / 2, p2.screen.y,
                p2.screen.x + p2.screen.w / 2 + rw2, p2.screen.y,
                segment.color.rumble
            );

            //公路
            this.polygon(this.bitmap.ctx,
                p1.screen.x - p1.screen.w / 2, p1.screen.y,
                p1.screen.x + p1.screen.w / 2, p1.screen.y,
                p2.screen.x + p2.screen.w / 2, p2.screen.y,
                p2.screen.x - p2.screen.w / 2, p2.screen.y,
                segment.color.road
            );

            if(segment.color.lane) {
                var lw1 = this.laneMarkerWidth(p1.screen.w),
                    lw2 = this.laneMarkerWidth(p2.screen.w);
                for(var j = 1; j < this.lanes; j++) {
                    this.polygon(
                        this.bitmap.ctx,
                        p1.screen.x - p1.screen.w / 2 + p1.screen.w / this.lanes * j - lw1 / 2, p1.screen.y,
                        p1.screen.x - p1.screen.w / 2 + p1.screen.w / this.lanes * j + lw1 / 2, p1.screen.y,
                        p2.screen.x - p2.screen.w / 2 + p2.screen.w / this.lanes * j + lw2 / 2, p2.screen.y,
                        p2.screen.x - p2.screen.w / 2 + p2.screen.w / this.lanes * j - lw2 / 2, p2.screen.y,
                        segment.color.lane
                    );
                }
            }

            maxy = p2.screen.y;
        }

        this.bitmap.dirty = true;
    },

    findSegmentIndex : function(z) {
        return Math.floor(z / this.segmentGap) % this.segments.length;
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

    project : function(p, cameraX, cameraY, cameraZ) {
        p.camera = {
            x : (p.world.x || 0) - cameraX,
            y : (p.world.y || 0) - cameraY,
            z : (p.world.z || 0) - cameraZ
        };

        var rate = this.game.cameraDepth / p.camera.z;
        p.screen = {
            x : Math.round(this.game.resolution.x / 2 + rate * p.camera.x),
            y : Math.round(this.game.resolution.y / 2 - rate * p.camera.y),
            w : Math.round(rate * this.width)
        };
    },

    setRoad : function() {
        // 初始化道路分段
        var num = Road.LENGTH.SHORT;
        var height = Road.HILL.LOW;
        this.addRoad(num, num, num, 0, height/2);
        this.addRoad(num, num, num, 0, -height);
        this.addRoad(num, num, num, 0, height);
        this.addRoad(num, num, num, 0, 0);
        this.addRoad(num, num, num, 0, height/2);
        this.addRoad(num, num, num, 0, 0);
        this.addRoad(num, num, num, 0, -this._lastY() / this.segmentGap);
        this.trackDistance = this.segments.length * this.segmentGap;
    },

    addSegment : function(curve, y) {
        var i = this.segments.length,
            lastY = this._lastY();
        this.segments.push({
            p1 : {world : {y : lastY, z : this.segmentGap * i}, camera : null, screen : null},
            p2 : {world : {y : y, z : this.segmentGap * (i + 1)}, camera : null, screen : null},
            color : Math.floor(i / this.stripLength) % 2 ? this.colors.dark : this.colors.light,
            curve : curve
        });
    },

    addRoad : function(enter, hold, leave, curve, y) {
        var startY = this._lastY(),
            endY = startY + y * this.segmentGap,
            total = enter + hold + leave,
            i;
        for(i = 0; i < enter; i++) {
            this.addSegment(Road.easeIn(0, curve, i / enter), Road.easeInOut(startY, endY, i / total));
        }
        for(i = 0; i < hold; i++) {
            this.addSegment(curve, Road.easeInOut(startY, endY, (enter + i) / total));
        }
        for(i = 0; i < leave; i++) {
            this.addSegment(Road.easeInOut(curve, 0, i / leave), Road.easeInOut(startY, endY, (enter + hold + i) / total));
        }
    },

    addStraight : function(num) {
        num = num || ROAD.LENGTH.MEDIUM;
        this.addRoad(num, num, num, 0, 0);
    },

    addHill : function(num, height) {
        num = num || ROAD.LENGTH.MEDIUM;
        height = height || ROAD.HILL.MEDIUM;
        this.addRoad(num, num, num, 0, height);
    },

    addCurve : function(num, curve, height) {
        num = num || ROAD.LENGTH.MEDIUM;
        curve = curve || ROAD.CURVE.MEDIUM;
        height = height || ROAD.HILL.NONE;
        this.addRoad(num, num, num, curve, height);
    },

    addLowRollingHills : function() {
        num = num || ROAD.LENGTH.SHORT;
        height = height || ROAD.HILL.LOW;
        this.addRoad(num, num, num, 0, height/2);
        this.addRoad(num, num, num, 0, -height);
        this.addRoad(num, num, num, ROAD.CURVE.EASY, height);
        this.addRoad(num, num, num, 0, 0);
        this.addRoad(num, num, num, -ROAD.CURVE.EASY, height/2);
        this.addRoad(num, num, num, 0, 0);
    },

    addDownhillToEnd : function() {
        num = num || 200;
        this.addRoad(num, num, num, -ROAD.CURVE.EASY, -lastY() / segmentGap);
    },

    addSCurves : function() {
        this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.EASY, ROAD.HILL.NONE);
        this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
        this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.CURVE.EASY, -ROAD.HILL.LOW);
        this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.EASY, ROAD.HILL.MEDIUM);
        this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.MEDIUM, -ROAD.HILL.MEDIUM);
    },

    addBumps : function() {
        this.addRoad(10, 10, 10, 0, 5);
        this.addRoad(10, 10, 10, 0, -2);
        this.addRoad(10, 10, 10, 0, -5);
        this.addRoad(10, 10, 10, 0, 8);
        this.addRoad(10, 10, 10, 0, 5);
        this.addRoad(10, 10, 10, 0, -7);
        this.addRoad(10, 10, 10, 0, 5);
        this.addRoad(10, 10, 10, 0, -2);
    },

    _lastY : function() {
        var i = this.segments.length;
        return i === 0 ? 0 : this.segments[i - 1].p2.world.y;
    }
};

Road.LENGTH = {NONE : 0, SHORT : 25, MEDIUM : 50, LONG : 100};
Road.HILL = {NONE : 0, LOW : 20, MEDIUM : 40, HIGH : 60};
Road.CURVE = {NONE : 0, EASY : 2, MEDIUM : 4, HARD : 6};

Road.easeInOut = function(a, b, percent) {
    return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5);
};

Road.easeIn = function(a, b, percent) {
    return a + (b - a) * Math.pow(percent, 2);
};