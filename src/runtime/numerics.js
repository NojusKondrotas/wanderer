function generateRandom(minRange = 0x1000, maxRange = 0xffffffff){
    return Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange
}

function generateUniqueHash(map, minRange = 0x1000, maxRange = 0xffffffff){
    let hash = convertToString(generateRandom(minRange, maxRange), 16)
    while(map.has(hash))
        hash = convertToString(generateRandom(minRange, maxRange), 16)
    
    return hash
}

function convertToString(num, base = 10){
    return num.toString(base)
}