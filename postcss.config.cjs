const fs = require('fs')

const breakpoints = JSON.parse(
  fs.readFileSync('./src/layouts/breakpoints.json'),
)

module.exports = {
  plugins: [
    require('postcss-constants')({defaults: {breakpoints}}),
    require('postcss-nested'),
  ],
}
