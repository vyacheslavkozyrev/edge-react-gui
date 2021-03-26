// @flow

import detectBundler from 'detect-bundler'
import { type EdgeContext, type EdgeContextOptions, type EdgeFakeWorld, MakeEdgeContext, MakeFakeEdgeWorld } from 'edge-core-js'
import makeAccountbasedIo from 'edge-currency-accountbased/lib/react-native-io.js'
import makeBitcoinIo from 'edge-currency-bitcoin/lib/react-native-io.js'
import makeMoneroIo from 'edge-currency-monero/lib/react-native-io.js'
import * as React from 'react'
import { Alert, AppState } from 'react-native'
import { getBrand, getDeviceId } from 'react-native-device-info'
import { callMyMonero } from 'react-native-mymonero-core'
import SplashScreen from 'react-native-smart-splash-screen'

import ENV from '../../../env.json'
import { allPlugins } from '../../util/corePlugins.js'
import { fakeUser } from '../../util/fake-user.js'
import { LoadingScene } from '../scenes/LoadingScene.js'
import { Services } from './Services.js'

global.moneroCore = { methodByString: callMyMonero }

type Props = {}

type State = {
  context: EdgeContext | null,
  counter: number
}

const contextOptions: EdgeContextOptions = {
  apiKey: ENV.AIRBITZ_API_KEY,
  appId: '',
  deviceDescription: `${getBrand()} ${getDeviceId()}`,

  // Use this to adjust logging verbosity on a plugin-by-plugin basis:
  logSettings: {
    defaultLogLevel: 'warn',
    sources: {
      'edge-core': 'warn'
    }
  },

  plugins: allPlugins,
  authServer: 'https://login-test.edge.app/api'
}

const isReactNative = detectBundler.isReactNative
const nativeIo = isReactNative
  ? {
      'edge-currency-accountbased': makeAccountbasedIo(),
      'edge-currency-bitcoin': makeBitcoinIo(),
      'edge-currency-monero': makeMoneroIo()
    }
  : {}

/**
 * Mounts the edge-core-js WebView, and then mounts the rest of the app
 * once the core context is ready.
 */
export class EdgeCoreManager extends React.PureComponent<Props, State> {
  splashHidden: boolean = false
  paused: boolean = false

  constructor(props: Props) {
    super(props)
    this.state = { context: null, counter: 0 }
  }

  componentDidMount() {
    AppState.addEventListener('change', this.onAppStateChange)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.onAppStateChange)
  }

  onAppStateChange = (appState: string) => {
    const paused = appState !== 'active'
    if (this.paused !== paused) {
      this.paused = paused

      const { context } = this.state
      if (context != null) {
        // TODO: Display a popdown error alert once we get that redux-free:
        context.changePaused(paused, { secondsDelay: paused ? 20 : 0 }).catch(e => console.log(e))
      }
    }
  }

  hideSplash() {
    if (!this.splashHidden) {
      this.splashHidden = true
      SplashScreen.close({
        animationType: SplashScreen.animationType.fade,
        duration: 850,
        delay: 500
      })
    }
  }

  onContext = (context: EdgeContext) => {
    console.log('EdgeContext opened')
    context.on('close', () => {
      console.log('EdgeContext closed')
      this.setState({ context: null })
    })
    this.setState(
      state => ({ context, counter: state.counter + 1 }),
      () => this.hideSplash()
    )
  }

  onError = (error: Error) => {
    console.log('EdgeContext failed', error)
    this.hideSplash()
    Alert.alert('Edge core failed to load', String(error))
  }

  onFakeEdgeWorld = (world: EdgeFakeWorld) => {
    world.makeEdgeContext({ ...contextOptions }).then(this.onContext, this.onError)
  }

  renderCore() {
    return ENV.USE_FAKE_CORE ? (
      <MakeFakeEdgeWorld debug={ENV.DEBUG_CORE_BRIDGE} users={[fakeUser]} onLoad={this.onFakeEdgeWorld} onError={this.onError} nativeIo={nativeIo} />
    ) : (
      <MakeEdgeContext debug={ENV.DEBUG_CORE_BRIDGE} options={contextOptions} onLoad={this.onContext} onError={this.onError} nativeIo={nativeIo} />
    )
  }

  render(): React.Node {
    const { context, counter } = this.state
    const key = `redux${counter}`

    return (
      <>
        {context == null ? <LoadingScene /> : <Services key={key} context={context} />}
        {this.renderCore()}
      </>
    )
  }
}
