var i=1;
global.clientConnectionReady = function(mysqlclient,callback) 
	{
		mysqlclient.query('use adserve', function(error, results) { 
	        if(error) { 
	            console.log('ClientConnectionReady Error: ' + error.message+',re-connect! times:'+i); 
	            //mysqlclient.end(); 
	            if(i<6){
		            global.mysqlclient = require('mysql').createConnection({'host':'localhost','port':3306,'user':global.mysqlroot,'password':global.mysqlpwd});
		            i++;
		            global.clientConnectionReady(mysqlclient,callback);
	            }
	        }else{
	        	console.log('已经连接上MySQL....');
	        	callback();
	        } 

	    }); 
	
	};
global.base64_decode =function(data) {
		  // http://kevin.vanzonneveld.net
		  // +   original by: Tyler Akins (http://rumkin.com)
		  // +   improved by: Thunder.m
		  // +      input by: Aman Gupta
		  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		  // +   bugfixed by: Onno Marsman
		  // +   bugfixed by: Pellentesque Malesuada
		  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		  // +      input by: Brett Zamir (http://brett-zamir.me)
		  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		  // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
		  // *     returns 1: 'Kevin van Zonneveld'
		  // mozilla has this native
		  // - but breaks in 2.0.0.12!
		  //if (typeof this.window['atob'] == 'function') {
		  //    return atob(data);
		  //}
		  var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
		    ac = 0,
		    dec = "",
		    tmp_arr = [];

		  if (!data) {
		    return data;
		  }

		  data += '';

		  do { // unpack four hexets into three octets using index points in b64
		    h1 = b64.indexOf(data.charAt(i++));
		    h2 = b64.indexOf(data.charAt(i++));
		    h3 = b64.indexOf(data.charAt(i++));
		    h4 = b64.indexOf(data.charAt(i++));

		    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

		    o1 = bits >> 16 & 0xff;
		    o2 = bits >> 8 & 0xff;
		    o3 = bits & 0xff;

		    if (h3 == 64) {
		      tmp_arr[ac++] = String.fromCharCode(o1);
		    } else if (h4 == 64) {
		      tmp_arr[ac++] = String.fromCharCode(o1, o2);
		    } else {
		      tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
		    }
		  } while (i < data.length);

		  dec = tmp_arr.join('');

		  return dec;
		}

