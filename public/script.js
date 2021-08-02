import * as THREE from './three-module.js'

(function () { 'use strict';       
                    
   window.threejs = () => {

     if (window.threejsstate){
       console.log("threejs is already active")
       document.getElementById("canvascontainer").children[0].remove()
     }
     
     window.threejsstate = true
     
let renderer, scene, camera;

let line;
const MAX_POINTS = 15000;
let drawCount;

init();
animate();

function init() {

	// info
	const info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '30px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	info.style.color = '#fff';
	info.style.fontWeight = 'bold';
	info.style.backgroundColor = 'transparent';
	info.style.zIndex = '1';
	info.style.fontFamily = 'Monospace';
	info.innerHTML = "";
	document.body.appendChild( info );

	// renderer
	renderer = new THREE.WebGLRenderer();
  renderer.id = "threejs"
	renderer.setPixelRatio( window.devicePixelRatio );
/* 	renderer.setSize( window.innerWidth, window.innerHeight ); */
	renderer.setSize( 200, 200 );
  // renderer.setSize( 400, 400 );
	document.getElementById("canvascontainer").prepend( renderer.domElement );

	// scene
	scene = new THREE.Scene();
  scene.background = new THREE.Color( window.backgroundColor );
  
	// camera
	camera = new THREE.PerspectiveCamera( 45, 400 / 400, 1, 10000 );
	camera.position.set( 0, 0, 1000 );

	// geometry
	const geometry = new THREE.BufferGeometry();

	// attributes
	const positions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

	// drawcalls
	drawCount = 2; // draw the first 2 points, only
	geometry.setDrawRange( 0, drawCount );

	// material
	// const material = new THREE.LineBasicMaterial( { color: 0xFFFDEC } );
  const material = new THREE.LineBasicMaterial( { color: window.accentColor } );
  
	// line
	line = new THREE.Line( geometry,  material );
	scene.add( line );

	// update positions
	updatePositions();

}

// update positions
function updatePositions() {

	const positions = line.geometry.attributes.position.array;

	let x, y, z, index;
	x = y = z = index = 0;

	for ( let i = 0, l = MAX_POINTS; i < l; i ++ ) {

		positions[ index ++ ] = x;
		positions[ index ++ ] = y;
		positions[ index ++ ] = z;
    
		x += ( Math.random() - 0.5 ) * 30;
    if (x > 399){
    x = x - 30
    } else if (x < -399){
    x = x + 30
    }

		y += ( Math.random() - 0.5 ) * 30;
    if (y > 399){
    y = y - 30
    } else if (y < -399){
    y = y + 30
    }

		z += ( Math.random() - 0.5 ) * 30;
    if (z > 399){
    z = z - 30
    } else if (z < -399){
    z = z + 30
    }
	}
  
	
}

// render
function render() {

	renderer.render( scene, camera );

}

// animate
function animate() {

  setTimeout(function(){ 
	requestAnimationFrame( animate );

	drawCount = ( drawCount + 1 ) % MAX_POINTS;

	line.geometry.setDrawRange( 0, drawCount );

	if ( drawCount === 0 ) {

		// periodically, generate new data
    
		updatePositions();

		line.geometry.attributes.position.needsUpdate = true; // required after the first render

		/* line.material.color.setHSL( Math.random(), 1, 0.5 ); */

	}

	render();
}, 40);
  
}

              }
              
              
// shortcuts for easier to read formulas

var PI   = Math.PI,
    sin  = Math.sin,
    cos  = Math.cos,
    tan  = Math.tan,
    asin = Math.asin,
    atan = Math.atan2,
    acos = Math.acos,
    rad  = PI / 180;

// sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas


// date/time constants and conversions

var dayMs = 1000 * 60 * 60 * 24,
    J1970 = 2440588,
    J2000 = 2451545;

function toJulian(date) { return date.valueOf() / dayMs - 0.5 + J1970; }
function fromJulian(j)  { return new Date((j + 0.5 - J1970) * dayMs); }
function toDays(date)   { return toJulian(date) - J2000; }


// general calculations for position

var e = rad * 23.4397; // obliquity of the Earth

function rightAscension(l, b) { return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l)); }
function declination(l, b)    { return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l)); }

function azimuth(H, phi, dec)  { return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi)); }
function altitude(H, phi, dec) { return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H)); }

function siderealTime(d, lw) { return rad * (280.16 + 360.9856235 * d) - lw; }

function astroRefraction(h) {
    if (h < 0) // the following formula works for positive altitudes only.
        h = 0; // if h = -0.08901179 a div/0 would occur.

    // formula 16.4 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
    // 1.02 / tan(h + 10.26 / (h + 5.10)) h in degrees, result in arc minutes -> converted to rad:
    return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
}

