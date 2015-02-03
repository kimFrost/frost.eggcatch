'use strict';

// shim layer with setTimeout fallback
window.requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

(function (window, document, undefined) {

  var base = {
    options: {
      debug: true,
      useRoundNum: false,
      gravity: 0.05,
      showCollisonModel: true,
      spawnTicksRequired: 50,
      playerWidth: 275,
      playerHeight: 141,
      eggWidth: 50,
      eggHeight: 80,
      playerColumns: 4,
      playerRows: 2
    },
    scaleMultiplier: 1,
    gameTicks: 0,
    spawnTicks: 0,
    canvas: null,
    canvasCtx: null,
    canvasWidth: 0,
    canvasHeight: 0,
    lastCanvasWidth: 0,
    lastCanvasHeight: 0,
    entities: [],
    players: [],
    playerImage: document.createElement('img'),
    eggImage: document.createElement('img'),
    fpsCount: 0,
    fps: 0,
    logCount: 0,
    states: {}
  };
/**---------------------------------------
  Constructors
---------------------------------------**/
  var Entity = function() {
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.width = 0;
    this.height = 0;
    this.slots = [];
    this.collision = {
      type: 'box',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      radius: 0
    };
    this.image = base.eggImage;
    return this;
  };
/**---------------------------------------
  Log
---------------------------------------**/
  base.log = function (msg, msg2) {
    if (!base.options.debug) {
      return;
    }
    try {
      if (base.logCount > 500) {
        console.clear();
        base.logCount = 0;
      }
      if (msg2 !== undefined) {
        console.log(msg, msg2);
      }
      else {
        console.log(msg);
      }
      base.logCount++;
    }
    catch (err) {
      //send error to developer platform
    }
  };
/**---------------------------------------
  Draw/Update
---------------------------------------**/
  function updateLoop() {
    window.requestAnimFrame(updateLoop);
    checkSpawn();
    update();
    base.fpsCount++;
    base.gameTicks++;
    base.spawnTicks++;
  }

  function checkSpawn() {
    if (base.spawnTicks > base.options.spawnTicksRequired) {
      var entity = new Entity();
      entity.x = Math.floor(Math.random() * (base.canvasWidth - 50));
      entity.height = -(base.options.eggHeight * base.scaleMultiplier);
      entity.width = base.options.eggWidth * base.scaleMultiplier;
      entity.height = base.options.eggHeight * base.scaleMultiplier;
      entity.collision.width = entity.width;
      entity.collision.height = entity.height;
      base.entities.push(entity);
      // Reset spawn ticks
      base.spawnTicks = 0;
    }
  }

  function timedUpdate() {
    var i,
      player;
    for (i=0;i<base.entities.length;i++) {
      var entity = base.entities[i];
      entity.dy += base.options.gravity;
      entity.x += entity.dx;
      entity.y += entity.dy;
      if (base.options.useRoundNum) {
        entity.x = Math.round(entity.x);
        entity.y = Math.round(entity.y);
      }
      // Check entities for out of screen
      if ((entity.y - entity.height) > base.canvasHeight) {
        base.entities.splice(i, 1);
      }
      // Collision detect with player
      else {
        for (var ii=0;ii<base.players.length;ii++) {
          player = base.players[ii];
          if (collisionDetect(player, entity)) {
            putEgg(player, entity);
            base.entities.splice(i, 1);
          }
        }
      }
    }
  }

  function update() {
    //base.log(base.entities.length);
    var i,
        player;
    // Update player bounds
    for (i=0;i<base.players.length;i++) {
      player = base.players[i];
      if (player.x < 0) {
        player.x = 0;
      }
      else if (player.x + player.width > base.canvasWidth) {
        player.x = base.canvasWidth - player.width;
      }
    }
    draw();
  }

  function putEgg(player, entity) {
    for (var i=0; i<player.slots.length; i++) {
      var slot = player.slots[i];
      if (slot.entities.length === 0) {
        slot.entities.push(entity);
        break;
      }
      else {
        continue;
      }
    }
  }

  function draw() {
    base.canvasCtx = base.canvas.getContext('2d');
    var ctx = base.canvasCtx;
    ctx.clearRect(0, 0, base.canvasWidth, base.canvasHeight);
    ctx.save();
    var i;
    var ii;
    var entity;

    // Players
    for (i=0;i<base.players.length;i++) {
      var player = base.players[i];
      ctx.drawImage(base.playerImage, player.x, player.y, player.width, player.height);
      if (base.options.showCollisonModel) {
        ctx.fillStyle = 'rgba(150,0,0,0.3)';
        ctx.fillRect(player.x + player.collision.x, player.y + player.collision.y, player.collision.width, player.collision.height);
      }
      // Entities stored in player slots
      for (ii = 0; ii < player.slots.length; ii++) {
        var slot = player.slots[ii];
        for (var iii = 0; iii < slot.entities.length; iii++) {
          entity = slot.entities[iii];

          ctx.drawImage(entity.image, player.x + slot.ix * entity.width, player.y + slot.iy * entity.height, entity.width, entity.height);
        }
      }
    }

    // Entities
    for (i=0;i<base.entities.length;i++) {
      entity = base.entities[i];
      ctx.drawImage(entity.image, entity.x, entity.y, entity.width, entity.height);
      if (base.options.showCollisonModel) {
        ctx.fillStyle = 'rgba(150,0,0,0.3)';
        ctx.fillRect(entity.x + entity.collision.x, entity.y + entity.collision.y, entity.collision.width, entity.collision.height);
      }
    }
    // Fps
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.font='20px Georgia';
    ctx.fillText('FPS: ' + base.fps,10,30);
    ctx.fillText('TICKS: ' + base.gameTicks,10,50);
    ctx.fillText('EGGS: ' + base.entities.length, 10,70);
  }
/**---------------------------------------
  Collision Detection
---------------------------------------**/
  var collisionDetect = function(c1, c2, type) {
    type = (type === undefined) ? 'box' : type;
    var x1 = c1.x + c1.collision.x;
    var y1 = c1.y + c1.collision.y;
    var x2 = c2.x + c2.collision.x;
    var y2 = c2.y + c2.collision.y;
    if (type === 'box') {
      return (x1 < x2 + c2.collision.width &&
      x1 + c1.collision.width > x2 &&
      y1 < y2 + c2.collision.height &&
      c1.collision.height + y1 > y2);
    }
    else if (type === 'circle') {
      var dx = x1 - x2;
      var dy = y1 - y2;
      var dist = c1.collision.radius + c2.collision.radius;
      return (dx * dx + dy * dy <= dist * dist);
    }
  };
/**---------------------------------------
  Resize
---------------------------------------**/
  var resize = function(width, height) {
    base.canvas.width = width;
    base.canvas.height= height;
    recal();
  };
  var recal = function() {
    base.canvasWidth = base.canvas.width;
    base.canvasHeight = base.canvas.height;
    var widthRatio = base.canvasWidth / base.lastCanvasWidth;
    // Set Size Profile
    if (base.canvasWidth > 1050) {
      base.scaleMultiplier = 1;
    }
    else if (base.canvasWidth > 600) {
      base.scaleMultiplier = 0.7;
    }
    else {
      base.scaleMultiplier = 0.4;
    }
    // Set player size and position
    base.players[0].x = base.players[0].x * widthRatio;
    base.players[0].y = base.canvasHeight - (200 * base.scaleMultiplier);
    base.players[0].width = base.options.playerWidth * base.scaleMultiplier;
    base.players[0].height = base.options.playerHeight * base.scaleMultiplier;
    base.players[0].collision.y = 80 * base.scaleMultiplier;
    base.players[0].collision.width = base.players[0].width;
    base.players[0].collision.height = 20 * base.scaleMultiplier;

    for (var i=0;i<base.entities.length;i++) {
      var entity = base.entities[i];
      entity.x = entity.x * widthRatio;
      entity.width = base.options.eggWidth * base.scaleMultiplier;
      entity.height = base.options.eggHeight * base.scaleMultiplier;
      entity.collision.width = entity.width;
      entity.collision.height = entity.height;
    }

    // Store canvas sizes for ratio calculations
    base.lastCanvasWidth = base.canvasWidth;
    base.lastCanvasHeight = base.canvasHeight;
  };
/**---------------------------------------
  Bindings
---------------------------------------**/
  var setupBindings = function() {
    base.canvas.addEventListener('mousedown', function(event) {
      //base.log('mousedown');
    });
    base.canvas.addEventListener('mouseup', function(event) {
      //base.log('mouseup');
    });
    base.canvas.addEventListener('touchstart', function(event) {
      //base.log('touchstart');
    });
    base.canvas.addEventListener('touchend', function(event) {
      //base.log('touchend');
    });
    base.canvas.addEventListener('mousemove', function(event) {
      //base.log('mousemove', event);
      base.players[0].x = event.x - (base.players[0].width / 2);
    });
    base.canvas.addEventListener('touchmove', function(event) {
      //base.log('touchmove', event);
      event.preventDefault();
      base.players[0].x = event.touches[0].clientX - (base.players[0].width / 2);
    });
    // Resize
    window.addEventListener('resize', function(event){
      // Update canvas size
      var parent = base.canvas.parentElement;
      resize(parent.clientWidth, parent.clientHeight);
    });
  };
/**---------------------------------------
  Start
---------------------------------------**/
  var start = function() {
    updateLoop();
    setInterval(timedUpdate, 1000 / 60);
  };
/**---------------------------------------
  Initialize
---------------------------------------**/
  var initiate = function () {
    var canvas = document.createElement('canvas');
    var canvasAttrWidth = document.createAttribute('width');
    canvasAttrWidth.value = '1200';
    canvas.setAttributeNode(canvasAttrWidth);
    var canvasAttrHeight = document.createAttribute('height');
    canvasAttrHeight.value = '800';
    canvas.setAttributeNode(canvasAttrHeight);
    //canvas.style.width = '100%';
    //canvas.style.height = '100%';
    document.body.appendChild(canvas);
    base.canvas = canvas;
    base.canvasCtx = canvas.getContext('2d');
    base.eggImage.src = 'egg.png';
    base.playerImage.src = 'bakke.png';

    // Create Paddle
    var player = new Entity();
    player.x = Math.floor(0.5 * base.canvasWidth - (base.options.playerWidth / 2));
    player.y = base.canvasHeight - 200;
    player.width = base.options.playerWidth;
    player.height = base.options.playerHeight;
    player.collision.type = 'box';
    player.collision.x = 0;
    player.collision.y = 80;
    player.collision.width = player.width;
    player.collision.height = 20;

    // Create player slot for eggs
    for (var i=0; i < base.options.playerColumns * base.options.playerRows; i++) {
      player.slots.push({
        ix: i % 4,
        iy: Math.floor(i / 4),
        entities: []
      });
    }

    base.players.push(player);

    // Update canvas size
    var parent = base.canvas.parentElement;
    resize(parent.clientWidth, parent.clientHeight);

    setupBindings();
    start();
    setInterval(function() {
      base.fps = base.fpsCount;
      base.fpsCount = 0;
    },1000);
  };
  initiate();
  window.base = base;

})(window, window.document);
