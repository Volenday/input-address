const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
	mode: 'production',
	context: __dirname,
	devtool: false,
	entry: {
		index: ['core-js/stable', 'regenerator-runtime/runtime', './index.js']
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel-loader',
				query: {
					presets: ['@babel/react', '@babel/env'],
					plugins: [
						'react-html-attrs',
						['@babel/proposal-decorators', { legacy: true }],
						'@babel/proposal-class-properties',
						'@babel/plugin-proposal-export-default-from',
						'@babel/plugin-syntax-dynamic-import'
					]
				}
			},
			{
				test: /\.(css|scss)$/,
				use: ['style-loader', 'css-loader', 'sass-loader']
			},
			{
				test: /\.(ttf|eot|woff|woff2)$/,
				loader: 'file-loader',
				options: {
					name: 'fonts/[name].[ext]'
				}
			},
			{
				test: /\.(jpg|png|svg|gif)$/,
				use: {
					loader: 'file-loader',
					options: {
						name: 'images/[name].[hash].[ext]'
					}
				}
			}
		]
	},
	output: {
		path: `${__dirname}/dist/`,
		filename: '[name].min.js',
		chunkFilename: '[name].[chunkhash].chunk.min.js',
		libraryTarget: 'commonjs2'
	},
	externals: {
		'react-google-maps': 'react-google-maps',
		'validate.js': 'validate.js',
		antd: 'antd',
		react: 'react',
		'react-dom': 'react-dom'
	},
	plugins: [
		new webpack.optimize.AggressiveMergingPlugin(),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		}),
		new CompressionPlugin({
			filename: '[path].gz[query]',
			algorithm: 'gzip',
			test: /\.js$|\.css$|\.html$/,
			threshold: 10240,
			minRatio: 0.7
		})
	]
};
