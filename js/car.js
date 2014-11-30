var Car = function(game) {
    this.game = game;
    this.offsetX = 0;
    this.mileage = 0;
    this.speed = 0;
    this.maxSpeed = this.game.road.segmentGap * 60;
    this.accel = this.maxSpeed / 5;
    this.breaking = -this.maxSpeed;
    this.decel = -this.maxSpeed / 5;
    this.offRoadDecel = -this.maxSpeed / 2;
    this.offRoadMaxSpeed = this.maxSpeed / 4;
    this.dx = this.game.road.width / 1000 * this.game.resolution.x / 2;
    this._imgs = {width : 80, height : 41};
    this._imgs.screenW = this.game.resolution.x / (this.game.road.lanes + 1);
    this._imgs.screenH = this._imgs.screenW / this._imgs.width * this._imgs.height;
};

Car.prototype = {
    loadImage : function() {
        this.game.engine.load.image("player-left", "imgs/player_left.png");
        this.game.engine.load.image("player-right", "imgs/player_right.png");
        this.game.engine.load.image("player-straight", "imgs/player_straight.png");
    },

    init : function() {
        this._imgs.straight = this.game.engine.cache.getImage('player-straight');
        this._imgs.straightLeft = this.game.engine.cache.getImage('player-left');
        this._imgs.straightRight = this.game.engine.cache.getImage('player-right');

        this.bitmap = this.game.engine.add.bitmapData(
            this._imgs.screenW,
            this._imgs.screenH
        );
        this.game.engine.add.image(
            (this.game.resolution.x - this._imgs.screenW) / 2,
            (this.game.resolution.y - this._imgs.screenH),
            this.bitmap
        );
    },

    _increaseSpeed : function(increment) {
        var speed = this.speed + increment;
        if(speed < 0) speed = 0;
        if(speed > this.maxSpeed) speed = this.maxSpeed;
        this.speed = speed;
        return this.speed;
    },

    isOffRoad : function() {
        return this.offsetX > this.game.road.width / 2 ||
            this.offsetX < -this.game.road.width / 2;
    },

    accelerate : function(t) {
        if(this.isOffRoad() && this.speed > this.offRoadMaxSpeed) {
            this._increaseSpeed(this.offRoadDecel * t);
        } else {
            this._increaseSpeed(this.accel * t);
        }
        return this.speed;
    },

    brake : function(t) {
        return this._increaseSpeed(this.breaking * t);
    },

    decelerate : function(t) {
        if(this.isOffRoad() && this.speed > this.offRoadMaxSpeed) {
            this._increaseSpeed(this.offRoadDecel * t);
        } else {
            this._increaseSpeed(this.decel * t);
        }
        return this.speed;
    },

    turnRight : function(t) {
        this.offsetX += this.dx * t * this.speed / this.maxSpeed;
        if(this.offsetX > this.game.road.width) this.offsetX = this.game.road.width;
        return this.offsetX;
    },

    turnLeft : function(t) {
        this.offsetX -= this.dx * t * this.speed / this.maxSpeed;
        if(this.offsetX < -this.game.road.width) this.offsetX = -this.game.road.width;
        return this.offsetX;
    },

    run : function(t) {
        this.mileage += this.speed * t;
        if(this.mileage >= this.game.road.trackDistance) {
            this.mileage -= this.game.road.trackDistance;
        }
        return this.mileage;
    },

    render : function() {
        var img;
        if(this.game.key.left.isDown) {
            img = this._imgs.straightLeft;
        } else if(this.game.key.right.isDown) {
            img = this._imgs.straightRight;
        } else {
            img = this._imgs.straight;
        }
        this.bitmap.ctx.clearRect(0, 0, this.bitmap.width, this.bitmap.height);
        var bounce = 0;
        if(this.speed > 0) {
            bounce = (2 * Math.random() * this.speed / this.maxSpeed * this.game.resolution.y / 480) * 1;
        }
        this.bitmap.ctx.drawImage(img,
            0, 0, this._imgs.width, this._imgs.height,
            0, bounce, this._imgs.screenW, this._imgs.screenH);
        this.bitmap.dirty = true;
    }
};