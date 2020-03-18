function makeMessage({
  todayPersons,
  tomorrowPersons,
  nextweekPersons,
  blogName,
  day
}: {
  todayPersons: string[];
  tomorrowPersons: string[];
  nextweekPersons: string[];
  blogName: string;
  day: number;
}): string {
  let message = "";
  const toToday: string = todayPersons.reduce(
    (str, item) => `${str}@${item} `,
    ""
  );
  const toTomorrow: string = tomorrowPersons.reduce(
    (str, item) => `${str}@${item} `,
    ""
  );
  const toNextweek: string = nextweekPersons.reduce(
    (str, item) => `${str}@${item} `,
    ""
  );
  if (toNextweek) {
    message += toNextweek + "担当日の一週間前です。準備をお願いします。\n";
  }
  if (toToday) {
    message += toToday + "担当日当日です。記事の投稿をお願いします。\n";
  }
  if (toTomorrow) {
    message +=
      "注意\n- 「明日の担当者は" +
      toTomorrow +
      "です。」という内容を必ず含めてください。\n";
  }
  message += `- 「${blogName}」のタグをつけてください。\n- 記事の初めに「${blogName}${day}日目の記事です」と書いてください。\n- post imageは必ず設定しましょう。`;
  return message;
}

function sendMessage(message: string): GoogleAppsScript.URL_Fetch.HTTPResponse {
  const webhookID: string = PropertiesService.getScriptProperties().getProperty(
    "webhookID"
  );
  const webhookSecret: string = PropertiesService.getScriptProperties().getProperty(
    "webhookSecret"
  );
  const webhookChannel: string = PropertiesService.getScriptProperties().getProperty(
    "webhookChannel"
  );
  const signature: number[] = Utilities.computeHmacSignature(
    Utilities.MacAlgorithm.HMAC_SHA_1,
    message,
    webhookSecret,
    Utilities.Charset.UTF_8
  );
  const sign: string = signature.reduce((str, chr) => {
    const char = (chr < 0 ? chr + 256 : chr).toString(16);
    return str + (char.length === 1 ? "0" : "") + char;
  }, "");
  const header: GoogleAppsScript.URL_Fetch.HttpHeaders = {
    "Content-Type": "text/plain; charset=utf-8",
    "X-TRAQ-Signature": sign,
    "X-TRAQ-Channel-Id": webhookChannel
  };
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "text/plain; charset=utf-8",
    headers: header,
    payload: message
  };
  const response: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(
    `https://q.trap.jp/api/1.0/webhooks/${webhookID}?embed=1`,
    options
  );
  return response;
}

function myFunction(): void {
  const sheet: GoogleAppsScript.Spreadsheet.Sheet = SpreadsheetApp.getActiveSheet();
  const dateIDs: string[][] = sheet
    .getRange(1, 1, sheet.getLastRow(), 2)
    .getValues()
    .filter(values => values[1])
    .map(values => {
      values[0] = Utilities.formatDate(values[0], "JST", "yyyy/MM/dd");
      return values;
    });
  const date: Date = new Date();
  const startDate: Date = new Date(
    PropertiesService.getScriptProperties().getProperty("startDate")
  );
  const today: string = Utilities.formatDate(date, "JST", "yyyy/MM/dd");
  date.setDate(date.getDate() + 1);
  const tomorrow: string = Utilities.formatDate(date, "JST", "yyyy/MM/dd");
  date.setDate(date.getDate() + 6);
  const nextweek: string = Utilities.formatDate(date, "JST", "yyyy/MM/dd");
  const todayPersons: string[] = dateIDs
    .filter(values => values[0] === today)
    .map(values => values[1]);
  const tomorrowPersons: string[] = dateIDs
    .filter(values => values[0] === tomorrow)
    .map(values => values[1]);
  const nextweekPersons: string[] = dateIDs
    .filter(values => values[0] === nextweek)
    .map(values => values[1]);
  const blogName: string = PropertiesService.getScriptProperties().getProperty(
    "name"
  );
  const day: number =
    (startDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) + 1;
  const message: string = makeMessage({
    todayPersons,
    tomorrowPersons,
    nextweekPersons,
    blogName,
    day
  });
  if (message) {
    sendMessage(message);
  }
}
