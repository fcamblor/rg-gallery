import {
    PostProcessableSpreadsheetReaderDescriptor, SpreadsheetReader, SpreadsheetReaderDescriptor,
    SpreadsheetTabDescriptor
} from './SpreadsheetReader';


interface Peinture {
    id: string;
    picture1: string;
    picture2: string;
    picture1Size: string;
    picture2Size: string;
}

interface SizedPeinture extends Peinture {
    picture1Width: number;
    picture1Height: number;
    picture2Width: number;
    picture2Height: number;
}

export class PicturesLoader {
    drawings: Peinture[];

    constructor(){
    }

    load(): Promise<void>{
        return SpreadsheetReader.readFromDescriptors('1P-b2Nirm8fP1nTiNp6WVlbaGm-98jYKsDGpP77B2Jec', [
            new SpreadsheetTabDescriptor({
                tabId: 1,
                dataField: "peintures",
                descriptor: new SpreadsheetReaderDescriptor<Peinture>({
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

    loadedDrawings(): SizedPeinture[]{
        return _(this.drawings)
            .filter((drawing) => ((!!drawing.picture1 && !!drawing.picture1Size) || (!!drawing.picture2 && !!drawing.picture2Size)))
            .each((drawing: SizedPeinture) => {
              if(drawing.picture1Size) {
                  drawing.picture1Width = Number(drawing.picture1Size.replace(/w=([0-9]+),.*/gi, "$1"));
                  drawing.picture1Height = Number(drawing.picture1Size.replace(/.*h=([0-9]+)$/gi, "$1"));
              }
              if(drawing.picture2Size) {
                  drawing.picture2Width = Number(drawing.picture2Size.replace(/w=([0-9]+),.*/gi, "$1"));
                  drawing.picture2Height = Number(drawing.picture2Size.replace(/.*h=([0-9]+)$/gi, "$1"));
              }
            }).map((drawing: SizedPeinture) => drawing).value();
    }
}