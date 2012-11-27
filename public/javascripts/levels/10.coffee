level = require('./level')
lvl = object(level)

lvl.grid = [
  '1111111111111111',
  '1111111111114111',
  '1111411111111411',
  '1111111114111111',
  '1111111111111111',
  '1111114111111111',
  '1111111111111111',
  '1114111111141111',
  '1111111111111111',
  '1111114111111111',
  '1111111111114111',
  '1111111111111111',
  ]

lvl.enemies = [
  {},
  {},
  {},
  {type: 'moth'},
  {type: 'moth'},
  {type: 'moth'},
  {type: 'centurion'}
]

lvl.name = 'minefield'

lvl.createTerrain()

module.exports = lvl