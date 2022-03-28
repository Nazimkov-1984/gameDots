const STEP_GRID = 75;
const START_Y_LINE = 100;
const START_X = 60;

let Application = PIXI.Application,
  Container = PIXI.Container,
  Graphics = PIXI.Graphics,
  TextureCache = PIXI.utils.TextureCache,
  Sprite = PIXI.Sprite,
  Text = PIXI.Text,
  TextStyle = PIXI.TextStyle,
  Circle = PIXI.Circle;

let app = new Application({
  width: 500,
  height: 600,
  backgroundColor: 0xa0aaeb,
});

const randomIntegerNumber = (min, max) => {
  return Math.abs(Math.round(min - 0.5 + Math.random() * (max - min + 1)));
};

const generateRandomColor = () => {
  const RED = 0xdc143c;
  const YELLOW = 0xffd700;
  const GREEN = 0x228b22;
  const arrColors = [RED, YELLOW, GREEN];
  const getIndex = () => {
    return randomIntegerNumber(0, arrColors.length - 1);
  };
  return arrColors[getIndex()];
};

let startCoordinate = {
  x: null,
  y: null,
};
let currentCoordinate = {
  x: null,
  y: null,
};

let startColor = null;

let quantityOffCircle = 0;

let arrForDestroy = [];
let arrLineNames = [];
let counterForName = 0;
let arrOfCoordinatesDestroyedCircles = [];

const getCoordinateFromCircleObj = (event) => {
  const splitNameArr = event.target.name.split(":");
  return {
    x: Number(splitNameArr[1]),
    y: Number(splitNameArr[2]),
  };
};

const createLine = (startCoordinate, currentCoordinate) => {
  const line = new Graphics();
  line.lineStyle(3, 0x0b1f5c, 1);
  line.moveTo(startCoordinate.x, startCoordinate.y);
  line.lineTo(currentCoordinate.x, currentCoordinate.y);
  line.name = `Line${counterForName}`;
  counterForName = counterForName + 1;
  gameScene.addChild(line);
};

const addToListsDeletedElements = (event) => {
  arrForDestroy.push(event.target);
  arrOfCoordinatesDestroyedCircles.push(getCoordinateFromCircleObj(event));
};

const getTopYInColumn = (numberOfColumn, top = false) => {
  const elFromColumn = arrOfCoordinatesDestroyedCircles.filter(
    (el) => el.x === numberOfColumn
  );
  const arrYCoordElementFromColumn = [];

  elFromColumn.forEach((el) => {
    arrYCoordElementFromColumn.push(el.y);
  });

  return top
    ? Math.max(...arrYCoordElementFromColumn)
    : Math.min(...arrYCoordElementFromColumn);
};

const animateMoveForNewCircles = (arrOfCoordinates) => {
  let iterator = 0;
  setInterval(() => {
    if (iterator <= 75) {
      arrOfCoordinates.forEach((circle, index) => {
        newY = arrOfCoordinatesDestroyedCircles[index].y - STEP_GRID + iterator;
        circle.position.y = iterator;
        circle.name = `Circle:${arrOfCoordinatesDestroyedCircles[index].x}:${newY}`;
      });
      iterator++;
    }
  }, 9);
};

const getNumbersColumns = (elements) => {
  const numberOfColumns = [];
  elements.forEach((objCoord) => {
    if (numberOfColumns.findIndex((el) => el === objCoord.x) === -1) {
      numberOfColumns.push(objCoord.x);
    }
  });
  return numberOfColumns;
};

