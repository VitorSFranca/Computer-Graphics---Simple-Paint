var pointA,pointB;
var pA, pB, operation, color = "#000000";
var pixel, context, canvas;


/**
 * Create pixel image
 * By default pixel color is black
 */
function createPixel(){
    pixel = context.createImageData(1, 1);
    pixel.data[0] = 0;
    pixel.data[1] = 0;
    pixel.data[2] = 0;
    pixel.data[3] = 255;
}

/**
 * Draw a pixel on the screen
 * @param {*} x 
 * @param {*} y 
 */
function drawPixel(x,y){
    context.putImageData(pixel,x,y);
}

console.log("Main loaded!");

/**
 * Start the application
 */
function init(){

    canvas = document.getElementById('canvas');
    context = canvas.getContext("2d");
    createPixel();
    cleanScreen(true);  
    bindElements();
}

/**
 * Draw a line using DDA algorithhm
 * @param {*} pA 
 * @param {*} pB 
 */
function drawLineDDA(pA,pB,newElement){
    var dx,dy,passos,k,x_incr,y_incr,x,y;

    dx = pB.x - pA.x;
    dy = pB.y - pA.y;
    if(Math.abs(dx) > Math.abs(dy)){
        passos = Math.abs(dx);
    } else {
        passos = Math.abs(dy);
    }

    x_incr = dx/passos;
    y_incr = dy/passos;

    x = pA.x;
    y = pA.y;

    drawPixel(x,y);

    for(k = 1; k < passos; k++){
        x = x + x_incr;
        y = y + y_incr;
        drawPixel(x,y);
    }

    if(newElement){
        canvas.content.lines.push({
            A: pA, 
            B: pB,
            color: color});
    }
    cleanPoints();
}

/**
 * Draw a line using Breseham algorithm
 * @param {*} pA 
 * @param {*} pB 
 */
function drawLineBreseham(pA,pB,newElement){
    var dx, dy, x, y, const1, const2, p, x_incr, y_incr;
    dx = pB.x - pA.x;
    dy = pB.y - pA.y;
    if(dx >= 0){
        x_incr = 1;
    } else {
        x_incr = -1;
        dx = -dx;
    }
    if(dy >= 0){
        y_incr = 1;
    } else {
        y_incr = -1;
        dy = -dy;
    }
    
    x = pA.x;
    y = pA.y;

    drawPixel(x,y);
    if(dy < dx){
        p = 2*dy - dx;
        const1 = 2*dy;
        const2 = 2*(dy-dx);
        for(var i = 0; i < dx; i++){
            x += x_incr;
            if(p < 0){
                p += const1;
            } else {
                y += y_incr;
                p += const2;
            }
            drawPixel(x,y);
        }
    } else {
        p = 2*dx - dy;
        const1 = 2*dx;
        const2 = 2*(dx-dy);
        for(var i = 0; i < dy; i++){
            y += y_incr;
            if(p < 0){
                p += const1;
            } else {
                x += x_incr;
                p+= const2;
            }
            drawPixel(x,y);
        }
    }

    if(newElement){
        canvas.content.lines.push({
            A: pA, 
            B: pB,
            color: color});
    }
}

/**
 * Draw circle points
 * @param {*} center 
 * @param {*} x 
 * @param {*} y 
 */
function drawCirclePoints(center,x,y){
    drawPixel(center.x + x,center.y + y);
    drawPixel(center.x - x, center.y + y);
    drawPixel(center.x + x,center.y - y);
    drawPixel(center.x - x,center.y - y);
    drawPixel(center.x + y,center.y + x);
    drawPixel(center.x - y,center.y + x);
    drawPixel(center.x + y,center.y - x);
    drawPixel(center.x - y,center.y - x);
}

/**
 * Get current mouse position
 * Relative to canvas area
 * @param {*} evt 
 */
function getMousePosition(evt){
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}


/**
 * Bind screen elements
 */