// general sun calculations

function solarMeanAnomaly(d) { return rad * (357.5291 + 0.98560028 * d); }

function eclipticLongitude(M) {

    var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), // equation of center
        P = rad * 102.9372; // perihelion of the Earth

    return M + C + P + PI;
}

function sunCoords(d) {

    var M = solarMeanAnomaly(d),
        L = eclipticLongitude(M);

    return {
        dec: declination(L, 0),
        ra: rightAscension(L, 0)
    };
}


var SunCalc = {};


// calculates sun position for a given date and latitude/longitude

SunCalc.getPosition = function (date, lat, lng) {

    var lw  = rad * -lng,
        phi = rad * lat,
        d   = toDays(date),

        c  = sunCoords(d),
        H  = siderealTime(d, lw) - c.ra;

    return {
        azimuth: azimuth(H, phi, c.dec),
        altitude: altitude(H, phi, c.dec)
    };
};


// sun times configuration (angle, morning name, evening name)

var times = SunCalc.times = [
    [-0.833, 'sunrise',       'sunset'      ],
    [  -0.3, 'sunriseEnd',    'sunsetStart' ],
    [    -6, 'dawn',          'dusk'        ],
    [   -12, 'nauticalDawn',  'nauticalDusk'],
    [   -18, 'nightEnd',      'night'       ],
    [     6, 'goldenHourEnd', 'goldenHour'  ]
];

// adds a custom time to the times config

SunCalc.addTime = function (angle, riseName, setName) {
    times.push([angle, riseName, setName]);
};


// calculations for sun times

var J0 = 0.0009;

function julianCycle(d, lw) { return Math.round(d - J0 - lw / (2 * PI)); }

function approxTransit(Ht, lw, n) { return J0 + (Ht + lw) / (2 * PI) + n; }
function solarTransitJ(ds, M, L)  { return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L); }

function hourAngle(h, phi, d) { return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d))); }
function observerAngle(height) { return -2.076 * Math.sqrt(height) / 60; }

// returns set time for the given sun altitude
function getSetJ(h, lw, phi, dec, n, M, L) {

    var w = hourAngle(h, phi, dec),
        a = approxTransit(w, lw, n);
    return solarTransitJ(a, M, L);
}


// calculates sun times for a given date, latitude/longitude, and, optionally,
// the observer height (in meters) relative to the horizon

SunCalc.getTimes = function (date, lat, lng, height) {

    height = height || 0;

    var lw = rad * -lng,
        phi = rad * lat,

        dh = observerAngle(height),

        d = toDays(date),
        n = julianCycle(d, lw),
        ds = approxTransit(0, lw, n),

        M = solarMeanAnomaly(ds),
        L = eclipticLongitude(M),
        dec = declination(L, 0),

        Jnoon = solarTransitJ(ds, M, L),

        i, len, time, h0, Jset, Jrise;


    var result = {
        solarNoon: fromJulian(Jnoon),
        nadir: fromJulian(Jnoon - 0.5)
    };

    for (i = 0, len = times.length; i < len; i += 1) {
        time = times[i];
        h0 = (time[0] + dh) * rad;

        Jset = getSetJ(h0, lw, phi, dec, n, M, L);
        Jrise = Jnoon - (Jset - Jnoon);

        result[time[1]] = fromJulian(Jrise);
        result[time[2]] = fromJulian(Jset);
    }

    return result;
};


// moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas

function moonCoords(d) { // geocentric ecliptic coordinates of the moon

    var L = rad * (218.316 + 13.176396 * d), // ecliptic longitude
        M = rad * (134.963 + 13.064993 * d), // mean anomaly
        F = rad * (93.272 + 13.229350 * d),  // mean distance

        l  = L + rad * 6.289 * sin(M), // longitude
        b  = rad * 5.128 * sin(F),     // latitude
        dt = 385001 - 20905 * cos(M);  // distance to the moon in km

    return {
        ra: rightAscension(l, b),
        dec: declination(l, b),
        dist: dt
    };
}

SunCalc.getMoonPosition = function (date, lat, lng) {

    var lw  = rad * -lng,
        phi = rad * lat,
        d   = toDays(date),

        c = moonCoords(d),
        H = siderealTime(d, lw) - c.ra,
        h = altitude(H, phi, c.dec),
        // formula 14.1 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
        pa = atan(sin(H), tan(phi) * cos(c.dec) - sin(c.dec) * cos(H));

    h = h + astroRefraction(h); // altitude correction for refraction

    return {
        azimuth: azimuth(H, phi, c.dec),
        altitude: h,
        distance: c.dist,
        parallacticAngle: pa
    };
};


