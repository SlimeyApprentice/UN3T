import React, { useEffect } from "react";
import { TransformComponent , useControls } from "react-zoom-pan-pinch";
import { useDispatch, useSelector } from "react-redux";
import { transitionComplete } from "../state/controlSlice";

//Board width with padding * number of board + borders + top level borders + top level padding
// const calculated_width = ((boardSize + 20)*Math.pow(3, current_depth)) + ((borderSize*2)*(Math.pow(3, current_depth-1))) + (boardSize*2) + 20

//See below for reason
const COMICALLY_SMALL_NUMBER = 0.000000000000000000000000000000000000000000000000000001
const animationTime = 300; //miliseconds
const animationType = "easeOutQuart";

function Renderer({ renderedBoards, cssVars }) {
    const dispatch = useDispatch()

    const transitionStates = useSelector((state) => state.control.transitionStates);
    const { resetTransform, setTransform } = useControls();

    //Move the window to the correct place
    useEffect(() => {
        const element = document.querySelector("#middle-board");

        //Not incredibly strictly enforced but we expect only one of these to be on
        if (transitionStates["top"] !== null) {            
            console.log("Transition Top");
            //??????????????
            //I struggle to understand why this works but it has. setTransform will not complete unless it's in timeout
                //It moves by some small fraction of a pixel when animationTime is 100+
                //It moves farther with small animationTime
                //The fraction of a pixel is clearly the width but divided by some exponent of 10
            //I thought maybe it hasn't rendered yet or something but I don't think waiting below number of ms changes anything
            //It works, looks funny, and doesn't add input lag, so it remains unless I figure out what's wrong
            //Watch out if behavior is different on different setup
            setTimeout(() => {
                setTransform(0, -element.offsetWidth, 1, 0); //Instantly go back to middle
            }, COMICALLY_SMALL_NUMBER);

            setTimeout(() => {
                resetTransform(animationTime, animationType); //Move to top board which is at 0,0
            }, COMICALLY_SMALL_NUMBER);
        } else if (transitionStates["left"] !== null) {
            console.log("Transition Left");
            setTimeout(() => {
                setTransform(-element.offsetWidth, 0, 1, 0); //Instantly go back to middle
            }, COMICALLY_SMALL_NUMBER);

            setTimeout(() => {
                setTransform(0, 0, 1, animationTime, animationType); //Move left
            }, COMICALLY_SMALL_NUMBER);
        } else if (transitionStates["bottom"] !== null) {
            console.log("Transition Down");
            setTimeout(() => {
                setTransform(0, -element.offsetWidth, 1, animationTime, animationType); //Move down
            }, COMICALLY_SMALL_NUMBER);

            setTimeout(() => {
                resetTransform(0); //Move to top board which is at 0,0
            }, animationTime + 1);
        } else if (transitionStates["right"] !== null) {
            console.log("Transition Right");
            setTimeout(() => {
                setTransform(-element.offsetWidth, 0, 1, animationTime, animationType); //Move right
            }, COMICALLY_SMALL_NUMBER);

            setTimeout(() => {
                resetTransform(0); //Move to top board which is at 0,0
            }, animationTime + 1);
        }

        if (Object.values(transitionStates).filter((x) => { if (x !== null) { return x }}).length != 0) {
            setTimeout(() => {
                console.log("Reset");
                // resetTransform(0); //Make sure we are at center
                dispatch(transitionComplete());
            }, animationTime);
        }

    }, [transitionStates])

    return <TransformComponent>
        <div className="game-wrapper" style={cssVars}>
            {renderedBoards}
        </div>
    </TransformComponent>;
};

export default Renderer;