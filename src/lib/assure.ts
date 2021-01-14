import forEach from 'lodash/forEach';
import isNil from 'lodash/isNil';

export default function assure(
  where: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: { [key: string]: any },
): void {
  forEach(values, (value, key) => {
    if (isNil(value)) {
      throw new Error(`No ${key} supplied to ${where}`);
    }
  });
}
