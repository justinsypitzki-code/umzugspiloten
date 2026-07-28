/* Umzugspiloten NRW · Effekte & Rechner */
(function(){
  var reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Glas-Header beim Scrollen */
  var header = document.querySelector('header');
  var hoch = document.getElementById('hoch');
  function beiScroll(){
    if(header) header.classList.toggle('fest', window.scrollY > 24);
    if(hoch) hoch.classList.toggle('sichtbar', window.scrollY > 700);
  }
  window.addEventListener('scroll', beiScroll, {passive:true});
  beiScroll();
  if(hoch) hoch.addEventListener('click', function(){ window.scrollTo({top:0, behavior: reduziert ? 'auto' : 'smooth'}); });

  /* Scroll-Reveal */
  if(!reduziert && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(eintraege){
      eintraege.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:.14});
    document.querySelectorAll('.rv, .rv-stagger').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.rv, .rv-stagger').forEach(function(el){ el.classList.add('in'); });
  }

  /* Zähler animieren */
  function zaehlen(el){
    var ziel = parseInt(el.getAttribute('data-ziel'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if(reduziert){ el.textContent = ziel + suffix; return; }
    var start = null;
    function schritt(t){
      if(!start) start = t;
      var f = Math.min((t - start) / 1200, 1);
      el.textContent = Math.round(ziel * (1 - Math.pow(1 - f, 3))) + suffix;
      if(f < 1) requestAnimationFrame(schritt);
    }
    requestAnimationFrame(schritt);
  }
  if('IntersectionObserver' in window){
    var zio = new IntersectionObserver(function(eintraege){
      eintraege.forEach(function(e){
        if(e.isIntersecting){ zaehlen(e.target); zio.unobserve(e.target); }
      });
    }, {threshold:.6});
    document.querySelectorAll('[data-ziel]').forEach(function(el){ zio.observe(el); });
  }

  /* Flugroute zeichnen, sobald sichtbar */
  var route = document.querySelector('.flugroute .route');
  if(route && !reduziert){ route.classList.add('zeichnen'); }

  /* Umzugsrechner */
  var btn = document.getElementById('r-berechnen');
  if(btn){
    btn.addEventListener('click', function(){
      var von = (document.getElementById('r-von').value || '').trim() || '–';
      var nach = (document.getElementById('r-nach').value || '').trim() || '–';
      var flaeche = parseFloat(document.getElementById('r-flaeche').value) || 0;
      var personen = parseInt(document.getElementById('r-personen').value, 10);
      var etage = document.getElementById('r-von-etage');
      var etageText = etage.options[etage.selectedIndex].text;
      var aufzug = document.getElementById('r-von-aufzug').value;
      var kueche = document.getElementById('x-kueche').checked;
      var montage = document.getElementById('x-montage').checked;
      var nurTragen = document.getElementById('x-packen').checked;

      if(!flaeche){ flaeche = 20 + personen * 25; }
      var volumen = Math.round(flaeche * 0.9);
      var kartons = Math.round(flaeche * 1.0 + personen * 5);
      var klasse = 'S';
      if(volumen > 25) klasse = 'M';
      if(volumen > 50) klasse = 'L';
      if(volumen > 80) klasse = 'XL';

      var zv = document.getElementById('z-volumen');
      var zk = document.getElementById('z-kartons');
      zv.setAttribute('data-ziel', volumen);
      zk.setAttribute('data-ziel', kartons);
      zaehlen(zv); zaehlen(zk);
      document.getElementById('z-klasse').textContent = klasse;

      var extras = [];
      if(kueche) extras.push('Küche zieht mit um');
      if(montage) extras.push('Demontage & Wiederaufbau');
      if(nurTragen) extras.push('nur Tragehilfe gewünscht');

      var msg = 'Hallo Umzugspiloten NRW, ich habe den Umzugsrechner genutzt:\n\n'
        + 'Von: ' + von + '\nNach: ' + nach + '\n'
        + 'Wohnfläche: ca. ' + flaeche + ' m² (' + personen + (personen > 1 ? ' Personen' : ' Person') + ')\n'
        + 'Etage Auszug: ' + etageText + ', Aufzug: ' + aufzug + '\n'
        + 'Geschätztes Volumen: ca. ' + volumen + ' m³, ca. ' + kartons + ' Kartons\n'
        + (extras.length ? 'Extras: ' + extras.join(', ') + '\n' : '')
        + 'Wunschtermin: ';
      document.getElementById('r-whatsapp').href = 'https://wa.me/4915757941442?text=' + encodeURIComponent(msg);
      var erg = document.getElementById('r-ergebnis');
      erg.classList.add('aktiv');
      erg.scrollIntoView({behavior: reduziert ? 'auto' : 'smooth', block:'nearest'});
    });
  }

  /* Burger-Menü */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if(burger && nav){
    burger.addEventListener('click', function(){
      var offen = nav.classList.toggle('offen');
      burger.classList.toggle('offen', offen);
      burger.setAttribute('aria-expanded', offen);
      document.body.style.overflow = offen ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        nav.classList.remove('offen'); burger.classList.remove('offen');
        burger.setAttribute('aria-expanded','false'); document.body.style.overflow='';
      });
    });
  }

  /* Umzugs-Checkliste: Stand lokal speichern */
  var checks = document.querySelectorAll('.check-punkt input');
  if(checks.length){
    var speicher = {};
    try { speicher = JSON.parse(localStorage.getItem('umzug-checkliste') || '{}'); } catch(e){}
    function stand(){
      var fertig = document.querySelectorAll('.check-punkt input:checked').length;
      var balken = document.getElementById('check-balken');
      var text = document.getElementById('check-stand');
      if(balken) balken.style.width = Math.round(fertig / checks.length * 100) + '%';
      if(text) text.textContent = fertig + ' von ' + checks.length + ' erledigt';
    }
    checks.forEach(function(c){
      var id = c.getAttribute('data-id');
      if(speicher[id]) c.checked = true;
      c.addEventListener('change', function(){
        speicher[id] = c.checked;
        try { localStorage.setItem('umzug-checkliste', JSON.stringify(speicher)); } catch(e){}
        stand();
      });
    });
    stand();
  }
})();
