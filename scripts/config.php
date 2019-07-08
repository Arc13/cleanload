<?php
$jsonstring = file_get_contents("./admin/config.json");
$jsontable = json_decode($jsonstring, true);

$DescriptionTitle = $jsontable['Texts']['DescriptionTitle'];
$Description = $jsontable['Texts']['description'];
$RulesTitle = $jsontable['Texts']['RulesTitle'];
$StaffTitle = $jsontable['Texts']['StaffTitle'];
$StyleSheet = $jsontable['Config']['StyleSheet'];
$UseBlur = $jsontable['Config']['Blur'];
$BackgroundType = $jsontable['Config']['BackgroundType'];
$ProgressColor = $jsontable['Config']['ProgressColor'];
$SelectedBackground = $jsontable['Config']['SelectedBackground'];
$Musics = $jsontable['Music'];
$Backgrounds = $jsontable['Background'];
$CarouselTime = $jsontable['Config']['CarouselTime'];
$Bubbles = $jsontable['Bubbles'];
$ContentBubbles = $jsontable['Bubbles']['main_content'];
$CornerRadius = $jsontable['Config']['CornerRadius'];
$Header = $jsontable['Header'];
$Links = $jsontable['Links'];
$MusicVolume = $jsontable['Config']['MusicVolume'];
$FormatURL = $jsontable['Config']['FormatURL'];
$BubbleColor = $jsontable['Config']['BubbleColor'];
$BubbleOpacity = $jsontable['Config']['BubbleOpacity'];
$AccentColor = $jsontable['Config']['AccentColor'];
$TextColor = $jsontable['Config']['TextColor'];
?>