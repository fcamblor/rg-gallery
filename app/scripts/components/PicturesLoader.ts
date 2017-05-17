import {
    PostProcessableSpreadsheetReaderDescriptor, SpreadsheetReader, SpreadsheetReaderDescriptor,
    SpreadsheetTabDescriptor
} from './SpreadsheetReader';


interface GSDrawing {
    id: string;
    picture1: string;
    picture2: string;
    picture1Size: string;
    picture2Size: string;
}

interface Drawing {
    id: string;
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
                        "A": "id", "O": "picture1", "P": "picture2", "Q": "picture1Size", "R": "picture2Size"
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
                if (drawing.picture1Size && drawing.picture1 && drawing.picture1 !== "#N/A") {
                    pictureSize = drawing.picture1Size;
                    picture = drawing.picture1;
                }
                if (drawing.picture2Size && drawing.picture2) {
                    pictureSize = drawing.picture2Size;
                    picture = drawing.picture2;
                }
                if(pictureSize && picture) {
                    let width = Number(pictureSize.replace(/w=([0-9]+),.*/gi, "$1"));
                    let height = Number(pictureSize.replace(/.*h=([0-9]+),.*/gi, "$1"));
                    return { id: drawing.id, picture: picture, width, height };
                } else {
                    return null;
                }
            }).filter((drawing) => !!drawing)
            .value();
    }
}