// calculations for illumination parameters of the moon,
// based on http://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.pro formulas and
// Chapter 48 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.

SunCalc.getMoonIllumination = function (date) {

    var d = toDays(date || new Date()),
        s = sunCoords(d),
        m = moonCoords(d),

        sdist = 149598000, // distance from Earth to Sun in km

        phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)),
        inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi)),
        angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) -
                cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));

    return {
        fraction: (1 + cos(inc)) / 2,
        phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
        angle: angle
    };
};


function hoursLater(date, h) {
    return new Date(date.valueOf() + h * dayMs / 24);
}

// calculations for moon rise/set times are based on http://www.stargazing.net/kepler/moonrise.html article

SunCalc.getMoonTimes = function (date, lat, lng, inUTC) {
    var t = new Date(date);
    if (inUTC) t.setUTCHours(0, 0, 0, 0);
    else t.setHours(0, 0, 0, 0);

    var hc = 0.133 * rad,
        h0 = SunCalc.getMoonPosition(t, lat, lng).altitude - hc,
        h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;

    // go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
    for (var i = 1; i <= 24; i += 2) {
        h1 = SunCalc.getMoonPosition(hoursLater(t, i), lat, lng).altitude - hc;
        h2 = SunCalc.getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;

        a = (h0 + h2) / 2 - h1;
        b = (h2 - h0) / 2;
        xe = -b / (2 * a);
        ye = (a * xe + b) * xe + h1;
        d = b * b - 4 * a * h1;
        roots = 0;

        if (d >= 0) {
            dx = Math.sqrt(d) / (Math.abs(a) * 2);
            x1 = xe - dx;
            x2 = xe + dx;
            if (Math.abs(x1) <= 1) roots++;
            if (Math.abs(x2) <= 1) roots++;
            if (x1 < -1) x1 = x2;
        }

        if (roots === 1) {
            if (h0 < 0) rise = i + x1;
            else set = i + x1;

        } else if (roots === 2) {
            rise = i + (ye < 0 ? x2 : x1);
            set = i + (ye < 0 ? x1 : x2);
        }

        if (rise && set) break;

        h0 = h2;
    }

    var result = {};

    if (rise) result.rise = hoursLater(t, rise);
    if (set) result.set = hoursLater(t, set);

    if (!rise && !set) result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = true;

    return result;
};


