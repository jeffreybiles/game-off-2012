level = require('./level')
lvl = object(level)

lvl.grid = [
  '1111111111111111',
  '1113331111333111',
  '1131111111111311',
  '1131111111111311',
  '1131111111111311',
  '1111111111111111',
  '1111111111111111',
  '1131111111111311',
  '1131111111111311',
  '1131111111111311',
  '1113331111333111',
  '1111111111111111',
  ]

lvl.enemies = [
  {type: 'moth'},
  {type: 'moth'},
  {type: 'moth'},
  {type: 'moth'},
  {type: 'moth'},
  {type: 'moth'},
  {type: 'moth'},
  {type: 'moth'},
  {},
  {}
]

lvl.name = 'arena 1'

lvl.createTerrain()

module.exports = lvl