window.gallConfig = {
    spreadsheetId: 'TODO: CHANGE ME',
    spreadsheetDescriptors: [
        {
            tabId: 1,
            category: 'Peintures',
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
            category: 'Dessins',
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
            tabId: 3,
            category: 'Estampes',
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
            tabId: 4,
            category: 'Divers',
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
            tabId: 5,
            descriptor: {
                firstRow: 4,
                category: 'Repros',
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