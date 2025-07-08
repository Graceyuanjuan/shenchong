function calculateSum(arr) {
    if (!Array.isArray(arr)) {
        throw new TypeError('Input must be an array');
    }
    return arr.reduce((sum, num) => {
        if (typeof num !== 'number') {
            throw new TypeError('Array must contain only numbers');
        }
        return sum + num;
    }, 0);
}