// @flow

import { type EdgeCurrencyConfig, type EdgeCurrencyWallet } from 'edge-core-js'
import * as React from 'react'
import { ActivityIndicator, Image, ScrollView, View } from 'react-native'
import { Actions } from 'react-native-router-flux'
import { connect } from 'react-redux'
import { sprintf } from 'sprintf-js'

import * as Constants from '../../constants/indexConstants'
import s from '../../locales/strings.js'
import { createFioWallet } from '../../modules/FioAddress/action'
import { DomainListModal } from '../../modules/FioAddress/components/DomainListModal'
import { EditNameModal } from '../../modules/FioAddress/components/EditNameModal'
import { FIO_DOMAIN_IS_NOT_PUBLIC, FioError } from '../../modules/FioAddress/util'
import { getFioWallets } from '../../modules/UI/selectors'
import type { RootState } from '../../reducers/RootReducer'
import type { Dispatch } from '../../types/reduxTypes'
import type { FioDomain, FioPublicDomain } from '../../types/types'
import { openLink } from '../../util/utils'
import { SceneWrapper } from '../common/SceneWrapper'
import type { WalletListResult } from '../modals/WalletListModal'
import { WalletListModal } from '../modals/WalletListModal'
import { Airship, showError, showToast } from '../services/AirshipInstance'
import { type Theme, type ThemeProps, cacheStyles, withTheme } from '../services/ThemeContext.js'
import { EdgeText } from '../themed/EdgeText'
import { ClickableText, PrimaryButton } from '../themed/ThemedButtons'
import { Tile } from '../themed/Tile'

type State = {
  selectedWallet: EdgeCurrencyWallet | null,
  selectedDomain: FioDomain,
  publicDomains: FioDomain[],
  fioAddress: string,
  isValid: boolean,
  loading: boolean,
  walletLoading: boolean,
  domainsLoading: boolean,
  isAvailable: boolean,
  fieldPos: number,
  inputWidth: number,
  showFreeAddressLink: boolean
}

type StateProps = {
  fioWallets: EdgeCurrencyWallet[],
  fioPlugin: EdgeCurrencyConfig,
  isConnected: boolean
}

type DispatchProps = {
  createFioWallet: () => Promise<EdgeCurrencyWallet>
}

type Props = StateProps & DispatchProps & ThemeProps

class FioAddressRegister extends React.Component<Props, State> {
  fioCheckQueue: number = 0

  state = {
    selectedWallet: null,
    selectedDomain: Constants.FIO_DOMAIN_DEFAULT,
    publicDomains: [],
    fioAddress: '',
    isValid: true,
    isAvailable: false,
    loading: false,
    walletLoading: false,
    domainsLoading: true,
    fieldPos: 200,
    inputWidth: 0,
    showFreeAddressLink: false
  }

  componentDidMount() {
    const { fioWallets } = this.props
    this.getPublicDomains()
    this.checkFreeAddress()
    if (fioWallets.length > 0) {
      this.setState({
        selectedWallet: fioWallets[0]
      })
    } else {
      this.createFioWallet()
    }
    this.setState({ inputWidth: this.props.theme.rem(12.5) })
  }

  checkFreeAddress = async () => {
    try {
      const { fioPlugin } = this.props
      const publicDomains = await fioPlugin.otherMethods.getDomains(fioPlugin.currencyInfo.defaultSettings.freeAddressRef)
      if (publicDomains.findIndex((publicDomain: FioPublicDomain) => publicDomain.free) > -1) {
        this.setState({ showFreeAddressLink: true })
      }
    } catch (e) {
      //
      console.log(e)
    }
  }

  getPublicDomains = async () => {
    const { fioPlugin } = this.props
    try {
      const publicDomains = await fioPlugin.otherMethods.getDomains(fioPlugin.currencyInfo.defaultSettings.fallbackRef)
      const publicDomainsConverted = publicDomains
        .sort(publicDomain => (publicDomain.domain === Constants.FIO_DOMAIN_DEFAULT.name ? -1 : 1))
        .map((publicDomain: FioPublicDomain) => ({
          name: publicDomain.domain,
          expiration: new Date().toDateString(),
          isPublic: true,
          walletId: '',
          isFree: publicDomain.free
        }))
      this.setState({
        publicDomains: publicDomainsConverted,
        selectedDomain: publicDomainsConverted[0]
      })
    } catch (e) {
      //
    }
    this.setState({ domainsLoading: false })
  }

