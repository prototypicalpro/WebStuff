/*
 * HTTP GET Implementation Interface
 * Designed to provide backup HTTP clients in case some don't work
 * Also abstracts all the http crap
 */

//interface drivers for get ar built on
interface GetInterface {
    get(URL: string): Promise<Object>;
}


export = GetInterface;