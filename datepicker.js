(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
  Expose functions.
*/
module.exports =
  { toJalaali: toJalaali
  , toGregorian: toGregorian
  , isValidJalaaliDate: isValidJalaaliDate
  , isLeapJalaaliYear: isLeapJalaaliYear
  , jalaaliMonthLength: jalaaliMonthLength
  , jalCal: jalCal
  , j2d: j2d
  , d2j: d2j
  , g2d: g2d
  , d2g: d2g
  }

/*
  Converts a Gregorian date to Jalaali.
*/
function toJalaali(gy, gm, gd) {
  if (Object.prototype.toString.call(gy) === '[object Date]') {
    gd = gy.getDate()
    gm = gy.getMonth() + 1
    gy = gy.getFullYear()
  }
  return d2j(g2d(gy, gm, gd))
}

/*
  Converts a Jalaali date to Gregorian.
*/
function toGregorian(jy, jm, jd) {
  return d2g(j2d(jy, jm, jd))
}

/*
  Checks whether a Jalaali date is valid or not.
*/
function isValidJalaaliDate(jy, jm, jd) {
  return  jy >= -61 && jy <= 3177 &&
          jm >= 1 && jm <= 12 &&
          jd >= 1 && jd <= jalaaliMonthLength(jy, jm)
}

/*
  Is this a leap year or not?
*/
function isLeapJalaaliYear(jy) {
  return jalCal(jy).leap === 0
}

/*
  Number of days in a given month in a Jalaali year.
*/
function jalaaliMonthLength(jy, jm) {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  if (isLeapJalaaliYear(jy)) return 30
  return 29
}

/*
  This function determines if the Jalaali (Persian) year is
  leap (366-day long) or is the common year (365 days), and
  finds the day in March (Gregorian calendar) of the first
  day of the Jalaali year (jy).

  @param jy Jalaali calendar year (-61 to 3177)
  @return
    leap: number of years since the last leap year (0 to 4)
    gy: Gregorian year of the beginning of Jalaali year
    march: the March day of Farvardin the 1st (1st day of jy)
  @see: http://www.astro.uni.torun.pl/~kb/Papers/EMP/PersianC-EMP.htm
  @see: http://www.fourmilab.ch/documents/calendar/
*/
function jalCal(jy) {
  // Jalaali years starting the 33-year rule.
  var breaks =  [ -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210
                , 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178
                ]
    , bl = breaks.length
    , gy = jy + 621
    , leapJ = -14
    , jp = breaks[0]
    , jm
    , jump
    , leap
    , leapG
    , march
    , n
    , i

  if (jy < jp || jy >= breaks[bl - 1])
    throw new Error('Invalid Jalaali year ' + jy)

  // Find the limiting years for the Jalaali year jy.
  for (i = 1; i < bl; i += 1) {
    jm = breaks[i]
    jump = jm - jp
    if (jy < jm)
      break
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4)
    jp = jm
  }
  n = jy - jp

  // Find the number of leap years from AD 621 to the beginning
  // of the current Jalaali year in the Persian calendar.
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
  if (mod(jump, 33) === 4 && jump - n === 4)
    leapJ += 1

  // And the same in the Gregorian calendar (until the year gy).
  leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150

  // Determine the Gregorian date of Farvardin the 1st.
  march = 20 + leapJ - leapG

  // Find how many years have passed since the last leap year.
  if (jump - n < 6)
    n = n - jump + div(jump + 4, 33) * 33
  leap = mod(mod(n + 1, 33) - 1, 4)
  if (leap === -1) {
    leap = 4
  }

  return  { leap: leap
          , gy: gy
          , march: march
          }
}

/*
  Converts a date of the Jalaali calendar to the Julian Day number.

  @param jy Jalaali year (1 to 3100)
  @param jm Jalaali month (1 to 12)
  @param jd Jalaali day (1 to 29/31)
  @return Julian Day number
*/
function j2d(jy, jm, jd) {
  var r = jalCal(jy)
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
}

