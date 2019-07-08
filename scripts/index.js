var INFOS = {};

function setProgress(progress) {
  if (isNaN(progress))
    return;

  if (progress < 0)
    progress = 0;
  else if (progress > 100)
    progress = 100;

  progress = Math.round(progress);

  var percentageTextNode = document.getElementById('percentage_text');
  var progressNode = document.getElementById('bubble_prgbar');

  if (percentageTextNode)
    percentageTextNode.innerHTML = progress + '%';

  if (progressNode)
    progressNode.style.width = progress + '%';
}

function resetProgress() {
  var percentageTextNode = document.getElementById('percentage_text');
  var progressNode = document.getElementById('bubble_prgbar');

  if (percentageTextNode)
    percentageTextNode.innerHTML = '';

  if (progressNode)
    progressNode.style.width = '0%';
}

function setProgressMessage(message) {
  var loadingTextNode = document.getElementById('loading_text');

  if (loadingTextNode)
    loadingTextNode.innerHTML = message;
}

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

function playActualMusic() {
  if (LD_SETTINGS.musics.length == 0)
    return;
  
  const playingMusic = LD_SETTINGS.musics[LD_SETTINGS.currentMusic];
  const audioPlayer = document.getElementById('bg_local_audio');
  const youtubePlayer = LD_SETTINGS.player;

  if (youtubePlayer)
    youtubePlayer.stopVideo();

  if (playingMusic.type == 1) {
    audioPlayer.src = 'musics/' + playingMusic.file;
    audioPlayer.load();
    audioPlayer.play();

    var musicTitle = playingMusic.file;
    if (playingMusic.title && playingMusic.title.trim().length > 0)
      musicTitle = playingMusic.title;

    var musicAuthor = 'Unknown artist';
    if (playingMusic.author && playingMusic.author.trim().length > 0)
      musicAuthor = playingMusic.author;

    setMusicInfos(musicTitle, musicAuthor);
  } else if (playingMusic.type == 2) {
    youtubePlayer.loadVideoById(playingMusic.code, 0, 'small');

    var musicTitle = 'YouTube Music';
    if (playingMusic.title && playingMusic.title.trim().length > 0)
      musicTitle = playingMusic.title;

    var musicAuthor = '';
    if (playingMusic.author && playingMusic.author.trim().length > 0)
      musicAuthor = playingMusic.author;

    setMusicInfos(musicTitle, musicAuthor);
  }
}

function nextMusic() {
  LD_SETTINGS.currentMusic++;
  if (LD_SETTINGS.currentMusic >= LD_SETTINGS.musics.length)
    LD_SETTINGS.currentMusic = 0;

  playActualMusic();
}

function onPlayerStateChange(event) {
  if (event.data == 0)
    nextMusic();
}

function onPlayerReady() {
  playActualMusic();
}

function onYouTubeIframeAPIReady() {
  LD_SETTINGS.player = new YT.Player('bg_yt_music', {
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': nextMusic
    }
  });
}

function setMusicInfos(title, author, album) {
  var mcTextNode = document.getElementById('mtm_title');
  if (mcTextNode)
    mcTextNode.innerHTML = title;

  var mtmSingerNode = document.getElementById('mtm_singer');
  if (mtmSingerNode)
    mtmSingerNode.innerHTML = ' – ' + author;
}

function scheduleBackgroundChange() {
  setTimeout(function() {
    LD_SETTINGS.currentBackground++;
    if (LD_SETTINGS.currentBackground >= LD_SETTINGS.backgrounds.length)
      LD_SETTINGS.currentBackground = 0;

    changeBackground(LD_SETTINGS.backgrounds[LD_SETTINGS.currentBackground]);
  }, LD_SETTINGS.carouselTime * 1000);
}

window.SetStatusChanged = function(status) {
  setProgressMessage(status);

  if (status == 'Workshop Complete')
    setProgress(80);
  else if (status == 'Sending client info...')
    setProgress(90);
}

window.SetFilesTotal = function(count) {
  INFOS.filesTotal = Math.max(0, count);
}

window.SetFilesNeeded = function(count) {
  INFOS.filesNeeded = Math.max(0, count);
}

window.DownloadingFile = function(filename) {
  INFOS.filesNeeded = Math.max(0, INFOS.filesNeeded - 1);

  var filesRemaining = Math.max(0, INFOS.filesTotal - INFOS.filesNeeded);
  var progress = filesRemaining / INFOS.filesTotal * 100;

  setProgress(progress);
  setProgressMessage("Downloading " + filename);
}

window.GameDetails = function(servername, serverurl, mapname, maxplayers, steamid, gamemode) {
  var serverNameNode = document.getElementById('bh_server_name');
  var maxPlayerNode = document.getElementById('bh_max_player');
  var gamemodeNode = document.getElementById('bh_gamemode');
  var mapNameNode = document.getElementById('bh_mapname');
  var infosNode = document.getElementById('bhi_infos');

  if (serverNameNode)
    serverNameNode.innerHTML = servername;

  if (maxPlayerNode)
    maxPlayerNode.innerHTML = maxplayers;

  if (gamemodeNode)
    gamemodeNode.innerHTML = gamemode;

  if (mapNameNode)
    mapNameNode.innerHTML = mapname;

  if (infosNode)
    infosNode.style.display = 'block';
}

window.onload = function() {
  INFOS.filesNeeded = 0;
  INFOS.filesTotal = 0;

  document.getElementById('bg_local_audio').onended = nextMusic;
  document.getElementById('bg_local_audio').volume = LD_SETTINGS.musicVolume;

  if (LD_SETTINGS.backgroundType == 2 && LD_SETTINGS.backgrounds.length > 0)
    scheduleBackgroundChange();

  playActualMusic();

  if (LD_SETTINGS.testMode)
    GameDetails('CleanLoad', '', 'gm_construct', 64, '', 'sandbox');
}