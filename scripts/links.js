function changeBackground(backgroundFile) {
  function onImageLoaded() {
    if (LD_SETTINGS.useBlur) {
      var bodyImage = this;

      function onBlurredImageLoaded() {
        var mainBackgroundNode = document.querySelector('#main_background:not(.bg_delete_mark)');

        var newBackgroundNode = mainBackgroundNode.cloneNode(true);
        newBackgroundNode.style.backgroundImage = 'url(background/' + backgroundFile + ')';
        mainBackgroundNode.parentNode.insertBefore(newBackgroundNode, mainBackgroundNode);

        var blurredNodes = document.querySelectorAll('.bubble_blur_bg:not(.bg_delete_mark)');
        var newBlurredNode = blurredNodes[0].cloneNode(true);
        newBlurredNode.style.backgroundImage = 'url(background/blur_' + backgroundFile + ')';

        Array.prototype.forEach.call(blurredNodes, function(el, i) {
          el.parentNode.insertBefore(newBlurredNode.cloneNode(true), el);
          el.className += ' bg_delete_mark';
          el.style.opacity = '0';
        });

        mainBackgroundNode.className += ' bg_delete_mark';
        mainBackgroundNode.style.opacity = '0';

        setTimeout(function() {
          var elements = document.querySelectorAll('.bg_delete_mark');
          Array.prototype.forEach.call(elements, function(el, i) {
            if (el.parentNode)
              el.parentNode.removeChild(el);
          });
        }, 1000);

        scheduleBackgroundChange();
      }

      var blurredImage = new Image();
      blurredImage.onload = onBlurredImageLoaded;
      blurredImage.src = 'background/blur_' + backgroundFile;
    } else {
      var mainBackgroundNode = document.querySelector('#main_background:not(.bg_delete_mark)');

      var newBackgroundNode = mainBackgroundNode.cloneNode(true);
      newBackgroundNode.style.backgroundImage = 'url(background/' + backgroundFile + ')';
      mainBackgroundNode.parentNode.insertBefore(newBackgroundNode, mainBackgroundNode);

      mainBackgroundNode.className += ' bg_delete_mark';
      mainBackgroundNode.style.opacity = '0';

      setTimeout(function() {
        var elements = document.querySelectorAll('.bg_delete_mark');
        Array.prototype.forEach.call(elements, function(el, i) {
          if (el.parentNode)
            el.parentNode.removeChild(el);
        });
      }, 1000);

      scheduleBackgroundChange();
    }
  }

  var image = new Image();
  image.onload = onImageLoaded;
  image.src = 'background/' + backgroundFile;
}

function scheduleBackgroundChange() {
  setTimeout(function() {
    LD_SETTINGS.currentBackground++;
    if (LD_SETTINGS.currentBackground >= LD_SETTINGS.backgrounds.length)
      LD_SETTINGS.currentBackground = 0;

    changeBackground(LD_SETTINGS.backgrounds[LD_SETTINGS.currentBackground]);
  }, LD_SETTINGS.carouselTime * 1000);
}

window.onload = function() {
  if (LD_SETTINGS.backgroundType == 2)
    scheduleBackgroundChange();
}