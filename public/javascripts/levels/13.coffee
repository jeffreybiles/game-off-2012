level = require('./level')
lvl = object(level)

lvl.grid = [
  '5555555555555555',
  '5511111111111155',
  '5111111111111115',
  '5111111111111115',
  '1111111311111111',
  '1111111553111111',
  '1111113551111111',
  '1111111131111111',
  '5111111111111115',
  '5111111111111115',
  '5511111111111155',
  '5555555555555555',
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

lvl.name = 'arena 2'

lvl.createTerrain()

module.exports = lvl