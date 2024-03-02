import { useEffect, useRef } from "react";
import "./App.css";
import MachineRoom from "./components/MachineRoom";

let room: MachineRoom;
// let canvas: HTMLCanvasElement;
let _canvas: HTMLCanvasElement

function App() {
  const canvas = useRef(null)
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
    }
  }, []);
  return (
    <div className="App" onMouseMove={handleMouseMove}>
      <canvas id="canvas" ref={canvas}></canvas>
    </div>
  );
}

export default App;
