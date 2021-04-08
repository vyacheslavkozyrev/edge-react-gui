// @flow

import { type EdgeAccount } from 'edge-core-js/types'
import * as React from 'react'
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native'
import { sprintf } from 'sprintf-js'

import { swapPluginLogos } from '../../assets/images/exchange'
import s from '../../locales/strings.js'
import { ExchangeQuoteComponent } from '../../modules/UI/components/ExchangeQuote/ExchangeQuoteComponent.js'
import FormattedText from '../../modules/UI/components/FormattedText/FormattedText.ui.js'
import { Slider } from '../../modules/UI/components/Slider/Slider.ui.js'
import { THEME } from '../../theme/variables/airbitz.js'
import { type GuiSwapInfo } from '../../types/types.js'
import { scale } from '../../util/scaling.js'
import { logEvent } from '../../util/tracking.js'
import { CircleTimer } from '../common/CircleTimer'
import { SceneWrapper } from '../common/SceneWrapper.js'
import { swapVerifyTerms } from '../modals/SwapVerifyTermsModal.js'
import { showError } from '../services/AirshipInstance.js'

export type OwnProps = {
  swapInfo: GuiSwapInfo
}
export type StateProps = {
  account: EdgeAccount,
  fromCurrencyIcon: string,
  fromDenomination: string,
  fromWalletCurrencyName: string,
  pending: boolean,
  toCurrencyIcon: string,
  toDenomination: string,
  toWalletCurrencyName: string
}
export type DispatchProps = {
  shift(swapInfo: GuiSwapInfo): mixed,
  timeExpired(swapInfo: GuiSwapInfo): void
}
type Props = OwnProps & StateProps & DispatchProps

type State = {}

export class CryptoExchangeQuoteScreenComponent extends React.Component<Props, State> {
  calledApprove: true

  componentDidMount = () => {
    const { swapInfo } = this.props
    const { pluginId } = swapInfo.quote
    if (pluginId === 'changelly') {
      this.checkChangellyKYC().catch(showError)
    } else if (pluginId === 'changenow') {
      this.checkChangeNowKYC().catch(showError)
    } else if (pluginId === 'coinswitch') {
      this.checkCoinswitchKYC().catch(showError)
    } else if (pluginId === 'foxExchange') {
      this.checkFoxExchangeKYC().catch(showError)
    } else if (pluginId === 'switchain') {
      this.checkSwitchainKYC().catch(showError)
    }
    logEvent('SwapQuote')
  }

  componentWillUnmount() {
    const { swapInfo } = this.props
    if (!this.calledApprove) swapInfo.quote.close()
  }

  doShift = () => {
    const { shift, swapInfo } = this.props
    this.calledApprove = true
    shift(swapInfo)
  }

  renderSlider = () => {
    const { pending } = this.props
    if (pending) {
      return <ActivityIndicator color={THEME.COLORS.ACCENT_PRIMARY} style={{ flex: 1, alignSelf: 'center' }} size="small" />
    }
    return <Slider onSlidingComplete={this.doShift} sliderDisabled={pending} parentStyle={styles.slideContainer} />
  }

  renderTimer = () => {
    const { swapInfo, timeExpired } = this.props
    const { expirationDate } = swapInfo.quote

    if (!expirationDate) return null
    return <CircleTimer timeExpired={() => timeExpired(swapInfo)} expiration={expirationDate} />
  }

  async checkChangellyKYC() {
    const { account, swapInfo, timeExpired } = this.props
    const result = await swapVerifyTerms(account.swapConfig.changelly, [
      {
        text: s.strings.swap_terms_terms_link,
        uri: 'https://changelly.com/terms-of-use'
      },
      {
        text: s.strings.swap_terms_privacy_link,
        uri: 'https://changelly.com/privacy-policy'
      },
      {
        text: s.strings.swap_terms_kyc_link,
        uri: 'https://changelly.com/aml-kyc'
      }
    ])
    if (!result) timeExpired(swapInfo)
  }

  async checkSwitchainKYC() {
    const { account, swapInfo, timeExpired } = this.props
    const result = await swapVerifyTerms(account.swapConfig.switchain, [
      {
        text: s.strings.swap_terms_terms_link,
        uri: 'https://www.switchain.com/tos'
      },
      {
        text: s.strings.swap_terms_privacy_link,
        uri: 'https://www.switchain.com/policy'
      },
      {
        text: s.strings.swap_terms_kyc_link,
        uri: 'https://www.switchain.com/policy'
      }
    ])
    if (!result) timeExpired(swapInfo)
  }

