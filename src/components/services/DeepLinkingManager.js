// @flow
/* global requestAnimationFrame */

import * as React from 'react'
import { Linking } from 'react-native'
import { connect } from 'react-redux'

import ENV from '../../../env.json'
import { launchDeepLink, retryPendingDeepLink } from '../../actions/DeepLinkingActions.js'
import { type WalletsState } from '../../reducers/scenes/WalletsReducer.js'
import { type DeepLink, parseDeepLink } from '../../types/DeepLink.js'
import { type Dispatch, type RootState } from '../../types/reduxTypes.js'
import { showError } from './AirshipInstance.js'

type StateProps = {
  pendingDeepLink: DeepLink | null,

  // We don't actually read these, but we need them to trigger updates:
  accountReferralLoaded: boolean,
  wallets: WalletsState
}

type DispatchProps = {
  launchDeepLink(link: DeepLink): void,
  retryPendingDeepLink(): void
}

type Props = StateProps & DispatchProps

class DeepLinkingManagerComponent extends React.Component<Props> {
  componentDidMount() {
    Linking.addEventListener('url', this.handleLinkEvent)
    Linking.getInitialURL()
      .then(url => {
        if (url == null && ENV.YOLO_DEEP_LINK != null) url = ENV.YOLO_DEEP_LINK
        if (url != null) this.props.launchDeepLink(parseDeepLink(url))
      })
      .catch(showError)
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleLinkEvent)
  }

  // Retry links that need a different app state:
  componentDidUpdate() {
    const { pendingDeepLink } = this.props
    if (pendingDeepLink == null) return

    // Wait a bit, since logging in can sometimes stomp us:
    requestAnimationFrame(() => this.props.retryPendingDeepLink())
  }

  render() {
    return null
  }

  handleLinkEvent = (event: any) => {
    try {
      this.props.launchDeepLink(parseDeepLink(event.url))
    } catch (error) {
      showError(error)
    }
  }
}

export const DeepLinkingManager = connect(
  (state: RootState): StateProps => ({
    pendingDeepLink: state.pendingDeepLink,
    accountReferralLoaded: state.account.accountReferralLoaded,
    wallets: state.ui.wallets
  }),

  (dispatch: Dispatch): DispatchProps => ({
    launchDeepLink(link) {
      dispatch(launchDeepLink(link))
    },
    retryPendingDeepLink() {
      dispatch(retryPendingDeepLink())
    }
  })
)(DeepLinkingManagerComponent)
