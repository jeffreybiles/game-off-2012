level = require('./level')
lvl = object(level)

lvl.grid = [
  '1111111111111111',
  '1111111111111111',
  '1111511111151111',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '1111511111151111',
  '1111111111111111',
  '1111111111111111',
  ]

lvl.enemies = [
  {x: 700, y: 200, type: 'moth'},
  {x: 700, y: 200, type: 'moth'},
  {x: 700, y: 200, type: 'moth'},
  {x: 700, y: 200, type: 'moth'},
  {x: 700, y: 200, type: 'moth'},
  {x: 700, y: 200}
]

lvl.name = 'open battle'

lvl.createTerrain()

module.exports = lvl