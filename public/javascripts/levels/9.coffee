level = require('./level')
lvl = object(level)

lvl.grid = [
  '1111111151111111',
  '1111111151111111',
  '1111111151111111',
  '1111111151111111',
  '1111111151111111',
  '1111111151111111',
  '1111111151111111',
  '1111111151111111',
  '1111111151111111',
  '1111111151111111',
  '1111111151111111',
  '1111111151111111',
  ]

lvl.enemies = [
  {type: 'centurion'},
  {type: 'moth'},
  {type: 'moth'},
  {type: 'moth'}
]

lvl.name = 'rubicon'

lvl.createTerrain()

module.exports = lvl