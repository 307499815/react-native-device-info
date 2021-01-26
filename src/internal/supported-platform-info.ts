import { Platform } from 'react-native';

import {
  PlatformArray,
  Getter,
  GetSupportedPlatformInfoAsyncParams,
  GetSupportedPlatformInfoSyncParams,
  GetSupportedPlatformInfoFunctionsParams,
} from './privateTypes';

type MemoType = { [key: string]: any };
// centralized memo object
const memo: MemoType = {};

const fromEntries = function(arr: any[]) {
    return arr.reduce(function(acc, curr: any[]) {
        acc[curr[0]] = curr[1];
        return acc;
    }, {});
};

/**
 * function returns the proper getter based current platform X supported platforms
 * @param supportedPlatforms array of supported platforms (OS)
 * @param getter desired function used to get info
 * @param defaultGetter getter that returns a default value if desired getter is not supported by current platform
 */
function getSupportedFunction<T>(
  supportedPlatforms: PlatformArray,
  getter: Getter<T>,
  defaultGetter: Getter<T>
): Getter<T> {
  const entries = supportedPlatforms
    .filter((key) => Platform.OS == key)
    .map((key) => [key, getter]);
  const supportedMap = fromEntries(entries);
  return Platform.select({
    ...supportedMap,
    default: defaultGetter,
  });
}

/**
 * function used to get desired info synchronously — with optional memoization
 * @param param0
 */
export function getSupportedPlatformInfoSync<T>({
  getter,
  supportedPlatforms,
  defaultValue,
  memoKey,
}: GetSupportedPlatformInfoSyncParams<T>): T {
  if (memoKey && memo[memoKey]) {
    return memo[memoKey];
  } else {
    const output = getSupportedFunction(supportedPlatforms, getter, () => defaultValue)();
    if (memoKey) {
      memo[memoKey] = output;
    }
    return output;
  }
}

/**
 * function used to get desired info asynchronously — with optional memoization
 * @param param0
 */
export async function getSupportedPlatformInfoAsync<T>({
  getter,
  supportedPlatforms,
  defaultValue,
  memoKey,
}: GetSupportedPlatformInfoAsyncParams<T>): Promise<T> {
  if (memoKey && memo[memoKey]) {
    return memo[memoKey];
  } else {
    const output = await getSupportedFunction(supportedPlatforms, getter, () =>
      Promise.resolve(defaultValue)
    )();
    if (memoKey) {
      memo[memoKey] = output;
    }

    return output;
  }
}

/**
 * function that returns array of getter functions [async, sync]
 * @param param0
 */
export function getSupportedPlatformInfoFunctions<T>({
  syncGetter,
  ...asyncParams
}: GetSupportedPlatformInfoFunctionsParams<T>): [Getter<Promise<T>>, Getter<T>] {
  return [
    () => getSupportedPlatformInfoAsync(asyncParams),
    () => getSupportedPlatformInfoSync({ ...asyncParams, getter: syncGetter }),
  ];
}