  createFioWallet = async (): Promise<void> => {
    const { createFioWallet } = this.props
    showToast(s.strings.preparing_fio_wallet)
    this.setState({ walletLoading: true })
    try {
      const wallet = await createFioWallet()
      this.setState({
        selectedWallet: wallet,
        walletLoading: false
      })
    } catch (e) {
      this.setState({ walletLoading: false })
      showError(s.strings.create_wallet_failed_message)
    }
  }

  registerFreeAddress = () => {
    const { fioPlugin, fioWallets } = this.props
    const { selectedWallet } = this.state
    if (!fioPlugin) return
    if (!fioWallets.length) return
    if (!selectedWallet) return
    const publicKey = selectedWallet.publicWalletInfo.keys.publicKey
    const url = `${fioPlugin.currencyInfo.defaultSettings.fioAddressRegUrl}${fioPlugin.currencyInfo.defaultSettings.freeAddressRef}?publicKey=${publicKey}`
    try {
      openLink(url)
    } catch (e) {
      showError(sprintf(s.strings.open_url_err, url))
    }
  }

  handleNextButton = (): void => {
    const { isConnected } = this.props
    const { fioAddress, selectedWallet, selectedDomain, isValid, isAvailable, loading, walletLoading } = this.state
    if (isValid && isAvailable && !loading && !walletLoading) {
      if (isConnected) {
        if (!selectedWallet) return showError(s.strings.create_wallet_failed_message)
        const fullAddress = `${fioAddress}${Constants.FIO_ADDRESS_DELIMITER}${selectedDomain.name}`
        if (selectedDomain.isFree) {
          Actions[Constants.FIO_NAME_CONFIRM]({
            fioName: fullAddress,
            paymentWallet: selectedWallet,
            fee: 0,
            ownerPublicKey: selectedWallet.publicWalletInfo.keys.publicKey
          })
        } else {
          Actions[Constants.FIO_ADDRESS_REGISTER_SELECT_WALLET]({
            fioAddress: fullAddress,
            selectedWallet,
            selectedDomain
          })
        }
      } else {
        showError(s.strings.fio_network_alert_text)
      }
    }
  }

  checkFioAddress(fioAddress: string, domain: string, isCustomDomain: boolean = false) {
    this.setState({
      loading: true
    })
    this.fioCheckQueue++
    setTimeout(async () => {
      // do not check if user continue typing fio address
      if (this.fioCheckQueue > 1) {
        return --this.fioCheckQueue
      }
      this.fioCheckQueue = 0
      const { fioPlugin } = this.props
      if (isCustomDomain) {
        try {
          const isDomainPublic = fioPlugin.otherMethods ? await fioPlugin.otherMethods.isDomainPublic(domain) : false
          if (!isDomainPublic) {
            throw new FioError(s.strings.fio_address_register_domain_is_not_public, FIO_DOMAIN_IS_NOT_PUBLIC)
          }
        } catch (e) {
          if (!e.labelCode || e.name !== 'FioError') {
            showError(s.strings.fio_connect_wallets_err)
          }
          return this.setState({
            isAvailable: false,
            loading: false
          })
        }
      }
      try {
        const fullAddress = `${fioAddress}${Constants.FIO_ADDRESS_DELIMITER}${domain}`
        const isAvailable = fioPlugin.otherMethods ? await fioPlugin.otherMethods.validateAccount(fullAddress) : false
        this.setState({
          isValid: true,
          isAvailable,
          loading: false
        })
      } catch (e) {
        this.setState({
          isValid: false,
          isAvailable: false,
          loading: false
        })
      }
    }, 1000)
  }

  handleFioAddressChange = (fioAddressChanged: string) => {
    if (!this.props.isConnected) {
      return this.setState({
        fioAddress: fioAddressChanged.toLowerCase(),
        loading: false
      })
    }
    this.checkFioAddress(fioAddressChanged, this.state.selectedDomain.name)

    this.setState({
      fioAddress: fioAddressChanged.toLowerCase()
    })
  }

  handleFioAddressFocus = () => {
    this.refs._scrollView.scrollTo({ x: 0, y: this.state.fieldPos, animated: true })
  }

  fieldViewOnLayout = ({ nativeEvent }) => {
    if (nativeEvent) {
      const {
        layout: { y }
      } = nativeEvent
      this.setState({ fieldPos: y })
    }
  }

  editAddressPressed = () => {
    this.handleFioAddressFocus()
    Airship.show(bridge => <EditNameModal bridge={bridge} title={s.strings.fio_address_choose_label} value={this.state.fioAddress} />).then(
      (response: string | null) => {
        if (response) {
          this.handleFioAddressChange(response)
        }
      }
    )
  }

