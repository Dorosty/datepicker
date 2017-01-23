jalali = require './jalali'

window.datepicker = (placeholder, rightAlign) ->

  extend = (target, sources...) ->
    sources.forEach (source) ->
      Object.keys(source).forEach (key) ->
        target[key] = source[key]
    target

  toPersian = (value) ->
    value = String value
    '۰۱۲۳۴۵۶۷۸۹'.split ''
    .forEach (digit, i) ->
      value = value.replace (new RegExp '' + i, 'g'), digit
    value

  toEnglish = (value) ->
    value ?= ''
    value = '' + value
    '۰۱۲۳۴۵۶۷۸۹'.split ''
    .forEach (digit, i) ->
      value = value.replace (new RegExp digit, 'g'), i
    value

  setStyle = (element, style) ->
    Object.keys(style).forEach (key) ->
      value = style[key]
      if typeof(value) is 'number'
        value = value + 'px'
      element.style[key] = value

  append = (element, children...) ->
    flatten = (a) ->
      arr = []
      a.forEach (x) ->
        if Array.isArray x
          arr = arr.concat flatten x
        else
          arr.push x
      arr
    flatten(children).forEach (child) ->
      element.appendChild child

  E = (style = {}, children...) ->
    div = document.createElement 'div'
    setStyle div, style
    append div, children...
    div

  text = (text) -> document.createTextNode text

  onEvent = (element, event, callback) -> element.addEventListener event, callback

  getPrevMonth = (year, month) ->
    if month is 1
      year--
      month = 12
    else
      month--
    {year, month}
  getNextMonth = (year, month) ->
    if month is 12
      year++
      month = 1
    else
      month++
    {year, month}

  date = new Date()
  year = date.getYear() + 1900
  month = date.getMonth() + 1
  date = date.getDate()
  {jy: year, jm: month, jd: date} = jalali.toJalaali year, month, date
  [displayYear, displayMonth] = [year, month]

  createCalendar = (textbox, callback) -> do (year, month, date, displayYear, displayMonth) ->
    [otherYear, otherMonth, otherDate] = [year, month, date]
    boxStyle = width: 40, height: 40, lineHeight: 40, textAlign: 'center'
    cellStyle = extend {display: 'inline-block', border: '1px solid #41698a', marginLeft: -1, marginBottom: -1}, boxStyle
    chevronStyle = position: 'absolute', cursor: 'pointer', top: 7, color: '#aaa', width: 40, height: 30, lineHeight: 30, fontSize: 25
    calendar = E calendarStyle = position: 'absolute', fontSize: 20, width: 7 * cellStyle.width + 6, height: 8 * cellStyle.width + 17, border: '1px solid transparent', cursor: 'default',
      nextYear = E extend({left: 0, textAlign: 'left'}, chevronStyle), text '‹‹'
      nextMonth = E extend({left: 30, textAlign: 'left'}, chevronStyle), text '‹'
      headerText = E marginTop: 10, width: '100%', height: 30, lineHeight: 30, textAlign: 'center', color: '#41698a'
      prevMonth = E extend({right: 30, textAlign: 'right'}, chevronStyle), text '›'
      prevYear = E extend({right: 0, textAlign: 'right'}, chevronStyle), text '››'
      E direction: 'rtl',
        ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map (day, i) ->
          cell = E extend({backgroundColor: '#41698a', color: 'white'}, cellStyle),
            text day
          if i is 0
            setStyle cell, marginRight: -1
          cell
        dateCells = E()

    gotoMonth = (y, m) ->
      [displayYear, displayMonth] = [y, m]
      headerText.innerHTML = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'][displayMonth - 1] + ' ' + toPersian displayYear
      monthLength = jalali.jalaaliMonthLength displayYear, displayMonth
      {year: py, month: pm} = getPrevMonth displayYear, displayMonth
      {year: ny, month: nm} = getNextMonth displayYear, displayMonth
      prevMonthLength = jalali.jalaaliMonthLength py, pm
      {gy, gm, gd} = jalali.toGregorian displayYear, displayMonth, 1
      day = new Date(gy, gm - 1, gd).getDay() + 1
      while dateCells.children.length
        dateCells.removeChild dateCells.children[0]
      compareDates = (y0, m0, d0, y1, m1, d1) ->
        if y0 > y1
          1
        else if y0 < y1
          -1
        else
          if m0 > m1
            1
          else if m0 < m1
            -1
          else
            if d0 > d1
              1
            else if d0 < d1
              -1
            else
              0
      amend = (cell, y, m, d) ->
        compare = 
        if compareDates(y, m, d, year, month, date) in [0, 1] && compareDates(y, m, d, otherYear, otherMonth, otherDate) in [0, -1]
          setStyle cell, backgroundColor: '#ffdbdb'
        if compareDates(y, m, d, year, month, date) in [0, -1] && compareDates(y, m, d, otherYear, otherMonth, otherDate) in [0, 1]
          setStyle cell, backgroundColor: '#ffdbdb'
      append dateCells, [prevMonthLength - day + 1 .. prevMonthLength].map (date) ->
        cell = E extend({color: '#ccc', cursor: 'pointer'}, cellStyle),
          text toPersian date
        amend cell, py, pm, date
        if date is prevMonthLength - day + 1
          setStyle cell, marginRight: -1
        onEvent cell, 'click', ->
          gotoDate py, pm, date
        cell
      selectedDate = date
      append dateCells, [1 .. monthLength].map (date) ->
        cell = E extend({color: '#41698a', cursor: 'pointer'}, cellStyle),
          text toPersian date
        amend cell, displayYear, displayMonth, date
        if ((day + date) % 7) is 1
          setStyle cell, marginRight: -1
        if selectedDate is date && month is displayMonth && year is displayYear
          setStyle cell, backgroundColor: '#ff6b6b'        
        onEvent cell, 'click', ->
          gotoDate displayYear, displayMonth, date
        cell
      append dateCells, [1 .. 42 - monthLength - day].map (date) ->
        cell = E extend({color: '#ccc', cursor: 'pointer'}, cellStyle),
          text toPersian date
        amend cell, ny, nm, date
        if ((day + date + monthLength) % 7) is 1
          setStyle cell, marginRight: -1
        onEvent cell, 'click', ->
          gotoDate ny, nm, date
        cell

    gotoDate = calendar.gotoDate = (y, m, d, skipTextbox) ->
      [year, month, date] = [y, m, d]
      gotoMonth year, month
      unless skipTextbox
        textbox.value = toPersian "#{year}/#{month}/#{date}"
      callback y, m, d

    calendar.setOtherDate = (y, m, d) ->
      return if otherYear is y && otherMonth is m && otherDate is d
      [otherYear, otherMonth, otherDate] = [y, m, d]
      gotoMonth year, month

    gotoDate year, month, date

    onEvent prevYear, 'click', -> gotoMonth displayYear - 1, displayMonth
    onEvent nextYear, 'click', -> gotoMonth displayYear + 1, displayMonth
    onEvent prevMonth, 'click', ->
      {year: y, month: m} = getPrevMonth displayYear, displayMonth
      gotoMonth y, m
    onEvent nextMonth, 'click', ->
      {year: y, month: m} = getNextMonth displayYear, displayMonth
      gotoMonth y, m

    calendar

  createTextbox = -> document.createElement 'input'

  fromTextbox = createTextbox()
  toTextbox = createTextbox()

  y0 = m0 = d0 = y1 = m1 = d1 = undefined
  fromCalendar = createCalendar fromTextbox, (y, m, d) ->
    setTimeout ->
      toCalendar.setOtherDate y, m, d
    [y0, m0, d0] = [y, m, d]
    if y0 > y1
      toCalendar.gotoDate y0, m0, d0
    else if y0 is y1
      if m0 > m1
        toCalendar.gotoDate y0, m0, d0
      else if m0 is m1
        if d0 > d1
          toCalendar.gotoDate y0, m0, d0
  toCalendar = createCalendar toTextbox, (y, m, d) ->
    setTimeout ->
      fromCalendar.setOtherDate y, m, d
    [y1, m1, d1] = [y, m, d]
    if y0 > y1
      fromCalendar.gotoDate y1, m1, d1
    else if y0 is y1
      if m0 > m1
        fromCalendar.gotoDate y1, m1, d1
      else if m0 is m1
        if d0 > d1
          fromCalendar.gotoDate y1, m1, d1

  textboxStyle =
    border: '1px solid #ddd'
    outline: 'none'
    width: 200
    borderRadius: 3
    padding: 7
    fontSize: 15
    height: 15
    lineHeight: 15
    position: 'absolute'
    top: 35

  partWidth = 320

  setStyle fromTextbox, extend {right: 0}, textboxStyle
  setStyle toTextbox, extend {right: partWidth}, textboxStyle

  setStyle fromCalendar, top: 75, right: 0
  setStyle toCalendar, top: 75, right: partWidth

  fromTitle = E position: 'absolute', fontSize: 17, direction: 'rtl', color: '#41698a', top: 5, right: 0
  toTitle = E position: 'absolute', fontSize: 17, direction: 'rtl', color: '#41698a', top: 5, right: partWidth

  fromTitle.innerHTML = 'از تاریخ:'
  toTitle.innerHTML = 'تا تاریخ:'

  append placeholder, E position: 'relative', width: partWidth * 2, backgroundColor: 'white',
    fromTitle
    toTitle
    fromTextbox
    toTextbox
    fromCalendar
    toCalendar

  [fromTextbox, toTextbox].forEach (input, i) ->
    prevValue = ''
    onEvent input, 'input', ->
      value = toEnglish input.value
      parts = value.split '/'
      valid = switch parts.length
        when 1
          /^(1?|13[0-9]?[0-9]?)$/.test parts[0]
        when 2
          /^13[0-9][0-9]$/.test(parts[0]) && /^([1-9]?|1[0-2])$/.test parts[1]
        when 3
          /^13[0-9][0-9]$/.test(parts[0]) && /^([1-9]|1[0-2])$/.test(parts[1]) && /^([1-9]?|[1-2][0-9]|3[0-1])$/.test parts[2]
      if valid
        if /^13[0-9][0-9]\/([1-9]|1[0-2])\/([1-9]|[1-2][0-9]|3[0-1])$/.test toEnglish input.value
          [y, m, d] = value.split '/'
          [y, m, d] = [+y, +m, +d]
          if jalali.isValidJalaaliDate y, m, d
            prevValue = value
            if i is 0
              fromCalendar.gotoDate y, m, d, true
            else
              toCalendar.gotoDate y, m, d, true
          else
            value = prevValue
        else    
          prevValue = value
      else
        value = prevValue
      input.value = toPersian value

  -> ["#{y0}/#{m0}/#{d0}", "#{y1}/#{m1}/#{d1}"]