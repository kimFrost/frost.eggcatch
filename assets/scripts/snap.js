(function (window, undefined) {
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

  window.snap = {};
  window.snap.scrolltoIndex = scrolltoIndex;
  window.snap.activeIndex = 0;
  window.snap.scrollLock = false;

  //--- VARIABLES ----------------------------------------------------------//

  var options = {
    snapPercent: 10,
    animationDuration: 300,
    swipeMinTime: 50,
    swipeMaxTime: 400,
    swipeMinDistance: 100,
    swipeMaxDistance: 800,
    clickPreventTime: 100,
    isMobile: (function() {
      var check = false;
      (function(a,b){
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) {
          check = true;
        }
      })(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    })()
  };

  var temp = {
    baseTime: null,
    basePointX: null,
    basePointY: null,
    baseX: null,
    baseY: null,
    allowClick: true,
    lastTouchClientX: null,
    lastTouchClientY: null,
    lastScrollTriggerDate: new Date()
  };

  var fps = 0,
    fpsCount = 0,
    lastScrollTop = 0,
    numOfLogs = 0,
    debounceTimer = null,
    windowHeight = window.innerHeight,
    activePanelIndex = 0,
    animationQuery = [];

  var states = {
    animating: false,
    noAnimate: true,
    moveListen: true
  };


  //--- FUNCTIONS ----------------------------------------------------------//

  // Linear interpolation
  function lerp(a, b, f) {
    return a + f * (b - a);
  }

  // Eventlisterner support for multiple events
  function addListenerMulti(el, s, fn) {
    var evts = s.split(' ');
    for (var i = 0, iLen = evts.length; i < iLen; i++) {
      el.addEventListener(evts[i], fn, false);
    }
  }

  // Debounce
  var debounce = function (func, threshold) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      func();
    }, threshold);
  };

  // Recal
  function recal() {
    console.log('recal');
  }

  function scrolltoIndex(index) {
    //console.log('scrolltoIndex', index);
    if (!window.snap.scrollLock && index !== undefined) {
      trackNavigation(index);
      killSound();
      //var container = document.querySelector('#scrollCapture');
      var container = window;
      if (container === null) {
        return;
      }
      var scrollTop = container.scrollTop;
      if (container.pageYOffset !== undefined) {
        scrollTop = container.pageYOffset;
      }
      var newPos = scrollTop;
      newPos = windowHeight * index;
      if (newPos !== scrollTop) {
        animate(scrollTop, newPos, container);
      }
    }
  }

  // Animate
  function animate(from, to, element) {
    if (from !== undefined && to !== undefined && element !== undefined) {
      states.animating = true;
      animationQuery.push({
        from: from,
        to: to,
        created: Date.now(),
        length: options.animationDuration,
        element: element
      });
    }
  }

  // Update/draw functions
  function updateLoop() {
    window.requestAnimFrame(updateLoop);
    update();
    fpsCount++;
    if (numOfLogs > 500) {
      console.clear();
    }
  }

  function update() {
    //console.log('draw');
    for (var i = 0; i < animationQuery.length; i++) {
      var animation = animationQuery[i];
      var animationDone = false;
      var timeProgress = (Date.now() - animation.created) / animation.length;

      if (timeProgress > 1) {
        timeProgress = 1;
        animationDone = true;
      }

      //console.log('timeProgress',timeProgress);

      var y = lerp(animation.from, animation.to, timeProgress);
      //animation.element.scrollTop = y;
      window.scrollTo(0, y);
      lastScrollTop = y;

      if (animationDone) {
        animationQuery.splice(i, 1);
        states.animating = false;
      }

    }
  }

  function trackNavigation(index) {
    if (typeof window.ga !== 'undefined') {
      window.ga('send', {
        'hitType': 'event', // Required.
        'eventCategory': 'Navigation', // Required.
        'eventAction': 'Navigate to panel', // Required.
        'eventValue': index,
        'hitCallback': function () {
          //console.log('Google Analytics Event Tracked');
        }
      });
    } else {
      //console.error('Google Analytics is not defined!');
    }
  }

  function killSound() {
    var audioTag = document.getElementsByTagName('audio')[0];
    var fadeOut = setInterval(function () {
      var volumeInterval = 0.05;
      // Only fade if past the fade out point or not at zero already
      if (audioTag.volume > volumeInterval) {
        audioTag.volume -= volumeInterval;
      } else {
        audioTag.volume = 0;
        clearInterval(fadeOut);
        audioTag.pause();
        audioTag.volume = 1;
      }

    }, 50);
  }

  //--- BINDINGS ----------------------------------------------------------//

  /*
   // Scroll
   document.querySelector('#scrollCapture').addEventListener('scroll', function (event) {
   if (states.animating) {
   //return;
   }
   var container = this,
   scrollTop = container.scrollTop,
   direction = 0,
   percent = scrollTop / windowHeight * 100,
   snapPercent = percent % 100;

   debounce(function() {
   if (scrollTop > lastScrollTop) {
   direction = 1;
   }
   else if (scrollTop < lastScrollTop) {
   direction = -1;
   }
   var newPos = scrollTop;
   var newIndex = activePanelIndex;
   if (direction > 0) {
   if (snapPercent >= options.snapPercent) {
   newPos = (percent + 100 - snapPercent) * windowHeight / 100;
   newIndex = Math.floor((percent + 100 - snapPercent) / 100);
   }
   else {
   newIndex = Math.floor((percent) / 100);
   }
   }
   else if (direction < 0) {
   if (snapPercent <= (100 - options.snapPercent)) {
   newPos = (percent - snapPercent) * windowHeight / 100;
   newIndex = Math.floor((percent - snapPercent) / 100);
   }
   else {
   newIndex = Math.floor((percent) / 100);
   }
   }
   //activePanelIndex = newIndex;
   if (newPos !== scrollTop) {
   animate(scrollTop, newPos, container);
   }
   lastScrollTop = scrollTop;
   }, 300);
   //activePanelIndex = newIndex;
   //window.snap.activeIndex = activePanelIndex;
   });
   */

  // Resize
  window.addEventListener('resize', function (event) {
    //console.log('resize');
    windowHeight = window.innerHeight;
    var container = document.querySelector('#scrollCapture');
    if (container === null) {
      return;
    }
    container.scrollTop = window.snap.activeIndex * windowHeight;
    lastScrollTop = container.scrollTop;
  });


  // Bind mousedown and touchstart
  addListenerMulti(window, 'mousedown touchstart', function (event) {
    //console.log('mousedown touchstart',event);
    var baseX = 0;
    var baseY = 0;
    if (event.touches !== undefined) {
      baseX = event.touches[0].clientX;
      baseY = event.touches[0].clientY;
    }
    else {
      baseX = event.clientX;
      baseY = event.clientY;
    }
    temp.baseTime = Date.now();
    temp.baseX = baseX;
    temp.baseY = baseY;
    temp.basePointX = baseX;
    temp.basePointY = baseY;

    states.noAnimate = true;
    states.moveListen = true;
  });

  // Prevent firefox link drag from blocking script
  document.addEventListener('dragstart', function (event) {
    event.preventDefault();
  });

  // Move while holding down
  addListenerMulti(window, 'mousemove touchmove', function (event) {
    //console.log('mousemove touchmove',event);
    if (states.moveListen) {
      var posX = 0;
      var posY = 0;
      if (event.touches !== undefined) {
        posX = event.touches[0].clientX;
        posY = event.touches[0].clientY;
      }
      else {
        posY = event.clientY;
      }
      temp.baseX = posX;
      temp.baseY = posY;
    }
  });


  var panels = document.querySelectorAll('.panel--sun, .panel--frame');

  window.addEventListener('touchmove', function (event) {
    /*
     event.preventDefault();
     for (var i=0;i<panels.length;i++) {
     var panel = panels[i];
     }
     */




  });




  var scrollAreas = document.querySelectorAll('.panel__scrollarea');
  for (var i=0;i<scrollAreas.length;i++) {
    var scrollArea = scrollAreas[i];
    scrollArea.addEventListener('scroll', scrollAreaHandler);
  }
  function scrollAreaHandler(event) {
    var elem = event.target;
    if (elem.scrollTop === 0) {
      //elem.scrollTop = 1;
    }
    else if (elem.scrollTop === (elem.scrollHeight - elem.clientHeight)) {
      //elem.scrollTop = elem.scrollHeight - elem.clientHeight - 1;
    }
  }

  /*
   document.body.addEventListener('touchmove', function (event) {
   console.log(event.target);
   if (event.target.className.indexOf('panel__overlay') === -1) {
   event.preventDefault();
   }
   });
   */



  // Bind mouse Up, Leave and Touch end //mouseup mouseleave touchend
  addListenerMulti(window, 'touchend', function (event) {
    //console.log('mouseup mouseleave touchend',event);

    if (true) {
      return;
    }

    if (options.isMobile) {
      //console.log('options.isMobile', options.isMobile);
      return false;
    }

    states.noAnimate = false;
    states.moveListen = false;

    var x = 0;
    var y = 0;
    if (event.changedTouches !== undefined) {
      x = event.changedTouches[0].clientX;
      y = event.changedTouches[0].clientY;
    }
    else {
      x = event.clientX;
      y = event.clientY;
    }
    var timeDiff = Date.now() - temp.baseTime;
    var xDistance = x - temp.basePointX;
    var xDistanceAbs = Math.abs(xDistance);
    var yDistance = y - temp.basePointY;
    var yDistanceAbs = Math.abs(yDistance);
    var direction = [0, 0];
    var swipe = false;

    if (xDistance === 0 && yDistance === 0) {
      // Didn't move cursor, therefore a single click
      temp.allowClick = true;
    }
    else if (timeDiff > options.swipeMinTime && timeDiff < options.swipeMaxTime) {
      if (xDistanceAbs < options.swipeMaxDistance && xDistanceAbs > options.swipeMinDistance) {
        direction[0] = xDistance / Math.abs(xDistance);
        swipe = true;
        temp.allowClick = false;
      }
      if (yDistanceAbs < options.swipeMaxDistance && yDistanceAbs > options.swipeMinDistance) {
        direction[1] = yDistance / Math.abs(yDistance);
        swipe = true;
        temp.allowClick = false;
      }
    }
    else {
      temp.allowClick = false;
      //log('recal');
      //recalPos();
    }

    //console.log('swipe', swipe);
    //console.log('direction', direction);

    if (swipe) {
      //console.log('swipe', direction);
      if (direction[1] === 1) {
        scrolltoIndex(window.snap.activeIndex - 1);
      }
      else if (direction[1] === -1) {
        scrolltoIndex(window.snap.activeIndex + 1);
      }
    }
  });


  // Bind mouse scroll
  addListenerMulti(window, 'mousewheel DOMMouseScroll', function (event) {
    //console.log('mousewheel', (event.wheelDelta || event.detail));

    if (true) {
      return;
    }

    if (states.animating) {
      return false;
    }
    var timeSinceLastScrollTrigger = new Date() - temp.lastScrollTriggerDate;
    temp.lastScrollTriggerDate = new Date();
    //console.log('timeSinceLastScrollTrigger', timeSinceLastScrollTrigger);
    if (timeSinceLastScrollTrigger < 500) {
      //return false;
    }
    //console.log('mousewheel Not Animating');
    var direction = event.wheelDelta;
    if (event.wheelDelta === undefined && event.detail !== undefined) {
      direction = (event.detail * -1);
    }
    if (direction > 0) {
      //scrolltoIndex(window.snap.activeIndex - 1);
    }
    else if (direction < 0) {
      scrolltoIndex(window.snap.activeIndex + 1);
    }
  });


  // Fps set
  setInterval(function () {
    fps = fpsCount;
    fpsCount = 0;
    var container = document.querySelector('.brugskallen__debug');
    if (container !== null) {
      container.textContent = 'FPS: '+fps;
    }
  }, 1000);

  setInterval(function () {
    //var container = document.querySelector('#scrollCapture');
    var container = window;
    if (container === null) {
      return;
    }
    var scrollTop = container.scrollTop;
    if (container.pageYOffset !== undefined) {
      scrollTop = container.pageYOffset;
    }
    var index = Math.round(scrollTop / windowHeight);
    window.snap.activeIndex = index;
  }, 100);

  //--- INIT ----------------------------------------------------------//

  // Start draw loop
  updateLoop();

})(window);
