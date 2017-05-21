/// <reference path="../../bower_components/localforage/typings/localforage.d.ts" />

declare var localforage: LocalForage;

export type PictureIds = string[];
export interface User {
    name: string;
}

export class Store {
    public static INSTANCE = new Store();

    private static PRELOADED_PICTURES_STORENAME="preloaded-pictures";
    private static USER_STORENAME="user";

    public loadPreloadedPictures() {
        return localforage.getItem<PictureIds>(Store.PRELOADED_PICTURES_STORENAME);
    }

    public savePreloadedPictures(preloadedPictures: PictureIds) {
        return localforage.setItem(Store.PRELOADED_PICTURES_STORENAME, preloadedPictures)
            .catch((error) => console.error(`Error while saving in store ${Store.PRELOADED_PICTURES_STORENAME} : ${error}`));
    }

    public loadUser() {
        return localforage.getItem<User>(Store.USER_STORENAME);
    }

    public saveUser(user: User) {
        return localforage.setItem(Store.USER_STORENAME, user);
    }
}