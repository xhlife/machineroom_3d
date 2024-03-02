import { useEffect, useRef, useState } from "react";
import "./App.css";
import MachineRoom from "./components/MachineRoom";
import Plane from './components/Plane'
let room: MachineRoom;
// let canvas: HTMLCanvasElement;
let _canvas: HTMLCanvasElement

function App() {
  const canvas = useRef(null)
  const [curCabinetInfo, updateCurCabinetInfo] = useState({
    planePos: {
      left: 200,
      top: 200,
    },
    planeDisplay: "",
    curCabinet: {
      name: "cabinet-001",
      temperature: 36,
      capacity: 0,
      count: 0,
    },
  })
  function handleMouseMove({clientX,  clientY}) {
    room.selectCabinet(clientX, clientY)
  }
  // mounted
  useEffect(() => {
    if (!canvas.current) return;
    _canvas = canvas.current
    canvas.current.width = window.innerWidth;
    canvas.current.height = window.innerHeight;
    if(!room) {
      room = new MachineRoom(canvas.current);
      room.loadGLTF("machineRoom.gltf");
      room.animate();
      room.onMouseOverCabinet = ({name}) => {
        const c = Number(Math.floor(Math.random() * 10).toFixed(2))
        updateCurCabinetInfo((pre) => ({
          ...pre,
          curCabinet:{
            ...pre.curCabinet,
            name,
            capacity: c + 10,
            count: c
          }
        }))
      }
      // 当鼠标划入机柜，显示信息面板
      room.onMouseMoveCabinet = () => {
        updateCurCabinetInfo((pre) => ({
          ...pre,
          planeDisplay: 'block'
        }))
      }
      // 当鼠标在机柜上移动，让信息面板随鼠标移动
      room.onMouseMoveCabinet = (left, top) => {
        updateCurCabinetInfo((pre) => ({
          ...pre,
          planeDisplay: 'block',
          planePos: {left, top}
        }))
      }
      // 当鼠标移出机柜， 隐藏信息面板
      room.onMouseOutCabinet = () => {
        updateCurCabinetInfo((pre) => ({
          ...pre,
          planeDisplay: 'none'
        }))
      }
    }
  }, []);
  return (
    <div className="App" onMouseMove={handleMouseMove}>
      <canvas id="canvas" ref={canvas}></canvas>
      <Plane info={curCabinetInfo}></Plane>
    </div>
  );
}

export default App;
