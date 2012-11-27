level = require('./level')
lvl = object(level)

lvl.grid = [
  '1114444444444444',
  '1114444444444444',
  '1114444444444444',
  '1114444411111111',
  '1114444411222111',
  '1111111122232222',
  '2222222221131111',
  '1114444411111111',
  '1114444411111111',
  '1114444444444444',
  '1114444444444444',
  '1114444444444444',
  ]

lvl.enemies = [
  {x: 280, y: 275},
  {x: 700, y: 275},
  {x: 600, y: 275},
  {x: 500, y: 275}
]
lvl.name = 'narrows'

lvl.createTerrain()

module.exports = lvl