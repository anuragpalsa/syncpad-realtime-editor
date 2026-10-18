const Document = require("../models/document");

const getOrCreateDocument = async (documentId) => {
    if(!documentId) {
  throw new Error("Document ID is required");
};

    let document =await  Document.findOne({documentId});

    if(documentId) return document;

    document = await Document.create({ documentId, content: "" });
    return document ;

   
}
 module.exports = {getOrCreateDocument};


// const Document = require("../models/document");

// const getOrCreateDocument = async (documentId) => {
//   if (!documentId) {
//     throw new Error("Document ID is required");
//   }

//   let document = await Document.findOne({ documentId });

//   // Return only if the document exists in MongoDB
//   if (document) {
//     return document;
//   }

//   // Create a new document if it doesn't exist
//   document = await Document.create({
//     documentId,
//     content: "",
//   });

//   return document;
// };

// module.exports = { getOrCreateDocument };
