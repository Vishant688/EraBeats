
const { ImageKit } = require("@imagekit/nodejs");

const ImageKitClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function uploadFile(file, fileName = "music") {
    const result = await ImageKitClient.files.upload({
        file,
        fileName: `${fileName}_${Date.now()}`,
        folder: "Spotify_Project",
    });

    return result;
}

module.exports = { uploadFile };
