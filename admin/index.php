<?php
require 'submit.php';
require_once '../config.php';
error_reporting(0);

if (isset($_COOKIE["token"])) //Prevent php error
{
	if ($_COOKIE["token"] != $Password)
	{
		header('Location: login.php');
		exit();
	}
}
else {
	header('Location: login.php');
	exit();
}


function listFilesAsJSON($directory) {
	$backgroundFiles = dir("../".$directory);
	if ($backgroundFiles) {
		$backgroundFilesArray = array();
		while (false !== ($entry = $backgroundFiles->read())) {
			if ($entry != "." and $entry != "..")
				array_push($backgroundFilesArray, $entry);
		}

		return json_encode($backgroundFilesArray);
	} else {
		return "{}";
	}
}
?>
<!DOCTYPE html>
<html>
<head>
	<title>CleanLoad Preferences</title>

	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" crossorigin="anonymous">
	<link rel="stylesheet" href="../styles/admin/index.css" />
	<script type="text/javascript" src="../scripts/jquery.js"></script>
	<script type="text/javascript" src="../scripts/squire.js"></script>
	<script type="text/javascript" src="../scripts/js-cookie.js"></script>
	<script type="text/javascript" src="../scripts/stackblur.js"></script>
	<script type="text/javascript" src="../scripts/sortable.js"></script>
	<script type="text/javascript" src="../scripts/URI.js"></script>
	<!-- <script type="text/javascript" src="https://www.youtube.com/iframe_api"></script> -->
	<script type="text/javascript">
		var PHP_VARS = {};
		PHP_VARS.steamKey = '<?php echo $SteamKey ?>';
		PHP_VARS.backgrounds = JSON.parse('<?php echo listFilesAsJSON("background/") ?>');
		PHP_VARS.musics = JSON.parse('<?php echo listFilesAsJSON("musics/") ?>');
	</script>
	<script type="text/javascript" src="../scripts/admin/index.js"></script>
