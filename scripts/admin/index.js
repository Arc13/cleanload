var GBL_VARS = {'needsSave': false, 'notifTimeout': -1, 'canSave': true, 'debugmode': false};

// Networking
function onGenericResponse() {
	if (this.readyState == XMLHttpRequest.DONE) {
		if (this.status == 200) {
			var jsonResponse = JSON.parse(this.responseText);

			if (!jsonResponse.success && jsonResponse.error >= 10 && jsonResponse.error <= 19) {
				if (jsonResponse.error == 10)
					sendNotification('Session expired, please login and try again');
				else if (jsonResponse.error == 11)
					sendNotification('Request malformed, please contact the devs about this');
			}

			if (this.callback)
				this.callback(jsonResponse);
		} else {
			sendNotification('HTTP Error ' + this.status + ' while performing the request');

			if (!GBL_VARS.canSave)
				GBL_VARS.canSave = true;
		}
	}
}

function onConfigRequestStateChange(event) {
	function applyDefaultSettings() {
		// General part
		$('#prgbar_blue').addClass('dot_selected');
	}

	function deepCheck(object, defaultValue) {
		try {
			const value = object;
			if (value != null)
				return value;
			else
				return defaultValue;
		} catch (e) {
			return defaultValue;
		}
	}

	if (this.readyState === XMLHttpRequest.DONE) {
		if (this.status === 200) {
			try {
				var config = JSON.parse(this.responseText);
			} catch(e) {
				applyDefaultSettings();
			}

			if (config) {
				const randomBackground = deepCheck(config.Config.RandomBackground, false);

				// General part
				$('#ba_blur').prop('checked', deepCheck(config.Config.Blur, true));
				$('#bgl_urlhide').prop('checked', deepCheck(config.Config.FormatURL, true));

				if (config.Header) {
					$('#bh_pinfos').prop('checked', deepCheck(config.Header.PlayerInfos, true));
					$('#bh_sinfos').prop('checked', deepCheck(config.Header.ServerInfos, true));
					$('#bh_qr').prop('checked', deepCheck(config.Header.QRCode, true));
				}

				const backgroundType = deepCheck(config.Config.BackgroundType, 0);
				if (backgroundType == 0)
					$('#btr_static').prop('checked', true);
				else if (backgroundType == 1)
					$('#btr_random').prop('checked', true);
				else if (backgroundType == 2)
					$('#btr_carousel').prop('checked', true);

				var carouselBackgroundTime = parseInt(deepCheck(config.Config.CarouselTime, 10));
				if (isNaN(carouselBackgroundTime))
					carouselBackgroundTime = 10;
				$('.ct_input').val(clampNumber(carouselBackgroundTime, 5, 60));

				var cornerRadius = parseInt(deepCheck(config.Config.CornerRadius, 8));
				if (isNaN(cornerRadius))
					cornerRadius = 8;
				$('.cr_input').val(clampNumber(cornerRadius, 0, 16));

				const progressColorType = deepCheck(config.Config.ProgressColorType, 0);
				$('.prgbar_dot').eq(progressColorType).addClass('dot_selected');
				if (progressColorType == $('#prgbar_custom').index()) {
					const progressColor = deepCheck(config.Config.ProgressColor, 'ffffff');

					$('#prgcustom_input').val(progressColor);
					$('#prgbar_custom').css('background-color', '#' + progressColor);
				}

				const themeType = deepCheck(config.Config.ThemeType);
				const themeCount = $('.themes_box').children().length;
				$('.themes_box').children().eq(themeType).prepend($('.selected_theme'));

				if (themeType == themeCount - 1) {
					$('.custom_theme_box').show();

					const bubbleColorVal = deepCheck(config.Config.BubbleColor, 'ffffff');
					const accentColorVal = deepCheck(config.Config.AccentColor, 'ffffff');
					const textColorVal = deepCheck(config.Config.TextColor, '000000');

					$('#bbg_dot').css('background-color', '#' + bubbleColorVal);
					$('#bbg_input').val(bubbleColorVal);

					$('#abg_dot').css('background-color', '#' + accentColorVal);
					$('#abg_input').val(accentColorVal);

					$('#tc_dot').css('background-color', '#' + textColorVal);
					$('#tc_input').val(textColorVal);
				}

				$('#bboc_range').val(deepCheck(config.Config.BubbleOpacity, 0.7));
				onOpacityRangeInput();

				// Bubbles part
				const bubblesConfig = deepCheck(config.Bubbles, {});
				for (var key in bubblesConfig) {
					if (key == 'main_content') {
						const contentArray = bubblesConfig[key];
						for (var i = 0; i < contentArray.length; i++) {
							const currentBubble = contentArray[i];
							const bubbleNode = $('.bbcm_content[data-bubble-type=' + currentBubble.bubbleType + ']');

							if (!currentBubble.isEnabled)
								bubbleNode.addClass('bbcc_disabled');

							if (bubbleNode.index() < i)
								bubbleNode.insertAfter($('.bbc_main').children().eq(i));
							else if (bubbleNode.index() > i)
								bubbleNode.insertBefore($('.bbc_main').children().eq(i));
						}
					} else if (!bubblesConfig[key]) {
						$('.bbcc_content[data-bubble-type=' + key + ']').addClass('bbcc_disabled');
					}
				}

				// Main Text part
				$('#sec_title').val(deepCheck(config.Texts.DescriptionTitle, ''));
				GBL_VARS.editor.setHTML(deepCheck(config.Texts.description, ''));

				// Staff and Rules part
				$('.sar_staff_subtitle').text(deepCheck(config.Texts.StaffTitle, 'Staff'));
				$('.sar_rules_subtitle').text(deepCheck(config.Texts.RulesTitle, 'Rules'));

				if (config.Rules) {
					for (var i = 0; i < config.Rules.length; i++)
						addRule(false, config.Rules[i]);
				}

				if (config.Staff) {
					for (var i = 0; i < config.Staff.length; i++)
						addStaff(false, config.Staff[i].steamid, config.Staff[i].role);
				}

				// Music part
				if (config.Music) {
					for (var i = 0; i < config.Music.length; i++) {
						const actualMusic = config.Music[i];
						if (actualMusic.type == 1) {
							const fileObject = $('.bmc_item[data-music-file="' + actualMusic.file + '"]');
							if (fileObject.index() < i)
								fileObject.insertAfter($('.bmc_container').children().eq(i));
							else if (fileObject.index() > i)
								fileObject.insertBefore($('.bmc_container').children().eq(i));

							fileObject.find('.bmc_title_input').val(actualMusic.title);
							fileObject.find('.bmc_author_input').val(actualMusic.author);
						} else if (actualMusic.type == 2) {
							addYoutubeMusic('https://www.youtube.com/watch?v=' + actualMusic.code, i, actualMusic.title, actualMusic.author);
						}
					}
				}

				$('#bmc_vc_range').val(deepCheck(config.Config.MusicVolume, 50));
				updateVolumeText();

				// Background part
				if (config.Background) {
					for (var i = 0; i < config.Background.length; i++) {
						const actualBackground = config.Background[i];
						const fileObject = $('.ic_holder[data-bg-file="' + actualBackground + '"]');
						if (fileObject.index() < i)
							fileObject.insertAfter($('.image_container').children().eq(i));
						else if (fileObject.index() > i)
							fileObject.insertBefore($('.image_container').children().eq(i));
					}
				}

				const selectedImageParent = $('.ic_preview[src$="/' + config.Config.SelectedBackground + '"]').parent();
				selectedImageParent.addClass('ic_selected');

				// Links part
				if (config.Links) {
					for (var i = 0; i < config.Links.length; i++) {
						const actualLink = config.Links[i];
						addLink(actualLink.type, actualLink.url);
					}
				}

				GBL_VARS.config = config;
			} else {
				applyDefaultSettings();
			}
		} else {
			applyDefaultSettings();
		}

		if ($('.sar_staff_holder').children().length == 0)
			addStaff();

		if ($('.sar_rules_holder').children().length == 0)
			addRule();

		if ($('.bl_container').children().length == 0)
			addLink();

		carouselTimeDisplayCheck();
	}
}

