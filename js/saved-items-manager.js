class SavedItemsManager {
    constructor() {
        this.storageKey = 'savedItems';
    }

    getSavedItems() {
        try {
            const items = localStorage.getItem(this.storageKey);
            return items ? JSON.parse(items) : [];
        } catch (e) {
            console.error("Ошибка при чтении из localStorage:", e);
            return [];
        }
    }

    addItem(item) {
        const items = this.getSavedItems();
        if (!items.includes(item)) {
            items.push(item);
            this._saveItems(items);
            return true;
        }
        return false;
    }

    removeItem(index) {
        const items = this.getSavedItems();
        if (index >= 0 && index < items.length) {
            items.splice(index, 1);
            this._saveItems(items);
        }
    }

    clearAllItems() {
        localStorage.removeItem(this.storageKey);
    }

    _saveItems(items) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(items));
        } catch (e) {
            console.error("Ошибка при записи в localStorage:", e);
        }
    }
}