// export as Node module / AMD module / browser variable
if (typeof exports === 'object' && typeof module !== 'undefined') module.exports = SunCalc;
else if (typeof define === 'function' && define.amd) define(SunCalc);
else window.SunCalc = SunCalc;

}());
      
      function getTimes(data){
        console.log(data)
        // data.longitude = 180
      window.origLongitude = data.longitude

  function checkColors (data, prevAccentColor, prevBackgroundColor){
            
          // data.longitude = 20.7783
          // data.longitude = -180
          // data.longitude = 100
          // data.longitude = 114;
          // data.latitude = 22
          // hong kong 22.3193° N, 114.1694° E

           var times = SunCalc.getTimes(new Date(), data.latitude, data.longitude);
        if (!window.threejsstate){
        // console.log(data.latitude, data.longitude) 
        console.log(times)
        // console.log("is times")
        }
        
           // let sunrise = JSON.stringify(times.sunrise)
           // let sunset = JSON.stringify(times.sunset)
           
const sunrise = times.sunrise.valueOf()
const sunset = times.sunset.valueOf()
const noon = times.solarNoon.valueOf()
const dateNow = Date.now()
        
        // console.log(sunrise, "is sunrise time for today")
        // console.log(sunset, "is sunset time for today")
       
const coolWhite = "#F2F3FF"
const warmWhite = "#FFFDEC"
let accentColor
let backgroundColor
let newsFilter
let favicon
window.colorOptionsArray = ["after solar noon but before sunset", "after sunrise but before solar noon", "before sunrise", "before nadir"]
       if (dateNow > sunrise && dateNow < sunset && dateNow > noon){
         window.colorOptionsArray.splice(0, 1)
         window.timeStatus = "it's after solar noon but before sunset"
         
          accentColor = "black"
          backgroundColor = warmWhite
          newsFilter = "contrast(3) grayscale(1) sepia(1)"
          favicon = "https://cdn.glitch.com/5f97e950-5a7a-4477-b953-b147a9bfa2c6%2Ffaviconcolors-60.svg?v=1627938519610"
         if (!prevAccentColor || prevAccentColor != accentColor || prevBackgroundColor != backgroundColor){
           console.log(window.timeStatus)
         }
       } else if (dateNow > sunrise && dateNow < sunset && dateNow < noon){
         window.colorOptionsArray.splice(1, 1)
         window.timeStatus = "it's after sunrise but before solar noon"
          accentColor = "black"
          backgroundColor = coolWhite
          newsFilter = "invert(1) contrast(3) grayscale(1) sepia(1) invert(1)"
          favicon = "https://cdn.glitch.com/5f97e950-5a7a-4477-b953-b147a9bfa2c6%2Ffaviconcolors-61.svg?v=1627938519610"
           if (!prevAccentColor || prevAccentColor != accentColor || prevBackgroundColor != backgroundColor){
           console.log(window.timeStatus)
         }
       } else if (dateNow < sunrise){
         window.colorOptionsArray.splice(2, 1)
         window.timeStatus = "it's before sunrise"
          backgroundColor = "black"
          accentColor = coolWhite
          newsFilter = "contrast(3) grayscale(1) sepia(1) invert(1)"
          favicon = "https://cdn.glitch.com/5f97e950-5a7a-4477-b953-b147a9bfa2c6%2Ffaviconcolors-63.svg?v=1627938519610"
           if (!prevAccentColor || prevAccentColor != accentColor || prevBackgroundColor != backgroundColor){
           console.log(window.timeStatus)
         }
       } else if (dateNow > sunset){
         window.colorOptionsArray.splice(3, 1)
         window.timeStatus = "it's after sunset and before nadir"
          backgroundColor = "black"
          accentColor = warmWhite
          newsFilter = "invert(1) contrast(3) grayscale(1) sepia(1)"
          favicon = "https://cdn.glitch.com/5f97e950-5a7a-4477-b953-b147a9bfa2c6%2Ffaviconcolors-62.svg?v=1627938519610"
           if (!prevAccentColor || prevAccentColor != accentColor || prevBackgroundColor != backgroundColor){
           console.log(window.timeStatus)
         }
       }
    
  if (!prevAccentColor || prevAccentColor != accentColor || prevBackgroundColor != backgroundColor){
definemoreInfoText()
window.accentColor = accentColor
window.backgroundColor = backgroundColor
window.favicon = favicon
    if (document.getElementById("favicon")){
document.getElementById("favicon").href = favicon
    }
    
        document.body.style.backgroundColor = backgroundColor
        // document.getElementById("Layer_1").style.fill = accentColor
        // document.getElementById("animation").style.fill = accentColor
        document.querySelectorAll(".st11").forEach(element => element.style.stroke = accentColor)
        let root = document.documentElement;
       root.style.setProperty('--accent-color', accentColor);
       root.style.setProperty('--background-color', backgroundColor)
       root.style.setProperty('--news-filter', newsFilter)
        window.backgroundColor = backgroundColor
        window.accentColor = accentColor
        window.threejs();
    }
            }
        
        checkColors(data);
        
        window.times = 0;
        window.debug = false;
        setInterval(function(data){
          const longitude = data.longitude
          if (window.debug){
          if (window.times === 0){
          data.longitude = 100;
          }
          if (window.times === 1){
          data.longitude = 20.7783
          }
          if (window.times === 2){
          data.longitude = -180
          }
          if (window.times > 2){
          data.longitude = window.origLongitude
          }
          window.times++
          }
          
          // console.log("checked!")
          const accentColor = window.accentColor
          const backgroundColor = window.backgroundColor
          checkColors(data, accentColor, backgroundColor)
        }, 30000, data)
        
            
window.time2 = Date.now()
anime({
  targets: '.st11',
  strokeDashoffset: [0, anime.setDashoffset],
  easing: 'easeInOutSine',
  duration: 600,
  delay: function(el, i) { return i * 50 },
  direction: 'alternate',
  loop: false
});
        console.log(window.time2 - window.time1)
          
                  setTimeout(function(){
                    Array.from(document.getElementById("animation").children).forEach(element => element.style.opacity=0)
                    document.getElementById("animation").style.opacity = 0;
                    document.getElementById("Layer_1").style.opacity= 1
                    
                   setTimeout(function(){
                    document.getElementById("animation").style.display = "none"
// document.getElementsByClassName("parentparent")[0].style.opacity= 1                     
}, 1000);

                  setTimeout(function(){
                    
                     }, 2200);
                    let root = document.documentElement;
       root.style.setProperty('--document-fade', "background-color 1s linear, color 1s linear, border-color 1s linear, opacity 1s linear");
                  }, 2200);
    
        
      }

console.log("about to get times eval!")
getTimes(window.eval)

