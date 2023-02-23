import React, {Fragment, useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {matrix, multiply, index, subset, Matrix} from "mathjs"
import {Button, Col, Container, Form, OverlayTrigger, Row, Tooltip} from "react-bootstrap";

function activation(h: number, size: number) {
    if (h <= 0) {
        return 0
    }
    return h
}

function isEqual(arr1: number[], arr2: number[]) {
    let n1 = arr1.length
    let n2 = arr2.length
    if (n1 !== n2) {
        return false
    }
    for (let i = 0; i < n1; i++) {
        if (arr1[i] != arr2[i]) {
            return false
        }
    }
    return true
}

function maxnet(out: number[]) {
    let nextOut = new Array(out.length).fill(0)
    let e = -0.1
    let n = out.length
    while (true) {
        nextOut = new Array(n).fill(0)
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i === j) {
                    nextOut[i] += out[j]
                } else {
                    nextOut[i] += out[j] * e
                }
            }
            if (nextOut[i] < 0) {
                nextOut[i] = 0
            }
        }
        if (isEqual(out, nextOut)) {
            break
        }
        out = [...nextOut]
    }
    for (let i = 0; i < n; i++) {
        if (out[i] < 0.00001 && out[i] > 0) {
            out[i] = 0.00001
        }
    }
    return out
}


function get_scalars(size: number, length: number, input: number[], weights: number[][]) {
    let out = []
    let k = weights.length
    let w = matrix(weights)
    let x = matrix(input)
    let y = multiply(w, x)
    for (let i = 0; i < k; i++) {
        out.push(activation(y.get([i]), size))
    }
    return out
}

function copy(arr: number[][], length: number, size: number) {
    let ans = new Array(length)
    for (let i = 0; i < length; i++) {
        ans[i] = new Array(size).fill(0)
    }
    for (let i = 0; i < length; i++) {
        for (let j = 0; j < size; j++) {
            ans[i][j] = arr[i][j]
        }
    }
    return ans
}