// Global handlers
function onMouseUp(event) {
	const dropdown = $('.dropdown');
	const confirmBackgroundDelete = $('.icd_confirm');
	const confirmMusicDelete = $('.bmc_confirm');

	if (!dropdown.is(event.target) && dropdown.has(event.target).length === 0 && dropdown.is(':visible'))
		closeDropdown();

	if (!confirmBackgroundDelete.is(event.target) && confirmBackgroundDelete.has(event.target).length === 0)
		$('.icd_confirm').removeClass('icd_confirm');

	if (!confirmMusicDelete.is(event.target) && confirmMusicDelete.has(event.target).length === 0)
		$('.bmc_confirm').removeClass('bmc_confirm');
}

// Main bubble
function onMainBubbleClick(event) {
	GBL_VARS.needsSave = true;
}

// Sidebar
function onSaveStateChange(json) {
	function playAnim(icon) {
		function resetIcon() {
			$('#sebd_save').animate({'opacity': 0}, 200, 'swing', function() {
				$('#sebd_save').removeClass(icon);
				$('#sebd_save').addClass('fa-save');

				$('#sebd_save').animate({'opacity': 1}, 200);
				GBL_VARS.canSave = true;
			});
		}

		$('#sebd_save').animate({'opacity': 0}, 200, 'swing', function() {
			$('#sebd_save').removeClass('fa-save');
			$('#sebd_save').addClass(icon);

			$('#sebd_save').animate({'opacity': 1}, 200, 'swing', function() {
				setTimeout(resetIcon, 700);
			});
		});
	}

	if (json.success) {
		playAnim('fa-check-circle');
	} else {
		playAnim('fa-exclamation-circle');
		if (json.error == 20)
			sendNotification('An error occured with the generated config, please contact the devs with screenshots of this configuration');
		else if (json.error == 21)
			sendNotification('The config file couldn\'t be written, check the permissions');
	}
}

function onSEMenuClick(event) {
	setCurrentMenu($(event.currentTarget).index(), $(event.currentTarget).hasClass('sidebar_element_bottom'));
}

function onSaveClick(event) {
	if (GBL_VARS.canSave) {
		GBL_VARS.canSave = false;

		const saveReq = new XMLHttpRequest();
		saveReq.open('POST', 'submit.php', true);
		saveReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		saveReq.onreadystatechange = onGenericResponse;
		saveReq.callback = onSaveStateChange;
		saveReq.send('cookie=' + Cookies.get('token') + '&json=' + generateConfig() + '&type=json');
	}
}

function onLogoutClick(event) {
	Cookies.remove('token', {path: ''});
	document.location.replace('login.php');
}

function setCurrentMenu(index, isBottom) {
	var currentSidebarElement = $(isBottom ? '.sidebar_element_holder_bottom' : '.sidebar_element_holder').children().eq(index);
	var menuTitle = currentSidebarElement.find('.se_menu_text').text();
	var menuSubtitle = '';
	if (currentSidebarElement.attr('data-subtitle'))
		menuSubtitle = currentSidebarElement.attr('data-subtitle');

	var bubbleClassName = '.bubble_' + menuTitle.replace(/ /g, '_').toLowerCase();
	var oldIndex = $('.se_selected').index();

	$('.se_selected').removeClass('se_selected');
	currentSidebarElement.addClass('se_selected');

	$('.bubble_main_title').text(menuTitle);
	$('.bubble_main_subtitle').text(menuSubtitle);

	$('.bm_shown').hide();
	$('.bm_shown').removeClass('bm_shown');

	$(bubbleClassName).addClass('bm_shown');
	$(bubbleClassName).css('display', $(bubbleClassName).attr('data-display-type'));
}

// General bubble
function onColorDotClick() {
	$('.dot_selected').removeClass('dot_selected');
	$(this).addClass('dot_selected');
}

function onColorInput() {
	const associatedDot = $(this).parent().find('.dot');
	const color = $(this).val();

	if (isHex(color)) {
		associatedDot.css('background-color', '#' + color);
	} else {
		associatedDot.css('background-color', 'white');
	}
}

function onProgressColorInput() {
	const progressCustomDot = $('#prgbar_custom');
	const color = $(this).val();

	if (isHex(color))
		progressCustomDot.css('background-color', '#' + color);
	else
		progressCustomDot.css('background-color', 'white');

	if (!progressCustomDot.hasClass('dot_selected')) {
		$('.dot_selected').removeClass('dot_selected');
		$('#prgbar_custom').addClass('dot_selected');
	}
}

function onOpacityRangeInput() {
	$('#bboc_label').text('Bubble background opacity – ' + parseInt($('#bboc_range').val() * 100) + '%');
}

function onThemeChangeClick() {
	$('.themes_box').children().eq($(this).index()).prepend($('.selected_theme'));

	if ($(this).is(':last-child'))
		$('.custom_theme_box').show();
	else
		$('.custom_theme_box').hide();
}

function onLoadingUrlClick() {
	this.select();
	document.execCommand('copy');
	sendNotification('URL copied to clipboard');
	this.blur();
}

function carouselTimeDisplayCheck() {
	if ($('input[name=background_type]:checked').attr('id') == 'btr_carousel')
		$('.carousel_time').show();
	else
		$('.carousel_time').hide();
}

