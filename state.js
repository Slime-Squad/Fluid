/**
 * Object for discreet states in a state machine.
 * @author Nathan Brown
 */
class State {

    constructor(name){
        this.stateChecks = [];
        this.name = name;
    }

    checkState(){
        for(let check of this.stateChecks){
            if(check[0]()) return check[1];
        }
        return false;
    }
    start(){
        // console.log("empty start function");
    }
    behavior(){
        // console.log("empty behavior function");
    }
    end(){
        // console.log("empty end function");
    }
    setCheckState(predicateStatePairs){
        this.stateChecks.length = 0;
        predicateStatePairs.forEach(pair=> this.addCheckState(pair.predicate, pair.state))
    }
    addCheckState(predicate, state){
        this.stateChecks.push([predicate, state])
    }
}