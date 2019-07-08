<?php

$configjsonPath = "./admin/config.json";

require 'config.php';
include_once 'admin/submit.php'; //Import the $canwrite $Password & $SteamKey
$configphp = true;
$configjson = file_exists($configjsonPath);
$urlfopen = false;

if ($isEmptyPassword || $SteamKey === "")
{
	$configphp = false;
}

if( ini_get('allow_url_fopen') )
{
	$urlfopen = true;
}

function check($bool)
{
	if ($bool)
	{
		return "check_ok";
	}
	return "check_fail";
}

?>

<!DOCTYPE html>
<html>
<head>
	<title>First Launch - CleanLoad</title>
	<link rel="stylesheet" type="text/css" href="styles/welcome.css">
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" crossorigin="anonymous">
	<script>
		function onPermsResponse() {
			if (this.readyState == XMLHttpRequest.DONE) {
				function setPermsStatus(isOk) {
					document.getElementById('bc_perm_text').innerHTML = isOk ? '&nbsp;' : '&nbsp;';
					document.getElementById('bc_perm_text').parentElement.classList.add(isOk ? 'check_ok' : 'check_fail');
				}

				if (this.status == 200) {
					const response = parseInt(this.responseText);

					setPermsStatus(response == 1);
				} else {
					setPermsStatus(0);
				}
			}
		}

		window.onload = function() {
			var gradients = ["#5bd2ed, #289bb2", "#e12544, #ed7482", "#ad74ed, #7a29d7", "#00bc7a, #008f4c"];
			document.body.style.background = 'linear-gradient(0.35turn, ' + gradients[Math.floor(Math.random() * gradients.length)] + ') repeat fixed';

			const blurUploadReq = new XMLHttpRequest();
			blurUploadReq.open('POST', 'admin/submit.php');
			blurUploadReq.onreadystatechange = onPermsResponse;
			var formData = new FormData();
			formData.append('type', 'perms');
			blurUploadReq.send(formData);
		}
	</script>
</head>
<body>
	<div class="bubble_main">
		<h1>First Launch</h1>

		<p class="bubble_title">1. Check file permissions</p>
		<div class="bubble_description_holder">
			<p class="bubble_description">The permissions are required to be set correctly for the admin panel to allow it to modify the configuration file, and upload background images.</p>
			<p class="bubble_description">The following folders needs their permission set to 775: <i>cache</i>, <i>music</i> and <i>background</i></p>
			<p class="bubble_description">The <i>submit.php</i> file in the <i>admin</i> folder, and the <i>FileCache.php</i> file in the <i>scripts</i> folder need their permission set to 655</p>
		</div>
		<div class="bubble_check_holder"><p id="bc_perm_text" class="bubble_check"></p></div>

		<p class="bubble_title">2. Modify the config.php</p>
		<div class="bubble_description_holder">
			<p class="bubble_description">The config.php is holding private information that should not be publicly available, make sure you're not sharing these informations with anyone.</p>
			<p class="bubble_description">This file will be used to set your admin password and your Steam API key.</p>
		</div>
		<div class="bubble_check_holder <?php echo check($configphp); ?>"><p class="bubble_check"> &nbsp;</p></div>

		<p class="bubble_title">3. Allow internet requests</p>
		<div class="bubble_description_holder">
			<p class="bubble_description">The loading screen needs PHP to have its allow_url_fopen setting enabled to show your staff names and profile pictures.</p>
			<p class="bubble_description">Check with your host if it is disabled.</p>
		</div>
		<div class="bubble_check_holder <?php echo check($urlfopen); ?>"><p class="bubble_check"> &nbsp;</p></div>

		<p class="bubble_title">4. Access your admin panel</p>
		<div class="bubble_description_holder">
			<p class="bubble_description">The admin panel will guide you through the setup of the screen that will be shown to your players, you can visit it whenever you want with your password in order to make the changes you want.</p>
		</div>
		<a class="bubble_link" href="admin/login.php">
			<div class="bubble_check_holder bch_access <?php echo check($configjson); ?>">
				<p class="bubble_description bcha_desc bubble_centered_text">Access it now</p>
				<p class="fas fa-angle-right bcha_angle"></p>
			</div>
		</a>
	</div>
</body>
</html>