// Main text bubble
function onSECClick(event) {
	switch (event.target.id) {
		case 'sec_bold':
		if (GBL_VARS.editor.hasFormat('b'))
			GBL_VARS.editor.removeBold();
		else
			GBL_VARS.editor.bold();

		checkFormats();
		break;
		case 'sec_italic':
		if (GBL_VARS.editor.hasFormat('i'))
			GBL_VARS.editor.removeItalic();
		else
			GBL_VARS.editor.italic();

		checkFormats();
		break;
		case 'sec_underline':
		if (GBL_VARS.editor.hasFormat('u'))
			GBL_VARS.editor.removeUnderline();
		else
			GBL_VARS.editor.underline();

		checkFormats();
		break;
		case 'sec_font_size':
		openDropdown($(event.target), 'text_size');

		break;
		case 'sec_order_list':
		if (GBL_VARS.editor.hasFormat('ol'))
			GBL_VARS.editor.removeList();
		else
			GBL_VARS.editor.makeOrderedList();

		checkFormats();
		break;
		case 'sec_unorder_list':
		if (GBL_VARS.editor.hasFormat('ul'))
			GBL_VARS.editor.removeList();
		else
			GBL_VARS.editor.makeUnorderedList();

		checkFormats();
		break;
		case 'sec_align_left':
		GBL_VARS.editor.setTextAlignment('left');
		break;
		case 'sec_align_center':
		GBL_VARS.editor.setTextAlignment('center');
		break;
		case 'sec_align_right':
		GBL_VARS.editor.setTextAlignment('right');
		break;
		case 'sec_align_justify':
		GBL_VARS.editor.setTextAlignment('justify');
		break;
		case 'sec_add_image':
		openDropdown($(event.target), 'image');

		break;
		case 'sec_text_color':
		openDropdown($(event.target), 'color_picker', {'default': true, 'callback': function(color) {
			GBL_VARS.editor.setTextColour(color);
			return true;
		}});

		break;
		default:
	}
}

function checkFormats() {
	function applyActiveColor(isActive, element) {
		if (isActive) {
			element.css('backgroundColor', 'rgba(255, 255, 255, 0.8)');
			element.css('color', 'black');
		} else {
			element.css('backgroundColor', '');
			element.css('color', '');
		}
	}

	applyActiveColor(GBL_VARS.editor.hasFormat('b'), $('#sec_bold'));
	applyActiveColor(GBL_VARS.editor.hasFormat('i'), $('#sec_italic'));
	applyActiveColor(GBL_VARS.editor.hasFormat('u'), $('#sec_underline'));

	applyActiveColor(GBL_VARS.editor.hasFormat('ol'), $('#sec_order_list'));
	applyActiveColor(GBL_VARS.editor.hasFormat('ul'), $('#sec_unorder_list'));

	applyActiveColor(false, $('.sec_align'));
	if (GBL_VARS.editor.getPath() != '(selection)' && GBL_VARS.editor.getPath().trim() != '') {
		if (GBL_VARS.editor.getPath().includes('align-center'))
			applyActiveColor(true, $('#sec_align_center'))
		else if (GBL_VARS.editor.getPath().includes('align-right'))
			applyActiveColor(true, $('#sec_align_right'))
		else if (GBL_VARS.editor.getPath().includes('align-justify'))
			applyActiveColor(true, $('#sec_align_justify'))
		else
			applyActiveColor(true, $('#sec_align_left'))
	}
}

// Staff and rules bubble
function onSARRemoveClick(event) {
	$(event.target).parent().remove();
}

function onSARAddClick(event) {
	if ($(event.target).hasClass('sar_staff_add')) {
		var lastStaff = $('.sar_staff_item').last();
		var steamID = lastStaff.find('.steamid_input').val();
		var isSteamIDInvalid = lastStaff.find('.steamid_input').is(':invalid');
		var rank = lastStaff.find('.rank_input').val();

		if (isStaffCoupleValid(steamID, isSteamIDInvalid, rank))
			addStaff(true);
		else
			openDropdown($(event.target), 'info', 'Please correctly fill the last staff before adding a new one');
	} else if ($(event.target).hasClass('sar_rules_add')) {
		var lastRuleText = $('.sar_rules_item').last().find('.rule_input').val();

		if (lastRuleText.trim().length > 0)
			addRule(true);
		else
			openDropdown($(event.target), 'info', 'Please correctly fill the last rule before adding a new one');
	}
}

function onSARTestClick(event) {
	const steamID = $(event.target).parent().find('.steamid_input').val();
	const staffTestReq = new XMLHttpRequest();

	staffTestReq.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE) {
			if (this.status === 200) {
				const result = JSON.parse(this.responseText)

				if (result && result.response.players.length > 0) {
					const playerAvatar = result.response.players[0].avatarfull;
					const playerName = result.response.players[0].personaname;

					openDropdown($(event.target), 'steam_test', {'avatar': playerAvatar, 'name': playerName});
				} else if (result.response.players.length == 0) {
					openDropdown($(event.target), "info", "No player found");
				} else {
					openDropdown($(event.target), "info", "An unknown error has occured");
				}
			} else if (this.status === 403) {
				openDropdown($(event.target), "info", "Access forbidden, check your Steam key");
			}
		}
	};

	staffTestReq.open('GET', 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + PHP_VARS.steamKey + '&steamids=' + steamID, true);
	staffTestReq.send(null);
}

function onSARSubtitleClick(event) {
	if ($(event.target).hasClass('sar_staff_subtitle')) {
		openDropdown($(event.target), "modify_text", function(text) {
			if (text.trim().length > 0)
				$('.sar_staff_subtitle').text(text);
			else
				$('.sar_staff_subtitle').text('Staff');

			return true;
		});
	} else if ($(event.target).hasClass('sar_rules_subtitle')) {
		openDropdown($(event.target), "modify_text", function(text) {
			if (text.trim().length > 0)
				$('.sar_rules_subtitle').text(text);
			else
				$('.sar_rules_subtitle').text('Rules');

			return true;
		});
	}
}

function onSteamIDInputUpdate(event) {
	if ($(event.target).is(':invalid') || $(event.target).val().trim().length === 0)
		openDropdown($(event.target), 'info', 'You must enter a 17-digits number', $(event.target).parent());
	else
		closeDropdown();
}

