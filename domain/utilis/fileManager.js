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
}