/* Demo pages: when the browser refuses autoplay (iOS Low Power Mode) the poster stays as a clean still (no native play glyph);
   the first tap on the page starts the film. Nothing is retried. */
(function () {
  var s = document.createElement('style');
  s.textContent = 'video::-webkit-media-controls,video::-webkit-media-controls-start-playback-button,video::-webkit-media-controls-overlay-play-button{display:none!important;-webkit-appearance:none}';
  document.head.appendChild(s);
  var go = function () { [].forEach.call(document.querySelectorAll('video[autoplay]'), function (v) { var p = v.play(); if (p && p.catch) p.catch(function () { }); }); };
  // the film's first frame can be blank (petalyx): if nothing plays, a frame with real content (data-still) replaces the poster
  setTimeout(function () { [].forEach.call(document.querySelectorAll('video[data-still]'), function (v) { if (v.paused) v.poster = v.dataset.still; }); }, 1500);
  ['touchend', 'click'].forEach(function (t) { addEventListener(t, go, { once: true, passive: true }); });
})();
