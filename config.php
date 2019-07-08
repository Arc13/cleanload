<?php

$SteamKey = ""; //Write your steam api key here. https://steamcommunity.com/dev/apikey

$Username = ""; //Write your admin panel username
$Password = ""; //Write your admin panel password.





//Don't touch me !

$isEmptyPassword = false;
if ($Password === "")
{
  $isEmptyPassword = true;
}

function hashpass($pass)
{
  $salt = " 295c93d1903485fe51eea4407ef6a644cac7d720774026b02a2ec1b2e958b13b ";
  return hash('sha256',$pass.$salt);
}

$Password = hashpass($Password);
