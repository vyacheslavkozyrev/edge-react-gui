// @flow

import { Platform } from 'react-native'

import changellyLogo from '../../assets/images/exchange/settingsExchangeChangelly.png'
import changenowLogo from '../../assets/images/exchange/settingsExchangeChangenow.png'
import coinswitchLogo from '../../assets/images/exchange/settingsExchangeCoinswitch.png'
import defaultLogo from '../../assets/images/exchange/settingsExchangeDefault.png'
import faastLogo from '../../assets/images/exchange/settingsExchangeFaast.png'
import foxExchangeLogo from '../../assets/images/exchange/settingsExchangeFoxExchange.png'
import godexLogo from '../../assets/images/exchange/settingsExchangeGodex.png'
import sideshiftLogo from '../../assets/images/exchange/settingsExchangeSideShiftAI.png'
import switchainLogo from '../../assets/images/exchange/settingsExchangeSwitchain.png'
import totleLogo from '../../assets/images/exchange/settingsExchangeTotle.png'
import guiPluginLogoBitaccess from '../../assets/images/guiPlugins/guiPluginLogoBitaccessDark.png'
import guiPluginLogoMoonpay from '../../assets/images/guiPlugins/guiPluginLogoMoonpayDark.png'
import fioAddressLogo from '../../assets/images/list_fioAddress.png'
import paymentTypeLogoApplePay from '../../assets/images/paymentTypes/paymentTypeLogoApplePay.png'
import paymentTypeLogoAuspost from '../../assets/images/paymentTypes/paymentTypeLogoAuspost.png'
import paymentTypeLogoBankgirot from '../../assets/images/paymentTypes/paymentTypeLogoBankgirot.png'
import paymentTypeLogoBankTransfer from '../../assets/images/paymentTypes/paymentTypeLogoBankTransfer.png'
import paymentTypeLogoBpay from '../../assets/images/paymentTypes/paymentTypeLogoBpay.png'
import paymentTypeLogoCash from '../../assets/images/paymentTypes/paymentTypeLogoCash.png'
import paymentTypeLogoCreditCard from '../../assets/images/paymentTypes/paymentTypeLogoCreditCard.png'
import paymentTypeLogoDebitCard from '../../assets/images/paymentTypes/paymentTypeLogoDebitCard.png'
import paymentTypeLogoFasterPayments from '../../assets/images/paymentTypes/paymentTypeLogoFasterPayments.png'
import paymentTypeLogoGiftCard from '../../assets/images/paymentTypes/paymentTypeLogoGiftCard.png'
import paymentTypeLogoIdeal from '../../assets/images/paymentTypes/paymentTypeLogoIdeal.png'
import paymentTypeLogoNewsagent from '../../assets/images/paymentTypes/paymentTypeLogoNewsagent.png'
import paymentTypeLogoPayid from '../../assets/images/paymentTypes/paymentTypeLogoPayid.png'
import paymentTypeLogoPoli from '../../assets/images/paymentTypes/paymentTypeLogoPoli.png'
import paymentTypeLogoSofort from '../../assets/images/paymentTypes/paymentTypeLogoSofort.png'
import paymentTypeLogoSwish from '../../assets/images/paymentTypes/paymentTypeLogoSwish.png'
import paymentTypeLogoUpi from '../../assets/images/paymentTypes/paymentTypeLogoUpi.png'
import walletListSlidingTutorial from '../../assets/images/tutorials/walletList_sliding_light.gif'
import { type Theme } from '../../types/Theme.js'
import { scale } from '../../util/scaling.js'

const palette = {
  primary: '#FF9400',
  midnight: '#021F3F',
  midnightDark: '#011327',
  black: '#000000',
  white: '#FFFFFF',
  whiteBlue: '#EEF3F6',
  lightestBlue: '#D1ECFF',
  edgeNavy: '#0D2145',
  edgeBlue: '#0E4B75',
  edgeMint: '#66EDA8',
  gray: '#87939E',
  lightGray: '#DBDBDB',
  lightestGray: '#F6F6F6',
  mutedBlue: '#2F5E89',
  mutedGray: '#EDEDED',
  accentGreen: '#05FF00',
  accentRed: '#FD2532',
  accentBlue: '#1248AB',
  accentOrange: '#FF8A00',

  blackOp25: 'rgba(0, 0, 0, .25)',
  blackOp50: 'rgba(0, 0, 0, .5)',
  blackOp10: 'rgba(0, 0, 0, .1)',
  grayOp80: 'rgba(135, 147, 158, .8)',
  whiteOp10: 'rgba(255, 255, 255, 0.1)',
  whiteOp50: 'rgba(255, 255, 255, .5)',
  whiteOp75: 'rgba(255, 255, 255, .75)',
  accentOrangeOp30: 'rgba(241, 170, 25, .3)',
  lightGrayOp75: 'rgba(217, 227, 237, .75)',
  transparent: 'rgba(255, 255, 255, 0)',

  midnightOp30: 'rgba(2, 31, 63, .3)',

  // Fonts
  SFUITextRegular: 'SF-UI-Text-Regular',
  QuicksandLight: 'Quicksand-Light',
  QuicksandRegular: 'Quicksand-Regular',
  QuicksandMedium: 'Quicksand-Medium',
  QuicksandSemiBold: 'Quicksand-SemiBold',
  QuicksandBold: 'Quicksand-Bold'
}

