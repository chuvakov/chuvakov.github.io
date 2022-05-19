$(function () {
	const initTheme = () => {
		if ($.cookie('theme') != null) {
			$('body').removeClass('light');
			$('body').addClass($.cookie('theme'));
		}
	};

	initTheme();

	$('#theme-switch').click(function () {
		$('body').toggleClass('light dark');
		if ($('body').hasClass('dark')) {
			$.cookie('theme', 'dark');
		} else {
			$.cookie('theme', 'light');
		}
	});
});
