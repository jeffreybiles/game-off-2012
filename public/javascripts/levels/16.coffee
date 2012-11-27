level = require('./level')
lvl = object(level)

lvl.grid = [
  '5533433443343355',
  '5411111111111145',
  '3141111111111413',
  '4114111111114114',
  '1111111331111111',
  '1111111331111111',
  '1111111331111111',
  '1111111331111111',
  '4114111111111114',
  '3141111111111413',
  '5411111111111145',
  '5533433443343355',
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
  {},
  {},
  {type: 'centurion'}
]

lvl.name = 'arena 3: final brawl'

lvl.createTerrain()

module.exports = lvl