export const randomInt = (min = 0, max = Number.MAX_VALUE) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}