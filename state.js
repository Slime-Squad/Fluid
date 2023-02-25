/**
 * Object for discreet states in a state machine.
 * @author Nathan Brown
 */
class State {

    constructor(){
        this.stateChecks = [];
    }

    checkState(){
        this.stateChecks.forEach(stateCheck => {
            if (stateCheck[0] == true) return this.stateCheck[1];
        });
    }
    start(){
        console.log("empty start function");
    }
    behavior(){
        console.log("empty behavior function");
    }
    setCheckState(predicateStatePairs){
        predicateStatePairs.forEach(pair=> this.addCheckState(pair.predicate, pair.state))
    }
    addCheckState(predicate, state){
        this.stateChecks.push([predicate, state])
    }
}