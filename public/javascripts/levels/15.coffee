level = require('./level')
lvl = object(level)

lvl.grid = [
  '3113111111111113',
  '3113111111111113',
  '3113113114334113',
  '3113333113113113',
  '3111111113111111',
  '3111111113111111',
  '3111111114333333',
  '3334111111111113',
  '3113111111111113',
  '3114333333334113',
  '1111111111111113',
  '1111111111111113',
  ]

lvl.enemies = [
  {type: 'moth', x: 300},
  {type: 'moth', x: 300},
  {type: 'moth', x: 50, y: 100},
  {type: 'moth', x: 50, y: 400},
  {type: 'moth', x: 50, y: 100},
  {type: 'moth', x: 50, y: 400},
  {x: 250, y: 530},
  {x: 250, y: 10},
  {x: 650, y: 530},
  {x: 650, y: 10},
  {type: 'centurion', x: 650, y: 330}
]

lvl.name = 'maze'

lvl.createTerrain()

module.exports = lvl