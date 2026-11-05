import { esc } from './util.js';
import { photoUrl } from '../data/photos.js';

export const SH='<ellipse class="sh" cx="100" cy="172" rx="56" ry="7"/>';
export const ART={
 grinder:SH+'<rect class="c2" x="64" y="132" width="72" height="36" rx="6"/><path class="c3" d="M72 132L78 76Q100 66 122 76L128 132Z"/><rect class="c1" x="92" y="44" width="16" height="30" rx="3"/><rect class="c1" x="62" y="36" width="76" height="9" rx="4.5"/><circle class="c2" cx="138" cy="40" r="7"/>',
 glasses:SH+'<path class="gl" d="M46 84h48l-5 84H51z"/><path class="c2" d="M50 130h40l-1 38H51z"/><path class="gl" d="M110 100h44l-4 68h-36z"/><path class="c1" d="M113 140h38l-1 28h-36z"/>',
 mug:SH+'<rect class="c3" x="60" y="86" width="68" height="82" rx="10"/><path class="s2" stroke-width="9" d="M128 104h10a14 14 0 010 38h-10"/><rect class="c1" x="60" y="86" width="68" height="14" rx="7"/><path class="s1" stroke-width="3" d="M84 70q-6-10 0-20M104 70q-6-10 0-20"/>',
 pan:SH+'<ellipse class="c1" cx="92" cy="134" rx="62" ry="24"/><ellipse class="c3" cx="92" cy="128" rx="52" ry="17"/><rect class="c2" x="146" y="124" width="46" height="9" rx="4.5"/>',
 book:SH+'<rect class="c1" x="42" y="140" width="116" height="26" rx="3"/><rect class="c2" x="52" y="113" width="100" height="26" rx="3"/><rect class="c3" x="38" y="86" width="108" height="26" rx="3"/><rect class="c1" x="52" y="96" width="40" height="5" rx="2"/>',
 vase:SH+'<path class="c2" d="M84 70h32l-4 22c26 20 26 56 6 80H82c-20-24-20-60 6-80z"/><path class="s1" stroke-width="3" d="M100 70V30M100 56l22-22M100 50L78 28"/><circle class="c1" cx="122" cy="32" r="6"/><circle class="c1" cx="78" cy="26" r="6"/><circle class="c1" cx="100" cy="28" r="6"/>',
 sneaker:SH+'<path class="c1" d="M30 150L34 106Q56 112 70 98L80 82Q100 96 126 106Q166 112 172 142L172 158H30z"/><rect class="c3" x="28" y="150" width="146" height="16" rx="8"/><path class="s3" stroke-width="3" d="M84 98l10 8M96 104l10 8"/>',
 tent:SH+'<path class="c2" d="M100 52L180 168H20z"/><path class="c1" d="M100 52L130 168H70z"/><path class="s3" stroke-width="3" d="M100 52v116"/>',
 suitcase:SH+'<rect class="c1" x="42" y="78" width="116" height="90" rx="10"/><path class="s2" stroke-width="8" d="M84 78V62h32v16"/><rect class="c3" x="64" y="78" width="9" height="90"/><rect class="c3" x="127" y="78" width="9" height="90"/>',
 ticket:SH+'<path class="c3" d="M24 66h152v30a12 12 0 000 24v30H24v-30a12 12 0 000-24z"/><path class="s1" stroke-width="3" stroke-dasharray="5 6" d="M136 72v90"/><rect class="c1" x="42" y="86" width="64" height="8" rx="4"/><rect class="c2" x="42" y="104" width="44" height="8" rx="4"/><circle class="c1" cx="156" cy="116" r="9"/>',
 headphones:SH+'<path class="s1" stroke-width="11" d="M54 122V104a46 46 0 0192 0v18"/><rect class="c2" x="42" y="114" width="26" height="50" rx="12"/><rect class="c2" x="132" y="114" width="26" height="50" rx="12"/>',
 sweater:SH+'<path class="c2" d="M70 52L36 82l18 32 18-8v64h56v-64l18 8 18-32-34-30Q100 70 70 52z"/><path class="c1" d="M78 56Q100 76 122 56l-6-4Q100 64 84 52z"/>',
 lamp:SH+'<path class="c2" d="M68 56h64l16 56H52z"/><rect class="c1" x="97" y="112" width="6" height="48"/><ellipse class="c1" cx="100" cy="164" rx="30" ry="7"/>',
 scale:SH+'<rect class="c1" x="46" y="116" width="108" height="48" rx="9"/><rect class="c3" x="62" y="128" width="46" height="20" rx="3"/><circle class="c2" cx="130" cy="140" r="11"/>',
 knife:SH+'<path class="c3" d="M34 150L126 68Q146 60 154 78L58 154z"/><rect class="c1" x="130" y="40" width="22" height="70" rx="6" transform="rotate(42 141 75)"/>',
 pot:SH+'<rect class="c1" x="44" y="98" width="112" height="66" rx="16"/><rect class="c2" x="38" y="88" width="124" height="14" rx="7"/><circle class="c3" cx="100" cy="76" r="8"/><rect class="c2" x="26" y="118" width="18" height="8" rx="4"/><rect class="c2" x="156" y="118" width="18" height="8" rx="4"/>',
 sticks:SH+'<path class="s1" stroke-width="7" d="M68 36L92 166M132 36L108 166"/><rect class="c2" x="58" y="28" width="22" height="34" rx="9" transform="rotate(-8 69 45)"/><rect class="c2" x="120" y="28" width="22" height="34" rx="9" transform="rotate(8 131 45)"/><ellipse class="c3" cx="92" cy="156" rx="12" ry="5"/><ellipse class="c3" cx="108" cy="156" rx="12" ry="5"/>',
 compass:SH+'<circle class="c1" cx="100" cy="100" r="62"/><circle class="c3" cx="100" cy="100" r="50"/><path class="c2" d="M100 56l12 44-12 44-12-44z" transform="rotate(35 100 100)"/><circle class="c1" cx="100" cy="100" r="5"/>',
 journal:SH+'<rect class="c1" x="58" y="40" width="88" height="128" rx="7"/><rect class="c2" x="132" y="40" width="9" height="128"/><rect class="c3" x="72" y="68" width="48" height="6" rx="3"/><rect class="c3" x="72" y="82" width="32" height="6" rx="3"/>',
 teapot:SH+'<path class="c3" d="M56 100h88a10 10 0 0110 10v18a38 38 0 01-38 38H84a38 38 0 01-38-38v-18a10 10 0 0110-10z" transform="translate(-4 0)"/><path class="s1" stroke-width="8" d="M148 116c20 0 24 22 6 30"/><path class="c1" d="M42 110l-22-16 4 22 20 10z"/><rect class="c1" x="76" y="88" width="52" height="14" rx="7"/><circle class="c2" cx="102" cy="82" r="7"/>',
 game:SH+'<rect class="c1" x="46" y="94" width="72" height="72" rx="13"/><rect class="c2" x="104" y="62" width="62" height="62" rx="11" transform="rotate(14 135 93)"/><circle class="c3" cx="66" cy="114" r="6"/><circle class="c3" cx="98" cy="146" r="6"/><circle class="c3" cx="82" cy="130" r="6"/><circle class="c1" cx="135" cy="93" r="7"/>',
 bottle:SH+'<rect class="c1" x="76" y="72" width="48" height="96" rx="15"/><rect class="c2" x="88" y="46" width="24" height="30" rx="6"/><rect class="c3" x="76" y="104" width="48" height="26"/>',
 gift:SH+'<rect class="c2" x="42" y="92" width="116" height="76" rx="6"/><rect class="c1" x="38" y="76" width="124" height="22" rx="5"/><rect class="c3" x="91" y="76" width="18" height="92"/><path class="s3" stroke-width="7" d="M100 76c-20-30-48-14-32 0M100 76c20-30 48-14 32 0"/>',
 mountain:SH+'<path class="c2" d="M16 168L82 66l34 54 24-32 48 80z"/><path class="c3" d="M82 66l18 28-14-6-12 10z"/><circle class="c1" cx="150" cy="44" r="12"/>',
 plant:SH+'<path class="c2" d="M66 124h68l-10 44H76z"/><path class="c1" d="M100 124C70 118 62 84 84 70c12 8 20 28 16 54zM100 124c28-10 40-44 18-62-14 10-22 32-18 62z"/><path class="c3" d="M100 124C98 100 98 86 100 70c3 18 3 34 0 54z"/>'
};
const photoTag=(url,cls='')=>url?`<img class="ph ${cls}" src="${url}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onload="this.classList.add('in')" onerror="this.remove()">`:'';

