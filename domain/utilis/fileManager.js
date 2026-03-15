class FileManager {
    static async loadJSON(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`no se encontro el json ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Could not load JSON file: ${error}`);
            return null;
        }
    }

    static saveJSON(filename, data) {
        try {
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log(`Archivo guardado: ${filename}`);
            return true;
        } catch (error) {
            console.error(`No se pudo guardar el archivo: ${error}`);
            return false;
        }
    }
}

globalThis.FileManager = FileManager;