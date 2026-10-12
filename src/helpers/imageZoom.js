export function imageZoom(img, resultID) {
  let lens, result, cx, cy;
  
  result = document.querySelector(resultID);
  /*create lens:*/
  lens = document.querySelector('.img-zoom-lens')
  console.log('image',img.dataset.src,'width', img.dataset.width,'height',img.dataset.height);
  /*calculate the ratio between result DIV and lens:*/
  cx = result.offsetWidth / lens.offsetWidth;
  cy = result.offsetHeight / lens.offsetHeight;
  console.log('cx...',cx, 'cy...',cy);
  /*set background properties for the result DIV:*/
  result.style.backgroundImage = "url('" + img.dataset.src + "')";
  result.style.backgroundSize = (img.dataset.width * cx) + "px " + (img.dataset.height * cy) + "px";
  console.log('background size....',(img.dataset.width * cx) + "px " + (img.dataset.height * cy) + "px");
  /*execute a function when someone moves the cursor over the image, or the lens:*/
  lens.addEventListener("mousemove", moveLens);
  img.addEventListener("mousemove", moveLens);
  /*and also for touch screens:*/
  lens.addEventListener("touchmove", moveLens);
  img.addEventListener("touchmove", moveLens);
  function moveLens(e) {
    var pos, x, y;
    /*prevent any other actions that may occur when moving over the image:*/
    e.preventDefault();
    /*get the cursor's x and y positions:*/
    pos = getCursorPos(e);
    /*calculate the position of the lens:*/
    x = pos.x - (lens.offsetWidth / 2);
    y = pos.y - (lens.offsetHeight / 2);
    /*prevent the lens from being positioned outside the image:*/
    if (x > img.dataset.width - lens.offsetWidth) {x = img.dataset.width - lens.offsetWidth;}
    if (x < 0) {x = 0;}
    if (y > img.dataset.height - lens.offsetHeight) {y = img.dataset.height - lens.offsetHeight;}
    if (y < 0) {y = 0;}
    /*set the position of the lens:*/
    lens.style.left = x + "px";
    lens.style.top = y + "px";
    /*display what the lens "sees":*/
    //console.log('lens position...','x position',x + "px",'y position', y + "px");
    result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
    console.log('background position....',"-" + (x * cx) + "px -" + (y * cy) + "px");
  }
  function getCursorPos(e) {
    var a, x = 0, y = 0;
    e = e || window.event;
    /*get the x and y positions of the image:*/
    a = img.getBoundingClientRect();
    /*calculate the cursor's x and y coordinates, relative to the image:*/
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    /*consider any page scrolling:*/
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return {x : x, y : y};
  }
}