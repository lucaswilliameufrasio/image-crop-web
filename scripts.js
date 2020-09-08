const photoFile = document.getElementById('photo-file')
let photoPreview = document.getElementById('photo-preview')
let image = new Image()
let photoName

// Select & Preview image

document.getElementById('select-image')
    .onclick = function () {
        photoFile.click()
    }

window.addEventListener('DOMContentLoaded', () => {
    photoFile.addEventListener('change', () => {
        let file = photoFile.files.item(0)
        photoName = file.name
        // Read file
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = function (event) {
            image = new Image()
            image.src = event.target.result
            image.onload = onLoadImage
        }
    })
})

// Selection tool
const selection = document.getElementById('selection-tool')
let startX, startY, relativeStartX, relativeStartY, endX, endY, relativeEndX, relativeEndY
let startSelection = false

const events = {
    mouseover() {
        this.style.cursor = 'crosshair'
    },
    mousedown() {
        const { clientX, clientY, offsetX, offsetY } = event

        startX = clientX
        startY = clientY
        relativeStartX = offsetX
        relativeStartY = offsetY

        startSelection = true
    },
    mousemove() {
        endX = event.clientX
        endY = event.clientY

        if (startSelection) {
            selection.style.display = 'initial'
            selection.style.top = startY + 'px'
            selection.style.left = startX + 'px'

            selection.style.width = (endX - startX) + 'px'
            selection.style.height = (endY - startY) + 'px'
        }
    },
    mouseup() {
        startSelection = false

        relativeEndX = event.layerX
        relativeEndY = event.layerY

        // Show crop button
        cropButton.style.display = 'initial'
    }
}

Object.keys(events)
    .forEach((eventName) => {
        // addEventListener('mouseover', events.mouseover)
        photoPreview.addEventListener(eventName, events[eventName])
    })

// Canvas
let canvas = document.createElement('canvas')
let context = canvas.getContext('2d')

function onLoadImage() {
    const { width, height } = image
    canvas.width = width
    canvas.height = height

    // Clear the context
    context.clearRect(0, 0, width, height)

    // Draw the image on context
    context.drawImage(image, 0, 0)

    photoPreview.src = canvas.toDataURL()
}

// Crop image
const cropButton = document.getElementById('crop-image')
cropButton.onclick = () => {
    const { width: imageWidth, height: imageHeight } = image
    const { width: previewWidth, height: previewHeight } = photoPreview

    const [widthFactor, heightFactor] = [
        +(imageWidth / previewWidth),
        +(imageHeight / previewHeight)
    ]

    const [selectionWidth, selectionHeight] = [
        +selection.style.width.replace('px', ''),
        +selection.style.height.replace('px', '')
    ]

    const [croppedWidth, croppedHeight] = [
        +(selectionWidth * widthFactor),
        +(selectionHeight * heightFactor)
    ]

    const [actualX, actualY] = [
        +(relativeStartX * widthFactor),
        +(relativeStartY * heightFactor)
    ]

    // Get the cropped image from the canvas context
    const croppedImage = context.getImageData(actualX, actualY, croppedWidth, croppedHeight)

    // Clear canvas context
    context.clearRect(0, 0, context.width, context.height)

    // Adjust ratios
    image.width = canvas.width = croppedWidth
    image.height = canvas.height = croppedHeight

    // Add cropped image into canvas context
    context.putImageData(croppedImage, 0, 0)

    // Hide selection tool
    selection.style.display = 'none'

    // Update image preview
    photoPreview.src = canvas.toDataURL()

    // Show download button
    downloadButton.style.display = 'initial'
}

// Download
const downloadButton = document.getElementById('download')
downloadButton.onclick = function () {
    const a = document.createElement('a')
    a.download = photoName + '-cropped.png'
    a.href = canvas.toDataURL()
    a.click()
}