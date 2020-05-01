window.gallConfig = {
    spreadsheetId: 'TODO: CHANGE ME',
    spreadsheetDescriptors: [
        {
            tabId: 1,
            category: 'Emaux',
            descriptor: {
                firstRow: 4,
                columnFields: {
                    "A": "id", "B": "type", "C": "title", "E": "tagsStr", "F": "date", "G": "signature",
                    "H": "dimensions", "J": "lastHolder", "L": "localization",
                    "O": "picture1", "P": "picture2", "Q": "thumbnail",
                    "R": "picture1Size", "S": "picture2Size", "T": "thumbnailSize"
                },
                fieldsRequiredToConsiderFilledRow: ["id"]
            }
        }, {
            tabId: 2,
            category: 'Eaux Fortes',
            descriptor: {
                firstRow: 4,
                columnFields: {
                    "A": "id", "B": "type", "C": "title", "E": "tagsStr", "F": "date", "G": "signature",
                    "H": "dimensions", "J": "lastHolder", "L": "localization",
                    "O": "picture1", "P": "picture2", "Q": "thumbnail",
                    "R": "picture1Size", "S": "picture2Size", "T": "thumbnailSize"
                },
                fieldsRequiredToConsiderFilledRow: ["id"]
            }
        }
    ]
};