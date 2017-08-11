/* 
 * Interface to make the parsing, storage, and management of cloud sync data iterable
 * I figured I wanted the backend to be kinda modular, so here we go
 */

interface DataInterface {
    //the key for the sync data this object will use (e.g. "calSyncData")
    //should be constant
    dataKey: string; 
    //init function, instantiate database or whatnot
    init(): Promise<any>;
    //update function, takes recieved data (using the key above) and updates the stored data
    updataData(data: any): void;
    //overwrite function, deletes any existing data and replaces it with the passed data
    overwriteData(data: any): void;
    //and finally, return the data or utility class that our program wants
    getData(): any;
}

export = DataInterface;