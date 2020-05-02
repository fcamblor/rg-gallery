/// <reference path="../../bower_components/localforage/typings/localforage.d.ts" />

declare var localforage: LocalForage;

export type PictureIds = string[];
export interface User {
    name: string;
}

export class Store {
    public static INSTANCE = new Store();

    private static USER_STORENAME="user";

    public loadPreloadedPictures() {
        return localforage.getItem<PictureIds>(Store.preloadedPicturesStorename());
    }

    public savePreloadedPictures(preloadedPictures: PictureIds) {
        return localforage.setItem(Store.preloadedPicturesStorename(), preloadedPictures)
            .catch((error) => console.error(`Error while saving in store ${Store.preloadedPicturesStorename()} : ${error}`));
    }

    public loadUser() {
        return localforage.getItem<User>(Store.USER_STORENAME);
    }

    public saveUser(user: User) {
        return localforage.setItem(Store.USER_STORENAME, user);
    }

    private static preloadedPicturesStorename() {
        const prefix = (window.location.href.indexOf("fb.html") === -1)?"rg":"fb";
        return `${prefix}-preloaded-pictures`;
    }
}