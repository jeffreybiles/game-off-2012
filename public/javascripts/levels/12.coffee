level = require('./level')
lvl = object(level)

lvl.grid = [
  '1111111111111115',
  '1111111111114415',
  '1111431111111415',
  '1111111141111115',
  '1111111111111115',
  '1111131111111111',
  '1111111111111111',
  '1114111111141115',
  '1111111111111115',
  '1111114111111115',
  '1111111111134115',
  '1111111111111115',
  ]

lvl.enemies = [
  {type: 'centurion'},
  {type: 'centurion'},
  {type: 'centurion'}
]

lvl.name = 'pinball'

lvl.createTerrain()

module.exports = lvl