import {
    PostProcessableSpreadsheetReaderDescriptor, SpreadsheetReader, SpreadsheetReaderDescriptor,
    SpreadsheetTabDescriptor
} from './SpreadsheetReader';

export type SignatureType = 'Signé'|'Non signé';
export type DrawingType = string;
export type Category = 'Peintures'|'Dessins'|'Estampes'|'Divers'|'Repros';

interface GSDrawing {
    id: string;
    title: string;
    type: string;
    date?: string;
    tagsStr: string;
    signature: string;
    dimensions: string;
    lastHolder: string;
    localization: string;
    picture1: string;
    picture2: string;
    thumbnail: string;
    picture1Size: string;
    picture2Size: string;
    thumbnailSize: string;
}

type GSDrawingByCategory = {[category in Category]: GSDrawing[]};

export interface Drawing {
    id: string;
    category: Category;
    title: string;
    picture: string;
    width: number;
    height: number;
    thumbnail: string;
    thumbnailWidth: number;
    thumbnailHeight: number;
    type: DrawingType;
    date?: string;
    signature: SignatureType;
    dimensions: string;
    lastHolder: string;
    localization: string;
    tags?: string[];
}

export class PicturesLoader {
    drawings: GSDrawingByCategory;

    constructor(){
    }

    load(): Promise<void>{
        return SpreadsheetReader.readFromDescriptors(window.gallConfig.spreadsheetId, window.gallConfig.spreadsheetDescriptors.map(descriptor =>
            new SpreadsheetTabDescriptor({
                tabId: descriptor.tabId,
                descriptor: new SpreadsheetReaderDescriptor<GSDrawing>(descriptor.descriptor)
            })
        )).then(results => {
            this.drawings = _.reduce(results[0], (drawings, result, idx) => {
                drawings[window.gallConfig.spreadsheetDescriptors[idx].category] = result;
                return drawings;
            }, {} as GSDrawingByCategory);

            console.log(results.length);
            console.log(_.reduce(this.drawings, (acc, drawings) => acc + (drawings?drawings.length:0), 0));
        });
    }

    loadedDrawings(): Drawing[]{
        return _(_.keys(this.drawings))
            .map((category: Category) => _(this.drawings[category]).map<Drawing>((drawing: GSDrawing) => {
                    let type: DrawingType;
                    switch((drawing.type || "").toUpperCase()) {
                        case 'H': type = 'Huile'; break;
                        case 'FRESQUE': type = 'Fresque'; break;
                        case 'G': type = 'Gouache'; break;
                        case 'CG': type = 'Craie grasse'; break;
                        case 'EF': type = 'Eau forte'; break;
                        case 'BG': type = 'Bois gravé'; break;
                        default: type = drawing.type || "Type inconnu";
                    }

                    let tags = drawing.tagsStr?_.map(drawing.tagsStr.split(";"), (tag) => tag.trim()):null;
                    tags = _.filter(tags, (tag) => tag);

                    let title = drawing.title || "Titre inconnu";

                    let date = drawing.date || "Date inconnue";

                    let signature: SignatureType = (drawing.signature && drawing.signature.toUpperCase() === 'OUI')?'Signé':'Non signé';

                    let dimensions = drawing.dimensions || "Dimensions inconnues";

                    let lastHolder = drawing.lastHolder || "Détenteur inconnu";

                    let localization = drawing.localization || "Localisation inconnu";

                    let pictureSize = null, picture: string = null, thumbnail: string = null, thumbnailSize: string = null;
                    if (PicturesLoader.isValidPicture(drawing.picture1,drawing.picture1Size)) {
                        pictureSize = drawing.picture1Size;
                        picture = drawing.picture1;
                    }
                    if (PicturesLoader.isValidPicture(drawing.picture2,drawing.picture2Size)) {
                        pictureSize = drawing.picture2Size;
                        picture = drawing.picture2;
                    }

                    thumbnailSize = drawing.thumbnailSize;
                    thumbnail = drawing.thumbnail;

                    if(pictureSize && picture) {
                        let width = Number(pictureSize.replace(/w=([0-9]+),.*/gi, "$1"));
                        let height = Number(pictureSize.replace(/.*h=([0-9]+),.*/gi, "$1"));
                        let thumbnailWidth, thumbnailHeight;
                        if(thumbnailSize) {
                            thumbnailWidth = Number(thumbnailSize.replace(/w=([0-9]+),.*/gi, "$1"));
                            thumbnailHeight = Number(thumbnailSize.replace(/.*h=([0-9]+),.*/gi, "$1"));
                        } else {
                            thumbnail = null;
                            console.warn("No thumbnail found for picture with id "+drawing.id);
                        }

                        return {
                            id: drawing.id,
                            category,
                            picture: picture,
                            title, width, height, type, tags, date, signature, dimensions, lastHolder, localization,
                            thumbnail, thumbnailWidth, thumbnailHeight
                        };
                    } else {
                        return null;
                    }
                }).filter((drawing: Drawing) => !!drawing).value()
            ).flatten<Drawing>()
            .value();
    }

    private static isValidPicture(pictureUrl: string, pictureSize: string) {
        return pictureSize && pictureUrl && pictureUrl !== "#N/A" && pictureUrl.indexOf("...") === -1;
    }
}