import {
  todayInfo,
  makeMessage,
  messageInfo,
  sendMessage,
  dateDiff
} from "../src/code";

describe("test code.ts", (): void => {
  beforeAll(() => {
    Logger.log = jest.fn().mockImplementation(msg => {
      return console.log(msg);
    });
    jest.spyOn(Logger, "log");
  });
  test("makeMessage", (): void => {
    let todayInfo: todayInfo = {
      todayPersons: ["hoge"],
      tomorrowPersons: ["huga"],
      nextweekPersons: ["oge"],
      blogName: "ブログリレー",
      day: 5
    };
    let response: string = makeMessage(todayInfo);
    expect(response).toBe(
      "@oge 担当日の一週間前です。準備をお願いします。\n@hoge 担当日当日です。記事の投稿をお願いします。\n今日の担当者への注意\n- 「明日の担当者は@huga です。」という内容を必ず含めてください。\n- 「ブログリレー」のタグをつけてください。\n- 記事の初めに「ブログリレー 5日目の記事です」という内容を書いてください。\n- post imageは必ず設定しましょう。"
    );
    todayInfo = {
      todayPersons: [],
      tomorrowPersons: [],
      nextweekPersons: [],
      blogName: "ブログリレー",
      day: -7
    };
    response = makeMessage(todayInfo);
    expect(response).toBe("");
  });
  test("dateDiff", (): void => {
    let response: number = dateDiff(
      new Date("2020/03/09"),
      new Date("2020/03/19")
    );
    expect(response).toBe(11);
    response = dateDiff(new Date("2020/03/09"), new Date("2020/03/09"));
    expect(response).toBe(1);
    response = dateDiff(new Date("2020/03/09"), new Date("2020/04/09"));
    expect(response).toBe(32);
    response = dateDiff(new Date("2020/03/09"), new Date("2021/03/09"));
    expect(response).toBe(366);
  });
});
