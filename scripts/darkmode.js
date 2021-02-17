const rootElement = document.documentElement;
const darkModeClassName = "dark";
const darkModeStorageKey = "user-color-scheme";
const darkModeTimeKey = "user-color-scheme-time";
const validColorModeKeys = { dark: true, light: true };
const invertDarkModeObj = { dark: "light", light: "dark" };

const setLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch (e) { }
};

const removeLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (e) { }
};

const getLocalStorage = (key) => {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        return null;
    }
};

const getModeFromCSSMediaQuery = () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const resetRootDarkModeClassAndLocalStorage = () => {
    rootElement.classList.remove(darkModeClassName);
    rootElement.classList.remove(invertDarkModeObj[darkModeClassName]);
    removeLocalStorage(darkModeStorageKey);
};

const applyCustomDarkModeSettings = (mode) => {
    // 接受从「开关」处传来的模式，或者从 localStorage 读取
    const currentSetting = mode || getLocalStorage(darkModeStorageKey);

    if (currentSetting === getModeFromCSSMediaQuery()) {
        // 当用户自定义的显示模式和 prefers-color-scheme 相同时重置、恢复到自动模式
        resetRootDarkModeClassAndLocalStorage();
    } else if (validColorModeKeys[currentSetting]) {
        rootElement.classList.add(currentSetting);
        rootElement.classList.remove(invertDarkModeObj[currentSetting]);
    } else {
        // 首次访问或从未使用过开关、localStorage 中没有存储的值，currentSetting 是 null
        // 或者 localStorage 被篡改，currentSetting 不是合法值
        resetRootDarkModeClassAndLocalStorage();
    }
};

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

const checkDarkModeTime = () => {
    if (new Date().getHours() >= 19 || new Date().getHours() < 7) {
        // 晚7点到早7点
        let darkModeTime = getLocalStorage(darkModeTimeKey);
        if (darkModeTime === null || new Date().getTime() - new Date(darkModeTime).getTime() > 43200) {
            // 没有设置过
            return true;
        } else {
            // 设置过
            return false;
        }
    } else {
        return false;
    }
};

// 当页面加载时，先判断时间
if (checkDarkModeTime()) {
    // 定时开启
    applyCustomDarkModeSettings(darkModeClassName);
    setLocalStorage(darkModeStorageKey, darkModeClassName);
    setLocalStorage(darkModeTimeKey, +new Date());
} else {
    // 将显示模式设置为 localStorage 中自定义的值（如果有的话）
    applyCustomDarkModeSettings();
}