const previousActions = [];

class Action {
    static _actionTypes = Object.freeze({
        CREATE: Symbol("Create"),
        COPY: Symbol("Copy"),
        CUT: Symbol("Cut"),
        PASTE: Symbol("Paste"),
        DELETE: Symbol("Delete"),
        CONNECT: Symbol("Connect"),
        DISCONNECT: Symbol("Disconnect"),
    });

    static isSupportedAction(actionType) {
        return actionType in this._actionTypes;
    }

    actionType;
    changes;
    
    // {
    //     actionType: ...,
    //     changes: [
    //         {
    //             componentType: ...,
    //             elementID?: ..., // only relevant for undoing creation
    //             contents?: ...,
    //             pathObj?: ..., // in case of connect/disconnect - the state before the action took place, in other cases - the state after
    //         }
    //     ]
    // }

    constructor(actionType, changes) {
        if(!this.isSupportedAction(actionType)) {
            logMessage(`Unsupported action in Action constructor: ${actionType}. The changes are such:\n${JSON.stringify(changes)}`);
        }

        this.actionType = actionType;
        this.changes = changes;
    }

}

class Change {
    componentType;
    elementID;
    contents;
    pathObj;

    constructor(componentType, elementID, contents, pathObj) {
        if(!isSupportedComponent(componentType)) {
            logMessage(`Unsupported component type in Change constructor: ${componentType}. The changes are such:\n\
                elementID: ${elementID},\ncontents: ${contents},\npathObj ${pathObj}`);
        }

        this.componentType = componentType;
        this.elementID = elementID;
        switch(componentType) {
            case componentTypes.NOTE:
                this.contents = contents;
                break;
            case componentTypes.PATH:
                this.pathObj = pathObj;
                break;
        }
    }
}