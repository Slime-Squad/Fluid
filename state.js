/**
 * Object for discreet states in a state machine.
 * @author Nathan Brown
 */
class State {

    constructor(){
        this.stateChecks = [];
        this.startFunction = ()=>{console.log("empty start function")};
        this.behaviorFunction = ()=>{console.log("empty behavior function")};
    }

    checkState(){
        this.stateChecks.forEach(stateCheck => {
            if (stateCheck[0] == true) return this.stateCheck[1];
        });
    }
    start(){
        return this.startFunction;
    }
    behavior(){
        return this.behaviorFunction;
    }
    setCheckState(predicateStatePairs){
        predicateStatePairs.forEach(pair=> this.addCheckState(pair.predicate, pair.state))
    }
    addCheckState(predicate, state){
        this.stateChecks.push([predicate, state])
    }
}