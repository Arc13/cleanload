<?php
require 'scripts/config.php'; //Import config file + links

if (!$SelectedBackground)
  $SelectedBackground = '0.jpg';

if ($BackgroundType == 1) {
  $backgroundFiles = dir('background/');
  if ($backgroundFiles) {
    $backgroundFilesArray = array();
    while (false !== ($entry = $backgroundFiles->read())) {
      if ($entry != "." and $entry != ".." and strpos($entry, "blur_") !== 0)
        array_push($backgroundFilesArray, $entry);
    }

    $SelectedBackground = $backgroundFilesArray[array_rand($backgroundFilesArray)];
  }
} else if ($BackgroundType == 2) {
  $SelectedBackground = $Backgrounds[0];
}

function formatLink($link, $linkType) {
  global $FormatURL;

  if ($linkType == 1 && $FormatURL) {
    if (substr($link, 0, 7) === "http://")
      $link = substr($link, 7);
    else if (substr($link, 0, 8) === "https://")
      $link = substr($link, 8);

    if (substr($link, 0, 4) === "www.")
      $link = substr($link, 4);
  } else if ($linkType == 2) {
    if (substr($link, 0, 12) != "ts3server://")
      $link = "ts3server://".$link;
  } else if ($linkType == 3) {
    if (substr($link, 0, 9) != "mumble://")
      $link = "mumble://".$link;
  }

  return $link;
}

function formatHref($link, $linkType) {
	if ($linkType == 1) {
    if (substr($link, 0, 7) != "http://" && substr($link, 0, 8) != "https://")
      $link = "http://".$link;
  } else {
    return formatLink($link, $linkType);
  }

	return $link;
}

$BlurStyleText = '';
if ($UseBlur)
  $BlurStyleText = 'style="background-image: url(background/blur_'.$SelectedBackground.')"';

$entries = '';
foreach ($Links as $value) {
  $iconClass = '';
  $linkType = '';
  $linkUrlType = 1;

  if ($value['type'] == 0) {
    $iconClass = 'fas fa-globe';
    $linkType = 'Website';
  } else if ($value['type'] == 1) {
    $iconClass = 'fas fa-comment';
    $linkType = 'Forum';
  } else if ($value['type'] == 2) {
    $iconClass = 'fas fa-dollar-sign';
    $linkType = 'Donation';
  } else if ($value['type'] == 3) {
    $iconClass = 'fas fa-store';
    $linkType = 'Store';
  } else if ($value['type'] == 4) {
    $iconClass = 'fab fa-discord';
    $linkType = 'Discord';
  } else if ($value['type'] == 5) {
    $iconClass = 'fab fa-teamspeak';
    $linkType = 'TeamSpeak';
    $linkUrlType = 2;
  } else if ($value['type'] == 6) {
    $iconClass = 'fas fa-headphones-alt';
    $linkType = 'Mumble';
    $linkUrlType = 3;
  }

  $linkUrl = formatLink($value['url'], $linkUrlType);
  $hrefLink = formatHref($value['url'], $linkUrlType);

  $entries .= '<a class="blh_link" href="'.$hrefLink.'">
					<span class="'.$iconClass.'">
					</span><span class="blh_type">'.$linkType.'</span>
					<p class="blh_url">'.$linkUrl.'</p>
				</a>';
}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Links - CleanLoad</title>
	<link rel="stylesheet" href="styles/links.css" />
	<style type="text/css" media="screen and (min-device-width: 768px)">
		.rounded {
			border-radius: <?php echo $CornerRadius; ?>px;
		}
	</style>
	<script type="text/javascript">
		var LD_SETTINGS = {'backgrounds': <?php echo json_encode($Backgrounds); ?>, 'currentBackground': 0, 'backgroundType': <?php echo $BackgroundType; ?>, 'useBlur': <?php echo $UseBlur ? "true" : "false"; ?>, 'carouselTime': <?php echo $CarouselTime; ?>};
	</script>
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" crossorigin="anonymous">
	<script type="text/javascript" src="scripts/links.js"></script>
</head>
<body>
	<div id="main_background" class="main_background backgrounds" style="background-image: url(<?php echo 'background/'.$SelectedBackground; ?>);"></div>
	<div class="bubble_links blur_bg rounded shadow <?php if ($DarkMode) echo 'dark_mode'; ?>">
		<div class="bubble_blur_bg backgrounds" <?php echo $BlurStyleText; ?>></div>
		<div class="bubble_bg_overlay"></div>
		<h1 class="title">Links</h1>
		<div class="bl_holder"><?php echo $entries; ?></div>
	</div>
</body>
</html>