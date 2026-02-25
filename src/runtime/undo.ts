import { ComponentTypes } from "../instantiable-components/component-handler.js"
import { Path } from "../instantiable-components/path.js";

const previousActions = [];

enum ActionTypes {
    CREATE,
    COPY,
    CUT,
    PASTE,
    DELETE,
    CONNECT,
    DISCONNECT,
}

class Action {
    actionType: ActionTypes;
    changes: Array<Change>;
    
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

    constructor(actionType: ActionTypes, changes: Array<Change>) {
        this.actionType = actionType;
        this.changes = changes;
    }

}

class Change {
    componentType: ComponentTypes;
    elementID: string;
    contents?: string;
    pathObj?: Path;

    constructor(componentType: ComponentTypes, elementID: string, contents?: string, pathObj?: Path) {
        this.componentType = componentType;
        this.elementID = elementID;
        switch(componentType) {
            case ComponentTypes.NOTE:
                this.contents = contents;
                break;
            case ComponentTypes.PATH:
                this.pathObj = pathObj;
                break;
        }
    }
}