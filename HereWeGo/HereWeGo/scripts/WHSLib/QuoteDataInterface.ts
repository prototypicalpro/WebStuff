/**
 * Interface to represent the format
 * of the data being recieved from the cloud
 * for the quoteDataManage module
 */

interface QuoteDataInterface {
    quote: string,
    length: number,
    author: string,
}

export = QuoteDataInterface;