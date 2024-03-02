import {
  MeshBasicMaterial,
  MeshStandardMaterial,
  Mesh,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Texture,
  TextureLoader,
  WebGLRenderer,
  Vector2,
  Color,
  BoxGeometry,
} from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// 实例化 GLTF 模型加载器
const gltfLoader = new GLTFLoader();

// 射线投射器和裁剪空间坐标
const raycaster = new Raycaster();
const pointer = new Vector2();

export default class MachineRoom {
  // 渲染器
  renderer: WebGLRenderer;
  // 场景
  scene: Scene;
  // 相机
  camera: PerspectiveCamera;
  // 相机控制器
  controls: OrbitControls;
  // 模型 目录
  modelPath: string;

  // 纹理集合
  maps: Map<string, Texture> = new Map();

  // 机柜集合
  cabinets: Mesh[] = [];

  // 鼠标滑入的机柜
  curCabinet: Mesh;

  // 鼠标滑入机柜事件，参数为机柜对象
  onMouseOverCabinet = (cabinet: Mesh) => {};

  // 鼠标在机柜上移动的事件， 参数为鼠标在canvas画布上的坐标位
  onMouseMoveCabinet = (x: number, y: number) => {};

  // 鼠标移出机柜的事件
  onMouseOutCabinet = () => {};

  constructor(canvas: HTMLCanvasElement, modelPath: string = "./models/") {
    this.renderer = new WebGLRenderer({ canvas });
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      45,
      canvas.width / canvas.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 15);
    this.camera.lookAt(0, 0, 0);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.modelPath = modelPath;

    // 创建鼠标高亮机柜的贴图
    this.createTexture("cabinet-hover.jpg");
    this.createTexture("cabinet.jpg");
  }

  // 加载 GLTF模型
  loadGLTF(modelName: string = "") {
    gltfLoader.load(this.modelPath + modelName, ({ scene: { children } }) => {
      // 解构出来的scene是模型的数据
      // console.log(...children);
      children.forEach((obj: Mesh) => {
        const { map, color } = obj.material as MeshStandardMaterial;
        // console.log(color)
        this.changeMaterial(obj, map, color);
        if (obj.name.includes("cabinet")) {
          this.cabinets.push(obj);
        }
      });
      // console.log(this.cabinets);
      this.scene.add(...children);
    });
  }
  // 修改 材质
  changeMaterial(obj: Mesh, map: Texture, color: Color) {
    if (map) {
      const m = this.createTexture(map.name);
      obj.material = new MeshBasicMaterial({
        map: m,
      });
    } else {
      obj.material = new MeshBasicMaterial({ color });
    }
  }

  // 建立纹理对象
  createTexture(imgName: string) {
    let curTexture = this.maps.get(imgName);
    if (!curTexture) {
      curTexture = new TextureLoader().load(this.modelPath + imgName);
      curTexture.flipY = false;
      curTexture.wrapS = 1000;
      curTexture.wrapT = 1000;
      this.maps.set(imgName, curTexture);
    }
    return curTexture;
  }
  // 选择机柜 x, y 是鼠标在canvas中的坐标
  selectCabinet(x: number, y: number) {
    const { cabinets, renderer, camera, maps, curCabinet } = this;
    const { width, height } = renderer.domElement;

    // 鼠标的canvas 坐标转裁剪坐标
    pointer.set((x / width) * 2 - 1, -(y / height) * 2 + 1);
    // 基于鼠标点的裁剪坐标位和相机设置射线投射器
    raycaster.setFromCamera(pointer, camera);

    // 选择机柜
    const intersect = raycaster.intersectObjects(cabinets)[0];
    let intersectObj = intersect ? (intersect.object as Mesh) : null;
    // 若之前已有机柜被选择， 且不等于当前所选择的机柜，取消已选机柜的高亮
    if (curCabinet && curCabinet !== intersectObj) {
      const material = curCabinet.material as MeshBasicMaterial;
      material.setValues({
        // 修改贴图为普通贴图
        map: maps.get("cabinet.jpg"),
      });
    }
    /*
      若当前所选对象不为空， 触发鼠标在机柜上移动的事件。
      若当前所选对象不等于上一次所选对象，更新curCabinet. 将模型高亮。 触发鼠标划入机柜事件
      否则， 若上一次所选对象存在：
        置空curCabinet, 触发鼠标划出机柜事件。 
    */
    if (intersectObj) {
      this.onMouseMoveCabinet(x, y);
      if (intersectObj !== curCabinet) {
        this.curCabinet = intersectObj;
        const material = intersectObj.material as MeshBasicMaterial;
        material.setValues({
          map: maps.get("cabinet-hover.jpg"),
        });
        this.onMouseOverCabinet(intersectObj);
      }
    } else if (curCabinet) {
      this.curCabinet = null;
      this.onMouseOutCabinet();
    }
  }
  // 连续渲染
  animate() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => {
      this.animate();
    });
  }
}
