// @flow

import Clipboard from '@react-native-community/clipboard'
import { bns } from 'biggystring'
import type { EdgeCurrencyInfo, EdgeCurrencyWallet, EdgeEncodeUri } from 'edge-core-js'
import * as React from 'react'
import type { RefObject } from 'react-native'
import { ActivityIndicator, InputAccessoryView, Linking, Platform, Text, TouchableOpacity, View } from 'react-native'
import { Actions } from 'react-native-router-flux'
import Share from 'react-native-share'
import { connect } from 'react-redux'
import { sprintf } from 'sprintf-js'

import { refreshReceiveAddressRequest, selectWalletFromModal } from '../../actions/WalletActions'
import * as Constants from '../../constants/indexConstants'
import { formatNumber } from '../../locales/intl.js'
import s from '../../locales/strings.js'
import { refreshAllFioAddresses } from '../../modules/FioAddress/action'
import * as SETTINGS_SELECTORS from '../../modules/Settings/selectors.js'
import * as UI_SELECTORS from '../../modules/UI/selectors.js'
import { type Dispatch, type RootState } from '../../types/reduxTypes.js'
import type { GuiCurrencyInfo, GuiDenomination, GuiWallet } from '../../types/types.js'
import { decimalOrZero, DIVIDE_PRECISION, getCurrencyInfo, getDenomFromIsoCode, getObjectDiff, truncateDecimals } from '../../util/utils.js'
import { QrCode } from '../common/QrCode.js'
import { SceneWrapper } from '../common/SceneWrapper.js'
import { ButtonsModal } from '../modals/ButtonsModal.js'
import { type WalletListResult, WalletListModal } from '../modals/WalletListModal.js'
import { Airship, showError, showToast } from '../services/AirshipInstance.js'
import { type Theme, type ThemeProps, cacheStyles, withTheme } from '../services/ThemeContext.js'
import { EdgeText } from '../themed/EdgeText.js'
import { type ExchangedFlipInputAmounts, ExchangedFlipInput } from '../themed/ExchangedFlipInput.js'
import { ShareButtons } from '../themed/ShareButtons.js'
import { RightChevronButton } from '../themed/ThemedButtons.js'

const PUBLIC_ADDRESS_REFRESH_MS = 2000

export type RequestStateProps = {
  currencyCode: string,
  currencyInfo: EdgeCurrencyInfo | null,
  edgeWallet: EdgeCurrencyWallet,
  exchangeSecondaryToPrimaryRatio: number,
  guiWallet: GuiWallet,
  loading: false,
  primaryCurrencyInfo: GuiCurrencyInfo,
  publicAddress: string,
  legacyAddress: string,
  secondaryCurrencyInfo: GuiCurrencyInfo,
  useLegacyAddress: boolean,
  fioAddressesExist: boolean,
  isConnected: boolean,
  balance?: string
}
export type RequestLoadingProps = {
  edgeWallet: null,
  currencyCode: null,
  currencyInfo: null,
  exchangeSecondaryToPrimaryRatio: null,
  guiWallet: null,
  loading: true,
  primaryCurrencyInfo: null,
  publicAddress: string,
  legacyAddress: string,
  secondaryCurrencyInfo: null,
  useLegacyAddress: null,
  fioAddressesExist: boolean,
  isConnected: boolean
}

export type RequestDispatchProps = {
  refreshReceiveAddressRequest(string): void,
  refreshAllFioAddresses: () => Promise<void>,
  onSelectWallet: (walletId: string, currencyCode: string) => void
}
type ModalState = 'NOT_YET_SHOWN' | 'VISIBLE' | 'SHOWN'
type CurrencyMinimumPopupState = { [currencyCode: string]: ModalState }

type LoadingProps = RequestLoadingProps & RequestDispatchProps & ThemeProps
type LoadedProps = RequestStateProps & RequestDispatchProps & ThemeProps
type Props = LoadingProps | LoadedProps

type State = {
  publicAddress: string,
  legacyAddress: string,
  encodedURI: string,
  minimumPopupModalState: CurrencyMinimumPopupState,
  isFioMode: boolean,
  qrCodeContainerHeight: number
}

const inputAccessoryViewID: string = 'cancelHeaderId'

export class RequestComponent extends React.PureComponent<Props, State> {
  amounts: ExchangedFlipInputAmounts
  flipInput: RefObject | null = null

