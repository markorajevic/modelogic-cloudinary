const path = require('path');
const merge = require('lodash.merge');
const parseArgs = require('minimist');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');


require('dotenv').config({
	path: path.resolve(__dirname, '../../.env')
})


const {
	dev
} = parseArgs(process.argv.slice(2));


module.exports = {
	entry: './src/index.ts',

	output: {
		path: path.resolve(__dirname, './dist'),
		filename: `[name]${dev ? '' : '.min'}.js`,
	},

	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: [".ts", ".tsx", ".js"]
	},

	plugins: [
		new HtmlWebpackPlugin({
			title: 'Extension',
			filename: 'index.html',
			template: './index.html',
			inlineSource: 'main(?:.min)?.js$',
		}),
		new HtmlWebpackInlineSourcePlugin(),
	],

	mode: dev ? 'development' : 'production',

	module: {
		rules: [{
			test: /\.tsx?$/,
			loader: "ts-loader"
		},
		{
			test: /\.m?js$/,
			exclude: /(node_modules|bower_components)/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env'],
					plugins: ['@babel/plugin-proposal-object-rest-spread']
				}
			}
		}
		]
	},

	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		compress: true,
		port: 3000
	},

	devtool: 'source-map'
};