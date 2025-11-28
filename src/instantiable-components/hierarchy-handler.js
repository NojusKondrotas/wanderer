let elementHierarchy = new Map()

function instantiateHierarchy(n_id, parent_ids, child_ids){
    elementHierarchy.set(n_id, [new Set(parent_ids),new Set(child_ids)])
    for(let p_id of parent_ids){
        let [p_parent_ids, p_child_ids] = elementHierarchy.get(p_id)
        p_child_ids.add(n_id)
    }
    for(let c_id of child_ids){
        let [p_parent_ids, p_child_ids] = elementHierarchy.get(c_id)
        p_parent_ids.add(n_id)
    }
}

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

function switchFocusToChild(n_id){
    let [parents, children] = elementHierarchy.get(n_id);
    if(children.size > 0){
        toggleWritingMode(false, n_id);
        toggleWritingMode(true, children.values().next().value);
    }
}

function switchFocusToParent(n_id){
    let [parents, children] = elementHierarchy.get(n_id);
    if(parents.size > 0){
        toggleWritingMode(false, n_id);
        toggleWritingMode(true, parents.values().next().value);
    }
}