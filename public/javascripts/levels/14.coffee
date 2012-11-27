level = require('./level')
lvl = object(level)

lvl.grid = [
  '4111111111111115',
  '4111114111141115',
  '4111111111111115',
  '4444111111411115',
  '1111411111111115',
  '1111141111111115',
  '1111114111111415',
  '1111111441111145',
  '4111111111111115',
  '4111411111111415',
  '4111111111111111',
  '4111111111111111',
  ]

lvl.enemies = [
  {type: 'centurion', y: 200},
  {type: 'centurion', y: 200},
  {type: 'centurion', y: 200}
]

lvl.name = 'pinWall'

lvl.createTerrain()

module.exports = lvl