const animateMoveForOldAndNewCircles = (circlesArray, coordinatsArray) => {
  const numberOfColumn = getNumbersColumns(coordinatsArray);

  numberOfColumn.forEach((columnNumber) => {
    const allDeletedPositionInColumn = arrOfCoordinatesDestroyedCircles.filter(
      (el) => el.x === columnNumber
    );
    const elementForMovies = circlesArray.filter((circle) =>
      circle.name.includes(`Circle:${columnNumber}`)
    );
    allDeletedPositionInColumn.sort((a, b) => a.y - b.y);
    elementForMovies.sort(
      (a, b) => a.name.split(":")[2] - b.name.split(":")[2]
    );

    if (allDeletedPositionInColumn.length === elementForMovies.length) {
      elementForMovies.forEach((circle, index) => {
        let iterator = 0;
        const oldY = Number(circle.name.split(":")[2]);
        setInterval(() => {
          if (iterator < allDeletedPositionInColumn[index].y - oldY) {
            const newY = oldY + iterator;
            circle.position.y = iterator;
            circle.name = `Circle:${allDeletedPositionInColumn[index].x}:${newY}`;
          }
          iterator++;
        }, 3);
      });
    } else {
      if (elementForMovies.length < allDeletedPositionInColumn.length) {
        const quantityNeededPlaces = elementForMovies.length;
        const bottomPositions = allDeletedPositionInColumn.slice(
          -quantityNeededPlaces
        );
        elementForMovies.forEach((circle, index) => {
          let iterator = 0;
          const oldY = Number(circle.name.split(":")[2]);
          setInterval(() => {
            if (iterator < bottomPositions[index].y - oldY) {
              const newY = oldY + iterator;
              circle.position.y = iterator;
              circle.name = `Circle:${bottomPositions[index].x}:${newY}`;
            }
            iterator++;
          }, 3);
        });
      } else {
        const stepToMove = allDeletedPositionInColumn.length * STEP_GRID;
        elementForMovies.forEach((circle) => {
          let iterator = 0;
          const oldY = Number(circle.name.split(":")[2]);
          setInterval(() => {
            if (iterator <= stepToMove) {
              const newY = oldY + iterator;
              circle.position.y = iterator;
              circle.name = `Circle:${columnNumber}:${newY}`;
            }
            iterator++;
          }, 6);
        });
      }
    }
  });
};

const movingCirclesAfterDestroy = () => {
  const numberOfColumns = getNumbersColumns(arrOfCoordinatesDestroyedCircles);
  const circlesForMovedDown = [];
  let newCircles = [];
  let newCirclesWhenNotEnoughtElements = [];

  numberOfColumns.forEach((columnNumber) => {
    const minY = getTopYInColumn(columnNumber);
    const maxY = getTopYInColumn(columnNumber, true);

    if (minY === 100) {
      const quantityCircles = Math.trunc(
        getTopYInColumn(columnNumber, true) / STEP_GRID
      );

      for (let i = 0; i < quantityCircles; i++) {
        newCircles.push({
          x: columnNumber,
          y: maxY - STEP_GRID * i,
        });
      }
    } else {
      const quantityCircles = Math.trunc(minY / STEP_GRID) - 1;
      const quantityNewCircles = (maxY - minY) / STEP_GRID + 1;

      for (let i = 0; i < quantityNewCircles; i++) {
        newCirclesWhenNotEnoughtElements.push({
          x: columnNumber,
          y: START_Y_LINE + STEP_GRID * i,
        });
      }

      for (let i = 1; i <= quantityCircles; i++) {
        circlesForMovedDown.push({
          x: columnNumber,
          y: minY - STEP_GRID * i,
        });
      }
    }

    // if don't enought elements
    if ((maxY - minY) / STEP_GRID > newCircles.length) {
      const notEnoughtQuantity = Math.abs(
        (maxY - minY) / STEP_GRID + 1 - circlesForMovedDown.length
      );
      for (let i = 1; i <= notEnoughtQuantity; i++) {
        newCircles.push({
          x: columnNumber,
          y: START_Y_LINE - STEP_GRID * i,
        });
      }
    }
  });

  // drawing new Circles if not circles for move down
  if (newCircles.length > 0 && circlesForMovedDown.length === 0) {
    newCircles.forEach((coordObj) => {
      generateCircleComponents(coordObj.x, coordObj.y - STEP_GRID, gameScene);
    });
    //find new circles in scene
    const newCirclesFromScreen = [];
    newCircles.forEach((el) => {
      newCirclesFromScreen.push(
        gameScene.getChildByName(`Circle:${el.x}:${el.y - STEP_GRID}`)
      );
    });
    animateMoveForNewCircles(newCirclesFromScreen);
  } else {
    const elFromScreenToMoveDown = [];
    circlesForMovedDown.forEach((coordObj) => {
      elFromScreenToMoveDown.push(
        gameScene.getChildByName(`Circle:${coordObj.x}:${coordObj.y}`)
      );
    });
    animateMoveForOldAndNewCircles(elFromScreenToMoveDown, circlesForMovedDown);

    const newCirclesWhenNotEnought = [];
    newCirclesWhenNotEnoughtElements.forEach((coordObj) => {
      generateCircleComponents(coordObj.x, coordObj.y, gameScene);
    });
  }
};

const onClickHandlerToCircle = (event) => {
  arrOfCoordinatesDestroyedCircles = [];
  startCoordinate = getCoordinateFromCircleObj(event);
  startColor = event.target.geometry.graphicsData[0].fillStyle.color;
  addToListsDeletedElements(event);
};

