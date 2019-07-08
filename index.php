<?php
require 'scripts/FileCache.php';
require 'config.php';
require 'scripts/qr.php';
require 'scripts/config.php'; //Import config file + links
//Check for non-setuped files
if ($SteamKey === ""|| $isEmptyPassword || file_exists("admin/config.json") === false)
{
  header("Location: welcome.php");
}

$cache = new FileCache();
$testMode = false;

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

$BlurStyleText = '';
if ($UseBlur)
  $BlurStyleText = 'style="background-image: url(background/blur_'.$SelectedBackground.')"';

//Define a default SteamID for PC-Testing
if (!isset($_GET['steamid'])) {
  $_GET['steamid'] = "76561198084178846";
  $testMode = true;
}

//Try to get user cache
try {
  $usercache = $cache->get($_GET['steamid']);
} catch (Exception $e) {
  header("Location: welcome.php");
}
if ($usercache == false){
  if (isset($_GET['steamid'])) {
    $data = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key='.$SteamKey.'&steamids='.$_GET['steamid'];
    $f = file_get_contents($data);
    $arr = json_decode($f, true);
    if (isset($arr['response']['players'][0]['personaname']))
      $plname = $arr['response']['players'][0]['personaname'];
    else
      {
        header("Location: welcome.php");
      }
    if (isset($arr['response']['players'][0]['avatarfull']))
    {
      $avatar = $arr['response']['players'][0]['avatarfull'];
      $userdata = array('name'=>$plname, 'avatar'=>$avatar);
      $cachelifetime = 86400; //One day in second
      $cache->save($_GET['steamid'], $userdata, $cachelifetime);
    }
  }
}
else
{ //Import of the cached data
  $plname = $usercache['name'];
  $avatar = $usercache['avatar'];
  if ($avatar === "")
  {
    $cache->delete($_GET['steamid']);
  }
}
function get_info($steamid)
{
  $jsonstring = file_get_contents("./admin/config.json");
  $jsontable = json_decode($jsonstring, true);
  $InfoTable = array("image" => "", "name" => "");

  $cache = new FileCache();
  $usercache = $cache->get($steamid);

  if ($usercache == false){
    global $SteamKey;
    $data = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key='.$SteamKey.'&steamids='.$steamid;
    $f = file_get_contents($data);
    $arr = json_decode($f, true);
    if (isset($arr['response']['players'][0]['avatarfull']))
      $InfoTable['image'] = $arr['response']['players'][0]['avatarfull'];
    if (isset($arr['response']['players'][0]['personaname']))
      $InfoTable['name'] = $arr['response']['players'][0]['personaname'];
      $data = array("name"=>$InfoTable['name'], "avatar"=>$InfoTable['image']);
      $cache->save($steamid, $data, 86400); //Cache username and avatar for one day
  }
  else
  {
    if ($usercache['name'] == "") //Corruption check
    {
      $cache->delete($steamid);
    }
    $InfoTable['image'] = $usercache['avatar'];
    $InfoTable['name'] = $usercache['name'];
  }
  return $InfoTable;

}


function adminbuilder($id, $side) //true = left, false = right
{
  $jsonstring = file_get_contents("./admin/config.json");
  $jsontable = json_decode($jsonstring, true);

  $trfirststring = '<tr> <td class="staff_item accent_background">';
  $staffid = get_info($jsontable['Staff'][$id]['steamid']);
  $trstring = $trfirststring.'<img class="staff_image" src="'.$staffid["image"].'"><b>'.$staffid["name"].'</b><br>'.$jsontable['Staff'][$id]['role'].'</td> </tr>';
  return $trstring;
}