export const edgeLight: Theme = {
  rem(size: number): number {
    return Math.round(scale(16) * size)
  },

  // Icons
  icon: palette.black,
  iconTappable: palette.primary,
  warningIcon: palette.accentOrange,
  iconLoadingOverlay: palette.whiteOp75,
  transactionListIconBackground: palette.white,
  buySellCustomPluginModalIcon: palette.white,

  // Background
  backgroundGradientLeft: palette.midnight,
  backgroundGradientRight: palette.midnight,

  // Modal
  modal: palette.lightestGray,
  modalBlurType: 'dark',
  modalCloseIcon: palette.edgeMint,
  // modalFullGradientLeft: palette.white,
  // modalFullGradientRight: palette.white,

  // Tile
  // listHeaderBackground: palette.white,
  tileBackground: palette.transparent,
  tileBackgroundMuted: palette.transparent,
  // listSectionHeaderBackground: palette.white,

  // WalletList
  walletListBackground: palette.edgeBlue,
  walletListMutedBackground: palette.mutedBlue,

  // Text
  primaryText: palette.black,
  secondaryText: palette.gray,
  warningText: palette.accentOrange,
  positiveText: palette.accentGreen,
  negativeText: palette.accentRed,
  dangerText: palette.accentRed,
  textLink: palette.primary,
  deactivatedText: palette.gray,
  // listHeaderText: palette.black,

  // Header
  headerText: palette.whiteOp50,
  // hamburgerButton: palette.black,
  // backButton: palette.black,

  // Buttons
  // Should add palette when pressed
  primaryButtonOutline: palette.transparent,
  primaryButton: palette.edgeBlue,
  primaryButtonText: palette.edgeBlue,
  // primaryButtonDeactivated: palette.gray,

  secondaryButtonOutline: palette.edgeBlue,
  secondaryButton: palette.transparent,
  secondaryButtonText: palette.edgeBlue,

  // tertiaryButtonOutline: palette.edgeBlue,
  // tertiaryButton: palette.transparent,
  // tertiaryButtonText: palette.edgeBlue,

  // glassButton: palette.blackOp10,
  // glassButtonDark: palette.blackOp50,
  // glassButtonDarkIcon: palette.white,
  // glassButtonIcon: palette.edgeBlue,

  // dangerButtonOutline: palette.transparent,
  // dangerButton: palette.accentRed,
  // dangerButtonText: palette.white,

  buttonBoxShadow: palette.black,

  // cardBackground: palette.white,
  // cardShadow: palette.blackOp25,

  tabBarBackground: palette.primary,
  tabBarIcon: palette.midnightOp30,
  tabBarIconHighlighted: palette.midnight,

  sliderTabSend: palette.accentRed,
  sliderTabRequest: palette.primary,
  sliderTabMore: palette.accentBlue,

  // pinOutline: palette.edgeBlue,
  // pinFilled: palette.edgeBlue,

  // radioButtonOutline: palette.edgeNavy,
  // radioButtonFilled: palette.edgeBlue,

  toggleButton: palette.accentGreen,
  toggleButtonOff: palette.gray,
  // toggleButtonThumb: palette.white,

  // warningBubble: palette.accentOrange,

  // Confirmation slider
  // confirmationSlider: palette.blackOp10,
  // confirmationSliderText: palette.edgeBlue,
  // confirmationSliderArrow: palette.white,
  // confirmationSliderThumb: palette.edgeBlue,
  // confirmationSliderTextDeactivated: palette.gray,
  // confirmationThumbDeactivated: palette.gray,

  // Lines
  lineDivider: palette.edgeBlue,
  // textInputLine: palette.gray,
  // orLine: palette.gray,
  // tileDivider: palette.gray,
  thinLineWidth: 1,
  mediumLineWidth: 2,

  // Notifications
  // notificationBackground: palette.grayOp80,
  // messageBanner: palette.grayOp80,
  // bubble: palette.whiteOp10,

  // Alert Modal
  // securityAlertModalHeaderIcon: palette.accentOrange,
  // securityAlertModalRowBorder: palette.lightGray,
  // securityAlertModalWarningIcon: palette.accentOrange,
  // securityAlertModalDangerIcon: palette.accentRed,
  // securityAlertModalBackground: palette.white,
  // securityAlertModalText: palette.black,
  // securityAlertModalLine: palette.lightGray,
  // securityAlertModalHeaderIconShadow: palette.accentOrangeOp30,

  // Settings Row
  settingsRowBackground: palette.white,
  settingsRowPressed: palette.transparent,
  settingsRowHeaderBackground: palette.lightGray,
  settingsRowSubHeader: palette.transparent,

  // Native iOS date modal:
  dateModalTextLight: palette.accentBlue,
  dateModalTextDark: palette.white,
  dateModalBackgroundLight: palette.white,
  dateModalBackgroundDark: palette.edgeBlue,

  // Wallet Icon Progress
  walletProgressIconFill: palette.edgeMint,
  walletProgressIconFillDone: palette.transparent,
  walletProgressIconBackground: palette.transparent,

  // Misc
  // pressedOpacity: 0.25, // Should be removed when press colors are given to buttons and links
  searchListRefreshControlIndicator: palette.transparent,
  clipboardPopupText: palette.black,
  flipInputBorder: palette.edgeBlue,

  // Fonts
  fontFaceDefault: palette.QuicksandRegular,
  fontFaceBold: palette.QuicksandMedium,
  fontFaceSymbols: Platform.OS === 'android' ? palette.SFUITextRegular : palette.QuicksandRegular,

  // TouchableHighlights underlay
  underlayColor: palette.white,
  underlayOpacity: 0.95,

  // Tutorials
  tutorialModalUnderlay: palette.transparent,

  // QR code
  qrForegroundColor: palette.black,
  qrBackgroundColor: palette.white,

  // Input Accessory
  inputAccessoryBackground: palette.white,
  inputAccessoryText: palette.accentBlue,

  // Images
  settingsChangellyLogo: changellyLogo,
  settingsChangenowLogo: changenowLogo,
  settingsCoinswitchLogo: coinswitchLogo,
  settingsDefaultLogo: defaultLogo,
  settingsFaastLogo: faastLogo,
  settingsFoxExchangeLogo: foxExchangeLogo,
  settingsGodexLogo: godexLogo,
  settingsSideshiftLogo: sideshiftLogo,
  settingsSwitchainLogo: switchainLogo,
  settingsTotleLogo: totleLogo,

  paymentTypeLogoApplePay: paymentTypeLogoApplePay,
  paymentTypeLogoAuspost: paymentTypeLogoAuspost,
  paymentTypeLogoBankgirot: paymentTypeLogoBankgirot,
  paymentTypeLogoBankTransfer: paymentTypeLogoBankTransfer,
  paymentTypeLogoBpay: paymentTypeLogoBpay,
  paymentTypeLogoCash: paymentTypeLogoCash,
  paymentTypeLogoCreditCard: paymentTypeLogoCreditCard,
  paymentTypeLogoDebitCard: paymentTypeLogoDebitCard,
  paymentTypeLogoFasterPayments: paymentTypeLogoFasterPayments,
  paymentTypeLogoGiftCard: paymentTypeLogoGiftCard,
  paymentTypeLogoIdeal: paymentTypeLogoIdeal,
  paymentTypeLogoNewsagent: paymentTypeLogoNewsagent,
  paymentTypeLogoPayid: paymentTypeLogoPayid,
  paymentTypeLogoPoli: paymentTypeLogoPoli,
  paymentTypeLogoSofort: paymentTypeLogoSofort,
  paymentTypeLogoSwish: paymentTypeLogoSwish,
  paymentTypeLogoUpi: paymentTypeLogoUpi,

  fioAddressLogo: fioAddressLogo,
  walletListSlideTutorialImage: walletListSlidingTutorial,

  guiPluginLogoBitaccess: guiPluginLogoBitaccess,
  guiPluginLogoMoonpay: guiPluginLogoMoonpay
}
