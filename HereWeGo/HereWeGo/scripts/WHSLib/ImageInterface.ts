/**
 * Interface to represent cloud data
 * used to determine which background image to show
 */

interface ImageInterface {
    //the image number out of all the images stored in the cloud
    index: number;
    //the url to the image
    url: string;
}

export = ImageInterface;