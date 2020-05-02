

interface Window {
    gallConfig: {
        spreadsheetId: string;
        spreadsheetDescriptors: {
            tabId: number;
            category: string;
            descriptor: {
                firstRow: number;
                columnFields: {[key: string]: string};
                fieldsRequiredToConsiderFilledRow: string[];
            }
        }[]
    }
}
