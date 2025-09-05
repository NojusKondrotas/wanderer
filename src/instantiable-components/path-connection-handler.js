function disconnectPathStart(path){
    path.startNoteID = null
}

function disconnectPathEnd(path){
    path.endNoteID = null
}

function disconnectConnectedPaths(elID){
    allPaths.forEach(path => {
        if(path.startNoteID === elID){
            path.startNoteID = null
        }else if(path.endNoteID === elID){
            path.endNoteID = null
        }
    })
}