const Document = require("../models/document");

const getOrCreateDocument = async (documentId) => {
    if(!documentId) return;

    let document =await  Document.findOne({documentId});

    if(documentId) return document;

    document = await Document.create({ documentId, content: "" });
    return document ;

   
}
 module.exports = {getOrCreateDocument};