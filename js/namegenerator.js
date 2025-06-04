// js/namegenerator.js

/**
 * Класс NameGenerator отвечает за логику генерации имен и никнеймов,
 * а также за взаимодействие с внешним API для получения дополнительной информации.
 */
class NameGenerator {
    constructor(data) {
        this.data = data;
        this.genderizeApiUrl = 'https://api.genderize.io/'; // API для определения пола по имени
    }

    /**
     * 
     * @param {object} options 
     * @param {number} options.lengthMin  
     * @param {number} options.lengthMax 
     * @param {string} options.registerType 
     * @param {boolean} options.includeNumbers 
     * @param {boolean} options.includeSpecials 
     * @param {boolean} options.includeSmiles 
     * @param {string} options.prefix
     * @param {string} options.suffix 
     * @param {string} [options.firstLetter] 
     * @returns {string}
     */
    generateNickname(options) {
        const { vowels, consonants, digits, specials } = this.data.symbols;
        // Для никнеймов всегда используем английский алфавит
        const upperEng = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowerEng = 'abcdefghijklmnopqrstuvwxyz';

        let lettersPoolForRandomSelection;
        if (options.registerType === 'uppercase') {
            lettersPoolForRandomSelection = upperEng;
        } else if (options.registerType === 'lowercase') {
            lettersPoolForRandomSelection = lowerEng;
        } else { 
            lettersPoolForRandomSelection = lowerEng + upperEng;
        }
        
        let mainPart = [];
        let extraPart = [];
        
        const baseLength = Math.floor(Math.random() * (options.lengthMax - options.lengthMin + 1)) + options.lengthMin;
        const mainPartLength = options.firstLetter ? baseLength - 1 : baseLength;

        // Добавляем первую букву если указана
        if (options.firstLetter) {
            const firstChar = this._formatFirstLetter(options.firstLetter, options.registerType);
           
            if ((lowerEng + upperEng).includes(firstChar)) { 
                mainPart.push(firstChar);
            } else {
                
                console.warn(`Первая буква "${options.firstLetter}" не является английской буквой и будет проигнорирована для никнейма.`);
            }
        }

        let lastLetterType = null;
        if (mainPart.length > 0) {
            const charLower = mainPart[0].toLowerCase();
            lastLetterType = vowels.includes(charLower) ? 'vowel' : 'consonant';
        }
        let sameTypeCount = mainPart.length > 0 ? 1 : 0;

        // Генерация основной части
        for (let i = 0; i < mainPartLength; i++) {
            let potentialChar;
            let potentialCharType;
            let attempts = 0;
            const maxAttempts = 100; 

            do {
                potentialChar = lettersPoolForRandomSelection[Math.floor(Math.random() * lettersPoolForRandomSelection.length)];
                const potentialCharLower = potentialChar.toLowerCase();
                potentialCharType = vowels.includes(potentialCharLower) ? 'vowel' : 'consonant';
                attempts++;
            } while (attempts < maxAttempts && 
                     (sameTypeCount >= 2 && potentialCharType === lastLetterType));

            
            if (attempts === maxAttempts && (sameTypeCount >= 2 && potentialCharType === lastLetterType)) {
                let fallbackChars = lettersPoolForRandomSelection.split('').filter(c => {
                    const cLower = c.toLowerCase();
                    const cType = vowels.includes(cLower) ? 'vowel' : 'consonant';
                    return cType !== lastLetterType;
                }).join('');

                if (fallbackChars.length > 0) {
                    potentialChar = fallbackChars[Math.floor(Math.random() * fallbackChars.length)];
                    potentialCharType = (lastLetterType === 'vowel') ? 'consonant' : 'vowel';
                } else {
                    potentialChar = lettersPoolForRandomSelection[Math.floor(Math.random() * lettersPoolForRandomSelection.length)];
                    potentialCharType = vowels.includes(potentialChar.toLowerCase()) ? 'vowel' : 'consonant';
                }
            }

            mainPart.push(potentialChar);

           
            if (potentialCharType === lastLetterType) {
                sameTypeCount++;
            } else {
                lastLetterType = potentialCharType;
                sameTypeCount = 1;
            }
        }

        // Дополнительные символы
        if (options.includeNumbers) {
            extraPart.push(digits[Math.floor(Math.random() * digits.length)]);
        }
        if (options.includeSpecials) {
            extraPart.push(specials[Math.floor(Math.random() * specials.length)]);
        }
        if (options.includeSmiles) {
            extraPart.push(' ' + smiles[Math.floor(Math.random() * smiles.length)]);
        }

        // Собираем никнейм
        return options.prefix + mainPart.join('') + extraPart.join('') + options.suffix;
    }

    /**
     * Генерирует имя на основе предоставленных опций.
     * @param {object} options 
     * @param {number} options.lengthMin 
     * @param {number} options.lengthMax 
     * @param {string} options.lang 
     * @param {string} [options.firstLetter] 
     * @returns {string}
     */
    generateName(options) {
        const namePool = this.data.names[options.lang];
        if (!namePool) return "Недоступный язык";

        let filteredNames = [...namePool];
        
        // Фильтрация по первой букве
        if (options.firstLetter) {
            const firstChar = options.firstLetter.toUpperCase();
            filteredNames = filteredNames.filter(name => 
                name[0].toUpperCase() === firstChar
            );
        }
        
        // Фильтрация по длине
        filteredNames = filteredNames.filter(name => 
            name.length >= options.lengthMin && name.length <= options.lengthMax
        );
        
        return filteredNames.length > 0 
            ? filteredNames[Math.floor(Math.random() * filteredNames.length)]
            : "Не найдено подходящих имён";
    }

    /**
     * Возвращает пул букв в зависимости от типа регистра и языка.
     * 
     * @param {string} registerType 
     * @param {string} lang 
     * @returns {string} 
     * @private
     */
    _getLettersPool(registerType, lang) {
        let upperLetters;
        let lowerLetters;

        // Для никнеймов всегда используем английский алфавит
        upperLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        lowerLetters = 'abcdefghijklmnopqrstuvwxyz';
        
        if (registerType === 'uppercase') return upperLetters;
        if (registerType === 'lowercase') return lowerLetters;
        return lowerLetters + upperLetters; // 'both'
    }

    /**
     * Форматирует первую букву в соответствии с типом регистра.
     * @param {string} letter
     * @param {string} registerType - Тип регистра
     * @returns {string} Отформатированная буква
     * @private
     */
    _formatFirstLetter(letter, registerType) {
        if (registerType === 'lowercase') {
            return letter.toLowerCase();
        } else if (registerType === 'uppercase') {
            return letter.toUpperCase();
        } else {
            return letter.toUpperCase();
        }
    }

    /**
     * Получает информацию о поле по имени с помощью внешнего API (genderize.io).
     * @param {string} name 
     * @returns {Promise<object|null>} 
     * 
     */
    async getGenderFromName(name) {
        if (!name) return null;
        try {
            const response = await fetch(`${this.genderizeApiUrl}?name=${name}`);
            if (!response.ok) {
                console.error(`Ошибка API genderize.io: ${response.status} ${response.statusText}`);
                return null;
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка при запросе к genderize.io API:', error);
            return null;
        }
    }
}
