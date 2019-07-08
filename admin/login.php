<?php
	include "../config.php";

	if (isset($_POST["password"]) && isset ($_POST["username"])){
		if (hashpass($_POST["password"]) === $Password && $_POST["username"] === $Username)
		{
			setcookie("token", hashpass($_POST["password"]), time()+60*60*24*30);
			header('Location: index.php');
		}
	}
?>

<!DOCTYPE html>
<html>
<head>
	<title>Login - CleanLoad Preferences</title>

	<link rel="stylesheet" href="../styles/admin/login.css" />
	<script type="text/javascript" src="../scripts/jquery.js"></script>
	<script type="text/javascript" src="../scripts/admin/login.js"></script>
</head>
<body>
	<div class="bubble_main">
		<h1>Login</h1>
		<form method="post" class="login_form">
			<input class="custom_input form_username" type="text" name="username" placeholder="Username">
			<input class="custom_input form_password" type="password" name="password" placeholder="Password">
			<input class="form_submit" type="submit" value=">">
		</form>
	</div>
</body>
</html>
