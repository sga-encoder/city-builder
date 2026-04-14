

export class CssManagerRule {

    static insertCssRule(sheet, selector, styles) {
        // Upsert: si existe, se reemplaza; si no, se inserta.
        for (let i = 0; i < sheet.cssRules.length; i++) {
            if (sheet.cssRules[i].selectorText === selector) {
                sheet.deleteRule(i);
                break;
            }
        }

        sheet.insertRule(`${selector}{${styles}}`, sheet.cssRules.length);
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