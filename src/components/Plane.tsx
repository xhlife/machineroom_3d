 function Plane(props) {
  // console.log(props)
  const {
    planePos: { left, top },
    planeDisplay: display,
    curCabinet: { name, temperature, capacity, count },
  } = props.info;
  return (
    <>
      <div id="plane" style={{ left, top, display }}>
        <p>机柜名称：{name}</p>
        <p>机柜温度：{temperature}°</p>
        <p>
          使用情况：{count}/{capacity}
        </p>
      </div>
    </>
  );
}

export default Plane