  constructor(props: Props) {
    super(props)
    const minimumPopupModalState: CurrencyMinimumPopupState = {}
    Object.keys(Constants.SPECIAL_CURRENCY_INFO).forEach(currencyCode => {
      if (Constants.getSpecialCurrencyInfo(currencyCode).minimumPopupModals) {
        minimumPopupModalState[currencyCode] = 'NOT_YET_SHOWN'
      }
    })
    this.state = {
      publicAddress: props.publicAddress,
      legacyAddress: props.legacyAddress,
      encodedURI: '',
      minimumPopupModalState,
      isFioMode: false,
      qrCodeContainerHeight: 0
    }
    if (this.shouldShowMinimumModal(props)) {
      if (!props.currencyCode) return
      this.state.minimumPopupModalState[props.currencyCode] = 'VISIBLE'
      console.log('stop, in constructor')
      this.enqueueMinimumAmountModal()
    }
  }

  componentDidMount() {
    this.generateEncodedUri()
    this.props.refreshAllFioAddresses()
  }

  onCloseXRPMinimumModal = () => {
    const minimumPopupModalState: CurrencyMinimumPopupState = Object.assign({}, this.state.minimumPopupModalState)
    if (!this.props.currencyCode) return
    minimumPopupModalState[this.props.currencyCode] = 'SHOWN'
    this.setState({ minimumPopupModalState })
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    let diffElement2: string = ''
    const diffElement = getObjectDiff(this.props, nextProps, {
      primaryCurrencyInfo: true,
      secondaryCurrencyInfo: true,
      displayDenomination: true,
      exchangeDenomination: true
    })
    if (!diffElement) {
      diffElement2 = getObjectDiff(this.state, nextState)
    }
    return !!diffElement || !!diffElement2
  }

  async generateEncodedUri() {
    const { edgeWallet, useLegacyAddress, currencyCode } = this.props
    if (!currencyCode) return
    let { publicAddress, legacyAddress } = this.props
    const abcEncodeUri = {
      publicAddress: useLegacyAddress ? legacyAddress : publicAddress,
      currencyCode
    }
    let encodedURI = s.strings.loading
    try {
      encodedURI = edgeWallet ? await edgeWallet.encodeUri(abcEncodeUri) : s.strings.loading
      this.setState({
        encodedURI
      })
    } catch (e) {
      console.log(e)
      publicAddress = s.strings.loading
      legacyAddress = s.strings.loading
      this.setState({
        publicAddress,
        legacyAddress
      })
      setTimeout(() => {
        if (edgeWallet && edgeWallet.id) {
          this.props.refreshReceiveAddressRequest(edgeWallet.id)
        }
      }, PUBLIC_ADDRESS_REFRESH_MS)
    }
  }

  async componentDidUpdate(prevProps: Props) {
    const { props } = this
    if (props.loading || props.currencyCode === null) return

    const didAddressChange = this.state.publicAddress !== props.guiWallet.receiveAddress.publicAddress
    const changeLegacyPublic = props.useLegacyAddress !== prevProps.useLegacyAddress
    const didWalletChange = prevProps.edgeWallet && props.edgeWallet.id !== prevProps.edgeWallet.id

    if (didAddressChange || changeLegacyPublic || didWalletChange) {
      let publicAddress = props.guiWallet.receiveAddress.publicAddress
      let legacyAddress = props.guiWallet.receiveAddress.legacyAddress

      const abcEncodeUri = props.useLegacyAddress
        ? { publicAddress, legacyAddress, currencyCode: props.currencyCode }
        : { publicAddress, currencyCode: props.currencyCode }
      let encodedURI = s.strings.loading
      try {
        encodedURI = props.edgeWallet ? await props.edgeWallet.encodeUri(abcEncodeUri) : s.strings.loading
      } catch (err) {
        console.log(err)
        publicAddress = s.strings.loading
        legacyAddress = s.strings.loading
        setTimeout(() => {
          if (props.edgeWallet && props.edgeWallet.id) {
            props.refreshReceiveAddressRequest(props.edgeWallet.id)
          }
        }, PUBLIC_ADDRESS_REFRESH_MS)
      }

      this.setState({
        encodedURI,
        publicAddress: publicAddress,
        legacyAddress: legacyAddress
      })
    }
    // old blank address to new
    // include 'didAddressChange' because didWalletChange returns false upon initial request scene load
    if (didWalletChange || didAddressChange) {
      if (this.shouldShowMinimumModal(props)) {
        const minimumPopupModalState: CurrencyMinimumPopupState = Object.assign({}, this.state.minimumPopupModalState)
        if (minimumPopupModalState[props.currencyCode] === 'NOT_YET_SHOWN') {
          this.enqueueMinimumAmountModal()
        }
        minimumPopupModalState[props.currencyCode] = 'VISIBLE'
        this.setState({ minimumPopupModalState })
      }
    }
  }

