

export class CssManagerRule {

    static insertCssRule(sheet, selector, styles) {
        // Verifica si ya existe una regla para ese selector
        if (!this.ruleExists(sheet, selector)) {
            // Inserta la regla si no existe
            sheet.insertRule(`${selector}{${styles}}`, sheet.cssRules.length);
        }
    }

    static removeCssRule(sheet, selector) {
        for (let i = 0; i < sheet.cssRules.length; i++) {
            if (sheet.cssRules[i].selectorText === selector) {
                sheet.deleteRule(i);
                return;
            }
        }
    }

    static ruleExists(sheet, selector) {
        for (let i = 0; i < sheet.cssRules.length; i++) {
            if (sheet.cssRules[i].selectorText === selector) {
                return true;
            }
        } 
        return false;
    }

}