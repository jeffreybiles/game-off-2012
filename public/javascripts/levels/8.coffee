level = require('./level')
lvl = object(level)

lvl.grid = [
  '1111111111111111',
  '1111111111111111',
  '1111333333331111',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '1111333333331111',
  '1111111111111111',
  '1111111111111111',
  ]

lvl.enemies = [
  {x: 700, y: 275, type: 'centurion'},
]

lvl.name = 'implacable'

lvl.createTerrain()

module.exports = lvl