function addStaff(doFade, steamid = '', rank = '') {
	$('.sar_staff_holder').append('\
		<div class="sar_staff_item">\
			<button class="custom_button sar_staff_remove" title="Remove this staff member">-</button>\
			<input class="custom_input sar_staff_input steamid_input" type="text" placeholder="Steam ID" pattern="\\d{17}" maxlength="17" pattern="[0-9]" value="' + steamid + '">\
			<input class="custom_input sar_staff_input rank_input" type="text" placeholder="Role" value="' + rank + '">\
			<button class="custom_button sar_staff_test" title="Test the entered Steam ID">Test</button>\
		</div>\
		');

	var createdItem = $('.sar_staff_holder').children().last();

	createdItem.find('.sar_staff_remove').click(onSARRemoveClick);
	createdItem.find('.sar_staff_test').click(onSARTestClick);

	createdItem.find('.steamid_input').click(onSteamIDInputUpdate);
	createdItem.find('.steamid_input').keyup(onSteamIDInputUpdate);

	if (doFade)
		createdItem.last().hide().fadeIn('fast');
}

function addRule(doFade, rule = '') {
	$('.sar_rules_holder').append('\
		<div class="sar_rules_item">\
			<button class="custom_button sar_rules_remove" title="Remove this rule">-</button>\
			<input class="custom_input sar_rules_input rule_input" type="text" placeholder="Your rule" value="' + rule + '">\
		</div>\
		');

	var createdItem = $('.sar_rules_holder').children().last();
	createdItem.find('.sar_rules_remove').click(onSARRemoveClick);

	if (doFade)
		createdItem.last().hide().fadeIn('fast');
}

function isStaffCoupleValid(steamID, isSteamIDInvalid, rank) {
	return (!isSteamIDInvalid && !(steamID.trim().length === 0)) && !(rank.trim().length === 0);
}

function getStaffAsArray() {
	var staffList = [];

	$('.sar_staff_item').each(function() {
		var steamID = $(this).find('.steamid_input').val();
		var isSteamIDInvalid = $(this).find('.steamid_input').is(':invalid');
		var rank = $(this).find('.rank_input').val();

		if (isStaffCoupleValid(steamID, isSteamIDInvalid, rank))
			staffList.push({"steamid": steamID, "role": rank});
	});

	return staffList;
}

function getRulesAsArray() {
	var ruleList = [];

	$('.sar_rules_item').each(function() {
		var rule = $(this).find('.rule_input').val();

		if (!(rule.trim().length === 0))
			ruleList.push(rule);
	});

	return ruleList;
}

// Background bubble
function onBackgroundUpload(json) {
	if (json.success) {
		addBackground(json.data, true);

		$('.ic_no_image').remove();
	} else {
		if (json.error == 30)
			sendNotification('The uploaded file is not valid');
		else if (json.error == 31)
			sendNotification('The background could not be saved, check the permissions');
		else if (json.error == 32)
			sendNotification('The file size is too big');
	}
}

function onBackgroundDeleted(json) {
	if (json.success) {
		const imageContainer = $('.ic_preview[src$="' + json.data + '"]').parent();

		if (imageContainer.hasClass('ic_selected'))
			$('.image_container').children().eq(0).addClass('ic_selected');

		imageContainer.remove();
	} else {
		if (json.error == 40)
			sendNotification('The requested background does not exist');
		else if (json.error == 41)
			sendNotification('The file could not be deleted, check the permissions');

		$('.ic_preview[src$="' + json.data + '"]').parent().find('.icd_trash').removeClass('icd_confirm').show();
	}
}

function onBlurUpload(json) {
	if (json.success) {
		const imgSrc = json.data.replace('blur_', '');
		const noBlurDiv = $('.ic_preview[src$="' + imgSrc + '"]').parent().children('.ic_data').children('.icd_no_blur');

		noBlurDiv.children('.icd_exclamation').remove();
		noBlurDiv.prepend('<span class="fas fa-check-circle icd_check"></span>');
		noBlurDiv.removeClass('icd_no_blur');
	} else {
		if (json.error == 50)
			sendNotification('The actual blurred image could not be deleted, check the permissions');
		else if (json.error == 51)
			sendNotification('The actual blurred image could not be deleted, but the old one has been lost');
	}
}

function onPreviewClick() {
	const selectedImage = $('.ic_selected');
	selectedImage.removeClass('ic_selected');

	$(this).parent().addClass('ic_selected');
}

function onNoBlurClick() {
	const imagePath = $($(this).parent().parent().children('.ic_preview')[0]).attr('src');
	const imageName = getFilenameFromPath(imagePath);

	function onImageLoaded() {
		const blurUploadReq = new XMLHttpRequest();
		blurUploadReq.open('POST', 'submit.php');
		blurUploadReq.onreadystatechange = onGenericResponse;
		blurUploadReq.callback = onBlurUpload;

		var formData = new FormData();
		formData.append('cookie', Cookies.get('token'));
		formData.append('type', 'updateblur');
		formData.append('id', getFilenameFromPath(this.src).replace(/\.[^/.]+$/, ""));
		formData.append('image', getBlurredImage(this));

		blurUploadReq.send(formData);
	}

	var image = new Image();
	image.onload = onImageLoaded;
	image.src = imagePath;

	sendNotification('The blurred version of ' + getFilenameFromPath(imagePath) + ' is being created...')
}

function onBackgroundUploadClick(event) {
	const files = $('.bbuc_input')[0].files;

	if (files.length <= 0) {
		sendNotification('No image selected');
		return;
	}

	function onFileRead() {
		var currentFile = this.file;

		function onImageLoaded() {
			const backgroundUploadReq = new XMLHttpRequest();
			backgroundUploadReq.open('POST', 'submit.php');
			backgroundUploadReq.onreadystatechange = onGenericResponse;
			backgroundUploadReq.callback = onBackgroundUpload;

			var formData = new FormData();
			formData.append('cookie', Cookies.get('token'));
			formData.append('type', 'image');
			formData.append('image', currentFile);
			formData.append('blurredImage', getBlurredImage(this));

			backgroundUploadReq.send(formData);
		}

		var image = new Image();
		image.onload = onImageLoaded;
		image.src = this.result;
	}

	for (i = 0; i < files.length; i++) {
		const currentFile = files[i];

		if (currentFile.type.match('image/*')) {
			var fileReader = new FileReader();
			fileReader.onload = onFileRead;
			fileReader.file = currentFile;
			fileReader.readAsDataURL(currentFile);
		} else {
			sendNotification(currentFile.name + ' is not an image', 2000);
		}
	}
}

function onDeleteBackgroundClicked(event) {
	const imagePath = $($(this).parent().parent().children('.ic_preview')[0]).attr('src');
	const imageName = getFilenameFromPath(imagePath);

	if (!$(this).hasClass('icd_confirm')) {
		$('.icd_confirm').removeClass('icd_confirm');
		$(this).addClass('icd_confirm');
	} else {
		$(this).hide();

		const deleteBackgroundReq = new XMLHttpRequest();
		deleteBackgroundReq.open('POST', 'submit.php');
		deleteBackgroundReq.onreadystatechange = onGenericResponse;
		deleteBackgroundReq.callback = onBackgroundDeleted;

		var formData = new FormData();
		formData.append('cookie', Cookies.get('token'));
		formData.append('type', 'deleteimage');
		formData.append('name', imageName);

		deleteBackgroundReq.send(formData);
	}
}