</head>
<body>
	<?php if ($canwrite === false) {echo '<script type="text/javascript">sendNotification("The admin/submit.php must be chmod 755 to work properly")</script>'; } ?>
	<div class="sidebar">
		<div class="sidebar_element_holder">
			<div class="sidebar_element se_menu se_selected"><p class="se_menu_text">General</p></div>
			<div class="sidebar_element se_menu"><p class="se_menu_text">Bubbles</p></div>
			<div class="sidebar_element se_menu"><p class="se_menu_text">Background</p></div>
			<div class="sidebar_element se_menu"><p class="se_menu_text">Music</p></div>
			<div class="sidebar_element se_menu"><p class="se_menu_text">Main Text</p></div>
			<div class="sidebar_element se_menu"><p class="se_menu_text">Staff and Rules</p></div>
			<div class="sidebar_element se_menu"><p class="se_menu_text">Links</p></div>
		</div>

		<div class="sidebar_element_holder_bottom">
			<div class="sidebar_element_bottom sidebar_element se_menu" data-subtitle="CleanLoad 1.0.0 — Made by Kuruyia and wow"><p class="se_menu_text">About</p></div>
			<div class="sidebar_element_bottom seb_divided">
				<i id="sebd_save" class="fas fa-save sebd_item" title="Save"></i><i id="sebd_logout" class="fas fa-sign-out-alt sebd_item" title="Log Out"></i>
			</div>
		</div>
	</div>

	<div class="content">
		<div class="bubble_main">
			<h1 class="bubble_main_title">General</h1>
			<p class="bubble_main_subtitle"></p>

			<div class="bubble_general bm_content" data-display-type="flex">
				<div class="ba_group">
					<div class="bag_left">
						<p class="bag_title">Loading URL:</p>
					</div>

					<div class="bag_right">
						<input class="ld_text mono_highlight_text" readonly title="Copy to clipboard"></input>
					</div>
				</div>

				<div class="ba_group">
					<div class="bag_left">
						<p class="bag_title">Theme:</p>
					</div>

					<div class="bag_right">
						<div class="checkbox_holder themes_box">
							<div class="theme_holder ba_light_holder">
								<span class="fas fa-check-circle selected_theme"></span>
								<span class="dot dot_primary">
								</span><span class="dot dot_secondary">
								</span><span>Light</span>
							</div>
							<div class="theme_holder ba_dark_holder">
								<span class="dot dot_primary">
								</span><span class="dot dot_secondary">
								</span><span>Dark</span>
							</div>
							<div class="theme_holder ba_orange_holder">
								<span class="dot dot_primary">
								</span><span class="dot dot_secondary">
								</span><span>Pumpkin</span>
							</div>
							<div class="theme_holder ba_purple_holder">
								<span class="dot dot_primary">
								</span><span class="dot dot_secondary">
								</span><span>Lavender</span>
							</div>
							<div class="theme_holder ba_brown_holder">
								<span class="dot dot_primary">
								</span><span class="dot dot_secondary">
								</span><span>Cocoa</span>
							</div>
							<div class="theme_holder ba_red_holder">
								<span class="dot dot_primary">
								</span><span class="dot dot_secondary">
								</span><span>Tomato</span>
							</div>
							<div class="theme_holder ba_green_holder">
								<span class="dot dot_primary">
								</span><span class="dot dot_secondary">
								</span><span>Enchanted Forest</span>
							</div>
							<div class="theme_holder ba_blue_holder">
								<span class="dot dot_primary">
								</span><span class="dot dot_secondary">
								</span><span>Water</span>
							</div>
							<div class="theme_holder ba_custom_holder">
								<span class="dot dot_primary">
								</span><span class="dot dot_secondary">
								</span><span>Custom</span>
							</div>
						</div>
						<div class="custom_theme_box">
							<p>Custom theme</p>
							<div>
								<span id="bbg_dot" class="dot">
								</span><input id="bbg_input" type="text" class="custom_input ctb_input" placeholder="Bubble background color (Hex value)" pattern="[a-fA-F\d]+" maxlength="6">
							</div>
							<div>
								<span id="abg_dot" class="dot">
								</span><input id="abg_input" type="text" class="custom_input ctb_input" placeholder="Accent background color (Hex value)" pattern="[a-fA-F\d]+" maxlength="6">
							</div>
							<div>
								<span id="tc_dot" class="dot">
								</span><input id="tc_input" type="text" class="custom_input ctb_input" placeholder="Text color (Hex value)" pattern="[a-fA-F\d]+" maxlength="6">
							</div>
						</div>
					</div>
				</div>

				<div class="ba_group">
					<div class="bag_left">
						<p class="bag_title">Progress bar color:</p>
					</div>

					<div class="bag_right">
						<span id="prgbar_blue" class="dot prgbar_dot">
						</span><span id="prgbar_red" class="dot prgbar_dot">
						</span><span id="prgbar_green" class="dot prgbar_dot">
						</span><span id="prgbar_yellow" class="dot prgbar_dot">
						</span><span id="prgbar_dark_blue" class="dot prgbar_dot">
						</span><span id="prgbar_purple" class="dot prgbar_dot">
						</span><span id="prgbar_orange" class="dot prgbar_dot">
						</span><span id="prgbar_pink" class="dot prgbar_dot">
						</span><span id="prgbar_custom" class="dot prgbar_dot">
						</span><input input id="prgcustom_input" type="text" class="custom_input" placeholder="Custom color (Hex value)" pattern="[a-fA-F\d]+" maxlength="6">
					</div>
				</div>

				<div class="ba_group">
					<div class="bag_left">
						<p class="bag_title">Header:</p>
					</div>

					<div class="bag_right">
						<div class="checkbox_holder">
							<label for="bh_pinfos"><input type="checkbox" id="bh_pinfos" checked/>Show player avatar</label>
							<label for="bh_sinfos"><input type="checkbox" id="bh_sinfos" checked/>Show server infos</label>
							<label for="bh_qr"><input type="checkbox" id="bh_qr" checked/>Show QR code</label>
						</div>
					</div>
				</div>

				<div class="ba_group">
					<div class="bag_left">
						<p class="bag_title">Background:</p>
					</div>

					<div class="bag_right">
						<div class="checkbox_holder">
							<label for="btr_static" title="The selected background will be used"><input id="btr_static" name="background_type" value="static" type="radio" checked>Selected image<br></label>
							<label for="btr_random"  title="A random background will be used each time the loading screen is loaded"><input id="btr_random" name="background_type" value="random" type="radio">Random image<br></label>
							<label for="btr_carousel" title="All the backgrounds will be used"><input id="btr_carousel" name="background_type" value="carousel" type="radio">Carousel</label>
						</div>

						<div class="carousel_time">
							<span>Change background every
							</span><input class="custom_input ci_number ct_input" placeholder="Enter a number" type="number" min="5" max="60" value="10"
							><span>seconds</span>
						</div>
					</div>
				</div>

				<div class="ba_group">
					<div class="bag_left">
						<p class="bag_title">Links:</p>
					</div>

					<div class="bag_right">
						<div class="checkbox_holder">
							<label for="bgl_urlhide"><input id="bgl_urlhide" type="checkbox" checked>Remove <span class="mono_highlight_text">http(s)://www.</span> from the URL<br></label>
						</div>
					</div>
				</div>

				<div class="ba_group">
					<div class="bag_left">
						<p class="bag_title">Bubbles:</p>
					</div>

					<div class="bag_right">
						<div class="checkbox_holder">
							<label for="ba_blur"><input type="checkbox" id="ba_blur" checked/>Use blur effects</label>
						</div>
						<div class="border_radius">
							<span>Corner radius:
							</span><input class="custom_input ci_number cr_input" placeholder="Enter a number" type="number" min="0" max="16" value="8"
							><span>px</span>
						</div>
						<div class="bb_opacity_container">
							<p id="bboc_label">Bubble color opacity – 70%</p>
							<input id="bboc_range" type="range" min="0" max="1" value="0.7" step="0.01">
						</div>
					</div>
				</div>
			</div>

			<div class="bubble_bubbles bm_content" data-display-type="flex">
				<div class="bbc_container">
					<div class="bbcc_header bbcc_content" data-bubble-type="header">
						<h1 class="title">Header</h1>
					</div>

					<div class="bbcc_content bbcc_bubble" data-bubble-type="main_text">
						<h1 class="title">Main text</h1>
					</div>

					<ul class="bbcc_bubble bbc_main">
						<li style="" class="bbcc_content bbcm_content" data-bubble-type="staff">
							<h1 class="title">Staff</h1>
						</li><li style="" class="bbcc_content bbcm_content" data-bubble-type="rules">
							<h1 class="title">Rules</h1>
						</li>
					</ul>
				</div>
			</div>

			<div class="bubble_main_text bm_content" data-display-type="flex">
				<div class="squire_editor_controls">
					<div class="sec_group sec_text_modifiers">
						<i id="sec_bold" class="fas fa-bold sec_control" title="Bold"></i><i id="sec_italic" class="fas fa-italic sec_control" title="Italic"></i><i id="sec_underline" class="fas fa-underline sec_control" title="Underline"></i>
					</div>

					<div class="sec_group sec_text_size">
						<i id="sec_font_size" class="fas fa-text-height sec_control" title="Text Size"></i><i id="sec_text_color" class="fas fa-palette sec_control" title="Text Color"></i>
					</div>

					<div class="sec_group sec_text_align">
						<i id="sec_align_left" class="fas fa-align-left sec_control sec_align" title="Left Align"></i><i id="sec_align_center" class="fas fa-align-center sec_control sec_align" title="Center Align"></i><i id="sec_align_right" class="fas fa-align-right sec_control sec_align" title="Right Align"></i><i id="sec_align_justify" class="fas fa-align-justify sec_control sec_align" title="Justified"></i>
					</div>

					<div class="sec_group sec_lists">
						<i id="sec_order_list" class="fas fa-list-ol sec_control" title="Ordered List"></i><i id="sec_unorder_list" class="fas fa-list-ul sec_control" title="Unordered List"></i>
					</div>

					<div class="sec_group sec_image">
						<i id="sec_add_image" class="fas fa-image sec_control" title="Image"></i>
					</div>

					<input type="text" placeholder="Title" class="sec_title custom_input" id="sec_title">
				</div>

				<div class="squire_editor"></div>
			</div>

			<div class="bubble_staff_and_rules bm_content" data-display-type="flex">
				<div class="sar_part sar_staff">
					<h2 class="sar_subtitle sar_staff_subtitle" title="Click to modify">Staff</h2>
					<div class="sar_staff_holder"></div>
					<p class="custom_button_p sar_staff_add">+</p>
				</div>

				<div class="sar_part sar_rules">
					<h2 class="sar_subtitle sar_rules_subtitle" title="Click to modify">Rules</h2>
					<div class="sar_rules_holder"></div>
					<p class="custom_button_p sar_rules_add">+</p>
				</div>
			</div>

			<div class="bubble_background bm_content" data-display-type="block">
				<div class="bb_upload_container">
					<input class="bbuc_input" type="file" accept="image/*" multiple>
					<i class="fas fa-upload bbuc_icon"></i>
				</div>

				<ul class="image_container">
					<p class="ic_no_image">No background images found</p>
				</ul>
			</div>

			<div class="bubble_music bm_content" data-display-type="block">
				<div class="bs_upload_container">
					<input class="bsuc_input" type="file" accept="audio/ogg, video/ogg, application/ogg, audio/vnd.wave, audio/wav, audio/wave, audio/x-wav, audio/x-pn-wav, .ogg, .wav" multiple>
					<i class="fas fa-upload bsuc_icon"></i>
				</div>

				<div class="bmc_volume_container">
					<p id="bmc_vc_text">Volume – 50%</p>
					<p id="bmc_vc_warn">A high volume might annoy your users</p>
					<input id="bmc_vc_range" class="bm_volume custom_range" type="range" min="0" max="100" value="50">
				</div>

				<ul class="bmc_container">
					<p class="mc_no_music">No music found</p>
				</ul>

				<!-- <p class="custom_button_p bmc_add" title="Add a YouTube music">+</p> -->
			</div>

			<div class="bubble_about bm_content bm_shown" data-display-type="block">
				<p class="bab_title">Acknowledgements</p>
				<div>
					<a class="bab_bold_text bab_link" href="https://jquery.com/">jQuery
					</a><span class="bab_text">- JavaScript helper library</span>
				</div>
				<div>
					<a class="bab_bold_text bab_link" href="https://github.com/neilj/Squire">Squire
					</a><span class="bab_text">- an HTML5 rich text editor used for the Main Text editor</span>
				</div>
				<div>
					<a class="bab_bold_text bab_link" href="https://github.com/js-cookie/js-cookie">js-cookie
					</a><span class="bab_text">- a cookie parser for JavaScript</span>
				</div>
				<div>
					<a class="bab_bold_text bab_link" href="https://github.com/RubaXa/Sortable">Sortable
					</a><span class="bab_text">- a library used to have reorganisable lists</span>
				</div>
				<div>
					<a class="bab_bold_text bab_link" href="https://github.com/flozz/StackBlur">StackBlur.js
					</a><span class="bab_text">- a fast blurring library used to upload a blurred version of your backgrounds</span>
				</div>
				<div>
					<a class="bab_bold_text bab_link" href="https://github.com/medialize/URI.js">URI.js
					</a><span class="bab_text">- a JavaScript parser for URIs</span>
				</div>
				<div>
					<a class="bab_bold_text bab_link" href="https://github.com/inouet/file-cache">file-cache
					</a><span class="bab_text">- a PHP class to put in cache frequently used data</span>
				</div>
				<div>
					<a class="bab_bold_text bab_link" href="https://fonts.google.com/specimen/Open+Sans">Open Sans
					</a><span class="bab_text">- the default font of this loading screen</span>
				</div>
				<div>
					<a class="bab_bold_text bab_link" href="https://fonts.google.com/specimen/Signika">Signika
					</a><span class="bab_text">- the font used in bubble titles</span>
				</div>
				<div>
					<a class="bab_bold_text bab_link" href="https://developers.google.com/chart/">Google Charts
					</a><span class="bab_text">- the tool used to generate QR codes</span>
				</div>
			</div>

			<div class="bubble_links bm_content" data-display-type="block">
				<ul class="bl_container"></ul>

				<p class="custom_button_p bl_add">+</p>
			</div>
		</div>

		<div class="notification_container"></div>

		<div class="canvas_holder" style="display: none;"></div>
	</div>

	<div class="dropdown">
		<div class="dropdown_item dropdown_text_size">
			<p class="ddts_selector">9</p>
			<p class="ddts_selector">10</p>
			<p class="ddts_selector">11</p>
			<p class="ddts_selector">12</p>
			<p class="ddts_selector">13</p>
			<p class="ddts_selector">14</p>
			<p class="ddts_selector">16</p>
			<p class="ddts_selector">18</p>
			<p class="ddts_selector">24</p>
			<p class="ddts_selector">36</p>
			<p class="ddts_selector">48</p>
			<p class="ddts_selector">64</p>
			<p class="ddts_selector">72</p>
		</div>

		<div class="dropdown_item dropdown_image">
			<p class="ddi_text">Image URL</p>
			<input id="ddi_url" class="custom_input ddi_input" type="text">

			<div class="ddi_size_holder">
				<div class="ddi_sh_item">
					<p class="ddi_text">Width</p>
					<input id="ddi_width" class="custom_input ddi_input" type="text" placeholder="Optional">
				</div>

				<div class="ddi_sh_item">
					<p class="ddi_text">Height</p>
					<input id="ddi_height" class="custom_input ddi_input" type="text" placeholder="Optional">
				</div>
			</div>

			<p class="custom_button_p ddi_add">Add</p>
		</div>

		<div class="dropdown_item dropdown_info">
			<i class="fas fa-info-circle ddinf_icon"></i><p class="ddinf_text"></p>
		</div>

		<div class="dropdown_item dropdown_steam_test">
			<img class="ddst_image">
			<p class="ddst_username"></p>
		</div>

		<div class="dropdown_item dropdown_modify_text">
			<input id="ddmt_input" class="custom_input ddmt_input" type="text" placeholder="Enter a text">
			<p id="ddmt_ok" class="custom_button_p ddmt_ok">OK</p>
		</div>

		<div class="dropdown_item dropdown_color_picker">
			<p class="ddcp_item ddcp_default">Default</p>
			<p class="ddcp_item ddcp_red">Red</p>
			<p class="ddcp_item ddcp_green">Green</p>
			<p class="ddcp_item ddcp_blue">Blue</p>
			<p class="ddcp_item ddcp_dark_blue">Dark Blue</p>
			<p class="ddcp_item ddcp_yellow">Yellow</p>
			<p class="ddcp_item ddcp_purple">Purple</p>
		</div>

		<div class="dropdown_item dropdown_confirm_dialog">
			<p class="ddcd_text"></p>
			<div class="ddcd_buttons">
				<p id="ddcd_cancel" class="custom_button_p ddcd_cancel">Cancel</p>
				<p id="ddcd_ok" class="custom_button_p ddcd_ok">OK</p>
			</div>
		</div>
	</div>

	<div id="player"></div>
</body>
</html>

<?php



?>
