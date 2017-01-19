jalali = require './jalali'

window.datepicker = (textbox, rightAlign) ->

  toPersian = (value) ->
    value = String value
    '۰۱۲۳۴۵۶۷۸۹'.split ''
    .forEach (digit, i) ->
      value = value.replace (new RegExp '' + i, 'g'), digit
    value

  extend = (target, sources...) ->
    sources.forEach (source) ->
      Object.keys(source).forEach (key) ->
        target[key] = source[key]
    target

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

  text = (text) ->
    document.createTextNode text

  onEvent = (element, event, callback) ->
    element.addEventListener event, callback

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

  {body} = document

  boxStyle = width: 50, height: 50, lineHeight: 50, textAlign: 'center'
  cellStyle = extend {display: 'inline-block', border: '1px solid black', marginLeft: -1, marginBottom: -1}, boxStyle
  chevronStyle = extend {position: 'absolute', cursor: 'pointer', top: 10}, boxStyle
  calendar = E calendarStyle = position: 'absolute', fontSize: 20, width: 7 * 50 + 6, height: 8 * 50 + 17, backgroundColor: 'white', border: '1px solid black', cursor: 'default',
    nextYear = E extend({left: 10}, chevronStyle), text '‹‹'
    nextMonth = E extend({left: 60}, chevronStyle), text '‹'
    headerText = E marginTop: 10, width: '100%', height: 50, lineHeight: 50, textAlign: 'center'
    prevMonth = E extend({right: 60}, chevronStyle), text '›'
    prevYear = E extend({right: 10}, chevronStyle), text '››'
    E direction: 'rtl',
      ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map (day, i) ->
        cell = E extend({backgroundColor: 'grey', color: 'white'}, cellStyle),
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
    append dateCells, [prevMonthLength - day + 1 .. prevMonthLength].map (date) ->
      cell = E extend({color: 'grey', cursor: 'pointer'}, cellStyle),
        text toPersian date
      if date is prevMonthLength - day + 1
        setStyle cell, marginRight: -1
      onEvent cell, 'click', ->
        gotoDate py, pm, date
      cell
    selectedDate = date
    append dateCells, [1 .. monthLength].map (date) ->
      cell = E extend({cursor: 'pointer'}, cellStyle),
        text toPersian date
      if ((day + date) % 7) is 1
        setStyle cell, marginRight: -1
      if date is selectedDate && month is displayMonth && year is displayYear
        setStyle cell, backgroundColor: 'lightblue'        
      onEvent cell, 'click', ->
        gotoDate year, month, date
      cell
    append dateCells, [1 .. 42 - monthLength - day].map (date) ->
      cell = E extend({color: 'grey', cursor: 'pointer'}, cellStyle),
        text toPersian date
      if ((day + date + monthLength) % 7) is 1
        setStyle cell, marginRight: -1
      onEvent cell, 'click', ->
        gotoDate ny, nm, date
      cell

  gotoDate = (y, m, d) ->
    [year, month, date] = [y, m, d]
    textbox.value = toPersian "#{year}/#{month}/#{date}"
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

  onEvent calendar, 'mousedown', (e) ->
    e.preventDefault()

  onEvent textbox, 'focus', ->
    {offsetWidth: width, offsetHeight: height} = textbox
    top = left = 0
    element = textbox
    loop
      top += element.offsetTop || 0
      left += element.offsetLeft || 0
      element = element.offsetParent
      break unless element

    setStyle calendar, top: top + height, left: if rightAlign then left + width - calendarStyle.width else left
    append body, calendar

  onEvent textbox, 'blur', (e) ->
    body.removeChild calendar