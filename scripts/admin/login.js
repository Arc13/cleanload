window.onload = function() {
	var gradients = ["#5bd2ed, #289bb2", "#e12544, #ed7482", "#ad74ed, #7a29d7", "#00bc7a, #008f4c"];
	$('body').css('background', 'linear-gradient(0.35turn, ' + gradients[Math.floor(Math.random() * gradients.length)] + ')');
}