/**
 * Interface to represent cloud data
 * used to determine which background image to show
 */

interface ImageInterface {
    //the day (0-31) to show the image on
    showDay: number;
    //the url to the image
    url: string;
}

export = ImageInterface;