const onMouseOverHandler = (event) => {
  currentColor = event.target.geometry.graphicsData[0].fillStyle.color;

  if (startCoordinate.x !== null) {
    const deltaX = Math.abs(
      startCoordinate.x - getCoordinateFromCircleObj(event).x
    );
    const deltaY = Math.abs(
      startCoordinate.y - getCoordinateFromCircleObj(event).y
    );

    if (startColor === currentColor && (deltaX === 0 || deltaY === 0)) {
      currentCoordinate = getCoordinateFromCircleObj(event);
      createLine(startCoordinate, currentCoordinate);
      addToListsDeletedElements(event);
    } else {
      if (startColor === currentColor) {
        const deltaX =
          currentCoordinate.x - getCoordinateFromCircleObj(event).x;
        const deltaY =
          currentCoordinate.y - getCoordinateFromCircleObj(event).y;
        if (deltaX === 0 || deltaY === 0) {
          createLine(currentCoordinate, getCoordinateFromCircleObj(event));
          addToListsDeletedElements(event);
          currentCoordinate = getCoordinateFromCircleObj(event);
        }
      }
    }
  }
};

const onMouseUpHandler = (event) => {
  if (arrOfCoordinatesDestroyedCircles.length > 1) {
    const currentCoord = getCoordinateFromCircleObj(event);
    const deltaX = Math.abs(startCoordinate.x - currentCoord.x);
    const deltaY = Math.abs(startCoordinate.y - currentCoord.y);

    deltaX !== 0
      ? (quantityOffCircle = quantityOffCircle + (deltaX / STEP_GRID + 1))
      : (quantityOffCircle = quantityOffCircle + (deltaY / STEP_GRID + 1));

    scoreValue.text = quantityOffCircle;

    arrForDestroy.forEach((itm) => {
      // destroy selected circles
      itm.destroy();
    });

    for (let i = 0; i < counterForName; i++) {
      // find and destroy all lines between circles
      gameScene.getChildByName(`Line${i}`).destroy();
    }

    startCoordinate.x = null;
    startCoordinate.y = null;
    currentCoordinate.x = null;
    currentCoordinate.y = null;
    arrForDestroy = [];
    arrLineNames = [];
    counterForName = 0;

    const isDeletedCirclesFromTopLine = arrOfCoordinatesDestroyedCircles.every(
      (el) => el.y === START_Y_LINE
    );

    if (isDeletedCirclesFromTopLine) {
      // draw new Circles
      arrOfCoordinatesDestroyedCircles.forEach((coordObj) => {
        generateCircleComponents(coordObj.x, coordObj.y - STEP_GRID, gameScene);
      });

      const newCircles = [];
      arrOfCoordinatesDestroyedCircles.forEach((coordObj) => {
        newCircles.push(
          gameScene.getChildByName(
            `Circle:${coordObj.x}:${coordObj.y - STEP_GRID}`
          )
        );
      });

      animateMoveForNewCircles(newCircles);
    } else {
      movingCirclesAfterDestroy();
    }
  } else {
    startCoordinate = null;
    startColor = null;
  }
};

const generateCircleComponents = (x, y, gameScene) => {
  const cir = new Graphics();
  cir.beginFill(generateRandomColor());
  cir.drawCircle(x, y, 30);
  cir.endFill();
  cir.interactive = true;
  cir.cursor = "pointer";
  cir.name = `Circle:${x}:${y}`;

  cir.on("mousedown", onClickHandlerToCircle);
  cir.on("mouseover", onMouseOverHandler);
  cir.on("mouseup", onMouseUpHandler);

  gameScene.addChild(cir);
};

const generateLineCircle = (yLine, gameScene) => {
  for (let i = 0; i < 6; i++) {
    generateCircleComponents(START_X + i * STEP_GRID, yLine, gameScene);
  }
};

const generateAllLineDots = (gameScene) => {
  for (let i = 0; i < 7; i++) {
    generateLineCircle(START_Y_LINE + i * STEP_GRID, gameScene);
  }
};

const gameScene = new Container();

const score = new Text("Score:", {
  fontFamily: "Arial",
  fontSize: 24,
  fill: 0x000000,
  align: "center",
  dropShadow: true,
  dropShadowBlur: 10,
});
score.x = 30;
score.y = 10;

const scoreValue = new Text("-", {
  fontFamily: "Arial",
  fontSize: 24,
  fill: 0x000000,
  dropShadow: true,
  dropShadowBlur: 10,
});
scoreValue.x = 110;
scoreValue.y = 10;

gameScene.addChild(score);
gameScene.addChild(scoreValue);

generateAllLineDots(gameScene);
app.stage.addChild(gameScene);
document.body.appendChild(app.view);
