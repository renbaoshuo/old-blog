/**
 * @name DarkMode.JS
 * @author Ren Baoshuo <i@baoshuo.ren>
 */

const rootElement = document.documentElement;
const darkModeClassName = "dark";
const darkModeStorageKey = "user-color-scheme";
const darkModeTimeKey = "user-color-scheme-time";
const validColorModeKeys = { dark: true, light: true };
const invertDarkModeObj = { dark: "light", light: "dark" };

/**
 * Set a key's value in LocalStorage
 * @param {String} key Key
 * @param {String} value Value
 */
const setLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch (e) { }
};

/**
 * Remove a key in LocalStorage
 * @param {String} key Key
 */
const removeLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (e) { }
};

/**
 * Get a key's value in LocalStorage
 * @param {String} key Key
 * @returns {String} Value
 */
const getLocalStorage = (key) => {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        return null;
    }
};

/**
 * Get system color mode preference
 * @returns {String} Mode
 */
const getModeFromCSSMediaQuery = () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

/**
 * Reset DarkMode class and LocalStorage
 */
const resetRootDarkModeClassAndLocalStorage = () => {
    rootElement.classList.remove(darkModeClassName);
    rootElement.classList.remove(invertDarkModeObj[darkModeClassName]);
    removeLocalStorage(darkModeStorageKey);
    // removeLocalStorage(darkModeTimeKey);
};

/**
 * Apply a custom darkmode setting
 * @param {String} [mode] Mode
 */
const applyCustomDarkModeSettings = (mode) => {
    // 接受从「开关」处传来的模式，或者从 localStorage 读取
    const currentSetting = mode || getLocalStorage(darkModeStorageKey);

    // if (currentSetting === getModeFromCSSMediaQuery()) {
    //     // 当用户自定义的显示模式和 prefers-color-scheme 相同时重置、恢复到自动模式
    //     resetRootDarkModeClassAndLocalStorage();
    //     rootElement.classList.add(currentSetting);
    // } else 
    if (validColorModeKeys[currentSetting]) {
        rootElement.classList.add(currentSetting);
        rootElement.classList.remove(invertDarkModeObj[currentSetting]);
    } else {
        // 首次访问或从未使用过开关、localStorage 中没有存储的值，currentSetting 是 null
        // 或者 localStorage 被篡改，currentSetting 不是合法值
        resetRootDarkModeClassAndLocalStorage();
    }
};

/**
 * Toggle DarkMode
 */
const toggleCustomDarkMode = () => {
    let currentSetting = getLocalStorage(darkModeStorageKey);

    if (validColorModeKeys[currentSetting]) {
        // 从 localStorage 中读取模式，并取相反的模式
        currentSetting = invertDarkModeObj[currentSetting];
    } else if (currentSetting === null) {
        // localStorage 中没有相关值，或者 localStorage 抛了 Error
        // 从 CSS 中读取当前 prefers-color-scheme 并取相反的模式
        currentSetting = invertDarkModeObj[getModeFromCSSMediaQuery()];
    } else {
        // 不知道出了什么幺蛾子，比如 localStorage 被篡改成非法值
        return; // 直接 return;
    }
    // 将相反的模式写入 localStorage
    setLocalStorage(darkModeStorageKey, currentSetting);
    setLocalStorage(darkModeTimeKey, +new Date());

    return currentSetting;
};

/**
 * Init DarkMode
 * @param {Date} nowTime Now Time
 */
const initDarkMode = (nowTime) => {
    const lastSunrise = (nowTime.getHours() < 7 ? new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate() - 1, 7) : new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate(), 7)).getTime();    // 日出
    const lastSunset = (nowTime.getHours() < 19 ? new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate() - 1, 19) : new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate(), 19)).getTime();  // 日落
    const darkModeTime = new Date(parseInt((getLocalStorage(darkModeTimeKey) || '0'), 10)).getTime();
    let mode = null;
    nowTime = nowTime.getTime();
    if (lastSunrise < lastSunset) {
        // 日出比日落早表示晚上
        if (lastSunset < darkModeTime) {
            // 当晚自行调整过日间/夜间模式
            applyCustomDarkModeSettings();
        } else {
            applyCustomDarkModeSettings(darkModeClassName);
            mode = darkModeClassName;
        }
    } else {
        // 日出比日落晚表示白天
        if (lastSunrise < darkModeTime) {
            applyCustomDarkModeSettings();
        }
        else {
            applyCustomDarkModeSettings(invertDarkModeObj[darkModeClassName]);
            mode = invertDarkModeObj[darkModeClassName];
        }
    }
    if (mode) {
        setLocalStorage(darkModeStorageKey, mode);
        setLocalStorage(darkModeTimeKey, +new Date());
    }
};

initDarkMode(new Date());