function rulesbuilder($id, $text)
{
  $trstring = '<tr> <th class="rule_number accent_background">'.$id.'</th> <td class="rule_text">'.$text.'</td> </tr>';
  return $trstring;
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

// Turn hex colors into RGB format
function hexToRGB($hex) {
  return sscanf($hex, "%02x%02x%02x");
}

$TextColorRGB = hexToRGB($TextColor);
$AccentColorRGB = hexToRGB($AccentColor);
$ProgressColorRGB = hexToRGB($ProgressColor);

//Table builder
$leftside = array(); //left
$rightside = array(); //right
$i = 0;
foreach ($jsontable['Staff'] as $value) {
  if ($i % 2 == 1)
    array_push($leftside, strval($i));
  else
    array_push($rightside, strval($i));

  $i++;
}

?>

<!DOCTYPE html>
<html lang="en" dir="ltr">
   <head>
      <meta charset="utf-8">
      <title>Loading...</title>
      <link rel="stylesheet" href="styles/index.css" />
      <?php if($StyleSheet != ""){
         echo '<link rel="stylesheet" href="'.$StyleSheet.'" />';
         }
         ?>
      <style type="text/css">
        body {
          color: rgb(<?php echo $TextColorRGB[0].', '.$TextColorRGB[1].', '.$TextColorRGB[2]; ?>);
        }

        .rounded {
          border-radius: <?php echo $CornerRadius; ?>px;
        }

        .header_rounded {
          border-bottom-left-radius: <?php echo $CornerRadius; ?>px;
          border-bottom-right-radius: <?php echo $CornerRadius; ?>px;
        }

        .bubble_bg_overlay {
          background-color: #<?php echo $BubbleColor; ?>;
          opacity: <?php echo $BubbleOpacity; ?>;
        }

        .accent_background {
          background-color: rgba(<?php echo $AccentColorRGB[0].', '.$AccentColorRGB[1].', '.$AccentColorRGB[2]; ?>, 0.6);
        }

        .bubble_prgbar {
          background-color: rgba(<?php echo $ProgressColorRGB[0].', '.$ProgressColorRGB[1].', '.$ProgressColorRGB[2]; ?>, 0.8);
        }
      </style>
      <!-- <script type="text/javascript" src="https://www.youtube.com/iframe_api"></script> -->
      <script type="text/javascript">
         var LD_SETTINGS = {'useBlur': <?php echo $UseBlur ? "true" : "false"; ?>, 'background': '<?php echo $SelectedBackground; ?>', 'musics': <?php echo json_encode($Musics); ?>, 'currentMusic': 0, 'backgrounds': <?php echo json_encode($Backgrounds); ?>, 'currentBackground': 0, 'carouselTime': <?php echo $CarouselTime; ?>, 'backgroundType': <?php echo $BackgroundType; ?>, 'testMode': <?php echo $testMode ? 'true' : 'false'; ?>, 'musicVolume': <?php echo $MusicVolume / 100; ?>};
      </script>
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" crossorigin="anonymous">
      <script type="text/javascript" src="scripts/index.js"></script>
   </head>
   <body>
      <div id="main_background" class="main_background backgrounds" style="background-image: url(<?php echo 'background/'.$SelectedBackground; ?>);"></div>
<?php
function echoBubble($bubbleType, $positionClass = '') {
  global $BlurStyleText, $ProgressColor;

  if ($bubbleType == 'staff') {
    global $StaffTitle, $leftside, $rightside;

    $staffLeft = '';
    foreach ($rightside as $value) {
      $staffLeft .= adminbuilder($value, true);
    }

    $staffRight = '';
    foreach ($leftside as $value) {
      $staffRight .= adminbuilder($value, false);
    }

    echo '<div class="blur_bg rounded shadow '.$positionClass.'">
            <div class="bubble_blur_bg backgrounds" '.$BlurStyleText.'></div>
            <div class="bubble_bg_overlay"></div>
              <h1 class="title">'.$StaffTitle.'</h1>
              <table class="staff_table_left">
                 <tbody id="staff_table_left_body">'.$staffLeft.'</tbody>
              </table>
              <table class="staff_table_right">
                 <tbody id="staff_table_right_body">'.$staffRight.'</tbody>
              </table>
           </div>';
  } else if ($bubbleType == 'rules') {
    global $RulesTitle, $jsontable;

    $i_two = 0;
    $ruleText = '';
    foreach ($jsontable['Rules'] as $value){
      $ruleText .= rulesbuilder($i_two+1, $value);
      $i_two++;
    }

    echo '<div class="blur_bg rounded shadow '.$positionClass.'">
            <div class="bubble_blur_bg backgrounds" '.$BlurStyleText.'></div>
            <div class="bubble_bg_overlay"></div>
              <h1 class="title">'.$RulesTitle.'</h1>
              <table class="rules_table">
                 <tbody id="rules_table_body">'.$ruleText.'</tbody>
              </table>
           </div>';
  } else if ($bubbleType == 'music') {
    echo '<div class="music_container blur_bg rounded shadow '.$positionClass.'">
            <div class="bubble_blur_bg backgrounds" '.$BlurStyleText.'></div>
            <div class="bubble_bg_overlay"></div>
            <h1 class="title">Music</h1>
            <div id="mc_text"></div>
          </div>';
  } else if ($bubbleType == 'contact') {
    global $Links;

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

      $entries .= '<tr>
                    <td class="cc_infos">
                      <span class="'.$iconClass.' cc_icon">
                      </span><span class="cc_title">'.$linkType.'</span>
                    </td>
                    <td class="cc_link">'.$linkUrl.'</td>
                  </tr>';
    }

    echo '<div class="blur_bg rounded shadow '.$positionClass.'">
            <div class="bubble_blur_bg backgrounds" '.$BlurStyleText.'></div>
            <div class="bubble_bg_overlay"></div>
            <h1 class="title">Links</h1>
            <table class="contact_container">
              <tbody class="accent_background">'.$entries.'</tbody>
            </table>
          </div>';
  } else if ($bubbleType == 'progress_bar') {
    global $ProgressColor;

    echo '<div class="prgbar_container">
            <div class="blur_bg bubble_prgbar_bg rounded shadow">
            <div class="bubble_blur_bg backgrounds" '.$BlurStyleText.'></div>
            <div class="bubble_bg_overlay"></div>
            <div id="bubble_prgbar" class="bubble_prgbar rounded"></div>
          </div>
          <p id="percentage_text" class="percentage_text"></p>
          <p id="loading_text" class="loading_text">Loading...</p>
        </div>';
  } else if ($bubbleType == 'main_text') {
    global $DescriptionTitle, $Description;

    echo '<div class="blur_bg bubble_info rounded shadow">
            <div class="bubble_blur_bg backgrounds" '.$BlurStyleText.'></div>
            <div class="bubble_bg_overlay"></div>
            <h1 class="title">'.$DescriptionTitle.'</h1>
            <div class="main_text_container">'.$Description.'</div>
            <div id="mt_music">
              <span class="fas fa-music"></span>
              <span id="mtm_title"></span>
              <span id="mtm_singer"></span>
            </div>
          </div>';
  } else if ($bubbleType == 'header') {
    global $avatar, $plname, $Header;

    $leftSideStyle = '';
    if (!$Header['PlayerInfos'])
      $leftSideStyle = 'style="display: none;"';

    $rightSideStyle = '';
    if (!$Header['QRCode'])
      $rightSideStyle = 'style="display: none;"';

    $middleSideStyle = '';
    if (!$Header['ServerInfos'])
      $middleSideStyle = 'style="display: none;"';

    echo '<div class="bubble_header header_rounded shadow">
            <div class="bubble_blur_bg backgrounds" '.$BlurStyleText.'></div>
            <div class="bubble_bg_overlay"></div>
            <div id="bubble_prgbar" class="bubble_prgbar"></div>

            <div class="bh_split_left" '.$leftSideStyle.'>
              <img class="bh_image" src="'.$avatar.'">
            </div><div class="bh_split_right" '.$rightSideStyle.'>
              <img class="bh_image" src="'.GetQR('128x128', (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http")."://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]links.php").'">

            </div><div id="bh_infos" class="bh_split_middle" '.$middleSideStyle.'>
              <h1 id="bh_server_name" class="title"></h1>

              <div id="bhi_infos">
                <span class="fas fa-users bh_icon">
                </span><span id="bh_max_player" class="bhi_text">
                </span><span class="fas fa-gamepad bh_icon">
                </span><span id="bh_gamemode" class="bhi_text">
                </span><span class="fas fa-map bh_icon">
                </span><span id="bh_mapname" class="bhi_text"></span>
              </div>
            </div>
          </div>';
  }
}

// Header part
if ($Bubbles['header'])
  echoBubble('header');

// // Main text part
if ($Bubbles['main_text'])
  echoBubble('main_text');

// Bubble main part
echo '<div>';

$bubbleList = array();
foreach ($ContentBubbles as $value)
  if ($value['isEnabled'])
    array_push($bubbleList, $value['bubbleType']);

$lastItemCentered = count($bubbleList) % 2 == 1;

foreach ($bubbleList as $key => $value) {
  $positionClass = '';
  if ($key == count($bubbleList) - 1 && $lastItemCentered)
    $positionClass = 'bubble_split_center';
  else if ($key % 2 == 0)
    echo '<div class="bm_row">';

  echoBubble($value, $positionClass);

  if ($key % 2 == 1)
    echo '</div>';
}
echo '</div>';

?>
      </div>

      <audio id="bg_local_audio"></audio>
      <div id="bg_yt_music"></div>
   </body>
</html>
