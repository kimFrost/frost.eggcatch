 window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
/**-------------------------
 Orbiter v0.0.4
-------------------------**/
$(document).ready(function() {
;(function($){
/**---------------------------------------
	Global variables
---------------------------------------**/
		var base = this;
		var planets = [];
		var asteroids = [];
		var players = [];
		var stageScale = 1;
		var stageX = 0;
		var stageY = 0;
		var prevXPos;
		var prevYPos;
		var canvas = document.getElementById('orbiter');
		var ctx = canvas.getContext('2d');
		var canvasBG = document.getElementById('orbiterBG');
		var BGctx = canvasBG.getContext('2d');
		var canvasBackground = '#000000';
		var canvasWidth;
		var canvasHeight;
		var windowWidth;
		var windowHeight;
		var numOfStars = 1200;
		var stars = [];
		var fps = 0;
		var gravityPull = 0.015;
		var debugArray = [];
/**---------------------------------------
	Init
---------------------------------------**/
		base.init = function() {
			base.resize();
			base.setupUniverse();
			$(window).on('resize',function() {
				//use smart resize instead
				base.resize();
			});
			base.drawStarBG();
			base.setupPlayers();
			base.setupControls();
			update();
			setInterval(function() {
				$('#fps').html('fps: '+fps);
				fps = 0;
			},1000);
	}
/**---------------------------------------
	Setup Universe
---------------------------------------**/
		base.setupUniverse = function() {
			base.setupStars();
			var numOfPlanets = Math.floor((Math.random()*5)+1);
			//setup planets
			for (i=0;i<numOfPlanets;i++) {
				var planet = {};
				planet.radius = Math.floor((Math.random()*150)+50);
				planet.gravity = planet.radius/2;
				planet.planetDebug = false;
				planet.gravityDebug = false,
				planet.type = 'rock';
				planet.mass = 1.0;
				planet.xPos = Math.floor((Math.random()*canvasWidth)+0);
				planet.yPos = Math.floor((Math.random()*canvasHeight)+0);
				//validate planets colision
				for (n=0;n<planets.length;n++) {
					base.consoleLog(base.collisitonDetect(planet,planets[n]));
				}
				planets.push(planet);
			}
			//validate positions of planets and objects

		}
		base.setupStars = function() {
			for (i=0;i<numOfStars;i++) {
				var star = {};
				star.size = Math.floor((Math.random()*1)+1);
				star.color = 'rgba(255,255,255,'+Math.random()+')';
				star.xPos = Math.floor((Math.random()*canvasWidth)+0);
				star.yPos = Math.floor((Math.random()*canvasHeight)+0);
				star.blur = Math.floor((Math.random()*10)+1);
				stars.push(star);
			}
			for (i=0;i<stars.length*0.75;i++) {
				var colorChance = Math.floor((Math.random()*20)+1);


				if (colorChance == 1) {
					stars[i].color = 'rgba(237,45,13,'+Math.floor((Math.random()*3)+1)/10+')';
				}
				else if (colorChance == 2) {
					stars[i].color = 'rgba(72,167,255,'+Math.floor((Math.random()*3)+1)/10+')';
				}
				else if (colorChance == 3) {
					stars[i].color = 'rgba(255,211,59,'+Math.floor((Math.random()*3)+1)/10+')';
				}
				else {
					stars[i].color = 'rgba(255,255,255,'+Math.floor((Math.random()*3)+1)/10+')';
				}
			}
		}
		base.setupPlayers = function() {
			for (i=0;i<1;i++) {
				var player = {};
				player.xPos = 150;
				player.yPos = 150;
				player.ship = 'something';
				player.xv = 1;
				player.yv = 0.3;
				player.radius = 10;
				player.velocity = 1;
				player.direction = 20;
				player.debugPullPoint = [90,20];
				players.push(player);
			}
		}
		base.drawStarBG = function() {
			//Draw stars
			for (i=0;i<stars.length;i++) {
				var star = stars[i];
				BGctx.beginPath();
				BGctx.fillStyle = star.color;
				BGctx.arc( star.xPos, star.yPos, star.size, 0, 2*Math.PI, false);
				BGctx.shadowColor = '#fff';
	 			BGctx.shadowBlur = star.blur;
				BGctx.closePath();
				BGctx.fill();
			}
		}
/**---------------------------------------
	Setup Controls
---------------------------------------**/
		base.setupControls = function() {
			$(canvas).on('mousedown', function(e) {
				e.preventDefault();
				prevXPos = e.pageX;
				prevYPos = e.pageY;
				$(canvas).on('mousemove', function(e) {
					base.handleDrag(e);
				});
				$(canvas).on('mouseup', function(e) {
					$(canvas).off('mousemove');
				});
			});
			$('#controls').append('<input type="button" class="zoomOut" value="Zoom Out" />');
			$('#controls').append('<input type="button" class="zoomIn" value="Zoom In" />');
			$('#controls').on('click','.zoomOut',function() {
				base.zoomControl(-0.1);
			}).on('click','.zoomIn',function() {
				base.zoomControl(+0.1);
			});
		}
		base.handleDrag = function(e) {
			e.preventDefault();
			var distanceX = prevXPos - e.pageX;
			var distanceY = prevYPos - e.pageY;
			prevXPos = e.pageX;
			prevYPos = e.pageY;
			base.moveWorld(distanceX,distanceY);
		}
/**---------------------------------------
	Zoom World
---------------------------------------**/
		base.zoomControl = function(amount,zoomToObject) {
			if (zoomToObject == undefined && amount == undefined) {

			}
			else if (zoomToObject == undefined && amount != undefined) {
				base.scaleValue(amount);
			}
			else if (zoomToObject != undefined && amount == undefined) {

			}
			else {

			}
		}
		base.scaleValue = function(amount) {
			if (stageScale + amount > 0.1) {
				stageScale = stageScale + amount;
			}
		}
/**---------------------------------------
	Move World
---------------------------------------**/
		base.moveWorld = function(xAdd,yAdd) {
			stageX = stageX - xAdd/stageScale;
			stageY = stageY - yAdd/stageScale;
		}
/**---------------------------------------
	Resize
---------------------------------------**/
		base.resize = function() {
			windowWidth = $(window).width();
			windowHeight = $(window).height();
			//$(canvas).width(windowWidth);
			//$(canvas).height(windowHeight);
			canvasWidth = canvas.width;
			canvasHeight = canvas.height;
			ctx = canvas.getContext('2d');
		}
/**---------------------------------------
	Collision Dectection
---------------------------------------**/
		base.collisitonDetect = function(c1,c2,type) {
			var dx = c1.xPos - c2.xPos;
			var dy = c1.yPos - c2.yPos;
			var dist = c1.radius + c2.radius;
			return (dx * dx + dy * dy <= dist * dist)
		}
		base.planetCollestionDetect = function(obj) {
			for (i=0;i<planets.length;i++) {
				var planet = planets[i];
				var dx = obj.xPos - planet.xPos;
				var dy = obj.yPos - planet.yPos;

				//check planet
				var planetDist = obj.radius + planet.radius;
				if (dx * dx + dy * dy <= planetDist * planetDist) {
					planet.planetDebug = true;
				}
				else {
					planet.planetDebug = false;
				}

				//check gravity
				var gravityDist = obj.radius + planet.radius + planet.gravity;
				if (dx * dx + dy * dy <= gravityDist * gravityDist) {
					planet.gravityDebug = true;

					var distX = planet.xPos - obj.xPos;
					var distY = planet.yPos - obj.yPos;

					//if in dead center, don't cal
					if (distX == 0 && distY == 0) continue;

					var absDistX = Math.abs(distX);
					var absDistY = Math.abs(distY);

					var distCenter = Math.sqrt(Math.pow(distX,2)+Math.pow(distY,2));
					var distSurface = distCenter-planet.radius;

					var xUnits;
					var yUnits;

					//if inside the planet
					if (distSurface <= 0) {


						//continue;
					}

					//Draw line between obj and gravity field
					var debugLine = {};
					debugLine.type = 'line';
					debugLine.xStart = obj.xPos;
					debugLine.yStart = obj.yPos;
					debugLine.xEnd = planet.xPos;
					debugLine.yEnd = planet.yPos;
					debugArray.push(debugLine);

					//Add gravity pull to obj
					if (absDistX >= absDistY) {
						//take into account the size of the gravity field
						xUnits = distX/absDistX*gravityPull;
						yUnits = distY/absDistX*gravityPull;
					}
					else if (absDistX < absDistY) {
						xUnits = distX/absDistY*gravityPull;
						yUnits = distY/absDistY*gravityPull;
					}




					obj.xv = obj.xv + xUnits;
					obj.yv = obj.yv + yUnits;

					//if inside the planet
					if (distSurface <= 0) {
						obj.xv = obj.xv - (xUnits*15);
						obj.yv = obj.yv - (yUnits*15);
					}

					//console.log('obj.xv: '+obj.xv);
					//console.log('obj.yv: '+obj.yv);

					//console.log((obj.xPos)+' , '+(obj.yPos));
					//console.log((obj.xPos - planet.xPos)+' , '+(obj.yPos - planet.yPos));
					//var distX = obj.xPos - planet.xPos;
					//var distY = obj.yPos - planet.yPos;



					/*
					var radians = player.direction * Math.PI/180;
					var xUnits = Math.cos(radians) * player.velocity;
					var yUnits = Math.sin(radians) * player.velocity;
					*/

					/*
					if (Math.abs(distX) > Math.abs(distY)) {
						obj.xv = obj.xv + 0.1;
						obj.yv = obj.yv + 0.1/distX;

					}
					else if (Math.abs(distX) < Math.abs(distY)) {
						obj.xv = obj.xv + 0.1/distY;
						obj.yv = obj.yv + 0.1;
					}
					else {

					}
					*/

					//obj.xv -= -0.05;

				}
				else {
					planet.gravityDebug = false;
				}


			}
		}
/**---------------------------------------
	Game loop
---------------------------------------**/
		function update() {
			requestAnimFrame(update);
			base.updateObjects();
			base.draw();
			$('#devStats').html('<p>'+stageX+'</p><p>'+stageY+'</p><p>'+stageScale+'</p>');
		}
		base.updateObjects = function() {
			for (i=0;i<players.length;i++) {
				var player = players[i];

				/*
				if (player.velocity > 0) {
					//cal new points
					var radians = player.direction * Math.PI/180;
					var xUnits = Math.cos(radians) * player.velocity;
					var yUnits = Math.sin(radians) * player.velocity;

					player.xPos += xUnits;
					player.yPos += yUnits;

					base.planetCollestionDetect(player);
				}
				*/
				base.planetCollestionDetect(player);

				player.xPos += player.xv;
				player.yPos += player.yv;
			}
		}
		base.draw = function() {
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			/*
			ctx.fillStyle = 'rgb(20,20,20)';
	   		ctx.fillRect( 0, 0, canvasWidth, canvasHeight );
	   		*/
			ctx.save();

			//ctx.restore();

			//Draw planets
			for (i=0;i<planets.length;i++) {
				var planet = planets[i];
				var planetX = (planet.xPos+stageX)*stageScale;
				var planetY = (planet.yPos+stageY)*stageScale;
				var planetRadius = planet.radius*stageScale;
				var planetGravity = planet.gravity*stageScale;

				//gravity fields
				ctx.beginPath();
				ctx.fillStyle = 'rgba(255,255,255,0.05)';

				//highlight debug
				if (planet.gravityDebug == true) ctx.fillStyle = 'rgba(255,255,255,0.4)';

				ctx.arc( planetX, planetY, planetRadius+planetGravity, 0, 2*Math.PI, false);
				ctx.closePath();
				ctx.fill();

				//var gr=ctx.createRadialGradient(startX, startY, startRadius, endX, endY, endRadius);
				var gr=ctx.createRadialGradient(planetX, planetY, planetRadius, planetX+100, planetY+100, planetRadius);
				gr.addColorStop(0, 'rgba(255,255,255,1)');
				gr.addColorStop(1, 'rgba(30,0,30,1)');

				//highlight debug
				if (planet.planetDebug == true) {
					gr=ctx.createRadialGradient(planetX, planetY, planetRadius, planetX+100, planetY+100, planetRadius);
					gr.addColorStop(0, 'rgba(255,255,255,1)');
					gr.addColorStop(1, 'rgba(255,0,255,1)');
				}

				ctx.beginPath();
				//ctx.fillStyle = 'rgba(245,20,245,0.6)';
				ctx.fillStyle = gr;
				ctx.arc( planetX, planetY, planetRadius, 0, 2*Math.PI, false);
				ctx.closePath();
				ctx.fill();
			}

			//Draw Players
			ctx.strokeStyle = '#f00';
			ctx.lineWidth   = 2;
			ctx.fillStyle = 'rgba(255,255,255,1)';
			for (i=0;i<players.length;i++) {
				var player = players[i];
				var playerXpos = (player.xPos + stageX) * stageScale;
				var playerYpos = (player.yPos + stageY) * stageScale;
				ctx.beginPath();
				ctx.moveTo(playerXpos, playerYpos);
				ctx.lineTo(playerXpos, playerYpos+(10*stageScale));
				ctx.lineTo(playerXpos-(20*stageScale), playerYpos);
				ctx.lineTo(playerXpos, playerYpos-(10*stageScale));

				ctx.closePath();
				ctx.fill();
				ctx.stroke();

				for (m=0;m<player.debugPullPoint.length;m++) {
					var pointDegree = player.debugPullPoint[m];
					var radians = pointDegree * Math.PI/180;
					var xUnits = Math.cos(radians) * 10;
					var yUnits = Math.sin(radians) * 10;
					//draw debug pull points
					ctx.beginPath();
					ctx.fillStyle = 'rgba(245,224,48,0.9)';
					ctx.arc( playerXpos+xUnits, playerYpos+yUnits, 3, 0, 2*Math.PI, false);
					ctx.closePath();
					ctx.fill();
				}
			}

			//Draw debug shapes
			for (i=0;i<debugArray.length;i++) {
				var debugObj = debugArray[i];
				if (debugObj.type == 'line') {
					ctx.fillStyle = 'rgba(255,255,255,0.9)';
					ctx.beginPath();
					ctx.moveTo((debugObj.xStart+stageX)*stageScale, (debugObj.yStart+stageY)*stageScale);
					ctx.lineTo((debugObj.xEnd+stageX)*stageScale, (debugObj.yEnd+stageY)*stageScale);
					ctx.closePath();
					ctx.stroke();
				}
			}
			debugArray = [];

			/*
			var time = new Date().getTime() * 0.002;
			var x = Math.sin(time) * 96 + 128;
			var y = Math.cos(time * 0.9) * 96 + 128;

			ctx.fillStyle = 'rgb(245,20,245)';

			ctx.beginPath();
			ctx.arc(x, y, 10, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			*/

			fps++;
		}
/**---------------------------------------
	Console log
---------------------------------------**/
		base.consoleLog = function(msg) {
			try {
				console.log(msg);
			} catch(err) {
				//send error to developer platform
			}
		}
		base.init();

})(jQuery);
});
