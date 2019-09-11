import React from "react"
import { mount, shallow } from "enzyme"
import Mark from "./Mark"
import { differentD } from "./constants/markTransition"

const straightD = "M0,0L1,1L2,2"
const arcD = "M0,0A1,1A2,2"
const straightD2 = "M0,0L1,1L2,2L3,3"

describe("Mark", () => {
  it("renders without crashing", () => {
    mount(<Mark markType="path" name="Test" />)
  })

  it("does not transition between linestrings with different numbers of control points", () => {
    expect(differentD(straightD, straightD2)).toEqual(true)
    expect(differentD(straightD, arcD)).toEqual(true)
    expect(differentD(straightD, straightD)).toEqual(false)
  })

  it("renders a rectangle in a g", () => {
    const wrapper = shallow(<Mark markType="rect" width="10" height="10" />)
    expect(wrapper.find("g").length).toEqual(1)
    expect(wrapper.find("rect").length).toEqual(1)
  })
})
