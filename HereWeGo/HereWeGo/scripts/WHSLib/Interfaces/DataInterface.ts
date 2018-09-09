import { DBInfoInterface } from '../../DBLib/DBManage';
import UIUtil = require('../../UILib/UIUtil');

/**
 * Interface for parsing a component of the data fetched by {@link DataManage}.
 * 
 * Classes that implement this will generally be pretty complicated due to the
 * amount of raw IndexedDB required to catalog and retrieve the data. Good Luck.
 */

interface DataInterface {
    /** Numerical constant specifying the type of data this class is meant to parse */
    readonly dataType: UIUtil.RecvType;
    /** Object specifying the structure of the database requested by the implementing class */
    readonly dbInfo: DBInfoInterface | Array<DBInfoInterface>;
    /** String key to be used by {@link DataManage} when spliting data between classes. Needs to be implemented here and in the cloud. */
    readonly dataKey: string;
    /** function called after contruction to pass DB over to the implementing class */
    setDB(db: IDBDatabase): void;
    /**
     * Takes data from the internet and updates the local stored data to reflect changes.
     * Data format varies depending on implementation.
     * @param data The cloud data object
     * @returns whether or not the stored data needed updating
     */
    updateData(data: any): Promise<boolean> | false;
    /** Delete stored data and replace it with the data from the internet */
    overwriteData(data: any): Promise<any>;
    /**
     * Generates data for an array of uiitems based on properties stored in the {@link UIUtil.RecvParams} element.
     * @param objs the array of ui elements to read properties from
     * @returns data which can then be passed to {@link UIUtil.UIItem.onInit} or {@link UIUtil.UIItem.onUpdate}, given the UIItem in question was passed to getData.
     */
    getData(objs: Array<UIUtil.UIItem>): Promise<any> | any;
}

export = DataInterface;