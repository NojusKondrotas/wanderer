let elementHierarchy = new Map()

function addNoteParent(n_id, p_id){
    let [parents, children] = elementHierarchy.get(n_id)
    parents.add(p_id)
}

function removeNoteParent(n_id, p_id){
    let [parents, children] = elementHierarchy.get(n_id)
    parents.delete(p_id)
}

function addNoteChild(n_id, c_id){
    let [parents, children] = elementHierarchy.get(n_id)
    children.add(c_id)
}

function removeNoteChild(n_id, c_id){
    let [parents, children] = elementHierarchy.get(n_id)
    children.delete(c_id)
}