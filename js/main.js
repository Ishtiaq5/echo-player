/* Echo — Premium Music Player UI (vanilla JS, simulated playback) */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  var tracks = [
    { title: 'Midnight Drive', artist: 'Neon Wave',      dur: 222 },
    { title: 'Velvet Static',  artist: 'Lunar Fields',   dur: 198 },
    { title: 'Afterglow',      artist: 'Cassette Motel', dur: 245 },
    { title: 'Chrome Rain',    artist: 'Synth Alley',    dur: 210 },
    { title: 'Low Orbit',      artist: 'Moonpad',        dur: 187 }
  ];

  var cur = 0, pos = 0, playing = false, shuffle = false, repeat = false, timer = null;
  var pl = $('playlist'), progress = $('progress');

  function fmt(s) {
    s = Math.max(0, Math.floor(s));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function renderPlaylist() {
    pl.innerHTML = '';
    tracks.forEach(function (t, i) {
      var li = document.createElement('li');
      li.innerHTML =
        '<span class="num">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="pt">' + t.title + '</span>' +
        '<span class="pa">' + t.artist + '</span>' +
        '<span class="pd">' + fmt(t.dur) + '</span>';
      li.tabIndex = 0;
      li.setAttribute('role', 'button');
      li.setAttribute('aria-label', 'Play ' + t.title + ' by ' + t.artist);
      var go = function () { if (i === cur) { toggle(); } else { setTrack(i, true); } };
      li.addEventListener('click', go);
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
      pl.appendChild(li);
    });
  }

  function updateUI() {
    var d = tracks[cur].dur;
    var pct = Math.min(100, (pos / d) * 100);
    $('progress-fill').style.width = pct + '%';
    progress.setAttribute('aria-valuenow', String(Math.round(pct)));
    progress.setAttribute('aria-valuetext', fmt(pos) + ' of ' + fmt(d));
    $('time-cur').textContent = fmt(pos);
    $('time-total').textContent = fmt(d);
  }

  function setTrack(i, autoplay) {
    cur = (i + tracks.length) % tracks.length;
    pos = 0;
    $('track-title').textContent = tracks[cur].title;
    $('track-artist').textContent = tracks[cur].artist;
    Array.prototype.forEach.call(pl.children, function (li, idx) {
      li.classList.toggle('active', idx === cur);
    });
    if (autoplay) { play(); } else { updateUI(); }
  }

  function play() {
    playing = true;
    document.body.classList.add('playing');
    $('btn-play').innerHTML = '&#9208;';
    $('btn-play').setAttribute('aria-pressed', 'true');
    clearInterval(timer);
    timer = setInterval(tick, 500);
    updateUI();
  }

  function pause() {
    playing = false;
    document.body.classList.remove('playing');
    $('btn-play').innerHTML = '&#9654;';
    $('btn-play').setAttribute('aria-pressed', 'false');
    clearInterval(timer);
  }

  function toggle() { playing ? pause() : play(); }

  function tick() {
    pos += 0.5;
    if (pos >= tracks[cur].dur) {
      if (repeat) { pos = 0; } else { next(); return; }
    }
    updateUI();
  }

  function next() {
    if (shuffle && tracks.length > 1) {
      var n;
      do { n = Math.floor(Math.random() * tracks.length); } while (n === cur);
      setTrack(n, playing);
    } else {
      setTrack(cur + 1, playing);
    }
  }

  function prev() {
    if (pos > 3) { pos = 0; updateUI(); } else { setTrack(cur - 1, playing); }
  }

  function seekTo(clientX) {
    var r = progress.getBoundingClientRect();
    var ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    pos = ratio * tracks[cur].dur;
    updateUI();
  }

  $('btn-play').addEventListener('click', toggle);
  $('btn-next').addEventListener('click', next);
  $('btn-prev').addEventListener('click', prev);
  $('btn-shuffle').addEventListener('click', function () {
    shuffle = !shuffle;
    this.classList.toggle('on', shuffle);
    this.setAttribute('aria-pressed', String(shuffle));
  });
  $('btn-repeat').addEventListener('click', function () {
    repeat = !repeat;
    this.classList.toggle('on', repeat);
    this.setAttribute('aria-pressed', String(repeat));
  });
  progress.addEventListener('click', function (e) { seekTo(e.clientX); });
  progress.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { pos = Math.min(tracks[cur].dur, pos + 5); updateUI(); }
    if (e.key === 'ArrowLeft')  { pos = Math.max(0, pos - 5); updateUI(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); toggle(); }
  });

  renderPlaylist();
  setTrack(0, false);
})();