  enqueueMinimumAmountModal = async () => {
    const { currencyCode } = this.props
    if (currencyCode == null) return
    const { minimumPopupModals } = Constants.getSpecialCurrencyInfo(currencyCode)
    if (minimumPopupModals == null) return

    await Airship.show(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={s.strings.request_minimum_notification_title}
        message={minimumPopupModals.modalMessage}
        buttons={{ ok: { label: s.strings.string_ok } }}
      />
    ))

    // resolve value doesn't really matter here
    this.onCloseXRPMinimumModal()
  }

  onNext = () => {
    if (this.state.isFioMode) {
      this.setState({ isFioMode: false })
      this.fioAddressModal()
    }
  }

  flipInputRef = (ref: RefObject) => {
    this.flipInput = ref && ref.flipInput ? ref.flipInput.current : null
  }

  handleAddressBlockExplorer = () => {
    const { currencyInfo, useLegacyAddress } = this.props
    const addressExplorer = currencyInfo ? currencyInfo.addressExplorer : null
    const requestAddress = useLegacyAddress ? this.state.legacyAddress : this.state.publicAddress

    Airship.show(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={s.strings.modal_addressexplorer_message}
        message={requestAddress}
        buttons={{
          confirm: { label: s.strings.string_ok_cap },
          cancel: { label: s.strings.string_cancel_cap, type: 'secondary' }
        }}
      />
    ))
      .then((result?: string) => {
        return result === 'confirm' ? Linking.openURL(sprintf(addressExplorer, requestAddress)) : null
      })
      .catch(error => console.log(error))
  }

  handleOpenWalletListModal = () => {
    Airship.show(bridge => <WalletListModal bridge={bridge} headerTitle={s.strings.select_wallet} />).then(({ walletId, currencyCode }: WalletListResult) => {
      if (walletId && currencyCode) {
        this.props.onSelectWallet(walletId, currencyCode)
      }
    })
  }

  handleQrCodeLayout = (event: any) => {
    const { height } = event.nativeEvent.layout
    this.setState({ qrCodeContainerHeight: height })
  }

  render() {
    const { theme } = this.props
    const styles = getStyles(theme)

    if (this.props.loading) {
      return <ActivityIndicator color={theme.primaryText} style={styles.loader} size="large" />
    }

    const { balance, primaryCurrencyInfo, secondaryCurrencyInfo, exchangeSecondaryToPrimaryRatio, guiWallet } = this.props
    const requestAddress = this.props.useLegacyAddress ? this.state.legacyAddress : this.state.publicAddress
    const flipInputHeaderText = guiWallet ? sprintf(s.strings.send_to_wallet, guiWallet.name) : ''
    const flipInputHeaderLogo = guiWallet.symbolImageDarkMono
    const { keysOnlyMode = false } = Constants.getSpecialCurrencyInfo(primaryCurrencyInfo.displayCurrencyCode)
    const { displayCurrencyCode } = primaryCurrencyInfo

    return (
      <SceneWrapper background="header" hasTabs={false}>
        {keysOnlyMode !== true ? (
          <View style={styles.container}>
            <EdgeText style={styles.title}>{s.strings.fragment_request_subtitle}</EdgeText>
            <EdgeText style={styles.balance}>{sprintf(s.strings.request_balance, `${balance ?? 0} ${displayCurrencyCode}`)}</EdgeText>

            <ExchangedFlipInput
              ref={this.flipInputRef}
              headerText={flipInputHeaderText}
              headerLogo={flipInputHeaderLogo}
              primaryCurrencyInfo={primaryCurrencyInfo}
              secondaryCurrencyInfo={secondaryCurrencyInfo}
              exchangeSecondaryToPrimaryRatio={exchangeSecondaryToPrimaryRatio}
              overridePrimaryExchangeAmount=""
              forceUpdateGuiCounter={0}
              onExchangeAmountChanged={this.onExchangeAmountChanged}
              keyboardVisible={false}
              isFiatOnTop
              isFocus={false}
              onNext={this.onNext}
              topReturnKeyType={this.state.isFioMode ? 'next' : 'done'}
              inputAccessoryViewID={this.state.isFioMode ? inputAccessoryViewID : ''}
              headerCallback={this.handleOpenWalletListModal}
            />

            {Platform.OS === 'ios' ? (
              <InputAccessoryView backgroundColor={theme.inputAccessoryBackground} nativeID={inputAccessoryViewID}>
                <View style={styles.accessoryView}>
                  <TouchableOpacity style={styles.accessoryButton} onPress={this.cancelFioMode}>
                    <Text style={styles.accessoryText}>{this.state.isFioMode ? s.strings.string_cancel_cap : ''}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.accessoryButton} onPress={this.nextFioMode}>
                    <Text style={styles.accessoryText}>{this.state.isFioMode ? s.strings.string_next_capitalized : 'Done'}</Text>
                  </TouchableOpacity>
                </View>
              </InputAccessoryView>
            ) : null}
            <View style={styles.qrContainer} onLayout={this.handleQrCodeLayout}>
              {this.state.qrCodeContainerHeight < theme.rem(1) ? null : (
                <QrCode data={this.state.encodedURI} size={this.state.qrCodeContainerHeight - theme.rem(1)} />
              )}
            </View>
            <RightChevronButton
              paddingRem={[0, 0, 0.5, 0]}
              onPress={this.handleAddressBlockExplorer}
              text={s.strings.request_qr_your_receiving_wallet_address}
            />
            <EdgeText style={styles.publicAddressText}>{requestAddress}</EdgeText>
          </View>
        ) : (
          <EdgeText>{sprintf(s.strings.request_deprecated_currency_code, primaryCurrencyInfo.displayCurrencyCode)}</EdgeText>
        )}
        {keysOnlyMode !== true && (
          <ShareButtons shareViaShare={this.shareViaShare} copyToClipboard={this.copyToClipboard} fioAddressModal={this.fioAddressModal} />
        )}
      </SceneWrapper>
    )
  }

  onExchangeAmountChanged = async (amounts: ExchangedFlipInputAmounts) => {
    const { publicAddress, legacyAddress } = this.state
    const { currencyCode } = this.props
    this.amounts = amounts
    if (!currencyCode) return
    const edgeEncodeUri: EdgeEncodeUri =
      this.props.useLegacyAddress && legacyAddress ? { publicAddress, legacyAddress, currencyCode } : { publicAddress, currencyCode }
    if (bns.gt(amounts.nativeAmount, '0')) {
      edgeEncodeUri.nativeAmount = amounts.nativeAmount
    }
    let encodedURI = s.strings.loading
    try {
      encodedURI = this.props.edgeWallet ? await this.props.edgeWallet.encodeUri(edgeEncodeUri) : s.strings.loading
    } catch (e) {
      console.log(e)
      setTimeout(() => {
        if (this.props.edgeWallet && this.props.edgeWallet.id) {
          this.props.refreshReceiveAddressRequest(this.props.edgeWallet.id)
        }
      }, PUBLIC_ADDRESS_REFRESH_MS)
    }

    this.setState({ encodedURI })
  }

  copyToClipboard = () => {
    const requestAddress = this.props.useLegacyAddress ? this.state.legacyAddress : this.state.publicAddress
    Clipboard.setString(requestAddress)
    showToast(s.strings.fragment_request_address_copied)
  }

  shouldShowMinimumModal = (props: Props): boolean => {
    if (!props.currencyCode) return false
    if (this.state.minimumPopupModalState[props.currencyCode]) {
      if (this.state.minimumPopupModalState[props.currencyCode] === 'NOT_YET_SHOWN') {
        const { minimumPopupModals } = Constants.getSpecialCurrencyInfo(props.currencyCode)
        const minBalance = minimumPopupModals != null ? minimumPopupModals.minimumNativeBalance : '0'
        if (bns.lt(props.guiWallet.primaryNativeBalance, minBalance)) {
          return true
        }
      }
    }
    return false
  }

  shareMessage = async () => {
    const { currencyCode, publicAddress, edgeWallet } = this.props
    const { legacyAddress } = this.state
    if (!currencyCode || !edgeWallet) {
      throw new Error('Wallet still loading. Please wait and try again.')
    }
    let sharedAddress = this.state.encodedURI
    let edgePayUri = 'https://deep.edge.app/'
    let addOnMessage = ''
    // if encoded (like XTZ), only share the public address
    if (Constants.getSpecialCurrencyInfo(currencyCode).isUriEncodedStructure) {
      sharedAddress = publicAddress
    } else {
      // Rebuild uri to preserve uriPrefix if amount is 0
      if (sharedAddress.indexOf('amount') === -1) {
        const edgeEncodeUri: EdgeEncodeUri =
          this.props.useLegacyAddress && legacyAddress
            ? { publicAddress, legacyAddress, currencyCode, nativeAmount: '0' }
            : { publicAddress, currencyCode, nativeAmount: '0' }
        const newUri = await edgeWallet.encodeUri(edgeEncodeUri)
        sharedAddress = newUri.substring(0, newUri.indexOf('?'))
      }
      edgePayUri = edgePayUri + `pay/${sharedAddress.replace(':', '/')}`
      addOnMessage = `\n\n${sprintf(s.strings.request_qr_email_title, s.strings.app_name_short)}\n\n`
    }

    const message = `${sharedAddress}${addOnMessage}`
    const shareOptions = {
      message: Platform.OS === 'ios' ? message : message + edgePayUri,
      url: Platform.OS === 'ios' ? edgePayUri : ''
    }
    Share.open(shareOptions).catch(e => console.log(e))
  }

  shareViaShare = () => {
    this.shareMessage()
    // console.log('shareViaShare')
  }

  fioAddressModal = () => {
    if (!this.props.isConnected) {
      showError(s.strings.fio_network_alert_text)
      return
    }
    if (!this.props.fioAddressesExist) {
      showError(`${s.strings.title_register_fio_address}. ${s.strings.fio_request_by_fio_address_error_no_address}`)
      return
    }
    if (!this.amounts || bns.lte(this.amounts.nativeAmount, '0')) {
      if (Platform.OS === 'android') {
        showError(`${s.strings.fio_request_by_fio_address_error_invalid_amount_header}. ${s.strings.fio_request_by_fio_address_error_invalid_amount}`)
        return
      } else {
        this.fioMode()
        return
      }
    }
    Actions[Constants.FIO_REQUEST_CONFIRMATION]({ amounts: this.amounts })
  }

  fioMode = () => {
    if (this.flipInput && Platform.OS === 'ios') {
      this.flipInput.textInputTopFocus()
      this.setState({ isFioMode: true })
    }
  }

  cancelFioMode = () => {
    this.setState({ isFioMode: false }, () => {
      if (this.flipInput) {
        this.flipInput.textInputTopBlur()
      }
    })
  }

  nextFioMode = () => {
    if (this.state.isFioMode && (!this.amounts || bns.lte(this.amounts.nativeAmount, '0'))) {
      showError(`${s.strings.fio_request_by_fio_address_error_invalid_amount_header}. ${s.strings.fio_request_by_fio_address_error_invalid_amount}`)
    } else {
      if (this.flipInput) {
        this.flipInput.textInputTopBlur()
      }
      this.onNext()
    }
  }
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: theme.rem(1)
  },

  title: {
    fontFamily: theme.fontFaceBold,
    fontSize: theme.rem(2)
  },
  balance: {
    fontSize: theme.rem(1.0),
    marginBottom: theme.rem(0.5)
  },

  qrContainer: {
    alignSelf: 'center',
    aspectRatio: 1,
    backgroundColor: theme.qrBackgroundColor,
    borderRadius: theme.rem(0.5),
    flex: 1,
    margin: theme.rem(2),
    padding: theme.rem(0.5)
  },

  accessoryView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.inputAccessoryBackground
  },
  accessoryButton: {
    paddingVertical: theme.rem(0.5),
    paddingHorizontal: theme.rem(1)
  },
  accessoryText: {
    color: theme.inputAccessoryText
  },
  publicAddressText: {
    fontSize: theme.rem(0.75)
  },
  loader: {
    flex: 1,
    alignSelf: 'center'
  }
}))

