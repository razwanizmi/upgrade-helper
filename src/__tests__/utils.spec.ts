import { PACKAGE_NAMES } from '../constants'
import '../releases/__mocks__/index'
import {
  getVersionsContentInDiff,
  replaceAppDetails,
  getChangelogURL,
  getDiffURL,
} from '../utils'

describe('getVersionsContentInDiff', () => {
  it('returns the versions in the provided range', () => {
    const versions = getVersionsContentInDiff({
      packageName: PACKAGE_NAMES.RN,
      fromVersion: '0.57.0',
      toVersion: '0.59.0',
    })

    expect(versions).toEqual([{ version: '0.59' }, { version: '0.58' }])
  })

  it('returns the versions in the provided range with release candidates', () => {
    const versions = getVersionsContentInDiff({
      packageName: PACKAGE_NAMES.RN,
      fromVersion: '0.56.0',
      toVersion: '0.59.0-rc.1',
    })

    expect(versions).toEqual([
      { version: '0.59' },
      { version: '0.58' },
      { version: '0.57' },
    ])
  })

  it('returns the versions in the provided range with patches specified', () => {
    const versions = getVersionsContentInDiff({
      packageName: PACKAGE_NAMES.RN,
      fromVersion: '0.57.2',
      toVersion: '0.59.9',
    })

    expect(versions).toEqual([{ version: '0.59' }, { version: '0.58' }])
  })
})

describe('getChangelogURL', () => {
  const { RN, RNM, RNW } = PACKAGE_NAMES
  test.each([
    [
      RN,
      '0.71.7',
      'https://github.com/facebook/react-native/blob/main/CHANGELOG.md#v0717',
    ],
    [
      RN,
      '0.71.6',
      'https://github.com/facebook/react-native/blob/main/CHANGELOG.md#v0716',
    ],
    [
      RNM,
      '0.71.5',
      'https://github.com/microsoft/react-native-macos/releases/tag/v0.71.5',
    ],
    [
      RNW,
      '0.71.4',
      'https://github.com/microsoft/react-native-windows/releases/tag/react-native-windows_v0.71.4',
    ],
  ])('getChangelogURL("%s", "%s") -> %s', (packageName, version, url) => {
    expect(getChangelogURL({ packageName, version })).toEqual(url)
  })
})

describe('getDiffURL', () => {
  const { RN, RNM, RNW } = PACKAGE_NAMES
  test.each([
    [
      RN,
      '',
      '0.76.9',
      '0.77.3',
      'https://api.github.com/repos/react-native-community/rn-diff-purge/contents/diffs/0.76.9..0.77.3.diff?ref=diffs',
    ],
    [
      RN,
      '',
      '0.70.0',
      '0.71.0',
      'https://api.github.com/repos/react-native-community/rn-diff-purge/contents/diffs/0.70.0..0.71.0.diff?ref=diffs',
    ],
    [
      RNM,
      '',
      '0.70.0',
      '0.71.0',
      'https://api.github.com/repos/acoates-ms/rnw-diff/contents/diffs/mac/0.70.0..0.71.0.diff?ref=diffs',
    ],
    [
      RNW,
      'cpp',
      '0.70.0',
      '0.71.0',
      'https://api.github.com/repos/acoates-ms/rnw-diff/contents/diffs/cpp/0.70.0..0.71.0.diff?ref=diffs',
    ],
  ])(
    'getDiffURL("%s", "%s", "%s", "%s") -> %s',
    (packageName, language, fromVersion, toVersion, expectedUrl) => {
      expect(
        getDiffURL({ packageName, language, fromVersion, toVersion })
      ).toEqual(expectedUrl)
    }
  )
})

describe('replaceAppDetails ', () => {
  test.each([
    // Don't change anything if no app name or package is passed.
    [
      'RnDiffApp/ios/RnDiffApp/main.m',
      '',
      '',
      'RnDiffApp/ios/RnDiffApp/main.m',
    ],
    [
      'android/app/src/debug/java/com/rndiffapp/ReactNativeFlipper.java',
      '',
      '',
      'android/app/src/debug/java/com/rndiffapp/ReactNativeFlipper.java',
    ],
    [
      'location = "group:RnDiffApp.xcodeproj">',
      '',
      '',
      'location = "group:RnDiffApp.xcodeproj">',
    ],
    // Update Java file path with correct app name and package.
    [
      'android/app/src/debug/java/com/rndiffapp/ReactNativeFlipper.java',
      'SuperApp',
      'au.org.mycorp',
      'android/app/src/debug/java/au/org/mycorp/ReactNativeFlipper.java',
    ],
    // Update the app details in file contents.
    [
      'location = "group:RnDiffApp.xcodeproj">',
      'MyFancyApp',
      '',
      'location = "group:MyFancyApp.xcodeproj">',
    ],
    [
      'applicationId "com.rndiffapp"',
      'ACoolApp',
      'net.foobar',
      'applicationId "net.foobar"',
    ],
    // Don't accidentally pick up other instances of "com" such as in domain
    // names, or android or facebook packages.
    [
      'apply plugin: "com.android.application"',
      'ACoolApp',
      'net.foobar',
      'apply plugin: "com.android.application"',
    ],
    [
      '* https://github.com/facebook/react-native',
      'ACoolApp',
      'net.foobar',
      '* https://github.com/facebook/react-native',
    ],
  ])(
    'replaceAppDetails("%s", "%s", "%s") -> %s',
    (path, appName, appPackage, newPath) => {
      expect(replaceAppDetails(path, appName, appPackage)).toEqual(newPath)
    }
  )
})
