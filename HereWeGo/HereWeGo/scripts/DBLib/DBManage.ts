/**
 * Class which should allow for better database management, since all files
 * in this project use indexedDB.
 * Takes an array of {@link DBManage.DBInfoInterface} which define that part of the db, then passes the database
 * pointer along to the other components. Used by {@link DataManage}.
 */

namespace DBManage {
    /** Database name constant, do not change */
    const dbName: string = 'MainDB';
    /** Database version constant, increment to clear storage on update */
    const dbVersion: number = 14;
    /** Interface defining the properties of the databases to be contructed */
    export interface DBInfoInterface {
        /** Name of the object store to use */
        storeName: string;
        /** Array of keys to generate in that object store */
        keys: Array<string>;
        /** String for the keypath (name of the column to index by) of the database */
        keyPath: string;
    }
    //and the lone function which does all the magic
    /**
     * Fetch a pointer to indexed DB, or create our database based on the properties specified
     * @param args Array of objects specifying the properties of the requested object stores
     * @returns The database, or an array which contains a boolean and the database if the database has been upgraded
     */
    export const constructDB = (args: Array<DBInfoInterface | Array<DBInfoInterface>>): Promise<IDBDatabase | [IDBDatabase, boolean]> => {
        let isUpgraded: boolean;
        //flatten dbs
        let dbs: Array<DBInfoInterface> = args.concat.apply([], args).filter(dbInf => dbInf);
        return new Promise((resolve, reject) => {
            //check to see if the database exists
            if (!window.indexedDB) return reject(false);
            //open database
            let req = window.indexedDB.open(dbName, dbVersion);
            //to promise
            req.onsuccess = resolve;
            req.onerror = reject;
            //and if the database doesn't exist yet, build it!
            req.onupgradeneeded = (evt: any) => {
                //needs an upgrade
                isUpgraded = true;
                //clear localStorage
                localStorage.clear();
                //delete every object store, so we're starting fresh
                for (let i = 0, len = dbs.length; i < len; i++) {
                    try { evt.currentTarget.result.deleteObjectStore(dbs[i].storeName); }
                    catch (e) { /*probably doesn't exist, which we don't care about*/ }
                }
                //for every object in the array, create an object store
                for (let i = 0, len = dbs.length; i < len; i++) {
                    let store: IDBObjectStore = evt.currentTarget.result.createObjectStore(dbs[i].storeName, { keyPath: dbs[i].keyPath });
                    //and fill it with indicies
                    for (let o = 0, len1 = dbs[i].keys.length; o < len1; o++) store.createIndex(dbs[i].keys[o], dbs[i].keys[o]);
                }
            }
        }).then((evt: any) => {
            if (isUpgraded) return [evt.target.result, isUpgraded];
            return evt.target.result;
        });
    };
}

export = DBManage;