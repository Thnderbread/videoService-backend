export const readUploadedFile = (file) => {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const fileData = reader.result;
            const uint8Array = new Uint8Array(fileData);
            const base64String = btoa(String.fromCharCode.apply(null, uint8Array))
            return resolve(base64String);
        }, false);
        reader.readAsArrayBuffer(file)
    })
}