  handleFioWalletChange = (walletId: string) => {
    this.setState({
      selectedWallet: this.props.fioWallets.find(fioWallet => fioWallet.id === walletId)
    })
  }

  selectFioWallet = () => {
    Airship.show(bridge => <WalletListModal bridge={bridge} headerTitle={s.strings.select_wallet} allowedCurrencyCodes={[Constants.FIO_STR]} />).then(
      ({ walletId, currencyCode }: WalletListResult) => {
        if (walletId && currencyCode) {
          if (currencyCode === Constants.FIO_STR) {
            this.handleFioWalletChange(walletId)
          } else {
            showError(`${s.strings.create_wallet_select_valid_crypto}: ${Constants.FIO_STR}`)
          }
        }
      }
    )
  }

  selectFioDomain = () => {
    const { domainsLoading } = this.state
    if (domainsLoading) return
    Airship.show(bridge => <DomainListModal bridge={bridge} publicDomains={this.state.publicDomains} />).then((response: FioDomain | null) => {
      if (response) {
        this.setState({ selectedDomain: response })
        this.checkFioAddress(this.state.fioAddress, response.name, !response.walletId)
      }
    })
  }

  renderButton() {
    const { isValid, isAvailable, loading, walletLoading } = this.state
    const styles = getStyles(this.props.theme)

    if (isValid && isAvailable && !loading) {
      return (
        <View style={styles.buttons}>
          <PrimaryButton
            style={styles.next}
            label={walletLoading ? '' : s.strings.string_next_capitalized}
            onPress={this.handleNextButton}
            disabled={!isAvailable || walletLoading}
          >
            {walletLoading ? <ActivityIndicator color={this.props.theme.icon} size="small" /> : null}
          </PrimaryButton>
        </View>
      )
    }

    return null
  }

  renderLoader() {
    const { theme } = this.props
    const { loading } = this.state
    const styles = getStyles(theme)

    const label = `(${s.strings.validating})`
    return loading ? <EdgeText style={styles.muted}>{label}</EdgeText> : null
  }

  renderFioWallets() {
    const { fioWallets } = this.props
    const { selectedWallet } = this.state

    if (fioWallets && fioWallets.length > 1) {
      const title = `${selectedWallet && selectedWallet.name ? selectedWallet.name : s.strings.fio_address_register_no_wallet_name}`
      return <Tile type="touchable" title={`${s.strings.title_fio_connect_to_wallet}`} onPress={this.selectFioWallet} body={title} />
    }
  }

  renderErrorMessage() {
    const { fioAddress, isAvailable, isValid, loading } = this.state
    const styles = getStyles(this.props.theme)
    let chooseHandleErrorMessage = ''

    if (loading) return null

    if (fioAddress && !this.props.isConnected) {
      chooseHandleErrorMessage = s.strings.fio_address_register_screen_cant_check
    }
    if (fioAddress && !isAvailable) {
      chooseHandleErrorMessage = s.strings.fio_address_register_screen_not_available
    }
    if (fioAddress && !isValid) {
      chooseHandleErrorMessage = s.strings.fio_error_invalid_address
    }

    return <EdgeText style={styles.errorMessage}>{chooseHandleErrorMessage}</EdgeText>
  }

