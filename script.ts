/**
 * Canvas
 */
var canvas = <HTMLCanvasElement>document.getElementById("ca");
var bgc = "#ebebe1";
document.body.style.backgroundColor = bgc;
var defaultImage = "./img3.jpg";
var pr = Math.min(window.devicePixelRatio, 2);

/**
 * Worker
 */
var worker = new Worker("./worker.js");

/**
 * User generated
 */
var controls = <HTMLInputElement>document.getElementById("controls");
var userImageInput = <HTMLInputElement>document.getElementById("userimage");
var form = <HTMLFormElement>document.getElementById("userimageform");
var resolutionInput = <HTMLInputElement>document.getElementById("resolution");
var currentImage: ImageBitmap | null = null;

var getCanvasSide = (pr) => (
  window.innerWidth < window.innerHeight
    ? window.innerWidth * pr
    : window.innerHeight * pr
);

var resizeCanvas = (canvas, width, height, pr) => {
  canvas.style.width = width / pr + "px";
  canvas.style.height = height / pr + "px";
};

var prepareDataForWorker = (image) => {
  var canvasWidth = getCanvasSide(pr);
  var canvasHeight = canvasWidth;
  var resolution = Number(resolutionInput.value);

  resizeCanvas(canvas, canvasWidth, canvasHeight, pr);

  worker.postMessage({
    message: "processFirstFrame",
    image,
    canvasWidth,
    canvasHeight,
    resolution
  });
};

var onImageLoaded = (image) => {
  createImageBitmap(image)
    .then((bitmap) => {
      currentImage = bitmap;
      prepareDataForWorker(bitmap);
    });
};

var loadImage = (urlOrData) => {
  var image = new Image();
  image.src = urlOrData;

  image.addEventListener("load", onImageLoaded.bind(null, image), { once: true });
};

var loadImageData = (file) => {
  var reader = new FileReader();

  reader.readAsDataURL(file);
  reader.onload = (readerEvent) => {
    loadImage(readerEvent.target.result);
  };
};

var getImageFromInput = () => {
  var data = new FormData(form);
  var file = data.get("userimage");

  if (!file || file.name === "") {
    return null;
  }

  return file;
};

form.addEventListener("submit", () => {
  var file = getImageFromInput();
  file && loadImageData(file);

  controls.classList.remove("dragover");
});

resolutionInput!.addEventListener("change", () => {
  prepareDataForWorker(currentImage);
});

window.addEventListener("resize", () => {
  prepareDataForWorker(currentImage);
});

controls.addEventListener("dragover", () => {
  controls.classList.add("dragover");
});

controls.addEventListener("dragleave", () => {
  controls.classList.remove("dragover");
});

userImageInput.addEventListener("dragover", () => {
  userImageInput.classList.add("dragover");
});

userImageInput.addEventListener("dragleave", () => {
  userImageInput.classList.remove("dragover");
});

userImageInput.addEventListener("drop", () => {
  userImageInput.classList.remove("dragover");
});

var setup = () => {
  var osc = canvas.transferControlToOffscreen();

  worker.postMessage({
    message: "initCanvas",
    canvas: osc,
  }, [osc]);

  var userFile = getImageFromInput();
  userFile
    ? loadImageData(userFile)
    : loadImage(defaultImage);
};

setup();