/*
  Converts the Julian Day number to a date in the Jalaali calendar.

  @param jdn Julian Day number
  @return
    jy: Jalaali year (1 to 3100)
    jm: Jalaali month (1 to 12)
    jd: Jalaali day (1 to 29/31)
*/
function d2j(jdn) {
  var gy = d2g(jdn).gy // Calculate Gregorian year (gy).
    , jy = gy - 621
    , r = jalCal(jy)
    , jdn1f = g2d(gy, 3, r.march)
    , jd
    , jm
    , k

  // Find number of days that passed since 1 Farvardin.
  k = jdn - jdn1f
  if (k >= 0) {
    if (k <= 185) {
      // The first 6 months.
      jm = 1 + div(k, 31)
      jd = mod(k, 31) + 1
      return  { jy: jy
              , jm: jm
              , jd: jd
              }
    } else {
      // The remaining months.
      k -= 186
    }
  } else {
    // Previous Jalaali year.
    jy -= 1
    k += 179
    if (r.leap === 1)
      k += 1
  }
  jm = 7 + div(k, 30)
  jd = mod(k, 30) + 1
  return  { jy: jy
          , jm: jm
          , jd: jd
          }
}

/*
  Calculates the Julian Day number from Gregorian or Julian
  calendar dates. This integer number corresponds to the noon of
  the date (i.e. 12 hours of Universal Time).
  The procedure was tested to be good since 1 March, -100100 (of both
  calendars) up to a few million years into the future.

  @param gy Calendar year (years BC numbered 0, -1, -2, ...)
  @param gm Calendar month (1 to 12)
  @param gd Calendar day of the month (1 to 28/29/30/31)
  @return Julian Day number
*/
function g2d(gy, gm, gd) {
  var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
      + div(153 * mod(gm + 9, 12) + 2, 5)
      + gd - 34840408
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
  return d
}

/*
  Calculates Gregorian and Julian calendar dates from the Julian Day number
  (jdn) for the period since jdn=-34839655 (i.e. the year -100100 of both
  calendars) to some millions years ahead of the present.

  @param jdn Julian Day number
  @return
    gy: Calendar year (years BC numbered 0, -1, -2, ...)
    gm: Calendar month (1 to 12)
    gd: Calendar day of the month M (1 to 28/29/30/31)
*/
function d2g(jdn) {
  var j
    , i
    , gd
    , gm
    , gy
  j = 4 * jdn + 139361631
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
  i = div(mod(j, 1461), 4) * 5 + 308
  gd = div(mod(i, 153), 5) + 1
  gm = mod(div(i, 153), 12) + 1
  gy = div(j, 1461) - 100100 + div(8 - gm, 6)
  return  { gy: gy
          , gm: gm
          , gd: gd
          }
}

/*
  Utility helper functions.
*/

function div(a, b) {
  return ~~(a / b)
}

