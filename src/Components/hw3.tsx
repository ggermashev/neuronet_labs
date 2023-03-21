import "./css/hw3.css"
import {useEffect, useRef, useState} from "react";

type Point = {
    x: number,
    y: number,
    color: string,
    type: number,
}

function predictClass(weights: number[], point: Point) {
    let y = -(weights[0] + weights[1] * point.x) / weights[2] - point.y
    // console.log(-(weights[0] + weights[1] * point.x) / weights[2])
    // console.log(point.y)
    if (y > 0) return 0
    return 1
}


export function Hw3(props: {}) {
    const [from, setFrom] = useState<Point>({x: 0, y: 0, color: "", type: 0})
    const [to, setTo] = useState<Point>({x: 0, y: 0, color: "", type: 0})
    const [points, setPoints] = useState<Point[]>([])
    const color = useRef("green")
    const [weights, setWeights] = useState<number[]>([window.innerHeight * 0.8 / 2, 1, -1])
    const type = useRef<number>(1)
    const [green, setGreen] = useState("greenyellow")
    const [red, setRed] = useState("darkred")
    const [flag, setFlag] = useState(true)
    const alpha = 1

    async function move(wghts: number[]) {
        let copyFlag = false
        let copyWeights = [...wghts]
        for (let p of points) {
            let predict = predictClass(copyWeights, p)
            if (predict == 1 && p.type == 0) {
                copyWeights[0] += alpha
                copyWeights[1] += alpha * p.x / (window.innerWidth * 0.8)
                copyWeights[2] += alpha * p.y / (window.innerHeight * 0.8)
                copyFlag = true
            } else if (predict == 0 && p.type == 1) {
                copyWeights[0] -= alpha
                copyWeights[1] -= alpha * p.x / (window.innerWidth * 0.8)
                copyWeights[2] -= alpha * p.y / (window.innerHeight * 0.8)
                copyFlag = true
            }
        }
        return {"weights": copyWeights, "flag": copyFlag}
    }

    function iterMove(wghts: number[]) {
        move([...wghts]).then(val => {
            setWeights(val.weights)
            console.log(val.weights)
            console.log(val.flag)
            if (val.flag) {
                setTimeout(iterMove, 50, [...val.weights])
            }
        })
    }

    useEffect(
        () => {
            let width = window.innerWidth * 0.8
            setFrom({x: 0, y: (-weights[0] / weights[2]), color: from.color, type: from.type})
            setTo({
                x: width,
                y: ((-weights[0] - weights[1] * width) / weights[2]),
                color: to.color,
                type: to.type
            })
            console.log()
        }, [weights])

    // useEffect(
    //     () => {
    //         let copyWeights = [...weights]
    //         // console.log(copyWeights)
    //         for (let p of points) {
    //             let predict = predictClass(copyWeights, p)
    //             if (predict == 1 && p.type == 0) {
    //                 copyWeights[0] += alpha
    //                 copyWeights[1] += alpha * p.x / (window.innerWidth * 0.8)
    //                 copyWeights[2] += alpha * p.y / (window.innerHeight * 0.8)
    //                 setWeights(copyWeights)
    //             } else if (predict == 0 && p.type == 1) {
    //                 copyWeights[0] -= alpha
    //                 copyWeights[1] -= alpha * p.x / (window.innerWidth * 0.8)
    //                 copyWeights[2] -= alpha * p.y / (window.innerHeight * 0.8)
    //                 setWeights(copyWeights)
    //             }
    //         }
    //     }, [weights])

    return (
        <div className="container">
            <div className="choice">
                <button style={{backgroundColor: `${green}`}} className="choice-btn green-btn" onClick={e => {
                    color.current = "green"
                    type.current = 1
                    setGreen("greenyellow")
                    setRed("darkred")
                }}>Зеленые
                </button>
                <button style={{background: `${red}`}} className="choice-btn red-btn" onClick={e => {
                    color.current = "red"
                    type.current = 0
                    setRed("red")
                    setGreen("green")
                }}>Красные
                </button>
            </div>
            <div className="field" onDoubleClick={e => {
                const x = e.clientX - 0.1 * window.innerWidth - 5
                const y = window.innerHeight * 0.8 - 15 - (e.clientY - 0.1 * window.innerHeight)
                let copyPoints = [...points]
                copyPoints.push({x: x, y: y, color: `${color.current}`, type: type.current})
                setPoints(copyPoints)
            }}>
                <svg viewBox="0 0 100% 100%">
                    <line x1={from.x} y1={window.innerHeight * 0.8 - from.y} x2={to.x}
                          y2={window.innerHeight * 0.8 - to.y} stroke="black"/>
                </svg>
                {points.map((p, i) => {
                    return (<span className="point"
                                  style={{left: `${p.x}px`, bottom: `${p.y}px`, backgroundColor: `${p.color}`}}
                                  onClick={e => {
                                      let copyPoints = points.filter((p, j) => {
                                          return j != i
                                      })
                                      setPoints(copyPoints)
                                      console.log(points)
                                  }
                                  }
                    ></span>)
                })}
            </div>
            <button className="run" onClick={e => {
                iterMove([...weights])
            }
            }>Run
            </button>
        </div>
    )
}
