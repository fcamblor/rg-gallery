import {
    PostProcessableSpreadsheetReaderDescriptor, SpreadsheetReader, SpreadsheetReaderDescriptor,
    SpreadsheetTabDescriptor
} from './SpreadsheetReader';


interface GSDrawing {
    id: string;
    title: string;
    type: string;
    tagsStr: string;
    picture1: string;
    picture2: string;
    picture1Size: string;
    picture2Size: string;
}

export type DrawingType = 'Gouache'|'Huile'|'Fresque'|'Inconnu';

export interface Drawing {
    id: string;
    title: string;
    picture: string;
    width: number;
    height: number;
    type: DrawingType;
    tags?: string[];
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
                        "A": "id", "B": "type", "C": "title", "E": "tagsStr", "O": "picture1", "P": "picture2", "Q": "picture1Size", "R": "picture2Size"
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
                let type: DrawingType;
                switch((drawing.type || "").toUpperCase()) {
                    case 'H': type = 'Huile'; break;
                    case 'FRESQUE': type = 'Fresque'; break;
                    case 'G': type = 'Gouache'; break;
                    default: type = 'Inconnu';
                }

                let tags = drawing.tagsStr?_.map(drawing.tagsStr.split(";"), (tag) => tag.trim()):null;
                tags = _.filter(tags, (tag) => tag);

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
                    return { id: drawing.id, picture: picture, title: drawing.title, width, height, type, tags };
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