var Racer = function(opts) {
    //分辨率 or canvas宽高
    this.resolution = {x : 640, y : 480};
    //游戏镜头坐标
    this.pseudo3DCamera = {x : 0, y : 1000, z : 0};
    //水平视角
    this.fieldOfView = 100 * Math.PI / 180;
    //镜头与屏幕的间距
    this.cameraDepth = this.resolution.x / 2 / Math.tan(this.fieldOfView / 2);
    //phaser初始化
    this.engine = new Phaser.Game(this.resolution.x, this.resolution.y, Phaser.AUTO, "racer");
    //road
    this.road = new Road(this);
    //car
    this.car = new Car(this);
    //启动游戏
    this.engine.state.add("racer", this, true);

    console.log(this.engine);
};

Racer.prototype = {
    preload : function() {
        this.engine.load.image("background-hills", "imgs/hills.png");
        this.engine.load.image("background-sky", "imgs/sky.png");
        this.engine.load.image("background-trees", "imgs/trees.png");
        this.car.loadImage();
    },

    create : function() {
        // 显示fps
        this.engine.time.advancedTiming = true;
        this.fpsText = this.engine.add.text(
            20, 20, '', { font: '16px Arial', fill: '#ffffff' }
        );

        if(!this.background) this.background = {};
        this.background.sky = this.engine.add.image(0, 0, "background-sky");
        this.background.hills = this.engine.add.image(0, 0, "background-hills");
        this.background.tress = this.engine.add.image(0, 0, "background-trees");

        if(!this.key) this.key = {};
        this.key.up = this.engine.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.key.down = this.engine.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.key.left = this.engine.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.key.right = this.engine.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

        this.road.init();
        this.car.init();
    },

    update : function() {
        // 更新fps
        if (this.engine.time.fps !== 0) {
            this.fpsText.setText(this.engine.time.fps + ' FPS');
        }

        this.car.run(this.time.physicsElapsed);
        this.pseudo3DCamera.z = this.car.z - this.cameraDepth;

        if(this.key.up.isDown) {
            this.car.accelerate(this.time.physicsElapsed);
        } else if(this.key.down.isDown) {
            this.car.brake(this.time.physicsElapsed);
        } else {
            this.car.decelerate(this.time.physicsElapsed);
        }

        if(this.key.right.isDown) {
            this.car.turnRight();
        } else if(this.key.left.isDown) {
            this.car.turnLeft();
        }
    },

    render : function() {
        this.road.render();
        this.car.render();
    }
};