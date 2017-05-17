import {
    PostProcessableSpreadsheetReaderDescriptor, SpreadsheetReader, SpreadsheetReaderDescriptor,
    SpreadsheetTabDescriptor
} from './SpreadsheetReader';


interface GSDrawing {
    id: string;
    title: string;
    picture1: string;
    picture2: string;
    picture1Size: string;
    picture2Size: string;
}

export interface Drawing {
    id: string;
    title: string;
    picture: string;
    width: number;
    height: number;
}

export class PicturesLoader {
    drawings: GSDrawing[];

    constructor(){
    }

    load(): Promise<void>{
        return SpreadsheetReader.readFromDescriptors('1P-b2Nirm8fP1nTiNp6WVlbaGm-98jYKsDGpP77B2Jec', [
            new SpreadsheetTabDescriptor({
                tabId: 1,
                dataField: "peintures",
                descriptor: new SpreadsheetReaderDescriptor<GSDrawing>({
                    firstRow: 4,
                    columnFields: {
                        "A": "id", "C": "title", "O": "picture1", "P": "picture2", "Q": "picture1Size", "R": "picture2Size"
                    },
                    fieldsRequiredToConsiderFilledRow: ["id"]
                })
            })
        ]).then(results => {
            this.drawings = results[0][0];

            console.log(results.length);
            console.log(this.drawings.length);
        });
    }

    loadedDrawings(): Drawing[]{
        return _(this.drawings)
            .map((drawing: GSDrawing) => {
                let pictureSize = null, picture = null;
                if (PicturesLoader.isValidPicture(drawing.picture1,drawing.picture1Size)) {
                    pictureSize = drawing.picture1Size;
                    picture = drawing.picture1;
                }
                if (PicturesLoader.isValidPicture(drawing.picture2,drawing.picture2Size)) {
                    pictureSize = drawing.picture2Size;
                    picture = drawing.picture2;
                }
                if(pictureSize && picture) {
                    let width = Number(pictureSize.replace(/w=([0-9]+),.*/gi, "$1"));
                    let height = Number(pictureSize.replace(/.*h=([0-9]+),.*/gi, "$1"));
                    return { id: drawing.id, picture: picture, title: drawing.title, width, height };
                } else {
                    return null;
                }
            }).filter((drawing) => !!drawing)
            .value();
    }

    private static isValidPicture(pictureUrl: string, pictureSize: string) {
        return pictureSize && pictureUrl && pictureUrl !== "#N/A" && pictureUrl.indexOf("...") === -1;
    }
}