function mod(a, b) {
  return a - ~~(a / b) * b
}
},{}],2:[function(require,module,exports){
var jalali,
  slice = [].slice;

jalali = require('./jalali');

window.datepicker = function(textbox, rightAlign) {
  var E, append, body, boxStyle, calendar, calendarStyle, cellStyle, chevronStyle, date, dateCells, displayMonth, displayYear, extend, getNextMonth, getPrevMonth, gotoDate, gotoMonth, headerText, month, nextMonth, nextYear, onEvent, prevMonth, prevYear, ref, ref1, setStyle, text, toPersian, year;
  toPersian = function(value) {
    value = String(value);
    '۰۱۲۳۴۵۶۷۸۹'.split('').forEach(function(digit, i) {
      return value = value.replace(new RegExp('' + i, 'g'), digit);
    });
    return value;
  };
  extend = function() {
    var sources, target;
    target = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    sources.forEach(function(source) {
      return Object.keys(source).forEach(function(key) {
        return target[key] = source[key];
      });
    });
    return target;
  };
  setStyle = function(element, style) {
    return Object.keys(style).forEach(function(key) {
      var value;
      value = style[key];
      if (typeof value === 'number') {
        value = value + 'px';
      }
      return element.style[key] = value;
    });
  };
  append = function() {
    var children, element, flatten;
    element = arguments[0], children = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    flatten = function(a) {
      var arr;
      arr = [];
      a.forEach(function(x) {
        if (Array.isArray(x)) {
          return arr = arr.concat(flatten(x));
        } else {
          return arr.push(x);
        }
      });
      return arr;
    };
    return flatten(children).forEach(function(child) {
      return element.appendChild(child);
    });
  };
  E = function() {
    var children, div, style;
    style = arguments[0], children = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (style == null) {
      style = {};
    }
    div = document.createElement('div');
    setStyle(div, style);
    append.apply(null, [div].concat(slice.call(children)));
    return div;
  };
  text = function(text) {
    return document.createTextNode(text);
  };
  onEvent = function(element, event, callback) {
    return element.addEventListener(event, callback);
  };
  getPrevMonth = function(year, month) {
    if (month === 1) {
      year--;
      month = 12;
    } else {
      month--;
    }
    return {
      year: year,
      month: month
    };
  };
  getNextMonth = function(year, month) {
    if (month === 12) {
      year++;
      month = 1;
    } else {
      month++;
    }
    return {
      year: year,
      month: month
    };
  };
  date = new Date();
  year = date.getYear() + 1900;
  month = date.getMonth() + 1;
  date = date.getDate();
  ref = jalali.toJalaali(year, month, date), year = ref.jy, month = ref.jm, date = ref.jd;
  ref1 = [year, month], displayYear = ref1[0], displayMonth = ref1[1];
  body = document.body;
  boxStyle = {
    width: 50,
    height: 50,
    lineHeight: 50,
    textAlign: 'center'
  };
  cellStyle = extend({
    display: 'inline-block',
    border: '1px solid black',
    marginLeft: -1,
    marginBottom: -1
  }, boxStyle);
  chevronStyle = extend({
    position: 'absolute',
    cursor: 'pointer',
    top: 10
  }, boxStyle);
  calendar = E(calendarStyle = {
    position: 'absolute',
    fontSize: 20,
    width: 7 * 50 + 6,
    height: 8 * 50 + 17,
    backgroundColor: 'white',
    border: '1px solid black',
    cursor: 'default'
  }, nextYear = E(extend({
    left: 10
  }, chevronStyle), text('‹‹')), nextMonth = E(extend({
    left: 60
  }, chevronStyle), text('‹')), headerText = E({
    marginTop: 10,
    width: '100%',
    height: 50,
    lineHeight: 50,
    textAlign: 'center'
  }), prevMonth = E(extend({
    right: 60
  }, chevronStyle), text('›')), prevYear = E(extend({
    right: 10
  }, chevronStyle), text('››')), E({
    direction: 'rtl'
  }, ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(function(day, i) {
    var cell;
    cell = E(extend({
      backgroundColor: 'grey',
      color: 'white'
    }, cellStyle), text(day));
    if (i === 0) {
      setStyle(cell, {
        marginRight: -1
      });
    }
    return cell;
  }), dateCells = E()));
  gotoMonth = function(y, m) {
    var day, gd, gm, gy, j, k, l, monthLength, nm, ny, pm, prevMonthLength, py, ref2, ref3, ref4, ref5, ref6, ref7, results, results1, results2, selectedDate;
    ref2 = [y, m], displayYear = ref2[0], displayMonth = ref2[1];
    headerText.innerHTML = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'][displayMonth - 1] + ' ' + toPersian(displayYear);
    monthLength = jalali.jalaaliMonthLength(displayYear, displayMonth);
    ref3 = getPrevMonth(displayYear, displayMonth), py = ref3.year, pm = ref3.month;
    ref4 = getNextMonth(displayYear, displayMonth), ny = ref4.year, nm = ref4.month;
    prevMonthLength = jalali.jalaaliMonthLength(py, pm);
    ref5 = jalali.toGregorian(displayYear, displayMonth, 1), gy = ref5.gy, gm = ref5.gm, gd = ref5.gd;
    day = new Date(gy, gm - 1, gd).getDay() + 1;
    while (dateCells.children.length) {
      dateCells.removeChild(dateCells.children[0]);
    }
    append(dateCells, (function() {
      results = [];
      for (var j = ref6 = prevMonthLength - day + 1; ref6 <= prevMonthLength ? j <= prevMonthLength : j >= prevMonthLength; ref6 <= prevMonthLength ? j++ : j--){ results.push(j); }
      return results;
    }).apply(this).map(function(date) {
      var cell;
      cell = E(extend({
        color: 'grey',
        cursor: 'pointer'
      }, cellStyle), text(toPersian(date)));
      if (date === prevMonthLength - day + 1) {
        setStyle(cell, {
          marginRight: -1
        });
      }
      onEvent(cell, 'click', function() {
        return gotoDate(py, pm, date);
      });
      return cell;
    }));
    selectedDate = date;
    append(dateCells, (function() {
      results1 = [];
      for (var k = 1; 1 <= monthLength ? k <= monthLength : k >= monthLength; 1 <= monthLength ? k++ : k--){ results1.push(k); }
      return results1;
    }).apply(this).map(function(date) {
      var cell;
      cell = E(extend({
        cursor: 'pointer'
      }, cellStyle), text(toPersian(date)));
      if (((day + date) % 7) === 1) {
        setStyle(cell, {
          marginRight: -1
        });
      }
      if (date === selectedDate && month === displayMonth && year === displayYear) {
        setStyle(cell, {
          backgroundColor: 'lightblue'
        });
      }
      onEvent(cell, 'click', function() {
        return gotoDate(year, month, date);
      });
      return cell;
    }));
    return append(dateCells, (function() {
      results2 = [];
      for (var l = 1, ref7 = 42 - monthLength - day; 1 <= ref7 ? l <= ref7 : l >= ref7; 1 <= ref7 ? l++ : l--){ results2.push(l); }
      return results2;
    }).apply(this).map(function(date) {
      var cell;
      cell = E(extend({
        color: 'grey',
        cursor: 'pointer'
      }, cellStyle), text(toPersian(date)));
      if (((day + date + monthLength) % 7) === 1) {
        setStyle(cell, {
          marginRight: -1
        });
      }
      onEvent(cell, 'click', function() {
        return gotoDate(ny, nm, date);
      });
      return cell;
    }));
  };
  gotoDate = function(y, m, d) {
    var ref2;
    ref2 = [y, m, d], year = ref2[0], month = ref2[1], date = ref2[2];
    textbox.value = toPersian(year + "/" + month + "/" + date);
    return gotoMonth(year, month);
  };
  gotoDate(year, month, date);
  onEvent(prevYear, 'click', function() {
    return gotoMonth(displayYear - 1, displayMonth);
  });
  onEvent(nextYear, 'click', function() {
    return gotoMonth(displayYear + 1, displayMonth);
  });
  onEvent(prevMonth, 'click', function() {
    var m, ref2, y;
    ref2 = getPrevMonth(displayYear, displayMonth), y = ref2.year, m = ref2.month;
    return gotoMonth(y, m);
  });
  onEvent(nextMonth, 'click', function() {
    var m, ref2, y;
    ref2 = getNextMonth(displayYear, displayMonth), y = ref2.year, m = ref2.month;
    return gotoMonth(y, m);
  });
  onEvent(calendar, 'mousedown', function(e) {
    return e.preventDefault();
  });
  onEvent(textbox, 'focus', function() {
    var element, height, left, top, width;
    width = textbox.offsetWidth, height = textbox.offsetHeight;
    top = left = 0;
    element = textbox;
    while (true) {
      top += element.offsetTop || 0;
      left += element.offsetLeft || 0;
      element = element.offsetParent;
      if (!element) {
        break;
      }
    }
    setStyle(calendar, {
      top: top + height,
      left: rightAlign ? left + width - calendarStyle.width : left
    });
    return append(body, calendar);
  });
  return onEvent(textbox, 'blur', function(e) {
    return body.removeChild(calendar);
  });
};


},{"./jalali":1}]},{},[2]);
