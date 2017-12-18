/**
 * Interface to represent cloud data
 * used to determine which background image to show
 */

interface ImageInterface {
    //the url to the image, and the identifier
    id: string;
    //cancelled or not
    cancelled?: boolean;
    //the image filesystem URL, only present if gotten from database
    image?: string;
    //the thumbnail to start displaying, only present if gotten from database
    thumb?: string;
}

export = ImageInterface;