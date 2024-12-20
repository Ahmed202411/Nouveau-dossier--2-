function loadApp() {

				$('#canvas').fadeIn(1000);

				var flipbook = $('.magazine');

				// Check if the CSS was already loaded

				if (flipbook.width() == 0 || flipbook.height() == 0) {
					setTimeout(loadApp, 10);
					return;
				}

				$("#slider").slider();

				// Create the flipbook
				function isMobileDevice() {
					return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
				}
				flipbook.turn({
					display: isMobileDevice() ? 'single' : 'double',
					// Magazine width

					width: isMobileDevice() ? 461 : 922,

					// Magazine height

					height: 600,

					// Duration in millisecond

					duration: 1000,

					// Enables gradients

					gradients: true,

					// Auto center this flipbook

					autoCenter: true,

					// Elevation from the edge of the flipbook when turning a page

					elevation: 50,

					// The number of pages

					pages: 160,

					// Events

					when: {
						turning: function (event, page, view) {

							var book = $(this),
								currentPage = book.turn('page'),
								pages = book.turn('pages');

							// Update the current URI

							Hash.go('page/' + page).update();

							// Show and hide navigation buttons

							disableControls(page);

						},

						turned: function (event, page, view) {

							disableControls(page);

							$(this).turn('center');

							$('#slider').slider('value', getViewNumber($(this), page));

							if (page == 1) {
								$(this).turn('peel', 'br');
							}

						},

						missing: function (event, pages) {

							// Add pages that aren't in the magazine

							for (var i = 0; i < pages.length; i++)
								addPage(pages[i], $(this));

						}
					}

				});

				// Zoom.js

				$('.magazine-viewport').zoom({
					flipbook: $('.magazine'),

					max: function () {

						return largeMagazineWidth() / $('.magazine').width();

					},

					when: {
						swipeLeft: function () {

							$(this).zoom('flipbook').turn('next');

						},

						swipeRight: function () {

							$(this).zoom('flipbook').turn('previous');

						},
						resize: function (event, scale, page, pageElement) {

							if (scale == 1)
								loadSmallPage(page, pageElement);
							else
								loadLargePage(page, pageElement);

						},

						zoomIn: function () {

							$('#slider-bar').hide();
							$('.made').hide();
							$('.magazine').removeClass('animated').addClass('zoom-in');
							$('.zoom-icon').removeClass('zoom-icon-in').addClass('zoom-icon-out');

							if (!window.escTip && !$.isTouch) {
								escTip = true;

								$('<div />', { 'class': 'exit-message' }).
									html('<div>Press ESC to exit</div>').
									appendTo($('body')).
									delay(2000).
									animate({ opacity: 0 }, 500, function () {
										$(this).remove();
									});
							}
						},

						zoomOut: function () {

							$('#slider-bar').fadeIn();
							$('.exit-message').hide();
							$('.made').fadeIn();
							$('.zoom-icon').removeClass('zoom-icon-out').addClass('zoom-icon-in');

							setTimeout(function () {
								$('.magazine').addClass('animated').removeClass('zoom-in');
								resizeViewport();
							}, 0);

						}
					}
				});

				// Zoom event

				if ($.isTouch)
					$('.magazine-viewport').on('zoom.doubleTap', zoomTo);
				else
					$('.magazine-viewport').on('zoom.tap', zoomTo);


				// Using arrow keys to turn the page

				$(document).on('keydown', function (e) {

					var previous = 37, next = 39, esc = 27;

					switch (e.keyCode) {
						case previous:

							// left arrow
							$('.magazine').turn('previous');
							e.preventDefault();

							break;
						case next:

							//right arrow
							$('.magazine').turn('next');
							e.preventDefault();

							break;
						case esc:

							$('.magazine-viewport').zoom('zoomOut');
							e.preventDefault();

							break;
					}
				});

				// URIs - Format #/page/1 

				Hash.on('^page\/([0-9]*)$', {
					yep: function (path, parts) {
						var page = parts[1];

						if (page !== undefined) {
							if ($('.magazine').turn('is'))
								$('.magazine').turn('page', page);
						}

					},
					nop: function (path) {

						if ($('.magazine').turn('is'))
							$('.magazine').turn('page', 1);
					}
				});


				$(window).on('resize', function () {
					resizeViewport();
				}).on('orientationchange', function () {
					resizeViewport();
				});

				// Regions

				if ($.isTouch) {
					$('.magazine').on('touchstart', regionClick);
				} else {
					$('.magazine').on('click', regionClick);
				}

				// Events for the next button

				$('.next-button').on($.mouseEvents.over, function () {

					$(this).addClass('next-button-hover');

				}).on($.mouseEvents.out, function () {

					$(this).removeClass('next-button-hover');

				}).on($.mouseEvents.down, function () {

					$(this).addClass('next-button-down');

				}).on($.mouseEvents.up, function () {

					$(this).removeClass('next-button-down');

				}).on('click', function () {

					$('.magazine').turn('next');

				});

				// Events for the next button

				$('.previous-button').on($.mouseEvents.over, function () {

					$(this).addClass('previous-button-hover');

				}).on($.mouseEvents.out, function () {

					$(this).removeClass('previous-button-hover');

				}).on($.mouseEvents.down, function () {

					$(this).addClass('previous-button-down');

				}).on($.mouseEvents.up, function () {

					$(this).removeClass('previous-button-down');

				}).on('click', function () {

					$('.magazine').turn('previous');

				});


				// Slider

				$("#slider").slider({
					min: 1,
					max: numberOfViews(flipbook),

					start: function (event, ui) {

						if (!window._thumbPreview) {
							_thumbPreview = $('<div />', { 'class': 'thumbnail' }).html('<div></div>');
							setPreview(ui.value);
							_thumbPreview.appendTo($(ui.handle));
						} else
							setPreview(ui.value);

						moveBar(false);

					},

					slide: function (event, ui) {

						setPreview(ui.value);

					},

					stop: function () {

						if (window._thumbPreview)
							_thumbPreview.removeClass('show');

						$('.magazine').turn('page', Math.max(1, $(this).slider('value') * 2 - 2));

					}
				});

				resizeViewport();

				$('.magazine').addClass('animated');

			}

			// Zoom icon

			$('.zoom-icon').on('mouseover', function () {

				if ($(this).hasClass('zoom-icon-in'))
					$(this).addClass('zoom-icon-in-hover');

				if ($(this).hasClass('zoom-icon-out'))
					$(this).addClass('zoom-icon-out-hover');

			}).on('mouseout', function () {

				if ($(this).hasClass('zoom-icon-in'))
					$(this).removeClass('zoom-icon-in-hover');

				if ($(this).hasClass('zoom-icon-out'))
					$(this).removeClass('zoom-icon-out-hover');

			}).on('click', function () {

				if ($(this).hasClass('zoom-icon-in'))
					$('.magazine-viewport').zoom('zoomIn');
				else if ($(this).hasClass('zoom-icon-out'))
					$('.magazine-viewport').zoom('zoomOut');

			});

			$('#canvas').hide();

			// Load turn.js

			loadApp()