function bindElements(){
    var cleanButton = document.getElementById('btnClean');              // Clean canvas button
    var drawLineButton = document.getElementById('btnLine');            // Draw line button
    var drawCircleButton = document.getElementById('btnCircle');        // Draw circle button
    var txtCircleRadius = document.getElementById('txtCircleRadius');   // Circle radius input text
    var translationButton = document.getElementById('btnTranslation');  // Translation button
    var txtTranslationX = document.getElementById('txtTransX');         // Translation X value
    var txtTranslationY = document.getElementById('txtTransY');         // Translation Y value
    var fillButton = document.getElementById('btnFill');                // Fill area button
    var rotationButton = document.getElementById('btnRotation');        // Rotation button


    // If-Else vs SwitchCase
    // https://www.oreilly.com/library/view/high-performance-javascript/9781449382308/ch04s02.html

    document.addEventListener('click', function(ev){
        var target = ev.target;

        switch(target){
            case canvas:
                canvasAction();
                break;
            case drawLineButton:
                setOperation('drawLine');
                break;
            case drawCircleButton:
                setOperation('drawCircle');
                break;
            case txtCircleRadius:
                break;
            case translationButton:
                applyTranslation(Math.round(txtTranslationX.value),Math.round(txtTranslationY.value));
                break;
            case cleanButton:
                cleanScreen(true);
                break;
            case fillButton:
                setOperation('fillArea');
                break;
            case rotationButton:
                var angle = textPopUp("Insira o ângulo","Angulo");
                applyRotation(angle);
                break;
            case txtCircleRadius:
            case txtTranslationX:
            case txtTranslationY:
                break;
            default:
                cleanPoints();
        }
    });

    // Set current color
    lineColor.addEventListener('input', function(ev){
        setColor();
    });
}

/**
 * Clean screen and reset lines and circles references
 */
