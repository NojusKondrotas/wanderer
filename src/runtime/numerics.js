function generateRandom(minRange = 0x1000, maxRange = 0xffffffff){
    return Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange
}

function convertToString(num, base = 10){
    return num.toString(base)
}