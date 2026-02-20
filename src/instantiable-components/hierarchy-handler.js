let elementHierarchy = new Map()

function instantiateHierarchy(n_id, parent_ids = new Set(), child_ids = new Set()){
    elementHierarchy.set(n_id, [parent_ids,child_ids])
    for(let p_id of parent_ids){
        addNoteChild(p_id, n_id);
    }
    for(let c_id of child_ids){
        addNoteParent(c_id, n_id);
    }
}

function deleteFromHierarchy(n_id){
    let hierarchy = elementHierarchy.get(n_id);
    if(!hierarchy) return;
    
    for(let p_id of parents){
        removeNoteParent(n_id, p_id);
    }
    for(let c_id of children){
        removeNoteChild(n_id, c_id);
    }
    elementHierarchy.delete(n_id);
}

function addNoteParent(n_id, p_id){
    let [n_parents, n_children] = elementHierarchy.get(n_id);
    let [p_parents, p_children] = elementHierarchy.get(p_id);
    n_parents.add(p_id);
    p_children.add(n_id);
}

function removeNoteParent(n_id, p_id){
    let [n_parents, n_children] = elementHierarchy.get(n_id);
    let [p_parents, p_children] = elementHierarchy.get(p_id);
    n_parents.delete(p_id);
    p_children.delete(n_id);
}

function addNoteChild(n_id, c_id){
    let [n_parents, n_children] = elementHierarchy.get(n_id);
    let [c_parents, c_children] = elementHierarchy.get(c_id);
    n_children.add(c_id);
    c_parents.add(n_id);
}

function removeNoteChild(n_id, c_id){
    let [n_parents, n_children] = elementHierarchy.get(n_id);
    let [c_parents, c_children] = elementHierarchy.get(c_id);
    n_children.delete(c_id);
    c_parents.delete(n_id);
}

function switchFocusToChild(n_id){
    let [parents, children] = elementHierarchy.get(n_id);
    if(children.size > 0){
        switchFocus(n_id, children.values().next().value);
    }
}

function switchFocusToParent(n_id){
    let [parents, children] = elementHierarchy.get(n_id);
    if(parents.size > 0){
        switchFocus(n_id, parents.values().next().value);
    }
}

function switchFocus(from_id, to_id){
    toggleWritingMode(false, from_id);
    toggleWritingMode(true, to_id);
}