import ListIterator = _.ListIterator;

export type CellContent = {$t: string};

export interface SpreadsheetContent {
    feed: {
        title: CellContent,
        entry: Array<{
            title: CellContent,
            content: CellContent
        }>
    }
}

export type LineResult = {[key: string]: string};

export interface ISpreadsheetReaderDescriptor<T> {
    firstRow: Number;
    columnFields: LineResult;
    isFilledRow?: (obj:T) => boolean;
    fieldsRequiredToConsiderFilledRow?: string[];
    sortBy?: Function|Function[]|string|string[];
    resultClass?: new (opts:any) => T;
}

export interface IPostProcessableSpreadsheetReaderDescriptor<T,T2> extends ISpreadsheetReaderDescriptor<T2> {
    postProcess?: (results: T[]) => T2;
}

export class SpreadsheetReaderDescriptor<T> implements ISpreadsheetReaderDescriptor<T> {
    firstRow: Number;
    columnFields: LineResult;
    isFilledRow?: (obj:T) => boolean;
    fieldsRequiredToConsiderFilledRow?: string[];
    sortBy: Function|Function[]|string|string[];
    resultClass: new (opts:any) => T;

    constructor(opts: ISpreadsheetReaderDescriptor<T>) {
        _.extend(this, opts);
    }
}

export class PostProcessableSpreadsheetReaderDescriptor<T,T2> extends SpreadsheetReaderDescriptor<T2> implements IPostProcessableSpreadsheetReaderDescriptor<T,T2> {
    postProcess: (results: T[]) => T2;

    constructor(opts: IPostProcessableSpreadsheetReaderDescriptor<T,T2>) {
        super(opts);
    }
}

export interface ISpreadsheetTabDescriptor<T> {
    tabId: number;
    dataField: string;
    descriptor: SpreadsheetReaderDescriptor<T>;
}

export class SpreadsheetTabDescriptor<T> implements ISpreadsheetTabDescriptor<T> {
    tabId: number;
    dataField: string;
    descriptor: SpreadsheetReaderDescriptor<T>;

    constructor(opts: ISpreadsheetTabDescriptor<T>) {
        _.extend(this, opts);
    }
}

export type URLFactory = (tabId: number) => string;

export class SpreadsheetReader {

    constructor() {
    }

    public static readFromDescriptors(spreadsheetId: string, descriptors: SpreadsheetTabDescriptor<any>[], errorHandler?: (message: string) => void): Promise<any[]> {
        return Promise.all(_.map(descriptors, (spreadsheetTabDescriptor) =>
            $.ajax({
                url: `https://spreadsheets.google.com/feeds/cells/${spreadsheetId}/${spreadsheetTabDescriptor.tabId}/public/basic?alt=json&v=3.0`,
                dataType: 'json'
            }).then(
                result =>
                    new SpreadsheetReader().read(result, spreadsheetTabDescriptor.descriptor),
                () => {
                    (errorHandler || console.error)(`Error while fetching spreadsheet info for tab ${spreadsheetTabDescriptor.tabId}`);
                    return Promise.reject(null);
                }
            )
        )).then((...results) => results);
    }

    public read<T,T2>(spreadsheetRepresentation: SpreadsheetContent, descriptor: IPostProcessableSpreadsheetReaderDescriptor<T,T2>): Promise<T[]>|Promise<T2> {
        return new Promise<T[]|T2>((resolve, reject) => {
            // First, reading every cells and building cell object like this :
            // { r: 1, c: "A", v: "Prénom" }
            let cells = _.map(spreadsheetRepresentation.feed.entry, function(spEntry){
                let cellCoords = /([A-Z]+)([0-9]+)/g.exec(spEntry.title.$t);
                return { v: spEntry.content.$t, r: Number(cellCoords[2]), c: cellCoords[1] };
            });

            // Now grouping cells by line and building result
            let normalResult: T[] = <T[]>_(cells)
                .filter((cell) => cell.r >= descriptor.firstRow)
                .groupBy('r')
                .mapValues((cells) => {
                    let lineObj = {};
                    _.each(cells, function(cell){
                        lineObj[descriptor.columnFields[cell.c]] = cell.v;
                    });
                    if(descriptor.resultClass) {
                        return new descriptor.resultClass(lineObj);
                    } else {
                        return <T>lineObj;
                    }
                }).values()
                .filter((obj: T) => {
                    if(descriptor.isFilledRow) {
                        return descriptor.isFilledRow(<any>obj);
                    } else if(descriptor.fieldsRequiredToConsiderFilledRow) {
                        let emptyRequiredColumns = _.filter(descriptor.fieldsRequiredToConsiderFilledRow, fieldRequiredToConsiderFilledRow => !obj[fieldRequiredToConsiderFilledRow]);
                        return emptyRequiredColumns.length === 0;
                    } else {
                        return true;
                    }
                }).value();

            if(descriptor.sortBy){
                normalResult = _.sortBy(normalResult, descriptor.sortBy);
            }

            let result: T[]|T2 = normalResult;
            if(descriptor.postProcess) {
                result = descriptor.postProcess(normalResult);
            }

            resolve(result);
        });
    }
}