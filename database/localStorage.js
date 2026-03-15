// Esta clase almacenara en arrays unitarios de cada edificio que genere algun tipo de recurso
// o que se necesite para el calculo de algun tipo de sistema 
// y se hara la funcion de crga y descarga de los datos a localStorage para su uso en el juego
// mediante la clase de fileManager

class LocalStorage {
    static saveData(clave, data) {
         try {
            localStorage.setItem(clave,data);
            return true;
        } catch (error) {
            console.error("Error guardando en localStorage:", error);
            return false;
        }
    }

    static loadData(clave) {
        try {
            const data = localStorage.getItem(clave);
            return data
        } catch (error) {
            console.error("Error cargando desde localStorage:", error);
            return null;
        }
    }

    
}

globalThis.LocalStorage = LocalStorage;