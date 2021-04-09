// @flow

import { type EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Actions } from 'react-native-router-flux'
import { connect } from 'react-redux'

import { CREATE_WALLET_SELECT_FIAT, CURRENCY_PLUGIN_NAMES, getSpecialCurrencyInfo } from '../../constants/indexConstants.js'
import s from '../../locales/strings.js'
import { PrimaryButton } from '../../modules/UI/components/Buttons/PrimaryButton.ui.js'
import Text from '../../modules/UI/components/FormattedText/FormattedText.ui.js'
import Gradient from '../../modules/UI/components/Gradient/Gradient.ui'
import { errorModal } from '../../modules/UI/components/Modals/ErrorModal.js'
import SafeAreaView from '../../modules/UI/components/SafeAreaView/SafeAreaView.ui.js'
import { THEME } from '../../theme/variables/airbitz.js'
import { PLATFORM } from '../../theme/variables/platform.js'
import { type Dispatch, type RootState } from '../../types/reduxTypes.js'
import { type CreateWalletType } from '../../types/types.js'
import { scale } from '../../util/scaling.js'
import { FormField } from '../common/FormField.js'
import { launchModal } from '../common/ModalProvider.js'

type OwnProps = {
  selectedWalletType: CreateWalletType
}
type StateProps = {
  account: EdgeAccount
}
type DispatchProps = {}
type Props = OwnProps & StateProps & DispatchProps

type State = {
  input: string,
  error: string,
  isProcessing: boolean,
  cleanedPrivateKey: string
}

class CreateWalletImportComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      input: '',
      error: '',
      isProcessing: false,
      cleanedPrivateKey: ''
    }
  }

  handleNext = (): void => {
    const { account, selectedWalletType } = this.props
    const { input } = this.state
    const { currencyCode } = selectedWalletType
    const currencyPluginName = CURRENCY_PLUGIN_NAMES[currencyCode]
    const currencyPlugin = account.currencyConfig[currencyPluginName]

    this.setState({ isProcessing: true })
    currencyPlugin
      .importKey(input)
      .then(() => {
        Actions[CREATE_WALLET_SELECT_FIAT]({ selectedWalletType, cleanedPrivateKey: input })
      })
      .catch(error => launchModal(errorModal(s.strings.create_wallet_failed_import_header, error)))
      .then(() => this.setState({ isProcessing: false }))
  }

  onChangeText = (input: string) => {
    this.setState({ input })
  }

  render() {
    const { error, isProcessing, input } = this.state
    const { selectedWalletType } = this.props
    const { currencyCode } = selectedWalletType
    const specialCurrencyInfo = getSpecialCurrencyInfo(currencyCode)
    if (!specialCurrencyInfo.isImportKeySupported) throw new Error()
    const instructionSyntax = specialCurrencyInfo.isImportKeySupported.privateKeyInstructions
    const labelKeySyntax = specialCurrencyInfo.isImportKeySupported.privateKeyLabel
    return (
      <SafeAreaView>
        <View style={styles.scene}>
          <Gradient style={styles.gradient} />
          <View style={styles.view}>
            <View style={styles.createWalletPromptArea}>
              <Text style={styles.instructionalText}>{instructionSyntax}</Text>
            </View>
            <FormField
              autoFocus
              autoCorrect={false}
              onChangeText={this.onChangeText}
              label={labelKeySyntax}
              value={input}
              returnKeyType="next"
              onSubmitEditing={this.handleNext}
              multiline
              error={error}
            />
            <View style={styles.buttons}>
              <PrimaryButton style={styles.next} onPress={this.handleNext} disabled={isProcessing}>
                {isProcessing ? (
                  <ActivityIndicator color={THEME.COLORS.ACCENT_PRIMARY} />
                ) : (
                  <PrimaryButton.Text>{s.strings.string_next_capitalized}</PrimaryButton.Text>
                )}
              </PrimaryButton>
            </View>
          </View>
        </View>
      </SafeAreaView>
    )
  }
}

const rawStyles = {
  scene: {
    flex: 1,
    backgroundColor: THEME.COLORS.WHITE
  },
  gradient: {
    height: THEME.HEADER,
    width: '100%',
    position: 'absolute'
  },
  view: {
    position: 'relative',
    top: THEME.HEADER,
    paddingHorizontal: 20,
    height: PLATFORM.usableHeight
  },
  createWalletPromptArea: {
    paddingTop: scale(16),
    paddingBottom: scale(8)
  },
  instructionalText: {
    fontSize: scale(16),
    textAlign: 'center',
    color: THEME.COLORS.GRAY_1
  },
  buttons: {
    marginTop: scale(24),
    flexDirection: 'row'
  },
  next: {
    marginLeft: scale(1),
    flex: 1
  }
}
const styles: typeof rawStyles = StyleSheet.create(rawStyles)

export const CreateWalletImportScene = connect(
  (state: RootState): StateProps => ({
    account: state.core.account
  }),
  (dispatch: Dispatch): DispatchProps => ({})
)(CreateWalletImportComponent)
