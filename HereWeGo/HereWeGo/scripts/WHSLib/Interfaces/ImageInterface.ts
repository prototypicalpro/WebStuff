/**
 * Interface to represent cloud data
 * used to determine which background image to show
 */

interface ImageInterface {
    //the day (0-31) to show the image on
    showDay: number;
    //the url to the image
    id: string;
    //the image blob, only present if gotten from database
    image?: Blob;
    //the thumbnail to start displaying, only present if gotten from database
    thumb?: Blob;
}

export = ImageInterface;