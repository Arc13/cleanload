<?php


function GetQR($size="128x128", $data)
{
  $apiurl = "https://chart.googleapis.com/chart?cht=qr&chld=L|0&chs=";
  $dataarg = "&chl=";
  return $apiurl.$size.$dataarg.$data;
}

?>
