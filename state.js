/**
 * Object for discrete states in a state machine.
 * @author Nathan Brown
 */
class State {

    constructor(name) {
        this.stateChecks = [];
        this.name = name;
    }

    checkStateTransitions() {
        return this.stateChecks.find((check) => check[0]())?.[1];
    }

    start() {
        // console.log("empty start function");
    }

    behavior() {
        // console.log("empty behavior function");
    }

    end() {
        // console.log("empty end function");
    }

    setTransitions(predicateStatePairs) {
        this.stateChecks.length = 0;
        predicateStatePairs.forEach(pair=> this.addCheckState(pair.predicate, pair.state));
    }

    addCheckState(predicate, state) {
        this.stateChecks.push([predicate, state]);
    }
}