/* Kachel: Foto, falls im Manifest vorhanden. Die Illustration liegt darunter und
   dient als Platzhalter und Fallback, wenn ein Foto nicht lädt. */
ART.kettle=ART.teapot; ART.cooking=ART.pan; ART.animals=ART.ticket; // Illustrationen als Fallback

export function art(kind,tone=0,cls=''){
  return `<span class="art t${tone} ${cls}" aria-hidden="true"><svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">${ART[kind]||ART.gift}</svg>${photoTag(photoUrl(kind,640))}</span>`;
}
export const obj=(k,x,y,s,t)=>`<g class="t${t}" transform="translate(${x-100*s} ${y-172*s}) scale(${s})">${ART[k]}</g>`;
export const cons=(top)=>`<rect x="30" y="338" width="340" height="16" rx="3" fill="${top}"/><rect x="42" y="354" width="316" height="14" fill="${top}" opacity=".85"/><rect x="52" y="368" width="12" height="80" fill="${top}"/><rect x="336" y="368" width="12" height="80" fill="${top}"/>`;
export const tiles=()=>{let o='<g stroke="#fff" stroke-opacity=".45" stroke-width="2">';for(let r=0;r<12;r++){o+=`<line x1="0" x2="400" y1="${r*28+10}" y2="${r*28+10}"/>`;for(let x=(r%2)*28;x<400;x+=56)o+=`<line x1="${x}" x2="${x}" y1="${r*28+10}" y2="${r*28+38}"/>`}return o+'</g>'};
export const planks=()=>{let o='<g stroke="#A98A62" stroke-opacity=".55" stroke-width="2">';for(let i=1;i<9;i++)o+=`<line x1="0" x2="400" y1="${i*62}" y2="${i*62}"/>`;return o+'</g>'};
export const SC={
 flur:{wall:['#E9E1D3','#DDD2BF'],fy:440,floor:['#B79B76','#9F8260'],deco:cons('#7C5E3F')+'<rect x="150" y="46" width="120" height="104" fill="#F7F2E8" stroke="#2E3B2F" stroke-width="5"/><circle cx="195" cy="100" r="22" fill="#B9835A" opacity=".85"/><path d="M160 140 Q210 90 262 140Z" fill="#8A9A77" opacity=".9"/>'},
 abend:{wall:['#CDBA9D','#BBA583'],fy:440,floor:['#8E7452','#765D40'],deco:'<polygon points="250,0 400,0 400,280 190,280" fill="#FFF3D6" opacity=".38"/><rect x="326" y="0" width="74" height="300" fill="#6F7B66" opacity=".55"/>'+cons('#5C4330')},
 kaffee:{wall:['#CBD3BE','#BAC4AB'],fy:500,floor:['#BAC4AB','#BAC4AB'],deco:tiles()+'<rect x="40" y="112" width="160" height="8" fill="#C79F6F"/><rect x="0" y="338" width="400" height="18" fill="#C79F6F"/><rect x="0" y="356" width="400" height="144" fill="#8A9A77"/>'+obj('mug',85,112,.55,5)+obj('mug',150,112,.55,2)},
 schmoren:{wall:['#D9C2A5','#CBB090'],fy:500,floor:['#CBB090','#CBB090'],deco:'<rect x="40" y="80" width="320" height="5" fill="#4A3628"/><rect x="0" y="338" width="400" height="162" fill="#4A3628"/><rect x="0" y="338" width="400" height="14" fill="#6B4E37"/>'},
 huette:{wall:['#CFE0E4','#EBE5D3'],fy:330,floor:['#8A9A77','#6F7B66'],deco:'<circle cx="318" cy="88" r="34" fill="#FBF3D8" opacity=".9"/><path d="M0 330 L90 190 L150 260 L230 150 L330 270 L400 210 L400 330Z" fill="#9FB0A6"/><path d="M0 330 L120 250 L210 300 L300 230 L400 300 L400 330Z" fill="#7F9484"/>'},
 packen:{wall:['#C9AB80','#BE9F73'],fy:500,floor:['#BE9F73','#BE9F73'],deco:planks()+'<rect x="40" y="230" width="320" height="230" rx="10" fill="#E9E0CC" opacity=".82"/>'}
};
export function sceneSvg(l){
  const Z=SC[l.scene],id=l.id;
  return `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(l.t)}"><defs>
   <linearGradient id="w${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${Z.wall[0]}"/><stop offset="1" stop-color="${Z.wall[1]}"/></linearGradient>
   <linearGradient id="f${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${Z.floor[0]}"/><stop offset="1" stop-color="${Z.floor[1]}"/></linearGradient>
   <radialGradient id="L${id}" cx=".2" cy=".1" r="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient>
   <radialGradient id="V${id}" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>
   <filter id="g${id}"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 0"/></filter></defs>
   <rect width="400" height="${Z.fy}" fill="url(#w${id})"/><rect y="${Z.fy}" width="400" height="${500-Z.fy}" fill="url(#f${id})"/>
   ${Z.deco}${l.objs.map(o=>obj(o.k,o.x,o.y,o.s,o.tone)).join('')}
   <rect width="400" height="500" fill="url(#L${id})"/><rect width="400" height="500" fill="url(#V${id})"/><rect width="400" height="500" filter="url(#g${id})" opacity=".14"/></svg>`;
}


/* Creator-Looks: Foto mit SVG-Szene als Fallback. */
export const sceneImg=l=>sceneSvg(l)+photoTag(photoUrl('look:'+l.id,1000));
/* Einzelprodukt eines Creators: nutzt das Foto der Produktart. */
export const pimg=x=>art(x.a,x.tone);

/* Nur die Illustration (für statische Seiten als Fallback unter dem Foto). */
export const illustration=kind=>`<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${ART[kind]||ART.gift}</svg>`;

/* Nur die Illustration, ohne Foto: für Angebote, bei denen ein Stockfoto zum Produkt nicht passen würde. */
export const artIllu=(kind,tone=0)=>`<span class="art t${tone}" aria-hidden="true">${illustration(kind)}</span>`;