  async checkChangeNowKYC() {
    const { account, swapInfo, timeExpired } = this.props
    const result = await swapVerifyTerms(account.swapConfig.changenow, [
      {
        text: s.strings.swap_terms_terms_link,
        uri: 'https://changenow.io/terms-of-use'
      },
      {
        text: s.strings.swap_terms_privacy_link,
        uri: 'https://changenow.io/privacy-policy'
      },
      {
        text: s.strings.swap_terms_kyc_link,
        uri: 'https://changenow.io/faq/kyc'
      }
    ])
    if (!result) timeExpired(swapInfo)
  }

  async checkCoinswitchKYC() {
    const { account, swapInfo, timeExpired } = this.props
    const result = await swapVerifyTerms(account.swapConfig.coinswitch, [
      {
        text: s.strings.swap_terms_terms_link,
        uri: 'https://coinswitch.co/terms'
      }
    ])
    if (!result) timeExpired(swapInfo)
  }

  async checkFoxExchangeKYC() {
    const { account, swapInfo, timeExpired } = this.props
    const result = await swapVerifyTerms(account.swapConfig.foxExchange, [
      {
        text: s.strings.swap_terms_terms_link,
        uri: 'https://fox.exchange/tos'
      }
    ])
    if (!result) timeExpired(swapInfo)
  }

  render() {
    const { fromCurrencyIcon, fromDenomination, fromWalletCurrencyName, swapInfo, toCurrencyIcon, toDenomination, toWalletCurrencyName } = this.props
    const { fee, fromDisplayAmount, fromFiat, toDisplayAmount, toFiat } = swapInfo
    const { isEstimate, pluginId } = swapInfo.quote
    const { fromWallet, toWallet } = swapInfo.request

    return (
      <SceneWrapper background="header">
        <ScrollView>
          <View style={styles.topLogoRow}>
            <Image source={swapPluginLogos[pluginId]} resizeMode="contain" style={styles.logoImage} />
          </View>
          <View style={styles.centerRow}>
            <ExchangeQuoteComponent
              cryptoAmount={fromDisplayAmount}
              currency={fromWalletCurrencyName}
              currencyCode={fromDenomination}
              fiatCurrencyAmount={fromFiat}
              fiatCurrencyCode={fromWallet.fiatCurrencyCode.replace('iso:', '')}
              headline={sprintf(s.strings.exchange_will_be_sent, fromDisplayAmount, fromDenomination)}
              isTop
              miningFee={fee}
              walletIcon={fromCurrencyIcon}
              walletName={fromWallet.name || ''}
            />
            <ExchangeQuoteComponent
              cryptoAmount={toDisplayAmount}
              currency={toWalletCurrencyName}
              currencyCode={toDenomination}
              fiatCurrencyAmount={toFiat}
              fiatCurrencyCode={toWallet.fiatCurrencyCode.replace('iso:', '')}
              headline={sprintf(s.strings.exchange_will_be_received, toDisplayAmount, toDenomination)}
              isEstimate={isEstimate}
              walletIcon={toCurrencyIcon}
              walletName={toWallet.name || ''}
            />
          </View>
          <View style={styles.confirmTextRow}>
            <FormattedText style={styles.confirmText}>{s.strings.confirm_to_complete_exchange}</FormattedText>
          </View>
          <View style={styles.bottomRow}>
            {this.renderSlider()}
            {this.renderTimer()}
          </View>
          <View style={{ height: 200 }} />
        </ScrollView>
      </SceneWrapper>
    )
  }
}

const rawStyles = {
  topLogoRow: {
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: scale(8),
    height: scale(55),
    paddingBottom: 4
  },
  logoImage: {
    position: 'relative',
    maxWidth: '70%',
    resizeMode: 'contain'
  },
  centerRow: {
    alignItems: 'center'
  },
  confirmTextRow: {
    paddingVertical: scale(12),
    alignItems: 'center',
    justifyContent: 'center'
  },
  bottomRow: {
    alignItems: 'center'
  },
  slideContainer: {
    height: scale(35),
    width: 270
  },
  confirmText: {
    color: THEME.COLORS.WHITE,
    fontSize: scale(14),
    width: '100%',
    textAlign: 'center'
  }
}
const styles: typeof rawStyles = StyleSheet.create(rawStyles)