function App() {
    //число признаков
    const [size, setSize] = useState(0)
    //число классов
    const [length, setLength] = useState(0)
    const [input, setInput] = useState<number[]>(new Array(size).fill(0))
    const [weights, setWeights] = useState<number[][]>(new Array(length).fill(new Array(size).fill(0)))
    const [scalars, setScalars] = useState<number[]>(new Array(length).fill(0))
    const [outputs, setOutputs] = useState<number[]>(new Array(length).fill(0))

    const renderTooltip = (i: number) => (
        <Tooltip id="button-tooltip">
            {i < weights.length ? weights[i].toString() : "?"}
        </Tooltip>
    );

    useEffect(
        () => {
            if (size > 0 && length > 0) {
                setScalars(get_scalars(size, length, input, weights))
            }
        }, [input, weights])
    useEffect(
        () => {
            if (size > 0 && length > 0) {
                setOutputs(maxnet(scalars))
            }
        }, [scalars])
    useEffect(
        () => {
            setInput(new Array(size || 0).fill(0))
            setWeights(new Array(length || 0).fill(new Array(size || 0).fill(0)))
        }, [size, length])
    return (
        <Fragment>
            <div style={{width: "300px", margin: "0 auto", justifyContent: "center"}}>
                <Form style={{margin: "20px"}}>
                    <Form.Group>
                        {/*size*/}
                        <Form.Label>Число признаков</Form.Label>
                        <Form.Control style={{width: "50px"}} value={size || 0} onChange={(e) => {
                            setSize(parseInt(e.target.value) || 0)
                        }} type="text"/>
                        {/*length*/}
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Число классов</Form.Label>
                        <Form.Control style={{width: "50px"}} value={length || 0} onChange={(e) => {
                            setLength(parseInt(e.target.value) || 0)
                        }} type="text"/>
                    </Form.Group>
                </Form>
            </div>
            {size > 0 && length > 0 && (weights.length > 0) && (input.length > 0) &&
                <Fragment>
                    <div style={{width: "100%", margin: "0 auto", justifyContent: "center", display: "flex"}}>
                        <Form style={{margin: "20px", justifyContent: "center"}}>
                            <Form.Group>
                                <Form.Label>Что сравнить?</Form.Label>
                                <div>
                                    {new Array(size).fill(1).map((a, i) => {
                                        return <Form.Select
                                            style={{width: "70px", display: "inline-block", margin: "5px"}}
                                            value={input[i] || 0}
                                            onChange={(e) => {
                                                let arr = [...input]
                                                arr[i] = parseInt(e.target.value)
                                                setInput(arr)
                                            }}>
                                            <option value={0}>---</option>
                                            <option value={1}>1</option>
                                            <option value={-1}>-1</option>
                                        </Form.Select>
                                    })}
                                </div>
                            </Form.Group>
                            <Form.Label>Какие классы?</Form.Label>
                            {weights.map((vec, i) => {
                                return <Form.Group> {vec.map((v, j) => {
                                    return (
                                        <Form.Select
                                            style={{width: "70px", display: 'inline', margin: "5px"}}
                                            value={weights[i][j]}
                                            onChange={(e) => {
                                                let arr = copy(weights, length, size)
                                                arr[i][j] = parseInt(e.target.value)
                                                setWeights(arr)
                                            }}
                                        >
                                            <option value={0}>---</option>
                                            <option value={1}>1</option>
                                            <option value={-1}>-1</option>
                                        </Form.Select>)
                                })} </Form.Group>
                            })}
                        </Form>
                    </div>
                    <Fragment>
                        <Row>
                            <Col style={{alignContent: "center", position: "relative", display: "flex"}} lg={2} md={2}
                                 sm={2}
                                 xs={2}>
                                <ul style={{width: "50px", alignContent: "center", margin: "auto 0"}}>
                                    {input.map(i => {
                                        return (
                                            <li style={{
                                                listStyleType: "none",
                                                marginTop: "10px",
                                                textAlign: "right",
                                                alignContent: "center"
                                            }}>{i}</li>
                                        )
                                    })}
                                </ul>
                            </Col>
                            <Col style={{alignContent: "center", position: "relative", display: "flex"}} lg={2} md={2}
                                 sm={2}
                                 xs={2}>
                                <div>
                                    {weights.length > 0 &&
                                        <ul style={{width: "50px", alignContent: "center", margin: "auto 0"}}>
                                            {new Array(length).fill(1).map((el, i) => {
                                                return (
                                                    <li className="neuron" style={{
                                                        listStyleType: "none",
                                                        marginTop: "10px",
                                                        textAlign: "right",
                                                    }}>
                                                        <OverlayTrigger
                                                            placement="right"
                                                            delay={{show: 0, hide: 0}}
                                                            overlay={renderTooltip(i)}
                                                        >
                                                            <Button style={{borderRadius: "300px"}}
                                                                    variant="success">{i + 1}</Button>
                                                        </OverlayTrigger>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    }
                                </div>
                            </Col>
                            <Col style={{alignContent: "center", position: "relative", display: "flex"}} lg={2} md={2}
                                 sm={2}
                                 xs={2}>
                                <ul style={{width: "200px", alignContent: "center", margin: "auto 0"}}>
                                    {scalars.map(i => {
                                        return (
                                            <li style={{
                                                listStyleType: "none",
                                                marginBottom: "15px",
                                                padding: "5px",
                                                textAlign: "left",
                                                alignContent: "center"
                                            }}>{"->"}{i}{"->"}</li>
                                        )
                                    })}
                                </ul>
                            </Col>
                            <Col style={{alignContent: "center", position: "relative", display: "flex"}} lg={2} md={2}
                                 sm={2}
                                 xs={2}>
                                <div>
                                    <ul style={{width: "50px", alignContent: "center", margin: "auto 0"}}>
                                        {outputs.map((el, i) => {
                                            return (
                                                <li className="neuron" style={{
                                                    listStyleType: "none",
                                                    marginTop: "10px",
                                                    textAlign: "right"
                                                }}>
                                                    <OverlayTrigger
                                                        placement="right"
                                                        delay={{show: 0, hide: 0}}
                                                        overlay={renderTooltip(i)}
                                                    >
                                                        <Button style={{borderRadius: "300px"}}
                                                                variant="success">{el}</Button>
                                                    </OverlayTrigger>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </Col>
                        </Row>
                    </Fragment>
                </Fragment>
            }
        </Fragment>
    );
}

export default App;
