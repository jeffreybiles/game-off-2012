level = new Object()

terrainTypes =
    1: { #grass
      color: '#68432a',
      bounciness: 0,
      damage: 0
    },
    2: { #dirt
      color: '#126822',
      bounciness: 0,
      damage: 0
    },
    3: { #thorns/shock
      color: '#FF0',
      bounciness: 2,
      damage: 10
    },
    4: { #wall/bush
      color: '#555',
      bounciness: 0.2,
      damage: 0
    },
    5: { #lava
      color: '#F00',
      bounciness: 0,
      damage: 1
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

#This mess of a function creates a second map that will be useful in
#1) making collision detection more efficient, and
#2) making pathfinding possible
level.mapGrid = ->
  @newGrid = []
  for row in [0...11]
    newRow = []
    for column in [0...15]
      includedSquares = @listAdjacent(row, column)
      includedTerrain = _.map(includedSquares, (coordinates) =>
          terrainNumber = @grid[coordinates[0]][coordinates[1]]
          return terrainTypes[terrainNumber]
        )
      newRow.push(
        bounciness: _.reduce(includedTerrain, ((memo, terrain) -> memo + terrain.bounciness), 0)
        damage: _.reduce(includedTerrain, ((memo, terrain) -> memo + terrain.damage), 0)
      )
    @newGrid.push(newRow)

level.listAdjacent = (row, column) ->
  [[row, column],
   [row + 1, column],
   [row, column + 1],
   [row + 1, column + 1]
  ]

#If the terrain is damaging, you get hurt.  If bouncy, you bounce.
level.interactWith = (entity) ->
  column = Math.floor(entity.x/@columnWidth)
  row = Math.floor(entity.y/@rowHeight)
  terrain = @newGrid[row][column]
  entity.hp -= terrain.damage
  if terrain.bounciness
    squaresOccupied = @listAdjacent(row, column)
    for [row, column] in squaresOccupied
      terrain = terrainTypes[@grid[row][column]]
      entity.knockback({x: column*@rowHeight, y: row*@columnWidth}, terrain.bounciness)

module.exports = level