function getBlurredImage(image) {
	var lastAppendedCanvas = $($('.canvas_holder').append('<canvas></canvas>').children().last())[0];

	lastAppendedCanvas.width = image.width;
	lastAppendedCanvas.height = image.height;

	StackBlur.image(image, lastAppendedCanvas, 64, true);

	const data = lastAppendedCanvas.toDataURL("image/jpeg");
	lastAppendedCanvas.remove();

	return data;
}

function addBackground(path, isBlurred) {
	const appendedBackground = $('.image_container').append('<li class="ic_holder" data-bg-file="' + path + '">\
		<img class="ic_preview" src="../background/' + path + '"></img>\
		</li>').children().last();

	if (isBlurred) {
		appendedBackground.append('<div class="ic_data">\
			<div class="icd_blur_holder">\
				<span class="fas fa-check-circle icd_check">\
				</span><span class="icd_blur_text">Blur</span>\
			</div>\
			<p class="far fa-trash-alt icd_trash"></p>\
			</div>');
	} else {
		appendedBackground.append('<div class="ic_data">\
			<div class="icd_blur_holder icd_no_blur">\
				<span class="fas fa-exclamation-triangle icd_exclamation">\
				</span><span class="icd_blur_text">Blur</span>\
			</div>\
			<p class="far fa-trash-alt icd_trash"></p>\
			</div>');
	}

	appendedBackground.children('.ic_preview').click(onPreviewClick);
	appendedBackground.children('.ic_data').children('.icd_no_blur').click(onNoBlurClick);
	appendedBackground.children('.ic_data').children('.icd_trash').click(onDeleteBackgroundClicked);
}

function getBackgroundsAsArray() {
	var backgroundList = [];

	$('.ic_holder').each(function() {
		backgroundList.push($(this).attr('data-bg-file'));
	});

	return backgroundList;
}

// Music bubble
function onMusicUpload(json) {
	if (json.success) {
		addLocalMusic(getFilenameFromPath(json.data));

		$('.mc_no_music').remove();
	} else {
		if (json.error == 31)
			sendNotification('The music could not be saved, check the permissions');
		else if (json.error == 32)
			sendNotification('The file size is too big');
	}
}