function cleanScreen(fullReset){
    if(fullReset){
        canvas.content = {
            lines: [],
            circles: []
        };
    }

    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Make translation of elements according to parameters
 * @param {*} xTrans 
 * @param {*} yTrans 
 */
function applyTranslation(xTrans, yTrans){
    // Translate lines
    canvas.content.lines.forEach(element => {
        element.A.x+= xTrans;
        element.B.x+= xTrans;
        element.A.y-= yTrans;
        element.B.y-= yTrans;
    });

    // Translate circles
    canvas.content.circles.forEach(element => {
        element.center.x += xTrans;
        element.center.y -= yTrans;
    });

    redrawCanvas();

}

/**
 * Canvas actions according to current operation and user action
 */
function canvasAction(){
    var cordinates = getMousePosition(event);
        
    /**
     * According to the operation take the correct action
     */
    switch(operation){
        // Draw a line from pointA to pointB
        case 'drawLine': 
            if(pA == null){
                pA = cordinates;
            } else {
                pB = cordinates;
                  drawLineBreseham(pA,pB,true);
                //   drawLineDDA(pA,pB,true);
                cleanPoints();
            }
            break;
        // Draw a circle with center on click point, and radius setted on radius text
        case 'drawCircle':
            if(txtCircleRadius.value > 0){
                drawCircle(cordinates,Math.round(txtCircleRadius.value), true);
            } else {
                alert("RAIO INVÁLIDO!");
            }
            break;
        case 'fillArea':
            if(!arraysEqual(Array.from(getPixelColor(cordinates.x,cordinates.y)), [255,255,255,255])){
                console.log("Flood Fill!");
                floodFill(cordinates.x,cordinates.y,getPixelColor(cordinates.x,cordinates.y));
            } else {
                console.log("Boundary Fill!");
                try {
                    boundaryFill(cordinates.x,cordinates.y);
                } catch (error){
                    if(error instanceof RangeError){
                        alert("Out of memory!");
                        redrawCanvas();
                    } else {
                        console.log(error.message);
                    }
                }
            }
    }
};

/**
 * Set operation id
 * @param {} opId 
 */
function setOperation(opId){
    this.operation = opId;
}

/**
 * Clean points
 */
function cleanPoints(){
    pA = pB = null;
}

/**
 * Set color to future operations
 */
function setColor(actColor){
    var lineColor = document.getElementById('lineColor');           // Stroke color input
    actColor = actColor || lineColor.value;
    color = actColor;

    // Get hexadecimal value and parse to int
    // Set RGB value to pixel
    var rgb = "0x" + color.substring(1,color.length);
    pixel.data[0] = (rgb >> 16) & 255;
    pixel.data[1] = (rgb >> 8) & 255;
    pixel.data[2] = rgb & 255;
}

/**
 * Redraw the entire canvas
 */
function redrawCanvas(){
    cleanScreen(false);

    canvas.content.lines.forEach(element => {
        setColor(element.color);
        drawLineDDA(element.A, element.B, false);
    });

    // Translate circles
    canvas.content.circles.forEach(element => {
        setColor(element.color);
        drawCircle(element.center, element.radius, false);
    });

    setColor();
}

/**
 * Draw a circle using Breseham algorithm
 * @param {*} center 
 * @param {*} radius 
 */
function drawCircle(center,radius,newElement){
    var x = 0, y = radius, p = 3 - 2*radius;

    drawCirclePoints(center,x,y);

    while(x < y){
        if(p < 0){
            p = p + 4 * x + 6;
        } else {
            p = p + 4*(x - y) + 10;
            y--;
        }
        x = x + 1;
        drawCirclePoints(center,x,y);
    }

    if(newElement){
        canvas.content.circles.push({
            center: center,
            radius: radius,
            color: color
        });
    }
}

/**
 * Check if array A == array B
 * @param {*} a 
 * @param {*} b 
 */
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;
  
    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * Transform current selected color into an array with RGB values
   * R[0], G[1], B[2]
   */
function colorToArray(){
    var rgb = "0x" + color.substring(1,color.length);
    var x = [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255];
    return x;
}

/**
 * Get selected pixel color
 * @param {*} x 
 * @param {*} y 
 */
function getPixelColor(x,y){
    return context.getImageData(x,y,1,1).data;
}

/**
 * Fill area using Bounadary Fill algorithm
 * @param {*} x 
 * @param {*} y 
 */
function boundaryFill(x,y){
    while(!arraysEqual(Array.from(getPixelColor(x,y).slice(0,3)), colorToArray())){
        drawPixel(x,y);
        boundaryFill(x+1,y);
        boundaryFill(x-1,y);
        boundaryFill(x,y+1);
        boundaryFill(x,y-1)
    }
}

/**
 * Fill area using Flood Fill algorithm
 * @param {*} x 
 * @param {*} y 
 * @param {*} originalColor 
 */
function floodFill(x,y,originalColor){

    while(arraysEqual(Array.from(getPixelColor(x,y)), originalColor) && !arraysEqual(Array.from(originalColor).splice(0,3), colorToArray())){
        drawPixel(x,y);
        floodFill(x+1,y,originalColor);
        floodFill(x-1,y,originalColor);
        floodFill(x,y+1,originalColor);
        floodFill(x,y-1,originalColor);
        floodFill(x+1,y+1,originalColor);
        floodFill(x+1,y-1,originalColor);
        floodFill(x-1,y+1,originalColor);
        floodFill(x+1,y-1,originalColor);
    } 
}

/**
 * Apply rotation in elements according to a factor
 * @param {*} factor 
 */
function applyRotation(factor){
    if(isNaN(factor)) {
        alert("Valor inválido!");
        return;
    };
    factor = -toRadians(factor);
    var newX, newY;

    // Rotate lines
    canvas.content.lines.forEach(element => {
        
        // Calculate new pointB position considering that pointA is new origin
        element.B.x = element.B.x - element.A.x;
        element.B.y = element.B.y - element.A.y;
        newX = element.B.x * Math.cos(factor) - element.B.y * Math.sin(factor);
        newY = element.B.x * Math.sin(factor) + element.B.y * Math.cos(factor);
        element.B.x = newX + element.A.x;
        element.B.y = newY + element.A.y;
    });
    
    redrawCanvas();
}

/**
 * Text popup
 * @param {*} message 
 * @param {*} placeholder 
 */
function textPopUp(message,placeholder){
    var value = window.prompt(message,placeholder);
    return value;
}

/**
 * Get a degree angle and parse to radians
 * @param {*} angle 
 */
function toRadians (angle) {
    return angle * (Math.PI / 180);
  }

init();