level = new Object()

terrainTypes =
    1: {
      color: '#68432a',
      bounciness: 0,
      damage: 0
    },
    2: {
      color: '#126822',
      bounciness: 0,
      damage: 0
    },
    3: {
      color: '#FF0',
      bounciness: 1,
      damage: 10
    }
level.columnWidth = 50
level.rowHeight = 50

level.draw = ->
  for row in [0...12]
    for column in [0...16]
      @drawSquare(row, column)

level.drawSquare = (row, column) ->
  square = @grid[row][column]
  ctx.fillStyle = terrainTypes[square].color
  ctx.fillRect(column*@columnWidth, row*@rowHeight, @columnWidth, @rowHeight)

level.interactWith = (entity) ->
  column = Math.floor(entity.x/@columnWidth)
  row = Math.floor(entity.y/@rowHeight)
  squaresOccupied = [[row, column],
                     [row + 1, column],
                     [row, column + 1],
                     [row + 1, column + 1]
                    ]

  for [row, column] in squaresOccupied
    terrain = terrainTypes[@grid[row][column]]
    entity.knockback({x: column*@rowHeight, y: row*@columnWidth}, terrain.bounciness)
    entity.hp -= terrain.damage


module.exports = level