  render() {
    const { theme } = this.props
    const { fioAddress, selectedDomain, domainsLoading, showFreeAddressLink } = this.state
    const styles = getStyles(theme)

    return (
      <SceneWrapper background="theme">
        <ScrollView ref="_scrollView">
          <View style={styles.view}>
            <Image source={theme.fioAddressLogo} style={styles.image} resizeMode="cover" />
            <View style={[styles.createWalletPromptArea, styles.title]}>
              <EdgeText style={styles.instructionalText} numberOfLines={2}>
                {s.strings.fio_address_first_screen_title}
              </EdgeText>
            </View>
            <View style={styles.createWalletPromptArea}>
              <EdgeText style={styles.handleRequirementsText} numberOfLines={3}>
                {s.strings.fio_address_features}
              </EdgeText>
            </View>
            <View style={styles.createWalletPromptArea}>
              <EdgeText style={styles.handleRequirementsText} numberOfLines={5}>
                {s.strings.fio_address_first_screen_end}
              </EdgeText>
            </View>

            <View onLayout={this.fieldViewOnLayout}>
              <Tile type="editable" title={s.strings.fio_address_choose_label} onPress={this.editAddressPressed}>
                <View style={styles.addressTileBody}>
                  {fioAddress ? (
                    <EdgeText style={styles.fioAddressName}>{fioAddress}</EdgeText>
                  ) : (
                    <EdgeText style={styles.muted}>{s.strings.fio_address_register_placeholder}</EdgeText>
                  )}
                  {this.renderLoader()}
                  {this.renderErrorMessage()}
                </View>
              </Tile>
              <Tile
                type="touchable"
                title={s.strings.fio_address_choose_domain_label}
                onPress={this.selectFioDomain}
                body={domainsLoading ? s.strings.loading : `${Constants.FIO_ADDRESS_DELIMITER}${selectedDomain.name}`}
              />
              {this.renderFioWallets()}
            </View>
            {this.renderButton()}
            {this.props.fioWallets.length && showFreeAddressLink ? (
              <ClickableText onPress={this.registerFreeAddress}>
                <EdgeText style={styles.link}>{s.strings.fio_address_reg_free}</EdgeText>
              </ClickableText>
            ) : null}
            <View style={styles.bottomSpace} />
          </View>
        </ScrollView>
      </SceneWrapper>
    )
  }
}

const getStyles = cacheStyles((theme: Theme) => ({
  view: {
    position: 'relative'
  },
  createWalletPromptArea: {
    paddingHorizontal: theme.rem(1),
    paddingBottom: theme.rem(1)
  },
  instructionalText: {
    fontSize: theme.rem(1),
    textAlign: 'center',
    color: theme.primaryText
  },
  handleRequirementsText: {
    fontSize: theme.rem(1),
    textAlign: 'left',
    color: theme.secondaryText
  },
  buttons: {
    marginTop: theme.rem(1.5),
    paddingHorizontal: theme.rem(1)
  },
  next: {
    flex: 1
  },

  addressTileBody: {
    flexDirection: 'row'
  },
  fioAddressName: {
    marginRight: theme.rem(1)
  },
  image: {
    alignSelf: 'center',
    marginTop: theme.rem(1.5),
    height: theme.rem(3.25),
    width: theme.rem(3.5)
  },
  title: {
    paddingTop: theme.rem(1.5)
  },
  bottomSpace: {
    paddingBottom: theme.rem(30)
  },
  selectWalletBlock: {
    marginTop: theme.rem(3),
    paddingHorizontal: theme.rem(1.25),
    paddingBottom: theme.rem(0.75),
    backgroundColor: theme.tileBackground
  },
  selectWalletBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.rem(1),
    paddingVertical: theme.rem(0.5),
    paddingHorizontal: theme.rem(0.25),
    backgroundColor: theme.primaryButton
  },
  domain: {
    marginTop: theme.rem(1.5),
    marginLeft: theme.rem(0.25),
    paddingHorizontal: theme.rem(0.75),
    paddingVertical: theme.rem(0.25),
    borderRadius: theme.rem(0.25),
    borderColor: theme.primaryButton,
    borderWidth: theme.rem(0.125)
  },
  domainText: {
    color: theme.primaryText,
    fontSize: theme.rem(1)
  },
  domainListRowName: {
    flex: 1,
    fontSize: theme.rem(1),
    color: theme.secondaryText
  },
  domainListRowContainerTop: {
    height: 'auto',
    paddingLeft: theme.rem(0.75),
    paddingRight: theme.rem(0.75),
    paddingVertical: theme.rem(0.75)
  },
  link: {
    fontSize: theme.rem(1),
    color: theme.textLink,
    textAlign: 'center'
  },
  errorMessage: {
    color: theme.dangerText
  },
  muted: {
    color: theme.deactivatedText
  }
}))

const FioAddressRegisterScene = connect(
  (state: RootState) => {
    const { account } = state.core
    if (!account || !account.currencyConfig) {
      return {
        fioWallets: [],
        fioPlugin: {},
        isConnected: state.network.isConnected
      }
    }
    const fioWallets: EdgeCurrencyWallet[] = getFioWallets(state)
    const fioPlugin = account.currencyConfig[Constants.CURRENCY_PLUGIN_NAMES.FIO]

    const out: StateProps = {
      fioWallets,
      fioPlugin,
      isConnected: state.network.isConnected
    }
    return out
  },
  (dispatch: Dispatch): DispatchProps => ({
    createFioWallet: () => dispatch(createFioWallet())
  })
)(withTheme(FioAddressRegister))
export { FioAddressRegisterScene }
