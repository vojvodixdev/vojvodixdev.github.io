/* Last Ember: site behaviour (menu, cart, booking, forms, language switch, scroll hero). */
(function(){
  "use strict";

  /* ================================================================
     0. Storage + language
     ================================================================ */
  var LS = {
    get:function(k){ try{ return window.localStorage.getItem(k); }catch(e){ return null; } },
    set:function(k,v){ try{ window.localStorage.setItem(k,v); }catch(e){} }
  };
  var lang = LS.get('lastember.lang');
  if(lang !== 'en' && lang !== 'sr') lang = 'en';

  var D = window.LASTEMBER_TEXT.D;
  var DAYS = window.LASTEMBER_TEXT.DAYS;

  function t(k, p){
    var e = D[k];
    var s = e ? (lang === 'sr' ? e[1] : e[0]) : k;
    if(p){ for(var x in p){ if(Object.prototype.hasOwnProperty.call(p,x)) s = s.split('{' + x + '}').join(String(p[x])); } }
    return s;
  }
  function L(v){ return Array.isArray(v) ? (lang === 'sr' ? v[1] : v[0]) : v; }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmtNum(n){ return Math.round(n).toLocaleString(lang === 'sr' ? 'sr-RS' : 'en-US'); }
  function fmt(n){ return fmtNum(n) + ' RSD'; }
  function pad(n){ return String(n).padStart(2,'0'); }
  function hhmm(d){ return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

  /* ================================================================
     1. Illustrations (each dish gets its own drawing)
     ================================================================ */
  function svgWrap(inner){ return '<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">' + inner + '</svg>'; }
  function bare(s){ return s.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,''); }
  function artBurger(o){
    o = o || {};
    var pattyCol = o.veggie ? '#5F7F3B' : '#3A2415';
    var w = o.small ? 56 : 72, x = 60 - w/2, y = 102, s = '';
    s += '<ellipse cx="60" cy="106" rx="' + (w/2+5) + '" ry="5" fill="#000" opacity="0.28"/>';
    y -= 14; s += '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="14" rx="7" fill="#D8A85F"/>';
    y -= 10; s += '<rect x="'+(x+2)+'" y="'+y+'" width="'+(w-4)+'" height="10" rx="4" fill="'+pattyCol+'"/>';
    if(o.double){ y -= 9; s += '<rect x="'+(x+2)+'" y="'+y+'" width="'+(w-4)+'" height="9" rx="4" fill="'+pattyCol+'"/>'; }
    if(o.bacon){ y -= 4; s += '<path d="M'+(x+4)+','+(y+2)+' q7,-6 14,0 t14,0 t14,0 t14,0" fill="none" stroke="#9E3B2C" stroke-width="4.5" stroke-linecap="round"/>'; y -= 2; }
    y -= 7; s += '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="7" rx="3" fill="#E8B84B"/>';
    s += '<rect x="'+(x+8)+'" y="'+(y+5)+'" width="5" height="9" rx="2.5" fill="#E8B84B"/>';
    s += '<rect x="'+(x+w-14)+'" y="'+(y+5)+'" width="5" height="9" rx="2.5" fill="#E8B84B"/>';
    if(o.egg){ y -= 8; s += '<ellipse cx="60" cy="'+(y+4)+'" rx="'+(w/2-2)+'" ry="7" fill="#FCEFD8"/><circle cx="66" cy="'+(y+3)+'" r="5" fill="#E8B84B"/>'; }
    y -= 6; s += '<rect x="'+(x-3)+'" y="'+y+'" width="'+(w+6)+'" height="7" rx="3.5" fill="#7BA05B"/>';
    var topY = y - 2, bunH = 30;
    s += '<path d="M'+x+','+topY+' C'+x+','+(topY-bunH)+' '+(x+w*0.22)+','+(topY-bunH-6)+' 60,'+(topY-bunH-6)+' C'+(x+w*0.78)+','+(topY-bunH-6)+' '+(x+w)+','+(topY-bunH)+' '+(x+w)+','+topY+' Z" fill="#D8A85F"/>';
    s += '<ellipse cx="48" cy="'+(topY-bunH+9)+'" rx="2.4" ry="3.4" fill="#FCEFD8" opacity="0.9"/>';
    s += '<ellipse cx="60" cy="'+(topY-bunH+4)+'" rx="2.4" ry="3.4" fill="#FCEFD8" opacity="0.9"/>';
    s += '<ellipse cx="72" cy="'+(topY-bunH+9)+'" rx="2.4" ry="3.4" fill="#FCEFD8" opacity="0.9"/>';
    if(o.spicy){ s += '<path d="M92,30 q11,0 11,11 q0,11 -10,10 q7,-9 -3,-16 z" fill="#C1432E"/><path d="M92,30 q-4,-5 1,-9" stroke="#5F7F3B" stroke-width="3" fill="none" stroke-linecap="round"/>'; }
    if(o.gold){ s += '<circle cx="90" cy="34" r="3.2" fill="#F2C36F"/><circle cx="98" cy="44" r="2.2" fill="#F2C36F"/><circle cx="86" cy="24" r="2" fill="#F2C36F"/>'; }
    if(o.blue){ s += '<circle cx="92" cy="36" r="4" fill="#8FA3C8"/><circle cx="99" cy="46" r="2.6" fill="#8FA3C8"/>'; }
    return svgWrap(s);
  }
  function artFries(col){
    col = col || '#F2C36F';
    return svgWrap('<ellipse cx="60" cy="106" rx="32" ry="5" fill="#000" opacity="0.28"/>' +
      '<rect x="44" y="30" width="7" height="44" rx="3.5" fill="'+col+'" transform="rotate(-9 47 52)"/>' +
      '<rect x="53" y="26" width="7" height="46" rx="3.5" fill="'+col+'"/>' +
      '<rect x="62" y="28" width="7" height="45" rx="3.5" fill="'+col+'" transform="rotate(5 65 50)"/>' +
      '<rect x="70" y="32" width="7" height="42" rx="3.5" fill="'+col+'" transform="rotate(11 73 53)"/>' +
      '<path d="M36,60 L44,104 L76,104 L84,60 Z" fill="#20294D"/><path d="M36,60 L38,72 L82,72 L84,60 Z" fill="#E0A04A"/>' +
      '<path d="M56,82 C54,88 60,90 58,96" fill="none" stroke="#0E1328" stroke-width="3" stroke-linecap="round" opacity="0.5"/>');
  }
  function artRings(){
    return svgWrap('<ellipse cx="60" cy="106" rx="34" ry="5" fill="#000" opacity="0.28"/>' +
      '<circle cx="50" cy="84" r="16" fill="none" stroke="#D8A85F" stroke-width="10"/>' +
      '<circle cx="74" cy="76" r="14" fill="none" stroke="#E3B76E" stroke-width="9"/>' +
      '<circle cx="58" cy="52" r="12" fill="none" stroke="#D8A85F" stroke-width="8"/>' +
      '<circle cx="50" cy="84" r="16" fill="none" stroke="#8f6428" stroke-width="1.5" opacity="0.5"/>');
  }
  function artSticks(){
    return svgWrap('<ellipse cx="60" cy="106" rx="32" ry="5" fill="#000" opacity="0.28"/>' +
      '<rect x="34" y="42" width="11" height="56" rx="5" fill="#D8A85F" transform="rotate(-14 39 70)"/>' +
      '<rect x="52" y="36" width="11" height="60" rx="5" fill="#E3B76E"/>' +
      '<rect x="70" y="42" width="11" height="56" rx="5" fill="#D8A85F" transform="rotate(14 76 70)"/>' +
      '<path d="M56,50 q4,4 0,8" stroke="#F3C659" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="94" cy="94" r="12" fill="#C1432E"/><circle cx="94" cy="94" r="12" fill="none" stroke="#8f2f1f" stroke-width="2" opacity="0.6"/>');
  }
  function artSauce(col){
    return svgWrap('<ellipse cx="60" cy="106" rx="26" ry="4.5" fill="#000" opacity="0.28"/>' +
      '<rect x="40" y="50" width="40" height="52" rx="10" fill="rgba(243,234,219,0.14)" stroke="rgba(243,234,219,0.35)" stroke-width="1.5"/>' +
      '<rect x="43" y="64" width="34" height="35" rx="7" fill="'+col+'"/><rect x="36" y="40" width="48" height="12" rx="5" fill="#20294D"/>' +
      '<path d="M52,74 q6,5 0,10" stroke="rgba(255,255,255,0.35)" stroke-width="3" fill="none" stroke-linecap="round"/>');
  }
  function artDrink(liquid, straw){
    return svgWrap('<ellipse cx="60" cy="106" rx="24" ry="4.5" fill="#000" opacity="0.28"/>' +
      (straw ? '<rect x="66" y="16" width="6" height="46" rx="3" fill="#E0A04A" transform="rotate(14 69 39)"/>' : '') +
      '<path d="M42,38 L48,102 L72,102 L78,38 Z" fill="rgba(243,234,219,0.1)" stroke="rgba(243,234,219,0.4)" stroke-width="2"/>' +
      '<path d="M45,56 L49,98 L71,98 L75,56 Z" fill="'+liquid+'"/>' +
      '<rect x="50" y="62" width="8" height="8" rx="2" fill="rgba(255,255,255,0.3)" transform="rotate(12 54 66)"/>' +
      '<rect x="61" y="74" width="8" height="8" rx="2" fill="rgba(255,255,255,0.25)" transform="rotate(-10 65 78)"/>');
  }
  function artBeer(){
    return svgWrap('<ellipse cx="58" cy="106" rx="26" ry="4.5" fill="#000" opacity="0.28"/>' +
      '<rect x="38" y="44" width="40" height="58" rx="8" fill="rgba(243,234,219,0.1)" stroke="rgba(243,234,219,0.4)" stroke-width="2"/>' +
      '<rect x="42" y="54" width="32" height="44" rx="5" fill="#E8B84B"/>' +
      '<path d="M78,56 h8 a8,8 0 0 1 8,8 v14 a8,8 0 0 1 -8,8 h-8" fill="none" stroke="rgba(243,234,219,0.4)" stroke-width="4"/>' +
      '<ellipse cx="58" cy="46" rx="22" ry="8" fill="#FCEFD8"/><circle cx="46" cy="41" r="5" fill="#FCEFD8"/><circle cx="60" cy="38" r="6" fill="#FCEFD8"/><circle cx="72" cy="42" r="4.5" fill="#FCEFD8"/>');
  }
  function artShake(){
    return svgWrap('<ellipse cx="60" cy="106" rx="24" ry="4.5" fill="#000" opacity="0.28"/>' +
      '<rect x="66" y="10" width="6" height="34" rx="3" fill="#C1432E" transform="rotate(12 69 27)"/>' +
      '<path d="M42,44 L50,102 L70,102 L78,44 Z" fill="rgba(243,234,219,0.12)" stroke="rgba(243,234,219,0.4)" stroke-width="2"/>' +
      '<path d="M45,56 L51,98 L69,98 L75,56 Z" fill="#F2C36F"/><path d="M40,44 Q49,32 58,42 Q66,30 80,44 Z" fill="#FCEFD8"/>' +
      '<circle cx="60" cy="26" r="6" fill="#C1432E"/><path d="M60,20 q4,-6 8,-4" stroke="#5F7F3B" stroke-width="2.5" fill="none" stroke-linecap="round"/>');
  }
  function artBrownie(){
    return svgWrap('<ellipse cx="60" cy="104" rx="32" ry="5" fill="#000" opacity="0.28"/>' +
      '<rect x="30" y="66" width="60" height="34" rx="6" fill="#2a1810"/><rect x="34" y="56" width="52" height="18" rx="5" fill="#3A2415"/>' +
      '<path d="M34,60 q7,7 14,0 t14,0 t14,0 t10,0" fill="none" stroke="#E0A04A" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="46" cy="80" r="2.5" fill="#0E1328"/><circle cx="64" cy="86" r="2.5" fill="#0E1328"/><circle cx="76" cy="76" r="2.5" fill="#0E1328"/>');
  }
  function artCheesecake(){
    return svgWrap('<ellipse cx="60" cy="104" rx="32" ry="5" fill="#000" opacity="0.28"/>' +
      '<path d="M28,96 L92,96 L74,50 Z" fill="#FCEFD8"/><path d="M28,96 L92,96 L88,88 L31,88 Z" fill="#D8A85F"/>' +
      '<path d="M74,50 Q80,44 86,50 Q84,58 76,56 Z" fill="#E0A04A"/><path d="M60,64 q5,4 0,9" stroke="#E0A04A" stroke-width="3.5" fill="none" stroke-linecap="round"/>');
  }
  function artSet(drink){
    return svgWrap('<ellipse cx="60" cy="106" rx="44" ry="6" fill="#000" opacity="0.26"/>' +
      '<rect x="14" y="66" width="26" height="36" rx="4" fill="#20294D"/><rect x="14" y="66" width="26" height="8" rx="3" fill="#E0A04A"/>' +
      '<rect x="18" y="46" width="5" height="24" rx="2.5" fill="#F2C36F"/><rect x="25" y="42" width="5" height="28" rx="2.5" fill="#F2C36F"/><rect x="32" y="48" width="5" height="22" rx="2.5" fill="#F2C36F"/>' +
      '<rect x="44" y="88" width="34" height="14" rx="7" fill="#D8A85F"/><rect x="46" y="78" width="30" height="10" rx="4" fill="#3A2415"/>' +
      '<rect x="44" y="72" width="34" height="6" rx="3" fill="#E8B84B"/><path d="M44,72 C44,54 52,48 61,48 C70,48 78,54 78,72 Z" fill="#D8A85F"/>' +
      '<path d="M86,54 L90,102 L106,102 L110,54 Z" fill="rgba(243,234,219,0.12)" stroke="rgba(243,234,219,0.38)" stroke-width="2"/>' +
      '<path d="M88,66 L91,98 L105,98 L108,66 Z" fill="' + (drink || '#E8D96B') + '"/>' +
      '<rect x="98" y="30" width="5" height="28" rx="2.5" fill="#E0A04A" transform="rotate(12 100 44)"/>');
  }
  function artVoucher(){
    return svgWrap('<rect x="16" y="38" width="88" height="52" rx="9" fill="#20294D" stroke="#E0A04A" stroke-width="2"/>' +
      '<path d="M16,60 h88" stroke="#E0A04A" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6"/>' +
      '<path d="M46,80 C42,70 49,66 46,58 C54,62 51,71 57,68 C56,76 51,80 46,80Z" fill="#E0A04A"/>' +
      '<rect x="66" y="64" width="26" height="4" rx="2" fill="#F2C36F" opacity="0.85"/><rect x="66" y="72" width="18" height="4" rx="2" fill="#F2C36F" opacity="0.55"/>' +
      '<circle cx="16" cy="60" r="6" fill="#151B36"/><circle cx="104" cy="60" r="6" fill="#151B36"/>');
  }
  var STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>';
  var FLAME = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12 27C8 19 15 15 12 6c8 4 6 12 11 10-1 7-7 11-11 11z" fill="#C8452F"/></svg>';
  var PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>';
  var XICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  /* ================================================================
     2. Menu data
     ================================================================ */
  var MENU = [
    { id:'b1', cat:'burgers', tag:null, w:'180 g', kcal:740, gf:false, veg:false, aller:['gluten','milk','mustard','sesame'], price:980, art:artBurger({}),
      name:['The Cabbie','Taksista'],
      desc:['Beef 180 g, smoked cheddar, caramelised onion, pickles, house ember sauce.','Junetina 180 g, dimljeni čedar, karamelizovani luk, kiseli krastavčić, kućni sos od žara.'],
      long:['Our standard and the most ordered burger at 3 a.m. The patty is flipped once, the cheese melts on the grill, and the bun goes over the flame until it gets its marks.','Naš standard i najčešća porudžbina u tri ujutru. Pljeskavica se okreće samo jednom, sir se topi na roštilju, a lepinja ide na vatru dok ne dobije trag.'] },
    { id:'b2', cat:'burgers', tag:null, w:'180 g', kcal:860, gf:false, veg:false, aller:['gluten','milk','mustard'], price:1090, art:artBurger({bacon:true}),
      name:['The Chimney Sweep','Dimnjačar'],
      desc:['Beef 180 g, crispy grilled bacon, smoky BBQ sauce, cheddar, red onion.','Junetina 180 g, hrskava slanina sa roštilja, dimljeni BBQ sos, čedar, crveni luk.'],
      long:['For people who like the smoke to linger. The bacon goes straight on the grate, then into the burger while it is still hot.','Za one koji vole kad se dim oseti i posle. Slanina ide direktno na rešetku, pa u burger dok je još topla.'] },
    { id:'b3', cat:'burgers', tag:'hot', w:'2 × 150 g', kcal:1020, gf:false, veg:false, aller:['gluten','milk','eggs','mustard'], price:1190, art:artBurger({double:true, spicy:true}),
      name:['The Firefighter','Vatrogasac'],
      desc:['Double beef, smoked hot pepper, jalapeño, spicy mayo, fried onion.','Dupla junetina, ljuta dimljena paprika, halapenjo, pikantni majonez, prženi luk.'],
      long:["The name is ironic, because this one puts nothing out. The heat is real but it doesn't hide the beef. Too much? Ask for it without jalapeño.",'Ime je ironija, jer ovaj ne gasi ništa. Ljutina je prava, ali ne pokriva ukus mesa. Ako ti je previše, traži bez halapenja.'] },
    { id:'b4', cat:'burgers', tag:null, w:'180 g', kcal:890, gf:false, veg:false, aller:['gluten','milk','eggs'], price:1140, art:artBurger({egg:true}),
      name:['The Night Porter','Portir'],
      desc:['Beef 180 g, fried egg, melted kashkaval, chive sour cream, crispy onion.','Junetina 180 g, prženo jaje, topljeni kačkavalj, pavlaka sa vlascem, hrskavi luk.'],
      long:['Breakfast and dinner in one bite, for whoever has been awake all night and lost track of which meal this is.','Doručak i večera u istom zalogaju, za onoga ko je budan celu noć i više ne zna koji je obrok u pitanju.'] },
    { id:'b5', cat:'burgers', tag:null, w:'2 × 90 g', kcal:940, gf:false, veg:false, aller:['gluten','milk','mustard'], price:1240, art:artBurger({double:true, blue:true}),
      name:['The Night Watch','Noćni Čuvar'],
      desc:['Double smash patty, blue cheese, caramelised pear, rocket, honey mustard.','Dupli smeš, plavi sir, karamelizovana kruška, rukola, senf sa medom.'],
      long:['The quietest one on the menu and the one people remember longest. Blue cheese and pear sound odd on paper, then people order two.','Najtiši u meniju i najduže ostaje u sećanju. Plavi sir i kruška zvuče čudno na papiru, a onda se poruče dva.'] },
    { id:'b6', cat:'burgers', tag:'novo', w:'180 g', kcal:910, gf:false, veg:false, aller:['gluten','milk','eggs'], price:1290, art:artBurger({gold:true}),
      name:['The Boss','Gazda'],
      desc:['Beef 180 g, truffle mayo, Emmental, rocket, confit onion.','Junetina 180 g, majonez sa tartufima, ementaler, rukola, konfitirani luk.'],
      long:['The most expensive burger in the house and the only one we never rush. The truffle goes into the mayo, not over everything, so it never drowns the beef.','Najskuplji burger u kući i jedini koji ne pravimo na brzinu. Tartuf ide u majonez, ne preko svega, da ne pregazi meso.'] },
    { id:'b7', cat:'burgers', tag:'veg', w:'160 g', kcal:610, gf:false, veg:true, aller:['gluten','eggs','mustard'], price:890, art:artBurger({veggie:true}),
      name:['The Baker','Pekar'],
      desc:['Chickpea and mushroom patty, avocado cream, tomato, spring onion, lemon mayo.','Pljeskavica od leblebije i pečuraka, krem od avokada, paradajz, mladi luk, limun majonez.'],
      long:["Named after the people who start work at 3 a.m. We make the patty from scratch every day, so it sometimes sells out before two. It doesn't imitate meat, it's a dish of its own.",'Ime je dobio po ljudima koji počinju posao u tri ujutru. Pljeskavicu pravimo od nule svakog dana, pa se ponekad rasproda pre dva. Ne imitira meso, nego je svoje jelo.'] },
    { id:'b8', cat:'burgers', tag:null, w:'90 g', kcal:480, gf:false, veg:false, aller:['gluten','milk'], price:690, art:artBurger({small:true}),
      name:['The Apprentice','Šegrt'],
      desc:['Smash patty 90 g, melted cheese, ketchup, pickles.','Smeš pljeskavica 90 g, topljeni sir, kečap, kiseli krastavčić.'],
      long:["The small one, for a lighter appetite, for kids, or for the third burger of the night when you're not giving up.",'Mali format za manju glad, za decu ili za treći burger u noći kad ne odustaješ.'] },

    { id:'p1', cat:'sides', tag:null, w:'200 g', kcal:390, gf:true, veg:true, aller:[], price:320, art:artFries(),
      name:['Rosemary fries','Pomfrit sa ruzmarinom'],
      desc:['Thick-cut potatoes, sea salt, fresh rosemary.','Debelo sečen krompir, morska so, svež ruzmarin.'],
      long:["Fried twice: once early in the evening, once when you order. That's why they stay crisp after ten minutes in the bag.",'Prži se dvaput, prvi put ranije uveče, drugi put kad ga poručiš. Zato ostaje hrskav i posle deset minuta u kesi.'] },
    { id:'p2', cat:'sides', tag:null, w:'200 g', kcal:420, gf:true, veg:true, aller:[], price:390, art:artFries('#E08B4A'),
      name:['Sweet potato fries','Batat pomfrit'],
      desc:['Sweet potato, smoked paprika, a pinch of cinnamon.','Slatki krompir, dimljena paprika, prstohvat cimeta.'],
      long:['Sweeter and softer than regular fries. Goes well with The Firefighter because it calms the heat.','Slađi i mekši od običnog. Ide odlično uz Vatrogasca jer smiruje ljutinu.'] },
    { id:'p3', cat:'sides', tag:null, w:'180 g', kcal:450, gf:false, veg:true, aller:['gluten','eggs','milk'], price:350, art:artRings(),
      name:['Onion rings','Kolutovi luka'],
      desc:['Crispy battered rings, tartar sauce on the side.','Hrskavo pohovani kolutovi, tartar sos sa strane.'],
      long:['The batter is made with beer, so the crust stays thin and crisp.','Testo pravimo sa pivom, zato je kora tanka i ostaje hrskava.'] },
    { id:'p4', cat:'sides', tag:null, w:['6 pcs','6 kom.'], kcal:520, gf:false, veg:true, aller:['gluten','milk','eggs'], price:420, art:artSticks(),
      name:['Kashkaval sticks','Štapići od kačkavalja'],
      desc:['Hot and stretchy, with hot honey for dipping.','Topli, rastegljivi, sa ljutim medom za umakanje.'],
      long:['The only side that comes with a warning to wait a minute before the first bite.','Jedini prilog koji stiže sa upozorenjem da sačekaš minut pre prvog zalogaja.'] },

    { id:'s1', cat:'sauces', tag:null, w:'50 ml', kcal:180, gf:true, veg:true, aller:['eggs','mustard'], price:120, art:artSauce('#C1432E'),
      name:['Ember sauce','Sos od žara'],
      desc:['Our signature: smoky, slightly sweet, secret spice mix.','Naš potpis: dimljen, blago sladak, tajni odnos začina.'],
      long:['Made every evening before opening, in the same jar, to the same recipe since 2021.','Pravi se svako veče pre otvaranja, u istoj tegli, po istom receptu od 2021.'] },
    { id:'s2', cat:'sauces', tag:null, w:'50 ml', kcal:150, gf:true, veg:true, aller:['mustard'], price:120, art:artSauce('#5b3620'),
      name:['Smoky BBQ','Dimljeni BBQ'],
      desc:['Simmered for six hours, with notes of coffee and molasses.','Kuvan šest sati, sa notom kafe i melase.'],
      long:['Thick enough to stay in the burger and not on your shirt.','Gust taman toliko da ostane u burgeru, a ne na tvojoj majici.'] },
    { id:'s3', cat:'sauces', tag:null, w:'50 ml', kcal:220, gf:true, veg:true, aller:['eggs','mustard'], price:120, art:artSauce('#E9E2C8'),
      name:['Tartar','Tartar'],
      desc:['Pickles, capers, dill, homemade mayo.','Kiseli krastavčić, kapar, mirođija, domaći majonez.'],
      long:['Best friend of the onion rings and of any burger without sauce.','Najbolji prijatelj kolutova luka i svakog burgera bez sosa.'] },
    { id:'s4', cat:'sauces', tag:'hot', w:'50 ml', kcal:190, gf:true, veg:true, aller:[], price:150, art:artSauce('#E0A04A'),
      name:['Hot honey','Ljuti med'],
      desc:["Acacia honey and chili. Sounds odd, you'll be back for more.",'Bagremov med i čili. Zvuči čudno, vraćaš se po još.'],
      long:["The one recipe in the kitchen that's written down nowhere except in Iva's head.",'Jedini recept u kuhinji koji nije zapisan nigde osim u Ivinoj glavi.'] },

    { id:'d1', cat:'drinks', tag:null, w:['0.4 l','0,4 l'], kcal:120, gf:true, veg:true, aller:[], price:280, art:artDrink('#E8D96B', true),
      name:['Homemade lemonade','Domaća limunada'],
      desc:['Fresh-squeezed lemon, mint, lightly sweetened.','Sveže ceđen limun, nana, blago zaslađena.'],
      long:['Squeezed on the spot, so it takes a minute longer than a bottled drink.','Ceđi se na licu mesta, zato traje minut duže od flaširanog pića.'] },
    { id:'d2', cat:'drinks', tag:null, w:['0.33 l','0,33 l'], kcal:140, gf:true, veg:true, aller:[], price:250, art:artDrink('#4a2c18', true),
      name:['Craft cola','Craft kola'],
      desc:['Local, less sweet, more flavour.','Lokalna, manje slatka, više ukusa.'],
      long:['Made by a small workshop in Zemun, in batches of a few hundred bottles.','Pravi je mala radionica iz Zemuna, u serijama od par stotina flaša.'] },
    { id:'d3', cat:'drinks', tag:null, w:['0.4 l','0,4 l'], kcal:160, gf:false, veg:true, aller:['gluten'], price:330, art:artBeer(),
      name:['Draft beer','Točeno pivo'],
      desc:['Pale lager from the small brewery down the street.','Svetli lager iz male pivare niz ulicu.'],
      long:["Changes with the season, so ask what's on tap tonight.",'Menja se sezonski, pa pitaj šta je večeras na točioniku.'] },
    { id:'d4', cat:'drinks', tag:null, w:['0.4 l','0,4 l'], kcal:480, gf:true, veg:true, aller:['milk'], price:420, art:artShake(),
      name:['Vanilla shake','Milkšejk vanila'],
      desc:['Thick, with real vanilla and whipped cream. The straw puts up a fight.','Gust, sa pravom vanilom i šlagom. Slamčica se bori.'],
      long:['Order it with The Firefighter and you get a spare straw, no questions asked.','Ako ga poručiš uz Vatrogasca, dobijaš dodatnu slamčicu bez pitanja.'] },

    { id:'z1', cat:'desserts', tag:null, w:'120 g', kcal:520, gf:false, veg:true, aller:['gluten','milk','eggs'], price:380, art:artBrownie(),
      name:['Chocolate brownie','Čokoladni brauni'],
      desc:['Warm, with salted caramel.','Topao, sa slanim karamel prelivom.'],
      long:['Baked in our bakery alongside the buns, so it only reaches the restaurant in the evening.','Peče se u pekari zajedno sa lepinjama, pa u lokal stiže tek uveče.'] },
    { id:'z2', cat:'desserts', tag:null, w:'140 g', kcal:560, gf:false, veg:true, aller:['gluten','milk','eggs'], price:420, art:artCheesecake(),
      name:['Caramel cheesecake','Čizkejk sa karamelom'],
      desc:['Baked cheesecake, biscuit base, smoked caramel.','Pečeni čizkejk, keks podloga, dimljena karamela.'],
      long:["We bake one tin a day. When it's gone, it's gone.",'Pravi se u jednom kalupu dnevno. Kad nestane, nestane.'] }
  ];

  var CATS = [
    { id:'burgers', key:'c_burgers' }, { id:'sides', key:'c_sides' }, { id:'sauces', key:'c_sauces' },
    { id:'drinks', key:'c_drinks' }, { id:'desserts', key:'c_desserts' }
  ];

  var COMBOS = [
    { id:'c1', cat:'set', best:false, price:1390, was:1580, art:artSet('#E8D96B'),
      name:['The Shift Set','Set Smena'],
      what:[['The Cabbie','Rosemary fries','Homemade lemonade'],['Taksista','Pomfrit sa ruzmarinom','Domaća limunada']] },
    { id:'c2', cat:'set', best:false, price:1720, was:1960, art:artSet('#F2C36F'),
      name:['The Long Night','Set Duga Noć'],
      what:[['The Firefighter','Onion rings','Vanilla shake'],['Vatrogasac','Kolutovi luka','Milkšejk vanila']] },
    { id:'c3', cat:'set', best:true, price:2490, was:3000, art:artSet('#4a2c18'),
      name:['Set for Two','Set za dvoje'],
      what:[['Two Cabbies','Large rosemary fries','Two drinks of your choice'],['Dva Taksiste','Veliki pomfrit sa ruzmarinom','Dva pića po izboru']] }
  ];

  var VOUCHERS = [
    { id:'v1', cat:'voucher', price:2000, art:artVoucher() },
    { id:'v2', cat:'voucher', price:4000, art:artVoucher() },
    { id:'v3', cat:'voucher', price:6000, art:artVoucher() }
  ];

  var EXTRAS = [
    { id:'e1', price:350, name:['Extra patty','Dodatna pljeskavica'] },
    { id:'e2', price:120, name:['Double cheese','Dupli sir'] },
    { id:'e3', price:180, name:['Crispy bacon','Hrskava slanina'] },
    { id:'e4', price:90,  name:['Fried egg','Prženo jaje'] },
    { id:'e5', price:80,  name:['Jalapeño','Halapenjo'] },
    { id:'e6', price:150, name:['Avocado','Avokado'] }
  ];

  var PROMOS = { 'EMBER10':10, 'NIGHT15':15, 'FIRST20':20 };

  /* specials by weekday, 0 = Sunday */
  var SPECIALS = {
    2:{ t:['Cabbie Tuesday','Taksista utorak'], d:['The Cabbie with rosemary fries for 1,090 RSD.','Taksista sa pomfritom za 1.090 RSD.'] },
    3:{ t:['Half-price sticks','Štapići pola cene'], d:['Kashkaval sticks at half price with any burger.','Štapići od kačkavalja upola cene uz svaki burger.'] },
    4:{ t:['Midnight pint','Ponoćno pivo'], d:['Draft beer for 250 RSD after midnight.','Točeno pivo 250 RSD posle ponoći.'] },
    5:{ t:['Free shake','Šejk gratis'], d:['A free vanilla shake with orders over 3,000 RSD.','Vanila šejk gratis uz porudžbinu preko 3.000 RSD.'] },
    6:{ t:['Date night','Noć za dvoje'], d:['Set for Two at 2,290 instead of 2,490 RSD.','Set za dvoje 2.290 umesto 2.490 RSD.'] },
    0:{ t:['Sunday reset','Nedeljni reset'], d:['A free brownie with any shift set.','Brauni gratis uz svaki set.'] },
    1:{ t:["Kitchen's off",'Kuhinja odmara'], d:['Closed on Mondays. Back on Tuesday at 20:00.','Ponedeljkom ne radimo. Vidimo se u utorak u 20:00.'], off:true }
  };

  var FAQ = [
    [['Until what time do you deliver?','Do koliko sati dostavljate?'],
     ['We take delivery orders until 02:30 and pickup orders until 02:45. We deliver within 4 km of the restaurant.','Porudžbine za dostavu primamo do 02:30, a za preuzimanje do 02:45. Dostavljamo u krugu od 4 km od lokala.']],
    [['How much is delivery?','Koliko košta dostava?'],
     ['Delivery is 190 RSD and free on orders over 2,000 RSD. You can check your address in the Contact section.','Dostava je 190 dinara, a besplatna je za porudžbine preko 2.000 dinara. Adresu možeš proveriti u odeljku Kontakt.']],
    [['Can I order before you open?','Mogu li da poručim pre otvaranja?'],
     ['Yes. Outside opening hours the order form offers time slots from 20:15, and the kitchen starts on your order in time for the slot you picked.','Može. Van radnog vremena porudžbina nudi termine od 20:15, a kuhinja kreće na vreme da bude spremno u izabrano vreme.']],
    [['How long does an order take?','Koliko se čeka porudžbina?'],
     ['Pickup is ready in about 20 minutes and delivery arrives in about 35. On Friday and Saturday after midnight, add about ten minutes.','Preuzimanje je spremno za oko 20 minuta, a dostava stiže za oko 35. Petkom i subotom posle ponoći dodaj još desetak minuta.']],
    [['Can I book for a larger group?','Mogu li da rezervišem za veću grupu?'],
     ["Online we take bookings for up to 8 people. For bigger groups and parties, send an inquiry from the Events section or call 011 555 0312, and we'll join tables and suggest a menu.",'Preko sajta primamo rezervacije do 8 osoba. Za veće grupe i proslave pošalji upit iz odeljka Proslave ili pozovi 011 555 0312, pa ćemo spojiti stolove i predložiti meni.']],
    [['Do you have meat-free and gluten-free options?','Imate li opcije bez mesa i bez glutena?'],
     ['The Baker is our meat-free burger, made with chickpeas and mushrooms. Any burger can come without the bun, in a bowl with salad. Allergens are listed with every dish, but if you have a severe allergy, tell us before ordering because everything is prepared in one kitchen.','Pekar je naš burger bez mesa, od leblebije i pečuraka. Svaki burger možeš dobiti i bez lepinje, u zdeli sa salatom. Alergeni su navedeni uz svako jelo, ali ako imaš tešku alergiju, javi nam pre porudžbine jer se sve priprema u istoj kuhinji.']],
    [['Is the place accessible, and are pets allowed?','Da li je lokal pristupačan i primate li ljubimce?'],
     ['The entrance is at street level and the dining room is wheelchair accessible. Pets are welcome in the garden, and guide dogs everywhere.','Ulaz je u nivou ulice i sala je pristupačna za invalidska kolica. Ljubimci su dobrodošli u bašti, a psi vodiči svuda.']],
    [['How can I pay?','Kako mogu da platim?'],
     ['Cash or card in the restaurant. For delivery you pay the courier, by cash or card.','U lokalu gotovinom ili karticom. Za dostavu plaćaš kuriru, gotovinom ili karticom.']]
  ];

  var LEGAL = {
    privacy:{ t:['Privacy policy','Politika privatnosti'], b:[
      '<h4>What we collect</h4><p>When you order or book a table we ask for your name, phone number and, for delivery, your address. We use them only to deliver the order or hold the table.</p>' +
      '<h4>How long we keep it</h4><p>Order details are kept for twelve months for bookkeeping and then deleted. Your Night Mail sign-up stays until you unsubscribe, which you can do at any time with one click in the email itself.</p>' +
      '<h4>Who sees it</h4><p>Only the courier carrying your order sees your name and address. We never sell data and never use it for third-party advertising.</p>' +
      '<h4>Your rights</h4><p>You can ask to see, correct or delete your data at hello@lastember.rs. We reply within 30 days.</p>' +
      '<p style="margin-top:18px;">This site is a demo, so no real data is collected here.</p>',
      '<h4>Šta prikupljamo</h4><p>Kada poručuješ ili rezervišeš sto, tražimo ime, telefon i, za dostavu, adresu. To koristimo samo da bismo isporučili porudžbinu ili sačuvali sto.</p>' +
      '<h4>Koliko dugo čuvamo</h4><p>Podatke o porudžbini čuvamo dvanaest meseci zbog knjigovodstva, a zatim ih brišemo. Prijavu na Noćnu poštu čuvamo dok se ne odjaviš, a to možeš u svakom trenutku, jednim klikom u samoj poruci.</p>' +
      '<h4>Ko ih vidi</h4><p>Ime i adresu vidi samo kurir koji nosi tvoju porudžbinu. Ne prodajemo podatke nikome i ne koristimo ih za reklame trećih strana.</p>' +
      '<h4>Tvoja prava</h4><p>Možeš tražiti uvid, ispravku ili brisanje svojih podataka na hello@lastember.rs. Odgovaramo u roku od 30 dana.</p>' +
      '<p style="margin-top:18px;">Ovaj sajt je demo, pa se ovde ne prikupljaju pravi podaci.</p>' ] },
    terms:{ t:['Terms of use','Uslovi korišćenja'], b:[
      '<h4>Orders</h4><p>An order is accepted once you receive an order number. If a dish sells out we may cancel the order, and we let you know by phone.</p>' +
      '<h4>Prices and payment</h4><p>All prices are in Serbian dinars and include VAT. You pay by cash or card on pickup or to the courier.</p>' +
      '<h4>Cancelling</h4><p>You can cancel an order before the kitchen starts on it by calling 011 555 0312. Please cancel a table booking at least one hour ahead so we can give the seat to someone else.</p>' +
      '<h4>Gift cards</h4><p>A gift card is valid for one year from issue, can be passed on to someone else and cannot be exchanged for cash.</p>' +
      '<p style="margin-top:18px;">This site is a demo, so no order placed here is real.</p>',
      '<h4>Porudžbine</h4><p>Porudžbina je primljena kada dobiješ broj porudžbine. Ako se jelo rasproda, možemo da otkažemo porudžbinu, uz obaveštenje telefonom.</p>' +
      '<h4>Cene i plaćanje</h4><p>Sve cene su u dinarima i uključuju PDV. Plaćanje je gotovinom ili karticom pri preuzimanju ili kuriru.</p>' +
      '<h4>Otkazivanje</h4><p>Porudžbinu možeš otkazati dok ne krene priprema, pozivom na 011 555 0312. Rezervaciju stola otkaži bar sat vremena ranije da bismo mesto dali nekom drugom.</p>' +
      '<h4>Vaučeri</h4><p>Poklon vaučer važi godinu dana od izdavanja, prenosiv je i ne može se zameniti za gotovinu.</p>' +
      '<p style="margin-top:18px;">Ovaj sajt je demo, pa nijedna porudžbina nije stvarna.</p>' ] },
    cookies:{ t:['Cookies','Kolačići'], b:[
      '<h4>Essential</h4><p>They keep your order basket, language and delivery choice while you browse. Ordering does not work without them, so they cannot be switched off.</p>' +
      '<h4>Visit counting</h4><p>If you agree, we count visits and see which sections people open most. We never link this to your name or phone number.</p>' +
      '<h4>Changing your choice</h4><p>Clear this site\'s data in your browser settings and the cookie bar appears again on your next visit.</p>',
      '<h4>Neophodni</h4><p>Pamte tvoju korpu, jezik i izbor dostave dok si na sajtu. Bez njih porudžbina ne radi, pa se ne mogu isključiti.</p>' +
      '<h4>Brojanje poseta</h4><p>Ako pristaneš, brojimo posete i gledamo koje sekcije ljudi najviše otvaraju. To nikada ne vezujemo za tvoje ime ni broj telefona.</p>' +
      '<h4>Kako da promeniš izbor</h4><p>Obriši podatke ovog sajta u podešavanjima pregledača i traka sa izborom će se pojaviti ponovo pri sledećoj poseti.</p>' ] }
  };

  /* delivery neighbourhoods, written without diacritics for matching */
  var IN_ZONE = ['vracar','dorcol','stari grad','savamala','slavija','tasmajdan','cvetni trg','palilula','krunska','njegoseva','skadarlija','centar','terazije','kalenic'];
  var NEAR = ['zvezdara','vukov spomenik','autokomanda','zeleni venac','neimar','senjak'];

  /* ================================================================
     3. Lookups and helpers
     ================================================================ */
  var ALL = MENU.concat(COMBOS, VOUCHERS);
  function findItem(id){ for(var i = 0; i < ALL.length; i++){ if(ALL[i].id === id) return ALL[i]; } return null; }
  function findExtra(id){ for(var i = 0; i < EXTRAS.length; i++){ if(EXTRAS[i].id === id) return EXTRAS[i]; } return null; }
  function nameOf(it){ return it.cat === 'voucher' ? t('v_name', { p: fmtNum(it.price) }) : L(it.name); }
  function $(id){ return document.getElementById(id); }
  function each(sel, fn){ Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  function phoneOk(v){ return /^[+0-9\s\/().-]+$/.test(v) && v.replace(/\D/g,'').length >= 6; }
  function emailOk(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function sameDay(a, b){ return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function isoDate(d){ return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); }
  var MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  var toastsEl = $('toasts');
  function toast(msg){
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    toastsEl.appendChild(el);
    setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 2800);
  }

  /* ================================================================
     4. Opening hours logic (Tue to Sun, 20:00 to 03:00)
     ================================================================ */
  function isOpenAt(now){
    var day = now.getDay(), h = now.getHours();
    if(h >= 20) return day !== 1;
    if(h < 3) return ((day + 6) % 7) !== 1;
    return false;
  }
  function shiftDay(now){ return now.getHours() < 3 ? (now.getDay() + 6) % 7 : now.getDay(); }
  function nextOpening(now){
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0, 0);
    while(d <= now || d.getDay() === 1){ d.setDate(d.getDate() + 1); d.setHours(20, 0, 0, 0); }
    return d;
  }
  function shiftWindow(now){
    if(isOpenAt(now)){
      var end = new Date(now);
      if(now.getHours() >= 20) end.setDate(end.getDate() + 1);
      end.setHours(3, 0, 0, 0);
      return { open:true, start:now, end:end };
    }
    var s = nextOpening(now), e = new Date(s);
    e.setDate(e.getDate() + 1); e.setHours(3, 0, 0, 0);
    return { open:false, start:s, end:e };
  }

  /* ================================================================
     5. Static text + simple renders
     ================================================================ */
  function applyStatic(){
    each('[data-i]', function(el){ el.textContent = t(el.getAttribute('data-i')); });
    each('[data-ih]', function(el){ el.innerHTML = t(el.getAttribute('data-ih')); });
    each('[data-ip]', function(el){ el.setAttribute('placeholder', t(el.getAttribute('data-ip'))); });
    each('[data-ia]', function(el){ el.setAttribute('aria-label', t(el.getAttribute('data-ia'))); });
    each('[data-lang]', function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    document.documentElement.lang = lang === 'sr' ? 'sr-Latn' : 'en';
    $('rateBig').textContent = lang === 'sr' ? '4,8' : '4.8';
  }

  function renderMarquee(){
    var one = ['mq1','mq2','mq3','mq4','mq5','mq6'].map(function(k){ return '<span>' + esc(t(k)) + '<b>&#9679;</b></span>'; }).join('');
    $('marqueeTrack').innerHTML = one + one;
  }

  function renderSpecials(){
    var today = shiftDay(new Date());
    $('spGrid').innerHTML = [2,3,4,5,6,0,1].map(function(d){
      var s = SPECIALS[d];
      var cls = 'sp' + (d === today ? ' today' : '') + (s.off ? ' off' : '');
      return '<div class="' + cls + '">' +
        '<span class="sp-day">' + esc(DAYS[lang].short[d]) + (d === today ? '<em>' + esc(t('sp_today')) + '</em>' : '') + '</span>' +
        '<span class="sp-title">' + esc(L(s.t)) + '</span>' +
        '<span class="sp-text">' + esc(L(s.d)) + '</span></div>';
    }).join('');
  }

  function renderStars(){
    $('rateStars').innerHTML = STAR + STAR + STAR + STAR + STAR;
    each('[data-stars]', function(el){ var n = Number(el.getAttribute('data-stars')); var s = ''; for(var i = 0; i < n; i++) s += STAR; el.innerHTML = s; });
  }

  function renderStamps(){
    var s = '';
    for(var i = 0; i < 9; i++){
      if(i < 3) s += '<span class="stamp on">' + FLAME + '</span>';
      else if(i === 8) s += '<span class="stamp free">' + esc(t('ly_free')) + '</span>';
      else s += '<span class="stamp"></span>';
    }
    s += '<span class="stamp" style="visibility:hidden"></span>';
    $('stamps').innerHTML = s;
  }

  function renderFaq(){
    var list = $('faqList');
    var open = [];
    each('#faqList details', function(d, i){ if(d.open) open.push(i); });
    list.innerHTML = FAQ.map(function(q, i){
      return '<details class="faq-item"' + (open.indexOf(i) > -1 ? ' open' : '') + '><summary>' + esc(L(q[0])) +
        '<svg class="faq-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>' +
        '</summary><p>' + esc(L(q[1])) + '</p></details>';
    }).join('');
  }

  function renderHours(){
    var today = shiftDay(new Date());
    $('hoursList').innerHTML = [1,2,3,4,5,6,0].map(function(d){
      return '<li' + (d === today ? ' class="today"' : '') + '><span>' + esc(DAYS[lang].long[d]) + '</span><span>' + esc(d === 1 ? t('closed') : t('hrs')) + '</span></li>';
    }).join('');
  }

  var statusTimer = null;
  function renderStatus(){
    var now = new Date(), open = isOpenAt(now);
    $('statusPill').classList.toggle('open', open);
    if(open){ $('statusText').textContent = t('st_open'); return; }
    var diff = nextOpening(now) - now;
    var h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000);
    $('statusText').textContent = h > 0 ? t('st_opens_h', { h:h, m:m }) : t('st_opens_m', { m:m });
  }

  /* ================================================================
     6. Menu: tabs, search, filters
     ================================================================ */
  var activeCat = 'burgers', activeFilter = 'all';
  var searchEl = $('menuSearch');
  function tagHtml(tag){ return tag ? '<span class="m-tag ' + tag + '">' + esc(t('tag_' + tag)) + '</span>' : ''; }
  function passFilter(m){
    if(activeFilter === 'hot') return m.tag === 'hot';
    if(activeFilter === 'veg') return m.veg;
    if(activeFilter === 'gf') return m.gf;
    return true;
  }
  function renderTabs(){
    var q = searchEl.value.trim();
    $('tabs').classList.toggle('dimmed', !!q);
    $('tabs').innerHTML = CATS.map(function(c){
      var on = c.id === activeCat;
      return '<button type="button" class="tab' + (on ? ' active' : '') + '" role="tab" aria-selected="' + on + '" data-cat="' + c.id + '">' + esc(t(c.key)) + '</button>';
    }).join('');
  }
  function renderMenu(){
    var q = searchEl.value.trim().toLowerCase();
    var items = MENU.filter(function(m){
      if(!q && m.cat !== activeCat) return false;
      if(!passFilter(m)) return false;
      if(!q) return true;
      return (L(m.name) + ' ' + L(m.desc) + ' ' + L(m.long)).toLowerCase().indexOf(q) > -1;
    });
    if(!items.length){ $('menuGrid').innerHTML = '<p class="no-hits">' + esc(t('no_hits')) + '</p>'; return; }
    $('menuGrid').innerHTML = items.map(function(m){
      var n = L(m.name);
      return '<article class="m-card">' +
        '<button type="button" class="m-art" data-open="' + m.id + '" aria-label="' + esc(t('details_aria', { n:n })) + '">' + m.art + '</button>' +
        '<h3>' + esc(n) + tagHtml(m.tag) + '</h3>' +
        '<p>' + esc(L(m.desc)) + '</p>' +
        '<div class="m-meta"><span>' + esc(L(m.w)) + '</span><span>' + m.kcal + ' kcal</span></div>' +
        '<div class="m-foot"><span class="price">' + fmt(m.price) + '</span>' +
        '<button type="button" class="add-btn" data-add="' + m.id + '" aria-label="' + esc(t('add_aria', { n:n })) + '">' + PLUS + esc(t('add')) + '</button></div>' +
      '</article>';
    }).join('');
  }
  $('tabs').addEventListener('click', function(e){
    var b = e.target.closest('[data-cat]'); if(!b) return;
    activeCat = b.getAttribute('data-cat'); searchEl.value = '';
    renderTabs(); renderMenu();
  });
  $('chips').addEventListener('click', function(e){
    var b = e.target.closest('[data-filter]'); if(!b) return;
    activeFilter = b.getAttribute('data-filter');
    each('#chips .chip', function(c){ c.classList.toggle('active', c === b); });
    renderMenu();
  });
  searchEl.addEventListener('input', function(){ renderTabs(); renderMenu(); });

  function renderCombos(){
    $('comboGrid').innerHTML = COMBOS.map(function(c){
      return '<article class="combo' + (c.best ? ' best' : '') + '">' +
        (c.best ? '<span class="combo-flag">' + esc(t('cb_best')) + '</span>' : '') +
        '<div class="combo-art">' + c.art + '</div>' +
        '<h3>' + esc(L(c.name)) + '</h3>' +
        '<ul class="combo-what">' + L(c.what).map(function(w){ return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' +
        '<div class="combo-price"><span class="price">' + fmt(c.price) + '</span><span class="old">' + fmt(c.was) + '</span><span class="save">' + esc(t('cb_save', { p:fmt(c.was - c.price) })) + '</span></div>' +
        '<button type="button" class="add-btn" style="align-self:flex-start;" data-add="' + c.id + '">' + PLUS + esc(t('cb_add')) + '</button>' +
      '</article>';
    }).join('');
  }
  function renderVouchers(){
    $('voucherRow').innerHTML = VOUCHERS.map(function(v){
      return '<button type="button" class="v-card" data-add="' + v.id + '" aria-label="' + esc(t('add_aria', { n:nameOf(v) })) + '"><b>' + fmtNum(v.price) + '</b><span>' + esc(t('v_unit')) + '</span></button>';
    }).join('');
  }

  /* ================================================================
     7. Gallery + lightbox
     ================================================================ */
  function sceneBig(svgStr, bg){
    return '<rect width="400" height="300" fill="' + bg + '"/><ellipse cx="200" cy="155" rx="140" ry="115" fill="#E0A04A" opacity="0.09"/>' +
      '<g transform="translate(140 30) scale(2)">' + bare(svgStr) + '</g>';
  }
  var SCENES = [
    { cap:'g1', draw:function(){ return '<rect width="400" height="300" fill="#0E1328"/>' +
        '<g stroke="#E0A04A" stroke-width="8" stroke-linecap="round" opacity="0.9"><line x1="60" y1="212" x2="340" y2="212"/><line x1="60" y1="238" x2="340" y2="238"/><line x1="60" y1="264" x2="340" y2="264"/></g>' +
        '<path d="M130,212 C116,168 146,154 138,116 C172,138 164,172 186,164 C178,198 152,212 130,212Z" fill="#E0A04A"/>' +
        '<path d="M232,212 C219,164 252,150 242,104 C280,128 270,168 292,160 C283,198 256,212 232,212Z" fill="#F2C36F" opacity="0.9"/>' +
        '<path d="M190,96 C180,76 200,60 190,40" fill="none" stroke="#F3EADB" stroke-width="4" opacity="0.4" stroke-linecap="round"/>'; } },
    { cap:'g2', draw:function(){ return sceneBig(artBurger({}), '#141a35'); } },
    { cap:'g3', draw:function(sfx){ var f = 'neonBlur' + sfx; return '<rect width="400" height="300" fill="#0a0f22"/>' +
        '<defs><filter id="' + f + '" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"/></filter></defs>' +
        '<rect x="60" y="105" width="280" height="90" rx="18" fill="none" stroke="#E0A04A" stroke-width="5" filter="url(#' + f + ')" opacity="0.8"/>' +
        '<rect x="60" y="105" width="280" height="90" rx="18" fill="none" stroke="#F2C36F" stroke-width="3"/>' +
        '<text x="200" y="166" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-size="38" font-weight="800" letter-spacing="4" fill="#F2C36F" filter="url(#' + f + ')" opacity="0.9">LAST EMBER</text>' +
        '<text x="200" y="166" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-size="38" font-weight="800" letter-spacing="4" fill="#FCEFD8">LAST EMBER</text>'; } },
    { cap:'g4', draw:function(){ return sceneBig(artFries(), '#151B36'); } },
    { cap:'g5', draw:function(){ return sceneBig(artShake(), '#141a35'); } },
    { cap:'g6', draw:function(){ return '<rect width="400" height="300" fill="#0a0f22"/>' +
        '<circle cx="322" cy="70" r="30" fill="#F3EADB" opacity="0.9"/><circle cx="312" cy="62" r="26" fill="#0a0f22"/>' +
        '<g fill="#151B36"><rect x="30" y="140" width="56" height="160"/><rect x="98" y="110" width="48" height="190"/><rect x="158" y="160" width="62" height="140"/><rect x="232" y="120" width="52" height="180"/><rect x="296" y="170" width="70" height="130"/></g>' +
        '<g fill="#E0A04A" opacity="0.85"><rect x="112" y="128" width="8" height="8"/><rect x="128" y="150" width="8" height="8"/><rect x="246" y="140" width="8" height="8"/><rect x="262" y="168" width="8" height="8"/><rect x="44" y="160" width="8" height="8"/><rect x="176" y="180" width="8" height="8"/></g>'; } }
  ];
  function sceneSvg(i, sfx){ return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + SCENES[i].draw(sfx) + '</svg>'; }
  function renderGallery(){
    $('gGrid').innerHTML = SCENES.map(function(s, i){
      return '<button type="button" class="g-tile" data-gal="' + i + '" aria-label="' + esc(t(s.cap)) + '">' + sceneSvg(i, 't' + i) + '<span class="g-cap">' + esc(t(s.cap)) + '</span></button>';
    }).join('');
  }
  var lb = $('lightbox'), lbIndex = 0;
  function showLb(){
    $('lbFrame').innerHTML = sceneSvg(lbIndex, 'lb');
    $('lbCap').textContent = t(SCENES[lbIndex].cap) + '   ' + (lbIndex + 1) + ' / ' + SCENES.length;
  }
  function openLb(i){ lbIndex = i; showLb(); openLayer(lb, $('lbClose')); }
  $('lbPrev').addEventListener('click', function(){ lbIndex = (lbIndex + SCENES.length - 1) % SCENES.length; showLb(); });
  $('lbNext').addEventListener('click', function(){ lbIndex = (lbIndex + 1) % SCENES.length; showLb(); });
  $('lbClose').addEventListener('click', function(){ closeLayer(lb); });
  lb.addEventListener('click', function(e){ if(e.target === lb) closeLayer(lb); });

  /* ================================================================
     8. Layers (drawer, modals, lightbox, mobile menu)
     ================================================================ */
  var overlay = $('overlay'), drawer = $('drawer'), itemModal = $('itemModal'), legalModal = $('legalModal'), mobileMenu = $('mobileMenu');
  var lastFocus = [];
  function isOpen(el){ return el.classList.contains('open'); }
  function sync(){
    var any = isOpen(drawer) || isOpen(itemModal) || isOpen(legalModal) || isOpen(lb) || isOpen(mobileMenu);
    document.body.classList.toggle('lock', any);
    overlay.classList.toggle('show', isOpen(drawer) || isOpen(itemModal) || isOpen(legalModal));
  }
  function openLayer(el, focusEl){
    if(!isOpen(el)) lastFocus.push(document.activeElement);
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    sync();
    if(focusEl) setTimeout(function(){ try{ focusEl.focus(); }catch(e){} }, 30);
  }
  function closeLayer(el){
    if(!isOpen(el)) return;
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    sync();
    var f = lastFocus.pop();
    if(f && f.focus){ try{ f.focus(); }catch(e){} }
  }
  overlay.addEventListener('click', function(){
    if(isOpen(itemModal)) closeLayer(itemModal);
    else if(isOpen(legalModal)) closeLayer(legalModal);
    else closeLayer(drawer);
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      if(isOpen(lb)) closeLayer(lb);
      else if(isOpen(itemModal)) closeLayer(itemModal);
      else if(isOpen(legalModal)) closeLayer(legalModal);
      else if(isOpen(drawer)) closeLayer(drawer);
      else if(isOpen(mobileMenu)) closeLayer(mobileMenu);
    } else if(isOpen(lb) && e.key === 'ArrowRight'){ $('lbNext').click(); }
    else if(isOpen(lb) && e.key === 'ArrowLeft'){ $('lbPrev').click(); }
  });

  /* ================================================================
     9. Cart
     ================================================================ */
  var cart = [], mode = 'pickup', pay = 'cash', tipPct = 0, promoPct = 0, promoCode = '', promoState = null;
  var orderShown = false, lastOrder = null, orderTimers = [];

  (function loadCart(){
    try{
      var raw = LS.get('lastember.cart.v1');
      if(!raw) return;
      var o = JSON.parse(raw);
      if(o && Array.isArray(o.cart)){
        cart = o.cart.filter(function(l){ return l && findItem(l.id) && l.qty > 0; }).map(function(l){
          var ex = Array.isArray(l.extras) ? l.extras.filter(findExtra) : [];
          return { key:keyOf(l.id, ex), id:l.id, extras:ex, qty:Math.min(Number(l.qty) || 1, 50) };
        });
      }
      if(o && (o.mode === 'pickup' || o.mode === 'delivery')) mode = o.mode;
    }catch(e){ cart = []; }
  })();
  function saveCart(){ LS.set('lastember.cart.v1', JSON.stringify({ cart:cart.map(function(l){ return { id:l.id, extras:l.extras, qty:l.qty }; }), mode:mode })); }

  function keyOf(id, extras){ return id + '|' + extras.slice().sort().join(','); }
  function linePrice(l){ var p = findItem(l.id).price; l.extras.forEach(function(x){ var e = findExtra(x); if(e) p += e.price; }); return p; }
  function qtyTotal(){ return cart.reduce(function(a, l){ return a + l.qty; }, 0); }
  function computeTotals(lines, m, pct, tp){
    var sub = 0, base = 0;
    lines.forEach(function(l){ var v = l.qty * linePrice(l); sub += v; if(findItem(l.id).cat !== 'voucher') base += v; });
    var disc = Math.round(base * pct / 100);
    var food = base - disc;
    var del = (m === 'delivery' && base > 0 && food < 2000) ? 190 : 0;
    var tip = Math.round(food * tp / 100);
    return { sub:sub, disc:disc, del:del, tip:tip, grand:sub - disc + del + tip, base:base };
  }

  function addToCart(id, extras, qty){
    extras = extras || []; qty = qty || 1;
    var k = keyOf(id, extras), found = null;
    cart.forEach(function(l){ if(l.key === k) found = l; });
    if(found) found.qty += qty; else cart.push({ key:k, id:id, extras:extras.slice(), qty:qty });
    orderShown = false;
    updateCartUI();
    toast(t('added', { n:nameOf(findItem(id)) }));
  }
  function setQty(key, delta){
    for(var i = 0; i < cart.length; i++){
      if(cart[i].key === key){ cart[i].qty += delta; if(cart[i].qty <= 0) cart.splice(i, 1); break; }
    }
    updateCartUI();
  }

  /* time slots */
  var whenSel = $('whenSel');
  function buildSlots(){
    var now = new Date(), w = shiftWindow(now), lead = mode === 'delivery' ? 35 : 20;
    var opts = [], fallback = false;
    function fill(win, isOpenNow){
      var last = new Date(win.end.getTime() - (mode === 'delivery' ? 30 : 15) * 60000);
      var first = isOpenNow ? new Date(now.getTime() + (lead + 15) * 60000) : new Date(win.start.getTime() + 15 * 60000);
      first.setSeconds(0, 0);
      first.setMinutes(Math.ceil(first.getMinutes() / 15) * 15);
      var prefix = '';
      if(!isOpenNow) prefix = (sameDay(win.start, now) ? t('today') : DAYS[lang].short[win.start.getDay()]) + ' ';
      if(isOpenNow && now < last) opts.push({ v:'asap', l:t('asap', { m:lead }) });
      for(var d = new Date(first); d <= last; d = new Date(d.getTime() + 15 * 60000)) opts.push({ v:d.toISOString(), l:prefix + hhmm(d) });
    }
    fill(w, w.open);
    if(!opts.length){
      fallback = true;
      var s = nextOpening(now), e = new Date(s); e.setDate(e.getDate() + 1); e.setHours(3, 0, 0, 0);
      fill({ start:s, end:e }, false);
    }
    var prev = whenSel.value;
    whenSel.innerHTML = opts.map(function(o){ return '<option value="' + o.v + '">' + esc(o.l) + '</option>'; }).join('');
    if(prev && opts.some(function(o){ return o.v === prev; })) whenSel.value = prev;
    var closed = !w.open || fallback;
    $('closedNote').hidden = !closed || !opts.length;
    if(closed && opts.length) $('closedNote').textContent = t('closed_note', { x:opts[0].l });
  }
  function whenLabel(v){
    if(v === 'asap') return t('tk_asap');
    var d = new Date(v), now = new Date();
    if(isOpenAt(now)) return hhmm(d);
    var sd = new Date(d); if(sd.getHours() < 3) sd.setDate(sd.getDate() - 1);
    return (sameDay(sd, now) ? t('today') : DAYS[lang].short[sd.getDay()]) + ' ' + hhmm(d);
  }

  function renderUpsell(){
    var cats = cart.map(function(l){ return findItem(l.id).cat; });
    function has(c){ return cats.indexOf(c) > -1; }
    var pick = null;
    if(!has('set')){
      if(has('burgers') && !has('sides')) pick = 'p1';
      else if((has('burgers') || has('sides')) && !has('drinks')) pick = 'd1';
      else if(has('burgers') && !has('sauces')) pick = 's1';
    }
    if(!pick){ $('upsell').innerHTML = ''; return; }
    var it = findItem(pick);
    $('upsell').innerHTML = '<div class="upsell"><div class="ci-art">' + it.art + '</div>' +
      '<div class="u-mid"><span>' + esc(t('up_title')) + '</span>' + esc(nameOf(it)) + ' <b class="price">+' + fmt(it.price) + '</b></div>' +
      '<button type="button" class="add-btn" data-add="' + it.id + '" aria-label="' + esc(t('add_aria', { n:nameOf(it) })) + '">' + PLUS + esc(t('add')) + '</button></div>';
  }

  function updateCartUI(){
    var n = qtyTotal();
    $('cartCount').textContent = n;
    $('cartCount').hidden = n === 0;
    $('orderOk').hidden = !orderShown;
    $('cartEmpty').hidden = n > 0 || orderShown;
    $('cartBody').hidden = n === 0;

    $('cartList').innerHTML = cart.map(function(l){
      var it = findItem(l.id), nm = nameOf(it);
      var ex = l.extras.map(function(x){ var e = findExtra(x); return e ? L(e.name) : ''; }).filter(Boolean);
      return '<li class="cart-item"><div class="ci-art">' + it.art + '</div>' +
        '<div class="ci-mid"><b>' + esc(nm) + '</b>' + (ex.length ? '<em>' + esc(t('with', { x:ex.join(', ') })) + '</em>' : '') +
        '<span class="price">' + fmt(linePrice(l)) + '</span></div>' +
        '<div class="ci-qty"><button type="button" class="qty-btn" data-dec="' + l.key + '" aria-label="' + esc(t('qty_minus')) + '">&minus;</button>' +
        '<output>' + l.qty + '</output>' +
        '<button type="button" class="qty-btn" data-inc="' + l.key + '" aria-label="' + esc(t('qty_plus')) + '">+</button></div>' +
        '<button type="button" class="ci-rm" data-rm="' + l.key + '" aria-label="' + esc(t('remove_aria', { n:nm })) + '">' + XICON + '</button></li>';
    }).join('');
    renderUpsell();

    var tt = computeTotals(cart, mode, promoPct, tipPct);
    $('tSub').textContent = fmt(tt.sub);
    $('tDiscRow').hidden = promoPct === 0;
    $('tDiscLabel').textContent = t('discount', { c:promoCode });
    $('tDisc').textContent = '-' + fmt(tt.disc);
    $('tDelRow').hidden = mode !== 'delivery';
    $('tDel').textContent = tt.del === 0 ? t('free') : fmt(tt.del);
    $('tTipRow').hidden = tipPct === 0;
    $('tTip').textContent = fmt(tt.tip);
    $('tGrand').textContent = fmt(tt.grand);
    $('orderSubmit').textContent = t('place', { p:fmt(tt.grand) });
    $('coAddr').hidden = mode !== 'delivery';
    $('modePickup').classList.toggle('active', mode === 'pickup');
    $('modeDelivery').classList.toggle('active', mode === 'delivery');
    if(promoState){
      $('promoMsg').className = 'promo-msg ' + (promoState === 'bad' || promoState === 'empty' ? 'bad' : 'ok');
      $('promoMsg').textContent = promoState === 'ok' ? t('promo_ok', { c:promoCode, p:promoPct }) : t(promoState === 'bad' ? 'promo_bad' : 'promo_empty');
    } else { $('promoMsg').textContent = ''; }
    saveCart();
  }

  $('cartBtn').addEventListener('click', function(){ buildSlots(); updateCartUI(); openLayer(drawer, $('drawerClose')); });
  $('drawerClose').addEventListener('click', function(){ closeLayer(drawer); });
  $('browseMenu').addEventListener('click', function(){ closeLayer(drawer); });
  $('cartList').addEventListener('click', function(e){
    var inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), rm = e.target.closest('[data-rm]');
    if(inc) setQty(inc.getAttribute('data-inc'), 1);
    else if(dec) setQty(dec.getAttribute('data-dec'), -1);
    else if(rm){ cart = cart.filter(function(l){ return l.key !== rm.getAttribute('data-rm'); }); updateCartUI(); }
  });
  $('modePickup').addEventListener('click', function(){ mode = 'pickup'; buildSlots(); updateCartUI(); });
  $('modeDelivery').addEventListener('click', function(){ mode = 'delivery'; buildSlots(); updateCartUI(); });
  each('[data-pay]', function(b){ b.addEventListener('click', function(){ pay = b.getAttribute('data-pay'); each('[data-pay]', function(x){ x.classList.toggle('active', x === b); }); }); });
  each('[data-tip]', function(b){ b.addEventListener('click', function(){ tipPct = Number(b.getAttribute('data-tip')); each('[data-tip]', function(x){ x.classList.toggle('active', x === b); }); updateCartUI(); }); });
  $('promoBtn').addEventListener('click', function(){
    var code = $('promoInput').value.trim().toUpperCase();
    if(!code){ promoState = 'empty'; promoPct = 0; promoCode = ''; }
    else if(PROMOS[code]){ promoState = 'ok'; promoPct = PROMOS[code]; promoCode = code; }
    else { promoState = 'bad'; promoPct = 0; promoCode = ''; }
    updateCartUI();
  });

  /* order + kitchen ticket */
  function renderOrder(){
    var o = lastOrder; if(!o) return;
    $('okText').textContent = o.mode === 'delivery' ? t('ok_del', { n:o.first, a:o.addr }) : t('ok_pick', { n:o.first });
    var rows = '';
    o.lines.forEach(function(l){
      var it = findItem(l.id);
      var ex = l.extras.map(function(x){ var e = findExtra(x); return e ? L(e.name) : ''; }).filter(Boolean);
      rows += '<div class="tk-item"><span>' + l.qty + '×</span><span>' + esc(nameOf(it).toUpperCase()) + '</span><span>' + fmtNum(l.qty * linePrice(l)) + '</span>' +
        (ex.length ? '<small>+ ' + esc(ex.join(', ')) + '</small>' : '') + '</div>';
    });
    var tt = o.tt;
    function row(a, b, cls){ return '<div class="tk-row' + (cls ? ' ' + cls : '') + '"><span>' + esc(a) + '</span><span>' + esc(b) + '</span></div>'; }
    $('ticket').innerHTML =
      '<div class="tk-brand">LAST EMBER</div><div class="tk-sub">BURGER BAR · ULICA PLAMENA 12</div>' +
      '<hr class="tk-hr">' +
      '<div class="tk-row"><span>' + esc(t('tk_order')) + '</span><span>' + esc(o.stamp) + '</span></div>' +
      '<div class="tk-code">' + esc(o.code) + '</div>' +
      row(o.mode === 'delivery' ? t('tk_delivery') : t('tk_pickup'), whenLabel(o.when)) +
      row(t('tk_for'), o.name.toUpperCase()) +
      '<hr class="tk-hr">' + rows + '<hr class="tk-hr">' +
      row(t('tk_subtotal'), fmtNum(tt.sub)) +
      (tt.disc ? row(t('tk_disc') + ' ' + o.promo, '-' + fmtNum(tt.disc)) : '') +
      (o.mode === 'delivery' ? row(t('tk_del'), tt.del ? fmtNum(tt.del) : t('tk_free')) : '') +
      (tt.tip ? row(t('tk_tip'), fmtNum(tt.tip)) : '') +
      '<hr class="tk-hr">' + row(t('tk_total') + ' RSD', fmtNum(tt.grand), 'tk-total') +
      row(t('tk_pay'), o.pay === 'card' ? t('tk_card') : t('tk_cash')) +
      (o.note ? '<hr class="tk-hr"><div>' + esc(t('tk_note')) + ': ' + esc(o.note) + '</div>' : '') +
      '<hr class="tk-hr"><div style="text-align:center; letter-spacing:0.1em;">' + esc(t('tk_thanks')) + '</div>';
    var steps;
    if(o.when === 'asap'){
      steps = [['tr1','tr1s'],['tr2','tr2s'],['tr3','tr3s'], o.mode === 'delivery' ? ['tr4d','tr4ds'] : ['tr4p','tr4ps']];
    } else {
      steps = [['tr1','tr1s'],['trS','trSs']];
    }
    $('tracker').innerHTML = steps.map(function(s, i){
      return '<div class="tr-step' + (i < o.done ? ' done' : '') + '"><span class="tr-dot">' + CHECK + '</span>' +
        '<span class="tr-txt"><b>' + esc(t(s[0])) + '</b><span>' + esc(t(s[1], { t:whenLabel(o.when) })) + '</span></span></div>';
    }).join('');
  }

  $('orderSubmit').addEventListener('click', function(){
    var err = $('coErr'), name = $('coName').value.trim(), phone = $('coPhone').value.trim(), addr = $('coAddr').value.trim();
    err.textContent = '';
    if(name.length < 2){ err.textContent = t('err_name'); $('coName').focus(); return; }
    if(!phoneOk(phone)){ err.textContent = t('err_phone'); $('coPhone').focus(); return; }
    if(mode === 'delivery' && addr.length < 5){ err.textContent = t('err_addr'); $('coAddr').focus(); return; }
    orderTimers.forEach(clearTimeout); orderTimers = [];
    var now = new Date();
    lastOrder = {
      code:'LE-' + Math.floor(1000 + Math.random() * 9000),
      stamp:pad(now.getDate()) + '.' + pad(now.getMonth() + 1) + '. ' + hhmm(now),
      lines:cart.map(function(l){ return { id:l.id, extras:l.extras.slice(), qty:l.qty }; }),
      mode:mode, pay:pay, name:name, first:name.split(' ')[0], addr:addr, note:$('coNote').value.trim(),
      when:whenSel.value || 'asap', promo:promoCode, tt:computeTotals(cart, mode, promoPct, tipPct), done:1
    };
    var total = lastOrder.when === 'asap' ? 4 : 2;
    for(var i = 2; i <= total; i++){
      (function(step){ orderTimers.push(setTimeout(function(){ if(lastOrder){ lastOrder.done = step; renderOrder(); } }, (step - 1) * 1500)); })(i);
    }
    cart = []; promoPct = 0; promoCode = ''; promoState = null; tipPct = 0;
    $('promoInput').value = ''; $('coNote').value = ''; $('coAddr').value = '';
    each('[data-tip]', function(x){ x.classList.toggle('active', x.getAttribute('data-tip') === '0'); });
    orderShown = true;
    renderOrder(); updateCartUI();
    drawer.querySelector('.drawer-scroll').scrollTop = 0;
  });
  $('newOrder').addEventListener('click', function(){ orderShown = false; updateCartUI(); });

  /* ================================================================
     10. Item modal
     ================================================================ */
  var current = null, curExtras = [], curQty = 1;
  function fillItem(){
    var m = current; if(!m) return;
    $('imArt').innerHTML = m.art;
    $('imName').innerHTML = esc(L(m.name)) + tagHtml(m.tag);
    $('imDesc').textContent = L(m.long);
    $('imFacts').innerHTML = '<span>' + esc(L(m.w)) + '</span><span>' + m.kcal + ' kcal</span><span>' + esc(m.gf ? t('im_gf') : t('im_hasg')) + '</span>';
    $('imAller').textContent = (m.aller.length ? m.aller.map(function(a){ return t('al_' + a); }).join(', ') + '. ' : t('im_none') + ' ') + t('im_kitchen');
    var burger = m.cat === 'burgers';
    $('imExtrasBlock').hidden = !burger;
    $('imExtras').innerHTML = burger ? EXTRAS.map(function(e){
      return '<label class="ex-lbl"><input type="checkbox" value="' + e.id + '"' + (curExtras.indexOf(e.id) > -1 ? ' checked' : '') + '>' + esc(L(e.name)) + '<em>+' + fmtNum(e.price) + '</em></label>';
    }).join('') : '';
    $('imQty').textContent = curQty;
    var p = m.price; curExtras.forEach(function(x){ var e = findExtra(x); if(e) p += e.price; });
    $('imAdd').textContent = t('im_add', { p:fmt(p * curQty) });
  }
  function openItem(id){
    var m = findItem(id); if(!m || !m.desc) return;
    current = m; curExtras = []; curQty = 1;
    fillItem();
    itemModal.querySelector('.modal-card').scrollTop = 0;
    openLayer(itemModal, $('imClose'));
  }
  $('imExtras').addEventListener('change', function(){
    curExtras = Array.prototype.slice.call($('imExtras').querySelectorAll('input:checked')).map(function(i){ return i.value; });
    fillItem();
  });
  $('imPlus').addEventListener('click', function(){ curQty = Math.min(curQty + 1, 20); fillItem(); });
  $('imMinus').addEventListener('click', function(){ curQty = Math.max(curQty - 1, 1); fillItem(); });
  $('imAdd').addEventListener('click', function(){ if(!current) return; addToCart(current.id, curExtras, curQty); closeLayer(itemModal); });
  $('imClose').addEventListener('click', function(){ closeLayer(itemModal); });
  itemModal.addEventListener('click', function(e){ if(e.target === itemModal) closeLayer(itemModal); });

  /* ================================================================
     11. Legal modal
     ================================================================ */
  var legalKey = null;
  function fillLegal(){ if(!legalKey) return; $('lgTitle').textContent = L(LEGAL[legalKey].t); $('lgBody').innerHTML = L(LEGAL[legalKey].b); }
  $('lgClose').addEventListener('click', function(){ closeLayer(legalModal); });
  legalModal.addEventListener('click', function(e){ if(e.target === legalModal) closeLayer(legalModal); });

  /* ================================================================
     12. Global clicks
     ================================================================ */
  document.addEventListener('click', function(e){
    var el;
    if((el = e.target.closest('[data-add]'))){
      var it = findItem(el.getAttribute('data-add'));
      if(!it) return;
      if(it.cat === 'burgers' && !el.closest('.upsell')) openItem(it.id); else addToCart(it.id, [], 1);
      return;
    }
    if((el = e.target.closest('[data-open]'))){ openItem(el.getAttribute('data-open')); return; }
    if((el = e.target.closest('[data-legal]'))){ legalKey = el.getAttribute('data-legal'); fillLegal(); openLayer(legalModal, $('lgClose')); return; }
    if((el = e.target.closest('[data-gal]'))){ openLb(Number(el.getAttribute('data-gal'))); return; }
    if((el = e.target.closest('[data-lang]'))){ setLang(el.getAttribute('data-lang')); return; }
    if((el = e.target.closest('[data-social]'))){ toast(t('social_toast')); return; }
    if((el = e.target.closest('[data-prefill]'))){ prefill(el); return; }
    if((el = e.target.closest('[data-copy]'))){ copyText(el); return; }
  });

  function copyText(btn){
    var text = btn.getAttribute('data-copy');
    function fallback(){
      var v = btn.parentNode.querySelector('.val');
      if(v && window.getSelection){ var r = document.createRange(); r.selectNodeContents(v); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
      toast(t('copy_fail'));
    }
    try{
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){ toast(t('copied', { x:text })); }, fallback);
      } else fallback();
    }catch(err){ fallback(); }
  }

  /* ================================================================
     13. Forms
     ================================================================ */
  /* reservation */
  var rDate = $('rDate'), lastRes = null;
  (function(){ var iso = isoDate(new Date()); rDate.min = iso; var d = new Date(); while(d.getDay() === 1) d.setDate(d.getDate() + 1); rDate.value = isoDate(d); })();
  function guestsPhrase(g){
    if(lang === 'sr') return g === 1 ? '1 osobu' : (g <= 4 ? g + ' osobe' : g + ' osoba');
    return g === 1 ? '1 guest' : g + ' guests';
  }
  function niceDate(iso){
    var p = iso.split('-'), d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    if(lang === 'sr') return DAYS.sr.long[d.getDay()].toLowerCase() + ' ' + d.getDate() + '.' + (d.getMonth() + 1) + '.';
    return DAYS.en.long[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS_EN[d.getMonth()];
  }
  function renderRes(){
    if(!lastRes) return;
    var area = lastRes.area === 'any' ? '' : t('rs_area', { x:t('a_' + lastRes.area).toLowerCase() });
    $('resOkText').textContent = t('rs_ok_text', { n:lastRes.first, g:guestsPhrase(lastRes.g), d:niceDate(lastRes.date), t:lastRes.time, a:area });
    $('resCode').textContent = lastRes.code;
  }
  $('resForm').addEventListener('submit', function(e){
    e.preventDefault();
    var ok = true, name = $('rName').value.trim(), phone = $('rPhone').value.trim();
    ['rNameErr','rPhoneErr','rDateErr'].forEach(function(id){ $(id).textContent = ''; });
    if(name.length < 2){ $('rNameErr').textContent = t('e_name'); ok = false; }
    if(!phoneOk(phone)){ $('rPhoneErr').textContent = t('e_phone'); ok = false; }
    if(!rDate.value){ $('rDateErr').textContent = t('e_date'); ok = false; }
    else if(rDate.value < isoDate(new Date())){ $('rDateErr').textContent = t('e_past'); ok = false; }
    else {
      var p = rDate.value.split('-');
      if(new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])).getDay() === 1){ $('rDateErr').textContent = t('e_monday'); ok = false; }
    }
    if(!ok) return;
    lastRes = { first:name.split(' ')[0], g:Number($('rGuests').value), date:rDate.value, time:$('rTime').value, area:$('rArea').value, code:'BK-' + Math.floor(1000 + Math.random() * 9000) };
    renderRes();
    $('resForm').hidden = true; $('resOk').hidden = false;
  });
  $('resAgain').addEventListener('click', function(){ $('resForm').reset(); rDate.value = isoDate(new Date()); $('resOk').hidden = true; $('resForm').hidden = false; lastRes = null; });

  /* loyalty */
  $('lyForm').addEventListener('submit', function(e){
    e.preventDefault();
    if($('lyName').value.trim().length < 2 || !phoneOk($('lyPhone').value.trim())){ $('lyErr').textContent = t('ly_err'); return; }
    $('lyErr').textContent = '';
    $('lyForm').hidden = true; $('lyOk').hidden = false;
  });

  /* contact */
  var lastCf = null;
  function renderCf(){ if(lastCf) $('cfOkText').textContent = t('cf_ok_text', { n:lastCf.first, e:lastCf.email }); }
  $('cfForm').addEventListener('submit', function(e){
    e.preventDefault();
    var ok = true, name = $('cfName').value.trim(), email = $('cfEmail').value.trim(), msg = $('cfMsg').value.trim();
    ['cfNameErr','cfEmailErr','cfMsgErr'].forEach(function(id){ $(id).textContent = ''; });
    if(name.length < 2){ $('cfNameErr').textContent = t('e_name'); ok = false; }
    if(!emailOk(email)){ $('cfEmailErr').textContent = t('e_email'); ok = false; }
    if(msg.length < 10){ $('cfMsgErr').textContent = t('e_msg'); ok = false; }
    if(!ok) return;
    lastCf = { first:name.split(' ')[0], email:email };
    renderCf();
    $('cfForm').hidden = true; $('cfOk').hidden = false;
  });
  $('cfAgain').addEventListener('click', function(){ $('cfForm').reset(); $('cfOk').hidden = true; $('cfForm').hidden = false; lastCf = null; });
  function prefill(btn){
    if(!$('cfOk').hidden) $('cfAgain').click();
    var kind = btn.getAttribute('data-prefill');
    $('cfTopic').value = kind === 'job' ? 'job' : 'event';
    $('cfMsg').value = kind === 'job' ? t('msg_job', { j:t(btn.getAttribute('data-job')) }) : t('msg_event');
    var ct = $('contact'); if(ct.scrollIntoView) ct.scrollIntoView({ behavior:'smooth', block:'start' });
    setTimeout(function(){ try{ ($('cfName').value ? $('cfMsg') : $('cfName')).focus({ preventScroll:true }); }catch(err){} }, 500);
  }

  /* newsletter */
  $('newsForm').addEventListener('submit', function(e){
    e.preventDefault();
    var em = $('newsEmail');
    if(!emailOk(em.value.trim())){ em.classList.add('bad'); $('newsErr').textContent = t('e_email'); em.focus(); return; }
    em.classList.remove('bad'); $('newsErr').textContent = '';
    $('newsForm').hidden = true; $('newsOk').hidden = false;
  });

  /* delivery zone */
  var lastZone = null;
  function norm(s){ return s.toLowerCase().replace(/[šś]/g,'s').replace(/đ/g,'dj').replace(/[čć]/g,'c').replace(/ž/g,'z').replace(/\s+/g,' ').trim(); }
  function renderZone(){
    var out = $('zoneOut');
    if(!lastZone){ out.textContent = ''; out.className = 'zone-out'; return; }
    out.className = 'zone-out ' + (lastZone === 'z_yes' || lastZone === 'z_near' ? 'yes' : (lastZone === 'z_no' ? 'no' : ''));
    out.textContent = t(lastZone);
  }
  function checkZone(){
    var v = norm($('zoneInput').value);
    if(!v) lastZone = 'z_empty';
    else {
      var vv = v.replace(/dj/g,'d');
      function hit(list){ return list.some(function(z){ return vv.indexOf(z) > -1 || (vv.length > 3 && z.indexOf(vv) > -1); }); }
      lastZone = hit(IN_ZONE) ? 'z_yes' : (hit(NEAR) ? 'z_near' : 'z_no');
    }
    renderZone();
  }
  $('zoneBtn').addEventListener('click', checkZone);
  $('zoneInput').addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); checkZone(); } });

  /* ================================================================
     14. Nav, mobile menu, cookie, back to top
     ================================================================ */
  var nav = $('nav'), toTop = $('toTop');
  function onScrollUi(){
    var y = window.scrollY || window.pageYOffset || 0;
    nav.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 1200);
  }
  window.addEventListener('scroll', onScrollUi, { passive:true });
  toTop.addEventListener('click', function(){ window.scrollTo({ top:0, behavior:'smooth' }); });
  $('burgerBtn').addEventListener('click', function(){ openLayer(mobileMenu, $('mobileClose')); });
  $('mobileClose').addEventListener('click', function(){ closeLayer(mobileMenu); });
  mobileMenu.addEventListener('click', function(e){ if(e.target.tagName === 'A') closeLayer(mobileMenu); });

  (function cookieBar(){
    var bar = $('cookie');
    if(LS.get('lastember.cookie')) return;
    setTimeout(function(){ bar.classList.add('show'); }, 1400);
    function done(v, msg){ LS.set('lastember.cookie', v); bar.classList.remove('show'); toast(t(msg)); }
    $('ckOnly').addEventListener('click', function(){ done('essential', 'ck_t1'); });
    $('ckAll').addEventListener('click', function(){ done('all', 'ck_t2'); });
  })();

  /* ================================================================
     15. Language switch
     ================================================================ */
  function renderAll(){
    applyStatic();
    renderMarquee(); renderSpecials(); renderTabs(); renderMenu(); renderCombos(); renderVouchers();
    renderGallery(); renderStars(); renderStamps(); renderFaq(); renderHours(); renderStatus();
    buildSlots(); updateCartUI(); renderOrder(); renderRes(); renderCf(); renderZone();
    if(isOpen(itemModal)) fillItem();
    if(isOpen(legalModal)) fillLegal();
    if(isOpen(lb)) showLb();
  }
  function setLang(l){
    if(l !== 'en' && l !== 'sr') return;
    lang = l; LS.set('lastember.lang', l);
    renderAll();
  }

  /* ================================================================
     16. Scroll-scrub hero
     ================================================================ */
  var journey = $('top'), rig = $('rig'), glow = $('glow');
  var chapters = Array.prototype.slice.call(document.querySelectorAll('.chapter'));
  var cue = document.querySelector('.scroll-cue');
  var G = { patty:$('patty'), cheese:$('cheese'), lettuce:$('lettuce'), tomato:$('tomato'), bunTop:$('bunTop'), steam:$('steam') };
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = mq ? mq.matches : false;
  function clamp01(x){ return Math.min(Math.max(x, 0), 1); }
  function smooth(a, b, x){ var k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k); }
  function layer(el, k, dy){ if(!el) return; el.style.opacity = k; el.setAttribute('transform', 'translate(0 ' + ((1 - k) * dy).toFixed(2) + ')'); }
  function chapterOpacity(p, i, n){
    var s = i / n, e = (i + 1) / n;
    var fin = i === 0 ? 1 : smooth(s, s + 0.05, p);
    var fout = i === n - 1 ? 1 : 1 - smooth(e - 0.05, e, p);
    return Math.min(fin, fout);
  }
  function renderHero(p){
    layer(G.patty, smooth(0.08, 0.22, p), 30);
    layer(G.cheese, smooth(0.28, 0.40, p), 16);
    layer(G.lettuce, smooth(0.36, 0.48, p), 0);
    layer(G.tomato, smooth(0.42, 0.52, p), 0);
    layer(G.bunTop, smooth(0.56, 0.72, p), -36);
    G.steam.style.opacity = (smooth(0.62, 0.82, p) * 0.9).toFixed(2);
    glow.setAttribute('opacity', (0.35 + p * 0.65).toFixed(2));
    rig.setAttribute('transform', 'translate(300 380) scale(' + (1 + p * 0.14).toFixed(3) + ') translate(-300 -380)');
    chapters.forEach(function(c, i){
      var o = chapterOpacity(p, i, chapters.length);
      c.style.opacity = o;
      c.style.transform = 'translateY(' + ((1 - o) * 14).toFixed(1) + 'px)';
      c.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
      c.setAttribute('aria-hidden', o < 0.05 ? 'true' : 'false');
    });
    cue.style.opacity = (1 - smooth(0, 0.06, p)).toFixed(2);
  }
  function progress(){
    var r = journey.getBoundingClientRect();
    var total = journey.offsetHeight - window.innerHeight;
    return total <= 0 ? 1 : clamp01(-r.top / total);
  }
  if(reduced){
    journey.classList.add('reduced');
    renderHero(1);
    chapters.forEach(function(c){ c.setAttribute('aria-hidden', 'false'); });
  } else {
    var ticking = false;
    var onHero = function(){ if(!ticking){ ticking = true; requestAnimationFrame(function(){ renderHero(progress()); ticking = false; }); } };
    window.addEventListener('scroll', onHero, { passive:true });
    window.addEventListener('resize', onHero);
    renderHero(progress());
  }

  /* ================================================================
     17. Start
     ================================================================ */
  renderAll();
  onScrollUi();
  statusTimer = setInterval(function(){ renderStatus(); }, 30000);
})();
