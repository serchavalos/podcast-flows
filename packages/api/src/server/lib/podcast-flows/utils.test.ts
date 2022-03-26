import { TimeInterval } from "../../storage";
import { getDateLimitByInterval, isAfter } from "./utils";

describe("getDateLimitByInterval", () => {
  it.each([
    [
      new Date(Date.parse("2022-04-02T02:39:28+02:00")),
      TimeInterval.DAILY,
      new Date(Date.parse("2022-04-01T00:00:00+02:00")),
    ],
    [
      new Date(Date.parse("2022-04-06T00:00:00+02:00")),
      TimeInterval.WEEKLY,
      new Date(Date.parse("2022-04-03T00:00:00+02:00")),
    ],
    [
      new Date(Date.parse("2022-04-02T02:39:28+02:00")),
      TimeInterval.MONTHLY,
      new Date(Date.parse("2022-03-01T01:00:00+02:00")),
    ],
  ])(
    "Date: %s Interval: %s returns %s",
    (inputDate: Date, interval: TimeInterval, expectedDate: Date) => {
      const dateLimit = getDateLimitByInterval(interval, inputDate);
      expect(dateLimit.getTime()).toBe(expectedDate.getTime());
    }
  );
});

describe("isAfter", () => {
  it.each([
    [new Date("2022-04-01"), new Date("2022-04-02"), false],
    [new Date("2022-04-01"), new Date("2022-04-01"), false],
    [new Date("2022-04-01"), new Date("2022-03-02"), true],
    [new Date("2022-04-01T22:00:00"), new Date("2022-04-01"), true],
  ])("%s > %s returns %s", (date1: Date, date2: Date, expected: boolean) => {
    expect(isAfter(date1, date2)).toBe(expected);
  });
});
