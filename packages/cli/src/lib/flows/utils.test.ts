import isEqual from 'date-fns/isEqual';
import { getDateLimitByInterval } from './utils';

describe('getDateLimitByInterval', () => {
  test('getDateLimitByInterval provides the right value of the interal "daily', () => {
    const actual = getDateLimitByInterval('daily', new Date(2020, 1, 2));
    const expected = new Date(2020, 1, 1);
    expect(isEqual(actual, expected)).toBeTruthy();
  });

  test('getDateLimitByInterval provides the right value of the interal "weekly"', () => {
    const actual = getDateLimitByInterval('weekly', new Date(2020, 1, 8));
    const expected = new Date(2020, 1, 1);
    expect(isEqual(actual, expected)).toBeTruthy();
  });
});
