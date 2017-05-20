import {Category, Drawing, SignatureType} from './PicturesLoader';

export class DrawingItem implements PhotoSwipe.Item {
    // From PhotoSwipe
    src: string;
    w: number;
    h: number;
    loadError?: boolean;
    vGap?: {top: number; bottom: number};
    fitRatio?: number;
    initialZoomLevel?: number;
    bounds?: any;
    initialPosition?: any;

    // From current gallery
    private _id: string;
    public get id(): string { return this._id; }
    private _shortTitle: string;
    public get shortTitle(): string { return this._shortTitle; }
    public get title(): string { return `${this.id} ${this._shortTitle}`; }
    private _category: Category;
    public get category(): Category{ return this._category; }
    private _type: string;
    public get type(): string{ return this._type; }
    private _date?: string;
    public get date(): string{ return this._date; }
    private _tags: string[];
    public get tags(): string[]{ return this._tags; }
    private _signature: SignatureType;
    public get signature(): SignatureType{ return this._signature; }
    private _dimensions: string;
    public get dimensions(): string{ return this._dimensions; }
    private _lastHolder: string;
    public get lastHolder(): string{ return this._lastHolder; }
    private _localization: string;
    public get localization(): string{ return this._localization; }

    constructor(drawing?: Drawing) {
        if(drawing) {
            this.src = drawing.picture;
            this.w = drawing.width;
            this.h = drawing.height;
            // this.loadError = drawing.loadError;
            // this.vGap = drawing.vGap;
            // this.fitRatio = drawing.fitRatio;
            // this.initialZoomLevel = drawing.initialZoomLevel;
            // this.bounds = drawing.bounds;
            // this.initialPosition = drawing.initialPosition;
            this._id = drawing.id;
            this._shortTitle = drawing.title;
            this._category = drawing.category;
            this._type = drawing.type;
            this._date = drawing.date;
            this._tags = drawing.tags;
            this._signature = drawing.signature;
            this._dimensions = drawing.dimensions;
            this._lastHolder = drawing.lastHolder;
            this._localization = drawing.localization;
        }
    }

    private _qualifiers: string[];
    public get qualifiers() {
        if(!this._qualifiers) {
            this._qualifiers = _.flatten([
                `ID:${this._id}`,
                `CATEG:${DrawingItem.normalize(this._category)}`,
                `TITRE:${DrawingItem.normalize(this._shortTitle)}`,
                `TYPE:${DrawingItem.normalize(this._type)}`,
                _.map(this._tags, (tag) => `TAG:${DrawingItem.normalize(tag)}`),
                `DATE:${DrawingItem.normalize(this._date)}`,
                `DETENT:${DrawingItem.normalize(this._lastHolder)}`,
                `LOC:${DrawingItem.normalize(this._localization)}`
            ]);
        }
        return this._qualifiers;
    }

    private static normalize(value: string) {
        return value.toUpperCase();
    }
}