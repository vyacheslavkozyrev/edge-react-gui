// @flow

import { Platform, StyleSheet } from 'react-native'

import THEME from '../../../../theme/variables/airbitz'
import { scale } from '../../../../util/scaling.js'

export const styles = StyleSheet.create({
  container: {
    width: '90%',
    minHeight: Platform.OS === 'ios' ? THEME.rem(7.875) : THEME.rem(8.5),
    backgroundColor: THEME.COLORS.ACCENT_BLUE,
    borderRadius: 5,
    flexDirection: 'column',
    alignSelf: 'center',
    justifyContent: 'center',
    paddingVertical: scale(12)
  },
  flipContainerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: scale(8)
  },
  flipContainerHeaderIcon: {
    height: scale(22),
    width: scale(22),
    marginLeft: scale(13),
    marginRight: scale(13),
    resizeMode: 'cover'
  },
  flipContainerHeaderTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    color: THEME.COLORS.WHITE
  },
  flipContainerHeaderText: {
    fontSize: scale(15),
    color: THEME.COLORS.WHITE
  },
  flipContainerHeaderTextDropDown: {
    marginLeft: scale(3),
    color: THEME.COLORS.WHITE
  },
  flipContainerBody: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  flipContainerFront: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backfaceVisibility: 'hidden'
  },
  flipContainerBack: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  flipButton: {
    backgroundColor: THEME.COLORS.TRANSPARENT,
    marginLeft: scale(13),
    marginRight: scale(9),
    alignItems: 'center',
    justifyContent: 'center'
  },
  flipIcon: {
    color: THEME.COLORS.GRAY_3
  },
  rows: {
    flex: 1,
    flexDirection: 'column',
    marginRight: scale(23),
    backgroundColor: THEME.COLORS.TRANSPARENT
  },
  clipboardContainer: {
    width: '70%',
    height: 0,
    right: 0,
    alignItems: 'flex-end'
  },
  clipboardText: {
    color: THEME.COLORS.BLACK,
    fontSize: scale(16),
    padding: scale(4)
  }
})

export const top = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: scale(4),
    borderBottomColor: THEME.COLORS.OPAQUE_WHITE,
    borderBottomWidth: scale(1)
  },
  amountContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  amount: {
    width: '100%',
    fontSize: THEME.rem(1.5),
    fontFamily: THEME.FONTS.SYMBOLS,
    textAlign: 'right',
    padding: 0
  },
  amountPlaceholder: {
    color: THEME.COLORS.GRAY_2,
    fontSize: Platform.OS === 'ios' ? THEME.rem(1.5) : THEME.rem(1)
  },
  currencyCode: {
    fontSize: THEME.rem(1.5),
    color: THEME.COLORS.WHITE,
    textAlign: 'left',
    marginRight: THEME.rem(0.5)
  },
  textInput: {
    position: 'absolute',
    width: 0,
    height: 0
  }
})

export const bottom = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: scale(8)
  },
  amount: {
    width: '100%',
    fontSize: scale(10),
    color: THEME.COLORS.WHITE,
    opacity: THEME.OPACITY.MID,
    fontFamily: THEME.FONTS.SYMBOLS,
    textAlign: 'right',
    padding: 0
  },
  currencyCode: {
    fontSize: scale(10),
    color: THEME.COLORS.WHITE,
    opacity: THEME.OPACITY.MID,
    textAlign: 'right'
  },
  alert: {
    color: THEME.COLORS.WHITE,
    opacity: THEME.OPACITY.MID
  }
})
