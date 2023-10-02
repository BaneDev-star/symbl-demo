/* eslint-disable @typescript-eslint/no-var-requires */
// Overrides create-react-app webpack configs without ejecting
// https://github.com/timarney/react-app-rewired

const { override, addWebpackPlugin, useBabelRc } = require('customize-cra')
const webpack = require('webpack')

module.exports = override(
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useBabelRc(),
  (config) => {
    // Set fallback configurations
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    }

    // Add .ts and .js extensions
    config.resolve.extensions = [...config.resolve.extensions, '.ts', '.js']

    return config
  },
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ),
)
