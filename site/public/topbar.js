// The heyGRC announcement bar: a visitor can close it, and it stays closed.
// Loaded in <head> before the page renders, so a closed bar never flashes.
// Stores one flag in localStorage, only after the visitor clicks the close
// button: no identifier, never sent anywhere, never read for anything else.
// The value is TOPBAR.id in lib/content.ts; a new id shows a new bar again.
// Without JavaScript or storage, the bar simply shows.
(function () {
  var KEY = 'grcskills-topbar-dismissed';
  var ID = 'heygrc-1';
  var root = document.documentElement;
  var state = 'on';
  try { if (window.localStorage.getItem(KEY) === ID) state = 'off'; } catch (e) {}
  root.setAttribute('data-topbar', state);
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest || !t.closest('[data-topbar-dismiss]')) return;
    root.setAttribute('data-topbar', 'off');
    try { window.localStorage.setItem(KEY, ID); } catch (err) {}
    // Focus would be lost with the button; hand it to the first nav link.
    var next = document.querySelector('header.nav a');
    if (next) next.focus({ preventScroll: true });
  });
})();