export const Request = connect(
  (state: RootState): RequestStateProps | RequestLoadingProps => {
    const { account } = state.core
    const { currencyWallets = {} } = account
    const guiWallet: GuiWallet = UI_SELECTORS.getSelectedWallet(state)
    const currencyCode: string = UI_SELECTORS.getSelectedCurrencyCode(state)

    const plugins: Object = SETTINGS_SELECTORS.getPlugins(state)
    const allCurrencyInfos: EdgeCurrencyInfo[] = plugins.allCurrencyInfos
    const currencyInfo: EdgeCurrencyInfo | void = getCurrencyInfo(allCurrencyInfos, currencyCode)

    if (!guiWallet || !currencyCode) {
      return {
        currencyCode: null,
        currencyInfo: null,
        edgeWallet: null,
        exchangeSecondaryToPrimaryRatio: null,
        guiWallet: null,
        loading: true,
        primaryCurrencyInfo: null,
        secondaryCurrencyInfo: null,
        publicAddress: '',
        legacyAddress: '',
        useLegacyAddress: null,
        fioAddressesExist: false,
        isConnected: state.network.isConnected
      }
    }

    const edgeWallet: EdgeCurrencyWallet = currencyWallets[guiWallet.id]
    const primaryDisplayDenomination: GuiDenomination = SETTINGS_SELECTORS.getDisplayDenomination(state, currencyCode)
    const primaryExchangeDenomination: GuiDenomination = UI_SELECTORS.getExchangeDenomination(state, currencyCode)
    const secondaryExchangeDenomination: GuiDenomination = getDenomFromIsoCode(guiWallet.fiatCurrencyCode)
    const secondaryDisplayDenomination: GuiDenomination = secondaryExchangeDenomination
    const primaryExchangeCurrencyCode: string = primaryExchangeDenomination.name
    const secondaryExchangeCurrencyCode: string = secondaryExchangeDenomination.name ? secondaryExchangeDenomination.name : ''

    const primaryCurrencyInfo: GuiCurrencyInfo = {
      displayCurrencyCode: currencyCode,
      displayDenomination: primaryDisplayDenomination,
      exchangeCurrencyCode: primaryExchangeCurrencyCode,
      exchangeDenomination: primaryExchangeDenomination
    }
    const secondaryCurrencyInfo: GuiCurrencyInfo = {
      displayCurrencyCode: guiWallet.fiatCurrencyCode,
      displayDenomination: secondaryDisplayDenomination,
      exchangeCurrencyCode: secondaryExchangeCurrencyCode,
      exchangeDenomination: secondaryExchangeDenomination
    }
    const isoFiatCurrencyCode: string = guiWallet.isoFiatCurrencyCode
    const exchangeSecondaryToPrimaryRatio = UI_SELECTORS.getExchangeRate(state, currencyCode, isoFiatCurrencyCode)
    const fioAddressesExist = !!state.ui.scenes.fioAddress.fioAddresses.length

    // balance
    const isToken = guiWallet.currencyCode !== currencyCode
    const nativeBalance = isToken ? guiWallet.nativeBalances[currencyCode] : guiWallet.primaryNativeBalance
    const displayBalance = truncateDecimals(bns.div(nativeBalance, primaryDisplayDenomination.multiplier, DIVIDE_PRECISION), 6)
    const balance = formatNumber(decimalOrZero(displayBalance, 6)) // check if infinitesimal (would display as zero), cut off trailing zeroes

    return {
      currencyCode,
      currencyInfo: currencyInfo || null,
      edgeWallet,
      exchangeSecondaryToPrimaryRatio,
      guiWallet,
      publicAddress: guiWallet?.receiveAddress?.publicAddress ?? '',
      legacyAddress: guiWallet?.receiveAddress?.legacyAddress ?? '',
      loading: false,
      primaryCurrencyInfo,
      secondaryCurrencyInfo,
      useLegacyAddress: state.ui.scenes.requestType.useLegacyAddress,
      fioAddressesExist,
      isConnected: state.network.isConnected,
      balance
    }
  },
  (dispatch: Dispatch): RequestDispatchProps => ({
    refreshReceiveAddressRequest: (walletId: string) => {
      dispatch(refreshReceiveAddressRequest(walletId))
    },
    refreshAllFioAddresses: () => dispatch(refreshAllFioAddresses()),
    onSelectWallet: (walletId: string, currencyCode: string) => dispatch(selectWalletFromModal(walletId, currencyCode))
  })
)(withTheme(RequestComponent))