function onMusicUploadClick(event) {
	const files = $('.bsuc_input')[0].files;

	if (files.length <= 0) {
		sendNotification('No music selected');
		return;
	}

	function onFileRead() {
		const musicUploadReq = new XMLHttpRequest();
		musicUploadReq.open('POST', 'submit.php');
		musicUploadReq.onreadystatechange = onGenericResponse;
		musicUploadReq.callback = onMusicUpload;

		var formData = new FormData();
		formData.append('cookie', Cookies.get('token'));
		formData.append('type', 'music');
		formData.append('music', this.file);

		musicUploadReq.send(formData);
	}

	for (i = 0; i < files.length; i++) {
		const currentFile = files[i];

		const supportedAudio = ['application/ogg', 'audio/ogg', 'video/ogg', 'audio/vnd.wave', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/x-pn-wav'];
		const supportedExtensions = ['ogg', 'wav'];
		if (supportedAudio.lastIndexOf(currentFile.type) >= 0 || supportedExtensions.lastIndexOf(getFileExtension(currentFile.name)) >= 0) {
			var fileReader = new FileReader();
			fileReader.onload = onFileRead;
			fileReader.file = currentFile;
			fileReader.readAsDataURL(currentFile);
		} else {
			sendNotification(currentFile.name + ' is not an ogg/wav file', 2000);
		}
	}
}

function onMusicDeleted(json) {
	if (json.success) {
		$('.bmc_item[data-music-file="' + getFilenameFromPath(json.data) + '"]').remove();
	} else {
		if (json.error == 60)
			sendNotification('The requested music does not exist');
		else if (json.error == 61)
			sendNotification('The file could not be deleted, check the permissions');

		$('.bmc_item[data-music-file="' + getFilenameFromPath(json.data) + '"]').find('.bmc_delete').removeClass('bmc_confirm').show();
	}
}

function onDeleteLocalClick(event) {
	const musicFile = $(this).parent().parent().attr('data-music-file');

	if (!$(this).hasClass('bmc_confirm')) {
		$('.bmc_confirm').removeClass('bmc_confirm');
		$(this).addClass('bmc_confirm');
	} else {
		$(this).hide();

		const deleteMusicReq = new XMLHttpRequest();
		deleteMusicReq.open('POST', 'submit.php');
		deleteMusicReq.onreadystatechange = onGenericResponse;
		deleteMusicReq.callback = onMusicDeleted;

		var formData = new FormData();
		formData.append('cookie', Cookies.get('token'));
		formData.append('type', 'deletemusic');
		formData.append('name', musicFile);

		deleteMusicReq.send(formData);
	}
}

function onDeleteYoutubeClick(event) {
	function onButtonClick(result) {
		if (result)
			$(event.target).parent().parent().remove();
	}

	openDropdown($(event.target), 'confirm_dialog', {'text': 'Remove this music ?', 'callback': onButtonClick});
}

function onYoutubePreviewClick(event) {
	const target = $(event.target);

	if (target.hasClass('bmc_playing')) {
		target.removeClass('fa-stop');
		target.addClass('fa-play');
		target.removeClass('bmc_playing');

		if (GBL_VARS.player)
			GBL_VARS.player.stopVideo();
	} else {
		const linkArgs = URI(target.parent().parent().find('.bmc_link_input').val()).query(true);

		$('.bmc_playing').removeClass('fa-stop');
		$('.bmc_playing').addClass('fa-play');
		$('.bmc_playing').removeClass('bmc_playing');

		if (linkArgs.v && GBL_VARS.player) {
			target.addClass('bmc_playing');
			target.removeClass('fa-play');
			target.addClass('fa-stop');

			GBL_VARS.player.stopVideo();
			GBL_VARS.player.loadVideoById(linkArgs.v, 0, 'small');
		} else if (!linkArgs.v) {
			sendNotification('Incorrect URL format');
		}
	}
}

function onPlayerStateChange(event) {
	if (event.data == 0) {
		$('.bmc_playing').removeClass('fa-stop');
		$('.bmc_playing').addClass('fa-play');
		$('.bmc_playing').removeClass('bmc_playing');
	}
}

function onPlayerError(event) {
	$('.bmc_playing').removeClass('fa-stop');
	$('.bmc_playing').addClass('fa-play');
	$('.bmc_playing').removeClass('bmc_playing');

	if (event.data == 2)
		sendNotification('Incorrect request');
	else if (event.data == 5)
		sendNotification('This video can not be played in an HTML5 browser');
	else if (event.data == 100)
		sendNotification('Unable to play the request video (private or deleted)');
	else if (event.data == 101 || event.data == 150)
		sendNotification('This video can not be played in the background')
}

function onYouTubeIframeAPIReady() {
	GBL_VARS.player = new YT.Player('player', {
		events: {
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
          }
	});
}

function onVolumeRangeInput(event) {
	updateVolumeText();
}

function updateVolumeText() {
	const volume = $('#bmc_vc_range').val();

	$('#bmc_vc_text').text('Volume – ' + volume + '%');
	if (volume >= 60) {
		$('.bmc_volume_container').css('color', 'rgb(228, 139, 15)');
		$('#bmc_vc_warn').show();
	} else {
		$('.bmc_volume_container').css('color', 'white');
		$('#bmc_vc_warn').hide();
	}
}

function addLocalMusic(fileName, title = '', author = '') {
	var addedMusic = $('.bmc_container').append('<li class="bmc_item" data-music-type="1" data-music-file="' + fileName + '">\
		<p class="bmc_header_text">' + fileName + '</p>\
		<div class="bmc_content">\
			<span class="fas fa-grip-vertical bmc_handle">\
			</span><input class="custom_input bmc_title_input" type="text" placeholder="Music title" value="' + title + '"\
			><input class="custom_input bmc_author_input" type="text" placeholder="Music author" value="' + author + '">\
			<span class="far fa-trash-alt bmc_delete"></span>\
		</div>\
	</li>').children().last();

	addedMusic.find('.bmc_delete').click(onDeleteLocalClick);
}

function addYoutubeMusic(video = '', index = -1, title = '', author = '') {
	const youtubeTemplate = '<li class="bmc_item" data-music-type="2">\
		<p class="bmc_header_text">YouTube</p>\
		<div class="bmc_content">\
			<span class="fas fa-grip-vertical bmc_handle">\
			</span><input class="custom_input bmc_link_input" type="text" placeholder="Video link" value="' + video + '"\
			><span class="far fa-trash-alt bmc_delete"></span>\
		</div>\
		<div class="bmc_content">\
			<span class="fas fa-play bmc_play"></span>\
			<input class="custom_input bmc_title_input" type="text" placeholder="Music title" value="' + title + '"\
			><input class="custom_input bmc_author_input" type="text" placeholder="Music author" value="' + author + '">\
		</div>\
	</li>';
	const containerChildrenCount = $('.bmc_container').children().length;

	if (index == -1 || index >= containerChildrenCount - 1)
		$('.bmc_container').append(youtubeTemplate);
	else
		$(youtubeTemplate).insertBefore($('.bmc_container').children().eq(index));

	const addedMusic = $('.bmc_container').children().eq(index);
	addedMusic.find('.bmc_delete').click(onDeleteYoutubeClick);
	addedMusic.find('.bmc_play').click(onYoutubePreviewClick);
}

function getMusicAsArray() {
	var musicList = [];

	$('.bmc_item').each(function() {
		const musicType = $(this).attr('data-music-type');

		if (musicType == 1) {
			const musicFile = $(this).attr('data-music-file');

			const musicTitle = $(this).find('.bmc_title_input').val();
			const musicAuthor = $(this).find('.bmc_author_input').val();
			const musicAlbum = $(this).find('.bmc_album_input').val();

			musicList.push({'type': musicType, 'file': musicFile, 'title': musicTitle, 'author': musicAuthor, 'album': musicAlbum});
		} else if (musicType == 2) {
			const youtubeLink = $(this).find('.bmc_link_input').val();

			const youtubeArgs = URI(youtubeLink).query(true);
			const youtubeCode = youtubeArgs.v;

			const musicTitle = $(this).find('.bmc_title_input').val();
			const musicAuthor = $(this).find('.bmc_author_input').val();

			if (youtubeArgs && youtubeCode)
				musicList.push({'type': musicType, 'code': youtubeCode, 'title': musicTitle, 'author': musicAuthor});
		}
	});

	return musicList;
}

function onYoutubeAddClick() {
	$('.mc_no_music').remove();
	addYoutubeMusic();
}

// Bubbles bubble
function onBubbleContentClick(event) {
	$(this).toggleClass('bbcc_disabled');
}

function getBubblesAsArray() {
	var bubblesList = {};
	var mainContentList = [];

	$('.bbcc_content').each(function() {
		const bubbleType = $(this).attr('data-bubble-type');
		const isEnabled = !$(this).hasClass('bbcc_disabled');
		if (!$(this).hasClass('bbcm_content'))
			bubblesList[bubbleType] = isEnabled;
	});

	$('.bbcm_content').each(function() {
		const bubbleType = $(this).attr('data-bubble-type');
		const isEnabled = !$(this).hasClass('bbcc_disabled');

		mainContentList.push({bubbleType: bubbleType,
			isEnabled: isEnabled});
	});
	bubblesList['main_content'] = mainContentList;

	return bubblesList;
}

// Links bubble
function onAddLinkClick(event) {
	var lastLinkText = $('.bli_item').last().find('.bli_url').val();

	if (lastLinkText.trim().length > 0)
		addLink();
	else
		openDropdown($(event.target), 'info', 'Please correctly fill the last link before adding a new one');
}

function onRemoveLinkClick() {
	$(this).parent().remove();
}

function addLink(type = 0, url = '') {
	var addedLink = $('.bl_container').append('<li class="bli_item">\
			<span class="fas fa-grip-vertical bli_handle">\
			</span><select class="bli_select">\
				<option value="0">Website</option>\
				<option value="1">Forum</option>\
				<option value="2">Donation</option>\
				<option value="3">Store</option>\
				<option value="4">Discord</option>\
				<option value="5">TeamSpeak</option>\
				<option value="6">Mumble</option>\
			</select><input value="' + url + '" placeholder="URL" class="custom_input bli_url" type="text">\
			<button class="custom_button bli_remove" title="Remove this link">-</button>\
		</li>').children().last();

	addedLink.find('.bli_select').val(type);
	addedLink.find('.bli_remove').click(onRemoveLinkClick);
}

function getLinksAsArray() {
	var linkList = [];

	$('.bli_item').each(function() {
		const linkType = $(this).find('.bli_select').val();
		const linkUrl = $(this).find('.bli_url').val();

		if (linkUrl.trim().length > 0)
			linkList.push({'type': linkType, 'url': linkUrl});
	});

	return linkList;
}

// Dropdown
function onDropdownClick(event) {
	var target = $(event.target);

	if (target.hasClass('ddts_selector')) {
		var size = parseInt(target.text());

		if (size) {
			GBL_VARS.editor.setFontSize(size);
			closeDropdown();
		}
	} else if (target.hasClass('ddi_add')) {
		var targetParent = $(target).parent();
		var url = targetParent.find('#ddi_url').val();
		var width = parseInt(targetParent.find('#ddi_width').val()) || 'initial';
		var height = parseInt(targetParent.find('#ddi_height').val()) || 'initial';

		if (!(url.trim().length === 0)) {
			GBL_VARS.editor.insertImage(url, {"width": width, 'height': height});
			closeDropdown();
		}
	}
}

function openDropdown(target, dropdownType, args, insertionPoint) {
	var targetHeight = target.innerHeight();
	var dropdownTypeClass = '.dropdown_' + dropdownType;

	if (insertionPoint)
		$('.dropdown').insertAfter(insertionPoint);
	else
		$('.dropdown').insertAfter(target);

	$('.dd_shown').removeClass('dd_shown');
	$(dropdownTypeClass).addClass('dd_shown');

	if (dropdownType == 'info') {
		$('.ddinf_text').text(args);
	} else if (dropdownType == 'steam_test') {
		$('.ddst_image').attr('src', args.avatar);
		$('.ddst_username').text(args.name);
	} else if (dropdownType == 'modify_text') {
		function onDDMTClick() {
			if (args($('#ddmt_input').val())) {
				closeDropdown();
			}
		}

		$('#ddmt_ok').click(onDDMTClick);
		$('#ddmt_input').keyup(function(event) {
			if (event.keyCode == 13)
				onDDMTClick();
		});
	} else if (dropdownType == 'color_picker') {
		function onColorPick() {
			const color = $(this).hasClass('ddcp_default') ? '' : $(this).css('color');
			const colorText = $(this).text();
			const colorID = colorText.replace(/ /g, '_').toLowerCase();
			if (args.callback(color, colorText, colorID))
				closeDropdown();
		}

		$('.ddcp_item').click(onColorPick);

		args.default ? $('.ddcp_default').show() : $('.ddcp_default').hide();
	} else if (dropdownType == 'confirm_dialog') {
		function onCancel() {
			closeDropdown();

			if (args.callback)
				args.callback(false)
		}

		function onConfirm() {
			closeDropdown();

			if (args.callback)
				args.callback(true);
		}

		$('.ddcd_text').text(args.text);

		$('.ddcd_cancel').click(onCancel);
		$('.ddcd_ok').click(onConfirm);
	}

	$('.dropdown').show();
}

function closeDropdown() {
	$('.dropdown').hide();

	$('#ddmt_input').val('');
	$('#ddmt_input').off('keyup');
	$('#ddmt_ok').off('click');

	$('.ddcp_item').off('click');

	$('.ddcd_ok').off('click');
	$('.ddcd_cancel').off('click');
}

// Utils
function getRGB(str){
	var match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
	return match ? {
		r: match[1],
		g: match[2],
		b: match[3]
	} : null;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getStandardColorRepresentation(rgbObject) {
	if (rgbObject)
		return rgbObject.r + ', ' + rgbObject.g + ', ' + rgbObject.b;
	else
		return '255, 0, 0';
}

function generateConfig() {
	function getText(textToCheck, fallbackText) {
		if (textToCheck.trim().length > 0)
			return textToCheck;
		else
			return fallbackText;
	}

	var generatedConfig = {};

	generatedConfig.Version = 1;

	generatedConfig.Texts = {};
	generatedConfig.Texts.DescriptionTitle = getText($('#sec_title').val(), 'About this Server');
	generatedConfig.Texts.description = GBL_VARS.editor.getHTML();
	generatedConfig.Texts.RulesTitle = getText($('.sar_rules_subtitle').text(), 'Rules');
	generatedConfig.Texts.StaffTitle = getText($('.sar_staff_subtitle').text(), 'Staff');

	generatedConfig.Rules = getRulesAsArray();
	generatedConfig.Staff = getStaffAsArray();
	generatedConfig.Music = getMusicAsArray();
	generatedConfig.Background = getBackgroundsAsArray();
	generatedConfig.Bubbles = getBubblesAsArray();
	generatedConfig.Links = getLinksAsArray();

	generatedConfig.Header = {};
	generatedConfig.Header.PlayerInfos = $('#bh_pinfos').prop('checked');
	generatedConfig.Header.ServerInfos = $('#bh_sinfos').prop('checked');
	generatedConfig.Header.QRCode = $('#bh_qr').prop('checked');

	generatedConfig.Config = {};
	generatedConfig.Config.StyleSheet = "";
	generatedConfig.Config.Blur = $('#ba_blur').prop('checked');
	generatedConfig.Config.BackgroundType = $('input[name=background_type]:checked').parent().index();
	generatedConfig.Config.MusicVolume = $('#bmc_vc_range').val();
	generatedConfig.Config.FormatURL = $('#bgl_urlhide').prop('checked');

	var cornerRadius = parseInt($('.cr_input').val());
	if (isNaN(cornerRadius))
		cornerRadius = 8;

	generatedConfig.Config.CornerRadius = clampNumber(cornerRadius, 0, 16);

	var carouselBackgroundTime = parseInt($('.ct_input').val());
	if (isNaN(carouselBackgroundTime))
		carouselBackgroundTime = 10;

	generatedConfig.Config.CarouselTime = clampNumber(carouselBackgroundTime, 5, 60);

	const progressColorList = ['2196f3', 'e31717', '00a700', 'edcc11', '002bc4', '8e03c4', 'e48b0f', 'e551be'];
	const progressDotIndex = $('.dot_selected').index();

	if (progressDotIndex == progressColorList.length) {
		const progressColorVal = $('#prgcustom_input').val();

		generatedConfig.Config.ProgressColor = isHex(progressColorVal) ? progressColorVal : 'ffffff';
	} else {
		generatedConfig.Config.ProgressColor = progressColorList[$('.dot_selected').index()];
	}
	generatedConfig.Config.ProgressColorType = progressDotIndex;

	const selectedThemeIndex = $('.selected_theme').parent().index();
	const themeList = [['ffffff', 'ffffff', '000000'], ['000000', '000000', 'ffffff'], ['f39c12', 'ea5f00', 'ffffff'], ['9b59b6', '9c27b0', 'ffffff'], ['5f3c34', '50302b', 'ffffff'], ['e43835', 'd60c0c', 'ffffff'], ['16a085', '27ae60', 'ffffff'], ['3498db', '1565c0', 'ffffff']];

	if (selectedThemeIndex <= themeList.length - 1) {
		generatedConfig.Config.BubbleColor = themeList[selectedThemeIndex][0];
		generatedConfig.Config.AccentColor = themeList[selectedThemeIndex][1];
		generatedConfig.Config.TextColor   = themeList[selectedThemeIndex][2];
	} else {
		const bubbleColorVal = $('#bbg_input').val();
		const accentColorVal = $('#abg_input').val();
		const textColorVal = $('#tc_input').val();

		generatedConfig.Config.BubbleColor = isHex(bubbleColorVal) ? bubbleColorVal : 'ffffff';
		generatedConfig.Config.AccentColor = isHex(accentColorVal) ? accentColorVal : 'ffffff';
		generatedConfig.Config.TextColor = isHex(textColorVal) ? textColorVal : '000000';
	}
	generatedConfig.Config.BubbleOpacity = parseFloat($('#bboc_range').val());
	generatedConfig.Config.ThemeType = selectedThemeIndex;

	const selectedBackground = $('.ic_selected').find('.ic_preview');
	const firstBackground = $('.ic_preview').first();
	if (selectedBackground.length > 0) {
		generatedConfig.Config.SelectedBackground = getFilenameFromPath(selectedBackground.attr('src'));
	} else if (firstBackground.length > 0) {
		generatedConfig.Config.SelectedBackground = getFilenameFromPath(firstBackground.attr('src'));
	} else {
		generatedConfig.Config.SelectedBackground = '';
	}

	if (GBL_VARS.config)
		generatedConfig.Config.DefaultPassword = GBL_VARS.config.Config.DefaultPassword;
	else
		generatedConfig.Config.DefaultPassword = false;

	return JSON.stringify(generatedConfig);
}

function sendNotification(text, hideTime = 5000) {
	$('.notification_container').append('<div class="notification">\
		<i class="fas fa-info-circle notification_icon"></i>\
		<p class="notification_text">' + text + '</p>\
		</div>');

	const currentNotification = $('.notification_container').children().last();
	setTimeout(function() {
		currentNotification.fadeOut(400, function() {
			currentNotification.remove();
		});
	}, hideTime);
}

function _guid() {
	return "76561198069711123";
}

function getFilenameFromPath(path) {
	return path.substring(Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'))+1);
}

function clampNumber(nbr, min, max) {
	return Math.min(Math.max(nbr, min), max);
}

function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

function isHex(hex) {
	const regex = /[0-9A-Fa-f]{6}/g;
	return regex.test(hex);
}

window.onload = function() {
	var gradients = ["#5bd2ed, #289bb2", "#e12544, #ed7482", "#ad74ed, #7a29d7", "#00bc7a, #008f4c"];
	$('body').css('background', 'linear-gradient(0.35turn, ' + gradients[Math.floor(Math.random() * gradients.length)] + ')');

	setCurrentMenu(0, false);

	$(document).mouseup(onMouseUp);
	$('.bubble_main').click(onMainBubbleClick);

	$('.se_menu').click(onSEMenuClick);

	$('.prgbar_dot').click(onColorDotClick);
	$('#prgcustom_input').on('input', onProgressColorInput);

	$('.ctb_input').on('input', onColorInput);
	$('#bboc_range').on('input', onOpacityRangeInput);
	$('.theme_holder').click(onThemeChangeClick);

	var editorNode = $('.squire_editor').get();
	GBL_VARS.editor = new Squire(editorNode[0]);
	checkFormats();

	$('.sec_control').click(onSECClick);
	GBL_VARS.editor.addEventListener('pathChange', checkFormats)

	$('.dropdown').click(onDropdownClick);

	$('.bbcc_content').click(onBubbleContentClick);

	$('.sar_staff_subtitle').click(onSARSubtitleClick);
	$('.sar_rules_subtitle').click(onSARSubtitleClick);

	$('.sar_staff_add').click(onSARAddClick);
	$('.sar_rules_add').click(onSARAddClick);

	$('.bbuc_icon').click(onBackgroundUploadClick);
	$('.bsuc_icon').click(onMusicUploadClick);

	$('#bmc_vc_range').on('input', onVolumeRangeInput);

	$('input[name=background_type]').click(carouselTimeDisplayCheck);

	window.addEventListener("beforeunload", function (e) {
		if (GBL_VARS.needsSave && !GBL_VARS.debugmode) {
			var confirmationMessage = "There might be unsaved data.";

			(e || window.event).returnValue = confirmationMessage;
			return confirmationMessage;
		}
	});

	$('#sebd_save').click(onSaveClick);
	$('#sebd_logout').click(onLogoutClick);

	if (PHP_VARS.backgrounds && PHP_VARS.backgrounds.length > 0) {
		$('.ic_no_image').remove();

		for (var i = 0; i < PHP_VARS.backgrounds.length; i++) {
			const currentBackground = PHP_VARS.backgrounds[i];

			if (!currentBackground.startsWith('blur_'))
				addBackground(currentBackground, PHP_VARS.backgrounds.includes('blur_' + currentBackground));
		}
	}

	if (PHP_VARS.musics && PHP_VARS.musics.length > 0) {
		$('.mc_no_music').remove();

		for (var i = 0; i < PHP_VARS.musics.length; i++) {
			const currentMusic = PHP_VARS.musics[i];

			addLocalMusic(currentMusic);
		}
	}

	$('.bmc_add').click(onYoutubeAddClick);

	Sortable.create($('.bmc_container')[0], {
		animation: 150,
		handle:'.bmc_handle',
	});

	Sortable.create($('.image_container')[0], {
		animation: 150,
	});

	Sortable.create($('.bbc_main')[0], {
		animation: 150,
	});

	Sortable.create($('.bl_container')[0], {
		animation: 150,
		handle:'.bli_handle',
	});

	const splittedPath = document.location.pathname.split('/');
	var loadingUrl = document.location.origin;
	for (var i = 0; i < splittedPath.length - 2; i++)
		loadingUrl += splittedPath[i] + '/';
	loadingUrl += 'index.php';

	$('.ld_text').val('sv_loadingurl "' + loadingUrl + '?steamid=%s"');
	$('.ld_text').click(onLoadingUrlClick);

	$('.bl_add').click(onAddLinkClick);

	const configReq = new XMLHttpRequest();

	configReq.onreadystatechange = onConfigRequestStateChange;

	configReq.open('GET', 'config.json?_=' + new Date().getTime(), true);
	configReq.send(null);

	if (GBL_VARS.debugmode) {
		$('.se_menu_text').css({'color': 'black', 'background-color': 'white'});
	}
}