global.strtr =function(str, from, to) {
  // http://kevin.vanzonneveld.net
  // +   original by: Brett Zamir (http://brett-zamir.me)
  // +      input by: uestla
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: Alan C
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: Taras Bogach
  // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
  // +      input by: jpfle
  // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
  // -   depends on: krsort
  // -   depends on: ini_set
  // *     example 1: $trans = {'hello' : 'hi', 'hi' : 'hello'};
  // *     example 1: strtr('hi all, I said hello', $trans)
  // *     returns 1: 'hello all, I said hi'
  // *     example 2: strtr('äaabaåccasdeöoo', 'äåö','aao');
  // *     returns 2: 'aaabaaccasdeooo'
  // *     example 3: strtr('ääääääää', 'ä', 'a');
  // *     returns 3: 'aaaaaaaa'
  // *     example 4: strtr('http', 'pthxyz','xyzpth');
  // *     returns 4: 'zyyx'
  // *     example 5: strtr('zyyx', 'pthxyz','xyzpth');
  // *     returns 5: 'http'
  // *     example 6: strtr('aa', {'a':1,'aa':2});
  // *     returns 6: '2'
  var fr = '',
    i = 0,
    j = 0,
    lenStr = 0,
    lenFrom = 0,
    tmpStrictForIn = false,
    fromTypeStr = '',
    toTypeStr = '',
    istr = '';
  var tmpFrom = [];
  var tmpTo = [];
  var ret = '';
  var match = false;

  // Received replace_pairs?
  // Convert to normal from->to chars
  if (typeof from === 'object') {
    tmpStrictForIn = this.ini_set('phpjs.strictForIn', false); // Not thread-safe; temporarily set to true
    from = this.krsort(from);
    this.ini_set('phpjs.strictForIn', tmpStrictForIn);

    for (fr in from) {
      if (from.hasOwnProperty(fr)) {
        tmpFrom.push(fr);
        tmpTo.push(from[fr]);
      }
    }

    from = tmpFrom;
    to = tmpTo;
  }

  // Walk through subject and replace chars when needed
  lenStr = str.length;
  lenFrom = from.length;
  fromTypeStr = typeof from === 'string';
  toTypeStr = typeof to === 'string';

  for (i = 0; i < lenStr; i++) {
    match = false;
    if (fromTypeStr) {
      istr = str.charAt(i);
      for (j = 0; j < lenFrom; j++) {
        if (istr == from.charAt(j)) {
          match = true;
          break;
        }
      }
    } else {
      for (j = 0; j < lenFrom; j++) {
        if (str.substr(i, from[j].length) == from[j]) {
          match = true;
          // Fast forward
          i = (i + from[j].length) - 1;
          break;
        }
      }
    }
    if (match) {
      ret += toTypeStr ? to.charAt(j) : to[j];
    } else {
      ret += str.charAt(i);
    }
  }

  return ret;
}
global.str_replace =function(search, replace, subject, count) {
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Gabriel Paderni
  // +   improved by: Philip Peterson
  // +   improved by: Simon Willison (http://simonwillison.net)
  // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // +   bugfixed by: Anton Ongson
  // +      input by: Onno Marsman
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +    tweaked by: Onno Marsman
  // +      input by: Brett Zamir (http://brett-zamir.me)
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   input by: Oleg Eremeev
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // +   bugfixed by: Oleg Eremeev
  // %          note 1: The count parameter must be passed as a string in order
  // %          note 1:  to find a global variable in which the result will be given
  // *     example 1: str_replace(' ', '.', 'Kevin van Zonneveld');
  // *     returns 1: 'Kevin.van.Zonneveld'
  // *     example 2: str_replace(['{name}', 'l'], ['hello', 'm'], '{name}, lars');
  // *     returns 2: 'hemmo, mars'
  var i = 0,
    j = 0,
    temp = '',
    repl = '',
    sl = 0,
    fl = 0,
    f = [].concat(search),
    r = [].concat(replace),
    s = subject,
    ra = Object.prototype.toString.call(r) === '[object Array]',
    sa = Object.prototype.toString.call(s) === '[object Array]';
  s = [].concat(s);
  if (count) {
    this.window[count] = 0;
  }

  for (i = 0, sl = s.length; i < sl; i++) {
    if (s[i] === '') {
      continue;
    }
    for (j = 0, fl = f.length; j < fl; j++) {
      temp = s[i] + '';
      repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
      s[i] = (temp).split(f[j]).join(repl);
      if (count && s[i] !== temp) {
        this.window[count] += (temp.length - s[i].length) / f[j].length;
      }
    }
  }
  return sa ? s : s[0];
}
global.addslashes =function(str) {
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Ates Goral (http://magnetiq.com)
  // +   improved by: marrtins
  // +   improved by: Nate
  // +   improved by: Onno Marsman
  // +   input by: Denny Wardhana
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // +   improved by: Oskar Larsson Högfeldt (http://oskar-lh.name/)
  // *     example 1: addslashes("kevin's birthday");
  // *     returns 1: 'kevin\'s birthday'
  return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

global.htmlspecialchars =function(string, quote_style, charset, double_encode) {
  // http://kevin.vanzonneveld.net
  // +   original by: Mirek Slugen
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Nathan
  // +   bugfixed by: Arno
  // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
  // +      input by: Ratheous
  // +      input by: Mailfaker (http://www.weedem.fr/)
  // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
  // +      input by: felix
  // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
  // %        note 1: charset argument not supported
  // *     example 1: htmlspecialchars("<a href='test'>Test</a>", 'ENT_QUOTES');
  // *     returns 1: '&lt;a href=&#039;test&#039;&gt;Test&lt;/a&gt;'
  // *     example 2: htmlspecialchars("ab\"c'd", ['ENT_NOQUOTES', 'ENT_QUOTES']);
  // *     returns 2: 'ab"c&#039;d'
  // *     example 3: htmlspecialchars("my "&entity;" is still here", null, null, false);
  // *     returns 3: 'my &quot;&entity;&quot; is still here'
  var optTemp = 0,
    i = 0,
    noquotes = false;
  if (typeof quote_style === 'undefined' || quote_style === null) {
    quote_style = 2;
  }
  string = string.toString();
  if (double_encode !== false) { // Put this first to avoid double-encoding
    string = string.replace(/&/g, '&amp;');
  }
  string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  var OPTS = {
    'ENT_NOQUOTES': 0,
    'ENT_HTML_QUOTE_SINGLE': 1,
    'ENT_HTML_QUOTE_DOUBLE': 2,
    'ENT_COMPAT': 2,
    'ENT_QUOTES': 3,
    'ENT_IGNORE': 4
  };
  if (quote_style === 0) {
    noquotes = true;
  }
  if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
    quote_style = [].concat(quote_style);
    for (i = 0; i < quote_style.length; i++) {
      // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
      if (OPTS[quote_style[i]] === 0) {
        noquotes = true;
      }
      else if (OPTS[quote_style[i]]) {
        optTemp = optTemp | OPTS[quote_style[i]];
      }
    }
    quote_style = optTemp;
  }
  if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
    string = string.replace(/'/g, '&#039;');
  }
  if (!noquotes) {
    string = string.replace(/"/g, '&quot;');
  }

  return string;
}
global.isset=function(a){
	if(typeof(a)=='undefined')return false;
	return true;
}
global.empty =function(mixed_var) {
  // Checks if the argument variable is empty
  // undefined, null, false, number 0, empty string,
  // string "0", objects without properties and empty arrays
  // are considered empty
  //
  // http://kevin.vanzonneveld.net
  // +   original by: Philippe Baumann
  // +      input by: Onno Marsman
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: LH
  // +   improved by: Onno Marsman
  // +   improved by: Francesco
  // +   improved by: Marc Jansen
  // +      input by: Stoyan Kyosev (http://www.svest.org/)
  // +   improved by: Rafal Kukawski
  // *     example 1: empty(null);
  // *     returns 1: true
  // *     example 2: empty(undefined);
  // *     returns 2: true
  // *     example 3: empty([]);
  // *     returns 3: true
  // *     example 4: empty({});
  // *     returns 4: true
  // *     example 5: empty({'aFunc' : function () { alert('humpty'); } });
  // *     returns 5: false
  var undef, key, i, len;
  var emptyValues = [undef, null, false, 0, "", "0"];

  for (i = 0, len = emptyValues.length; i < len; i++) {
    if (mixed_var === emptyValues[i]) {
      return true;
    }
  }

  if (typeof mixed_var === "object") {
    for (key in mixed_var) {
      // TODO: should we check for own properties only?
      //if (mixed_var.hasOwnProperty(key)) {
      return false;
      //}
    }
    return true;
  }

  return false;
}

global.uniqid=function(prefix, more_entropy) {
	  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // +    revised by: Kankrelune (http://www.webfaktory.info/)
	  // %        note 1: Uses an internal counter (in php_js global) to avoid collision
	  // *     example 1: uniqid();
	  // *     returns 1: 'a30285b160c14'
	  // *     example 2: uniqid('foo');
	  // *     returns 2: 'fooa30285b1cd361'
	  // *     example 3: uniqid('bar', true);
	  // *     returns 3: 'bara20285b23dfd1.31879087'
	  if (typeof prefix === 'undefined') {
	    prefix = "";
	  }

	  var retId;
	  var formatSeed = function (seed, reqWidth) {
	    seed = parseInt(seed, 10).toString(16); // to hex str
	    if (reqWidth < seed.length) { // so long we split
	      return seed.slice(seed.length - reqWidth);
	    }
	    if (reqWidth > seed.length) { // so short we pad
	      return Array(1 + (reqWidth - seed.length)).join('0') + seed;
	    }
	    return seed;
	  };

	  // BEGIN REDUNDANT
	  if (!this.php_js) {
	    this.php_js = {};
	  }
	  // END REDUNDANT
	  if (!this.php_js.uniqidSeed) { // init seed with big random int
	    this.php_js.uniqidSeed = Math.floor(Math.random() * 0x75bcd15);
	  }
	  this.php_js.uniqidSeed++;

	  retId = prefix; // start with prefix, add current milliseconds hex string
	  retId += formatSeed(parseInt(new Date().getTime() / 1000, 10), 8);
	  retId += formatSeed(this.php_js.uniqidSeed, 5); // add seed hex string
	  if (more_entropy) {
	    // for more entropy we add a float lower to 10
	    retId += (Math.random() * 10).toFixed(8).toString();
	  }

	  return retId;
	}
global.date=function(format, timestamp) {
	  // http://kevin.vanzonneveld.net
	  // +   original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
	  // +      parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
	  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // +   improved by: MeEtc (http://yass.meetcweb.com)
	  // +   improved by: Brad Touesnard
	  // +   improved by: Tim Wiel
	  // +   improved by: Bryan Elliott
	  //
	  // +   improved by: Brett Zamir (http://brett-zamir.me)
	  // +   improved by: David Randall
	  // +      input by: Brett Zamir (http://brett-zamir.me)
	  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // +   improved by: Brett Zamir (http://brett-zamir.me)
	  // +   improved by: Brett Zamir (http://brett-zamir.me)
	  // +   improved by: Theriault
	  // +  derived from: gettimeofday
	  // +      input by: majak
	  // +   bugfixed by: majak
	  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // +      input by: Alex
	  // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
	  // +   improved by: Theriault
	  // +   improved by: Brett Zamir (http://brett-zamir.me)
	  // +   improved by: Theriault
	  // +   improved by: Thomas Beaucourt (http://www.webapp.fr)
	  // +   improved by: JT
	  // +   improved by: Theriault
	  // +   improved by: Rafał Kukawski (http://blog.kukawski.pl)
	  // +   bugfixed by: omid (http://phpjs.org/functions/380:380#comment_137122)
	  // +      input by: Martin
	  // +      input by: Alex Wilson
	  // +   bugfixed by: Chris (http://www.devotis.nl/)
	  // %        note 1: Uses global: php_js to store the default timezone
	  // %        note 2: Although the function potentially allows timezone info (see notes), it currently does not set
	  // %        note 2: per a timezone specified by date_default_timezone_set(). Implementers might use
	  // %        note 2: this.php_js.currentTimezoneOffset and this.php_js.currentTimezoneDST set by that function
	  // %        note 2: in order to adjust the dates in this function (or our other date functions!) accordingly
	  // *     example 1: date('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400);
	  // *     returns 1: '09:09:40 m is month'
	  // *     example 2: date('F j, Y, g:i a', 1062462400);
	  // *     returns 2: 'September 2, 2003, 2:26 am'
	  // *     example 3: date('Y W o', 1062462400);
	  // *     returns 3: '2003 36 2003'
	  // *     example 4: x = date('Y m d', (new Date()).getTime()/1000);
	  // *     example 4: (x+'').length == 10 // 2009 01 09
	  // *     returns 4: true
	  // *     example 5: date('W', 1104534000);
	  // *     returns 5: '53'
	  // *     example 6: date('B t', 1104534000);
	  // *     returns 6: '999 31'
	  // *     example 7: date('W U', 1293750000.82); // 2010-12-31
	  // *     returns 7: '52 1293750000'
	  // *     example 8: date('W', 1293836400); // 2011-01-01
	  // *     returns 8: '52'
	  // *     example 9: date('W Y-m-d', 1293974054); // 2011-01-02
	  // *     returns 9: '52 2011-01-02'
	    var that = this,
	      jsdate,
	      f,
	      formatChr = /\\?([a-z])/gi,
	      formatChrCb,
	      // Keep this here (works, but for code commented-out
	      // below for file size reasons)
	      //, tal= [],
	      _pad = function (n, c) {
	        n = n.toString();
	        return n.length < c ? _pad('0' + n, c, '0') : n;
	      },
	      txt_words = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	  formatChrCb = function (t, s) {
	    return f[t] ? f[t]() : s;
	  };
	  f = {
	    // Day
	    d: function () { // Day of month w/leading 0; 01..31
	      return _pad(f.j(), 2);
	    },
	    D: function () { // Shorthand day name; Mon...Sun
	      return f.l().slice(0, 3);
	    },
	    j: function () { // Day of month; 1..31
	      return jsdate.getDate();
	    },
	    l: function () { // Full day name; Monday...Sunday
	      return txt_words[f.w()] + 'day';
	    },
	    N: function () { // ISO-8601 day of week; 1[Mon]..7[Sun]
	      return f.w() || 7;
	    },
	    S: function(){ // Ordinal suffix for day of month; st, nd, rd, th
	      var j = f.j()
	      i = j%10;
	      if (i <= 3 && parseInt((j%100)/10) == 1) i = 0;
	      return ['st', 'nd', 'rd'][i - 1] || 'th';
	    },
	    w: function () { // Day of week; 0[Sun]..6[Sat]
	      return jsdate.getDay();
	    },
	    z: function () { // Day of year; 0..365
	      var a = new Date(f.Y(), f.n() - 1, f.j()),
	        b = new Date(f.Y(), 0, 1);
	      return Math.round((a - b) / 864e5);
	    },

	    // Week
	    W: function () { // ISO-8601 week number
	      var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3),
	        b = new Date(a.getFullYear(), 0, 4);
	      return _pad(1 + Math.round((a - b) / 864e5 / 7), 2);
	    },

	    // Month
	    F: function () { // Full month name; January...December
	      return txt_words[6 + f.n()];
	    },
	    m: function () { // Month w/leading 0; 01...12
	      return _pad(f.n(), 2);
	    },
	    M: function () { // Shorthand month name; Jan...Dec
	      return f.F().slice(0, 3);
	    },
	    n: function () { // Month; 1...12
	      return jsdate.getMonth() + 1;
	    },
	    t: function () { // Days in month; 28...31
	      return (new Date(f.Y(), f.n(), 0)).getDate();
	    },

	    // Year
	    L: function () { // Is leap year?; 0 or 1
	      var j = f.Y();
	      return j % 4 === 0 & j % 100 !== 0 | j % 400 === 0;
	    },
	    o: function () { // ISO-8601 year
	      var n = f.n(),
	        W = f.W(),
	        Y = f.Y();
	      return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
	    },
	    Y: function () { // Full year; e.g. 1980...2010
	      return jsdate.getFullYear();
	    },
	    y: function () { // Last two digits of year; 00...99
	      return f.Y().toString().slice(-2);
	    },

	    // Time
	    a: function () { // am or pm
	      return jsdate.getHours() > 11 ? "pm" : "am";
	    },
	    A: function () { // AM or PM
	      return f.a().toUpperCase();
	    },
	    B: function () { // Swatch Internet time; 000..999
	      var H = jsdate.getUTCHours() * 36e2,
	        // Hours
	        i = jsdate.getUTCMinutes() * 60,
	        // Minutes
	        s = jsdate.getUTCSeconds(); // Seconds
	      return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
	    },
	    g: function () { // 12-Hours; 1..12
	      return f.G() % 12 || 12;
	    },
	    G: function () { // 24-Hours; 0..23
	      return jsdate.getHours();
	    },
	    h: function () { // 12-Hours w/leading 0; 01..12
	      return _pad(f.g(), 2);
	    },
	    H: function () { // 24-Hours w/leading 0; 00..23
	      return _pad(f.G(), 2);
	    },
	    i: function () { // Minutes w/leading 0; 00..59
	      return _pad(jsdate.getMinutes(), 2);
	    },
	    s: function () { // Seconds w/leading 0; 00..59
	      return _pad(jsdate.getSeconds(), 2);
	    },
	    u: function () { // Microseconds; 000000-999000
	      return _pad(jsdate.getMilliseconds() * 1000, 6);
	    },

	    // Timezone
	    e: function () { // Timezone identifier; e.g. Atlantic/Azores, ...
	      // The following works, but requires inclusion of the very large
	      // timezone_abbreviations_list() function.
	/*              return that.date_default_timezone_get();
	*/
	      throw 'Not supported (see source code of date() for timezone on how to add support)';
	    },
	    I: function () { // DST observed?; 0 or 1
	      // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
	      // If they are not equal, then DST is observed.
	      var a = new Date(f.Y(), 0),
	        // Jan 1
	        c = Date.UTC(f.Y(), 0),
	        // Jan 1 UTC
	        b = new Date(f.Y(), 6),
	        // Jul 1
	        d = Date.UTC(f.Y(), 6); // Jul 1 UTC
	      return ((a - c) !== (b - d)) ? 1 : 0;
	    },
	    O: function () { // Difference to GMT in hour format; e.g. +0200
	      var tzo = jsdate.getTimezoneOffset(),
	        a = Math.abs(tzo);
	      return (tzo > 0 ? "-" : "+") + _pad(Math.floor(a / 60) * 100 + a % 60, 4);
	    },
	    P: function () { // Difference to GMT w/colon; e.g. +02:00
	      var O = f.O();
	      return (O.substr(0, 3) + ":" + O.substr(3, 2));
	    },
	    T: function () { // Timezone abbreviation; e.g. EST, MDT, ...
	      // The following works, but requires inclusion of the very
	      // large timezone_abbreviations_list() function.
	/*              var abbr = '', i = 0, os = 0, default = 0;
	      if (!tal.length) {
	        tal = that.timezone_abbreviations_list();
	      }
	      if (that.php_js && that.php_js.default_timezone) {
	        default = that.php_js.default_timezone;
	        for (abbr in tal) {
	          for (i=0; i < tal[abbr].length; i++) {
	            if (tal[abbr][i].timezone_id === default) {
	              return abbr.toUpperCase();
	            }
	          }
	        }
	      }
	      for (abbr in tal) {
	        for (i = 0; i < tal[abbr].length; i++) {
	          os = -jsdate.getTimezoneOffset() * 60;
	          if (tal[abbr][i].offset === os) {
	            return abbr.toUpperCase();
	          }
	        }
	      }
	*/
	      return 'UTC';
	    },
	    Z: function () { // Timezone offset in seconds (-43200...50400)
	      return -jsdate.getTimezoneOffset() * 60;
	    },

	    // Full Date/Time
	    c: function () { // ISO-8601 date.
	      return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb);
	    },
	    r: function () { // RFC 2822
	      return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
	    },
	    U: function () { // Seconds since UNIX epoch
	      return jsdate / 1000 | 0;
	    }
	  };
	  this.date = function (format, timestamp) {
	    that = this;
	    jsdate = (timestamp === undefined ? new Date() : // Not provided
	      (timestamp instanceof Date) ? new Date(timestamp) : // JS Date()
	      new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
	    );
	    return format.replace(formatChr, formatChrCb);
	  };
	  return this.date(format, timestamp);
	}

var crypto = require('crypto');
//global.json = require('json');
global.md5=function(text) {
  return crypto.createHash('md5').update(text).digest('hex');
};
global.base64_encode=function(data) {
	  var b   = new Buffer(data, 'binary');
	  return b.toString('base64');
	} 