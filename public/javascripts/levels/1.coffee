level = require('./level')
lvl1 = object(level)

lvl1.grid = [
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '2222222221111111',
  '1111111121111111',
  '1111111121111111',
  '1111111121112222',
  '1111111122222111',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  ]

lvl1.enemies = [
  {x: 500, y: 500}
]

lvl1.createTerrain()
lvl1.name = 'duel'


module.exports = lvl1