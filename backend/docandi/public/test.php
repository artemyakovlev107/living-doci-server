<?php
/* Create some objects */
$draw = new ImagickDraw();
$pixel = new ImagickPixel( 'gray' );

/* New image */
$handle = fopen('E:\flower.jpg', 'rb');
$img = new Imagick();
$img->readImageFile($handle);
$img->resizeImage(128, 128, 0, 0);
/* Black text */
$draw->setFillColor('black');

/* Font properties */
$draw->setFontSize( 30 );

/* Create text */
$image->annotateImage($draw, 10, 45, 0, 
    'The quick brown fox jumps over the lazy dog');

/* Give image a format */
$image->setImageFormat('png');

/* Output the image with headers */
header('Content-type: image/png');
echo $image;
?>