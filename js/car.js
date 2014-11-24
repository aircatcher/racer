var Car = function(game) {
    this.game = game;
    this.x = 0;
    this.y = 0;
    this.z = this.game.pseudo3DCamera.y / Math.tan(this.game.fieldOfView / 2);
    this.speed = 0;
    this.maxSpeed = 1000;
    this.accel = this.maxSpeed / 5;
    this.breaking = -this.maxSpeed;
    this.decel = -this.maxSpeed / 5;
};

Car.prototype = {
    loadImage : function() {
        this.game.engine.load.image("player-left", "imgs/player_left.png");
        this.game.engine.load.image("player-right", "imgs/player_right.png");
        this.game.engine.load.image("player-straight", "imgs/player_straight.png");
    },

    init : function() {
        this.bitmap = this.game.engine.add.bitmapData(
            this.game.resolution.x,
            this.game.resolution.y
        );
        this.game.engine.add.image(0, 0, this.bitmap);
    },

    accelerate : function(t) {
        this.speed += this.accel * t;
        if(this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        return this.speed;
    },

    brake : function(t) {
        this.speed += this.breaking * t;
        if(this.speed < 0) this.speed = 0;
        return this.speed;
    },

    decelerate : function(t) {
        this.speed += this.decel * t;
        if(this.speed < 0) this.speed = 0;
        return this.speed;
    },

    turnRight : function() {},

    turnLeft : function() {},

    run : function(t) {
        this.z += this.speed * t;
        if(this.z >= this.game.road.trackDistance) {
            this.z -= this.game.road.trackDistance;
        }
        return this.z;
    },

    render : function() {}
};