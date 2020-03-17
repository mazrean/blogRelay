function myFunction() {
  const sheet = SpreadsheetApp.getActiveSheet()
  const dateIDs = sheet.getRange(1, 1, sheet.getLastRow(), 2).getValues().filter(values=>values[1]).map(values=>{
    values[0]=Utilities.formatDate(values[0], "JST", "yyyy/MM/dd")
    return values
  })
  const date = Date.now()
  const startDate = new Date(PropertiesService.getScriptProperties().getProperty("startDate"))
  const today = Utilities.formatDate(date, "JST", "yyyy/MM/dd")
  date.setDate(date.getDate()+1)
  const tomorrow = Utilities.formatDate(date, "JST", "yyyy/MM/dd")
  date.setDate(date.getDate()+6)
  const nextweek = Utilities.formatDate(date, "JST", "yyyy/MM/dd")
  const todayPersons = dateIDs.filter(values => values[0]===today).map(values => values[1])
  const tomorrowPersons = dateIDs.filter(values => values[0]===tomorrow).map(values => values[1])
  const nextweekPersons = dateIDs.filter(values => values[0]===nextweek).map(values => values[1])
  const day = (startDate - date) / 86400000 + 1
  makeMessage(todayPersons, tomorrowPersons, nextweekPersons, day)
}

function makeMessage(todayPersons, tomorrowPersons, nextweekPersons, day) {
  let message = ""
  const toToday = todayPersons.reduce((str,item)=>`${str}@${item} `,'')
  const toTomorrow = tomorrowPersons.reduce((str,item)=>`${str}@${item} `,'')
  const toNextweek = nextweekPersons.reduce((str,item)=>`${str}@${item} `,'')
  const blogName = PropertiesService.getScriptProperties().getProperty("name")
  if (toNextweek) {
    message += toNextweek + "担当日の一週間前です。準備をお願いします。\n"
  }
  if (toToday) {
    message += toToday + "担当日当日です。記事の投稿をお願いします。\n"
  }
  if (toTomorrow) {
    message += "注意\n- 「明日の担当者は" + toTomorrow + "です。」という内容を必ず含めてください。\n"
  }
  message += `- 「${blogName}」のタグをつけてください。\n- 記事の初めに「${blogName}${day}日目の記事です」と書いてください。\n- post imageは必ず設定しましょう。`
  if (message) {
    sendMessage(message)
  }
}

function sendMessage(message) {
  const webhookID = PropertiesService.getScriptProperties().getProperty("webhookID")
  const webhookSecret = PropertiesService.getScriptProperties().getProperty("webhookSecret")
  const webhookChannel = PropertiesService.getScriptProperties().getProperty("webhookChannel")
  const signature = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_1, message, webhookSecret, Utilities.Charset.UTF_8)
  const sign = signature.reduce((str,chr)=>{
    chr = (chr < 0 ? chr + 256 : chr).toString(16)
    return str + (chr.length==1?'0':'') + chr
  },'')
  console.log(sign)
  const header = {
    "Content-Type": "text/plain; charset=utf-8",
    "X-TRAQ-Signature": sign,
    "X-TRAQ-Channel-Id": webhookChannel
  }
  const options = {
    "method": "post",
    "contentType": "text/plain; charset=utf-8",
    "headers": header,
    "payload": message
  }
  UrlFetchApp.fetch(`https://q.trap.jp/api/1.0/webhooks/${webhookID}?embed=1`, options)
}
