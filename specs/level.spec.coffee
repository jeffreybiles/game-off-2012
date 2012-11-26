require('../public/javascripts/lib/helper')
level = require('../public/javascripts/levels/level')
describe 'levels', ->
  describe 'makeGrid', ->
    testLevel = object(level)
    testLevel.grid = ['111', '222', '345']

    it "should create terrain", ->
      testLevel.createTerrain()
      terrain = testLevel.terrain
      expect(terrain[0][0].damage).toEqual(0)
      console.log(terrain[1])
      expect(terrain[1][2].damage).toEqual(0)
      expect(terrain[2][1].damage).toEqual(10)